import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { checkOppsett, fileStemOf } from "./oppsett.mjs";

const write = (root, path, text) => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text);
};

// Et lite skjema i samme form som det Neo serverer på GET /api/config/schema, med én type.
const URL = "https://neo.test/api/config/schema";
const MANIFEST = {
  apiVersion: "neo-config/v1",
  kinds: [
    { kind: "caseType", directory: "case-types", keyFields: ["slug"], schema: `${URL}/caseType.schema.json` },
    { kind: "customFieldDefinition", directory: "custom-fields", keyFields: ["entityType", "name"], schema: `${URL}/customFieldDefinition.schema.json` },
  ],
};
const CASE_TYPE = {
  type: "object",
  required: ["apiVersion", "kind", "spec"],
  additionalProperties: false,
  properties: {
    apiVersion: { const: "neo-config/v1" },
    kind: { const: "caseType" },
    spec: { type: "object", required: ["name", "slug"], additionalProperties: false, properties: { name: { type: "string", minLength: 1 }, slug: { type: "string" } } },
  },
};
const fake = (calls = []) => async (url) => {
  calls.push(url);
  if (url === URL) return MANIFEST;
  if (url.endsWith("caseType.schema.json")) return CASE_TYPE;
  throw new Error("HTTP 404");
};
const caseType = (slug, name = "Parkering") => `apiVersion: neo-config/v1\nkind: caseType\nspec:\n  name: ${name}\n  slug: ${slug}\n`;
const KRAV = "## frist Mottatt innen fristen\n\n```yaml\nflyt: deterministisk\nhvorfor: x\nkilde: [K1]\n```\n";
const repo = () => {
  const root = mkdtempSync(join(tmpdir(), "oppsett-"));
  write(root, "losninger/hc-parkering/3-krav/03-forlop.md", KRAV);
  write(root, "losninger/hc-parkering/5-oppsett/case-types/hc-parkering.yaml", caseType("hc-parkering"));
  write(root, "losninger/hc-parkering/5-oppsett/spor.yaml", "case-types/hc-parkering.yaml: [frist]\n");
  return root;
};
const run = (root, opts = {}) => checkOppsett(root, { schemaUrl: URL, env: "development", fetchJson: fake(), ...opts });
const msgs = (f) => f.map((x) => `${x.level ?? "fail"} ${x.file}: ${x.message}`).sort();

test("en fil i Neos format, på stien nøkkelen gir, med spor til et krav: ingen funn", async () => {
  const root = repo();
  assert.deepEqual(await run(root), []);
  rmSync(root, { recursive: true });
});

test("uten konfigfiler hentes ikke skjemaet", async () => {
  const root = mkdtempSync(join(tmpdir(), "oppsett-"));
  const calls = [];
  assert.deepEqual(await run(root, { fetchJson: fake(calls) }), []);
  assert.deepEqual(calls, []);
  rmSync(root, { recursive: true });
});

test("feil mot skjemaet, feil filnavn, feil mappe og en fil utenfor mappene er røde", async () => {
  const root = repo();
  const d = "losninger/hc-parkering/5-oppsett";
  write(root, `${d}/case-types/feil-navn.yaml`, caseType("klage", "Klage"));
  write(root, `${d}/case-types/tom.yaml`, "apiVersion: neo-config/v1\nkind: caseType\nspec:\n  name: \"\"\n  slug: tom\n  farge: rod\n");
  write(root, `${d}/custom-fields/x.yaml`, caseType("x"));
  write(root, `${d}/notater.md`, "# Notater\n");
  write(root, `${d}/case-types/dobbel.yaml`, "kind: caseType\nkind: caseType\n");
  const f = msgs((await run(root)).filter((x) => x.check === "oppsett"));
  assert.deepEqual(f, [
    `fail ${d}/case-types/dobbel.yaml: Kan ikke leses som YAML (linje 2: Map keys must be unique)`,
    `fail ${d}/case-types/feil-navn.yaml: Nøkkelen «klage» gir case-types/klage.yaml, men fila heter case-types/feil-navn.yaml. Gi fila navnet nøkkelen gir, eller rett nøkkelen`,
    `fail ${d}/case-types/tom.yaml: /spec must NOT have additional properties (farge)`,
    `fail ${d}/case-types/tom.yaml: /spec/name must NOT have fewer than 1 characters`,
    `fail ${d}/custom-fields/x.yaml: Fila er caseType, men ligger i mappa for customFieldDefinition (custom-fields/). Flytt den til case-types/`,
    `fail ${d}/notater.md: Ligger ikke i en mappe for en type i Neo. En konfigfil er <mappe>/<nøkkel>.yaml under 5-oppsett/, med mappene case-types, custom-fields`,
  ]);
  rmSync(root, { recursive: true });
});

test("samme nøkkel to steder er rødt", async () => {
  const root = repo();
  write(root, "organisasjon/5-oppsett/case-types/hc-parkering.yaml", caseType("hc-parkering"));
  const f = msgs((await run(root)).filter((x) => x.check === "oppsett"));
  assert.equal(f.length, 2);
  assert.match(f[0], /^fail losninger\/hc-parkering\/5-oppsett\/case-types\/hc-parkering.yaml: Samme nøkkel \(case-types\/hc-parkering.yaml\) står også i organisasjon\/5-oppsett/);
  assert.match(f[1], /^fail organisasjon\/5-oppsett\/case-types\/hc-parkering.yaml: Samme nøkkel .* står også i losninger\/hc-parkering\/5-oppsett/);
  rmSync(root, { recursive: true });
});

test("når skjemaet ikke kan hentes, sier sjekken det med rødt; den hopper ikke over", async () => {
  const root = repo();
  const down = async () => {
    throw new Error("fetch failed");
  };
  const f = await run(root, { fetchJson: down });
  assert.equal(f.length, 1);
  assert.equal(f[0].level, undefined);
  assert.match(f[0].message, /^Fikk ikke hentet skjemaet fra Neo i development \(https:\/\/neo.test\/api\/config\/schema: fetch failed\), så 1 fil i 5-oppsett\/ er ikke validert/);
  const none = await checkOppsett(root, {});
  assert.match(none[0].message, /Adressen til Neo .* mangler, så skjemaet kan ikke hentes: 1 fil i 5-oppsett\/ er ikke validert/);
  rmSync(root, { recursive: true });
});

test("spor.yaml viser til filer og krav som finnes, og en fil uten spor er gul", async () => {
  const root = repo();
  const d = "losninger/hc-parkering/5-oppsett";
  write(root, `${d}/spor.yaml`, "case-types/borte.yaml: [frist]\ncase-types/hc-parkering.yaml: [frist, ukjent]\n");
  write(root, `${d}/case-types/klage.yaml`, caseType("klage", "Klage"));
  assert.deepEqual(msgs((await run(root)).filter((x) => x.check === "spor")), [
    `fail ${d}/spor.yaml: case-types/borte.yaml finnes ikke i ${d}/`,
    `fail ${d}/spor.yaml: case-types/hc-parkering.yaml: kravet ukjent finnes ikke i losninger/hc-parkering/3-krav/`,
    `warn ${d}/case-types/klage.yaml: Står ikke i ${d}/spor.yaml: hvilke krav fila oppfyller`,
  ]);
  rmSync(root, { recursive: true });
});

test("filnavnet for en nøkkel er det samme som i Neo", () => {
  assert.equal(fileStemOf("Søknad om Åpen ørret-é!"), "soknad-om-apen-orret-e");
  assert.equal(fileStemOf("case/gnr"), "case-gnr");
});
