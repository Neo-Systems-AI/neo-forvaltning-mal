import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { checkStruktur, isRef, secretValues } from "./struktur.mjs";
import { SECRET_KEY } from "./check.mjs";

const write = (root, path, text) => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text);
};
const KRAV = "## frist Mottatt innen fristen\n\n```yaml\nflyt: deterministisk\nhvorfor: x\nkilde: [K1]\n```\n";
const LOSNING = "formal: Behandle søknader om tilskudd\neier: Kunden\nstatus: utkast\nintegrasjoner: [altinn]\nbygger-pa: egen\n";
const repo = () => {
  const root = mkdtempSync(join(tmpdir(), "struktur-"));
  write(root, "losninger/tilskudd/losning.yaml", LOSNING);
  write(root, "losninger/tilskudd/3-krav/03-forlop.md", KRAV);
  write(root, "losninger/klage/losning.yaml", "formal: Klager\neier: Kunden\nstatus: i-test\nintegrasjoner: []\nbygger-pa: { standard: klage, versjon: 1.2.0 }\n");
  write(root, "integrasjoner/altinn/hemmeligheter.yaml", "maskinporten-nokkel:\n  $env: MASKINPORTEN_KEY\n  kilde: azure-keyvault:kv/mp-key\n  fil: true\n");
  write(root, "integrasjoner/altinn/neo.yaml", "app: tilskudd\n");
  write(root, "integrasjoner/altinn/hos-kunden.md", "# Altinn\n\n## delegering Deleger tilgangen\n\n```yaml\nstatus: ikke-startet\nhvem: Hovedadministratoren\netter: [entra/sso]\n```\n");
  write(root, "integrasjoner/entra/hos-kunden.md", "## sso Sett opp SSO\n\n```yaml\nstatus: ferdig\nhvem: IT\n```\n");
  write(root, "test/personaer/saksbehandler.yaml", "navn: Sara Saksbehandler\nrolle: saksbehandler\nteam: [tilskudd]\nidentiteter:\n  altinn: { fnr: '01010112345' }\nhemmeligheter:\n  passord: { $env: SARA_PASSORD, kilde: azure-keyvault:kv/sara }\n");
  write(root, "losninger/tilskudd/6-test/testcaser/fjordlys.yaml", "beskrivelse: En søknad innen fristen\npersona: saksbehandler\ninn:\n  belop: 100\nforventet:\n  krav: [frist]\n");
  write(root, "test/innboks.yaml", "beskrivelse: En e-post havner i riktig løsning\nlosninger: [tilskudd, klage]\nforventet:\n  krav: [frist]\n");
  return root;
};
const run = (root) => checkStruktur(root, { secretKey: SECRET_KEY });
const msgs = (f, check) => f.filter((x) => x.check === check).map((x) => x.message).sort();

test("et tomt repo og et repo slik det skal være, gir ingen funn", () => {
  const empty = mkdtempSync(join(tmpdir(), "struktur-"));
  assert.deepEqual(run(empty), []);
  const root = repo();
  assert.deepEqual(run(root), []);
  rmSync(root, { recursive: true });
  rmSync(empty, { recursive: true });
});

test("losning.yaml mangler eller er ufullstendig", () => {
  const root = repo();
  mkdirSync(join(root, "losninger/ny"));
  write(root, "losninger/klage/losning.yaml", "formal: Klager\nstatus: ferdig\nintegrasjoner: [fiks]\nbygger-pa: { standard: klage }\n");
  const f = run(root).filter((x) => x.check === "losning");
  assert.deepEqual(f.map((x) => `${x.level ?? "fail"} ${x.message}`).sort(), [
    "fail bygger-pa må være «egen», eller { standard: <navn>, versjon: <versjon> }, når løsningen er ute av utkast",
    "fail eier mangler",
    "fail losning.yaml mangler. Lag en ny løsning med node scripts/ny-losning.mjs",
    "fail status må være utkast, i-test, i-bruk, avviklet",
    "warn Integrasjonen fiks står ikke i integrasjoner/",
  ]);
  rmSync(root, { recursive: true });
});

test("en hemmelighet med verdi stoppes, i hemmeligheter.yaml, neo.yaml, personaene og testcasene", () => {
  const root = repo();
  write(root, "integrasjoner/altinn/hemmeligheter.yaml", "maskinporten-nokkel: abc123\nannen:\n  $env: X\n");
  write(root, "integrasjoner/altinn/neo.yaml", "klient:\n  secret: abc\n");
  write(root, "test/personaer/leder.yaml", "navn: Lea\nrolle: leder\nhemmeligheter:\n  passord: hemmelig\n");
  write(root, "losninger/tilskudd/6-test/testcaser/b.yaml", "beskrivelse: b\nforventet: { krav: [frist] }\ninn: { password: x }\n");
  const f = run(root);
  assert.deepEqual(msgs(f, "integrasjon"), [
    "annen må være { $env: <variabel>, kilde: azure-keyvault:<hvelv>/<navn> } (og fil: true for en nøkkelfil), uten verdien",
    "klient.secret står med verdi. En hemmelighet står som { $env: …, kilde: … }, og verdien ligger i hvelvet",
    "maskinporten-nokkel må være { $env: <variabel>, kilde: azure-keyvault:<hvelv>/<navn> } (og fil: true for en nøkkelfil), uten verdien",
  ]);
  assert.deepEqual(msgs(f, "persona"), [
    "hemmeligheter.passord må være { $env: <variabel>, kilde: azure-keyvault:<hvelv>/<navn> } (og fil: true for en nøkkelfil), uten verdien",
    "hemmeligheter.passord står med verdi. En hemmelighet står som { $env: …, kilde: … }, og verdien ligger i hvelvet",
  ]);
  assert.deepEqual(msgs(f, "test"), ["inn.password står med verdi. En hemmelighet står som { $env: …, kilde: … }, og verdien ligger i hvelvet"]);
  assert.deepEqual(secretValues({ a: { $env: "A", kilde: "k" }, keyFile: ".keys/x.pem" }, SECRET_KEY), []);
  rmSync(root, { recursive: true });
});

test("oppgavene hos kunden trenger status og hvem, og det de venter på, må finnes", () => {
  const root = repo();
  write(root, "integrasjoner/entra/hos-kunden.md", "## sso SSO\n\n```yaml\nstatus: snart\n```\n\n## sso Igjen\n\n```yaml\nstatus: ferdig\nhvem: IT\netter: [borte, fiks/x]\n```\n");
  assert.deepEqual(msgs(run(root), "integrasjon"), [
    "Id-en sso er brukt før i integrasjoner/entra/hos-kunden.md",
    "sso: hvem mangler (rollen hos kunden som gjør det)",
    "sso: status må være ikke-startet, i-gang, ferdig",
    "sso: venter på entra/borte, som ikke finnes",
    "sso: venter på fiks/x, som ikke finnes",
  ]);
  rmSync(root, { recursive: true });
});

test("en testcase trenger beskrivelse og krav som finnes; en test i test/ går gjennom minst to løsninger", () => {
  const root = repo();
  write(root, "losninger/tilskudd/6-test/testcaser/fjordlys.yaml", "persona: ukjent\nforventet:\n  krav: [frist, borte]\n");
  write(root, "losninger/tilskudd/6-test/testcaser/tom.yaml", "beskrivelse: x\n");
  write(root, "test/innboks.yaml", "beskrivelse: x\nlosninger: [tilskudd]\nforventet: { krav: [frist] }\n");
  const f = run(root).filter((x) => x.check === "test");
  assert.deepEqual(f.map((x) => `${x.level ?? "fail"} ${x.message}`).sort(), [
    "fail En test i test/ går gjennom flere løsninger: losninger må ha minst to",
    "fail Kravet borte finnes ikke i noen 3-krav/",
    "fail beskrivelse mangler",
    "fail forventet mangler: det oppsettet skal gjøre med saken",
    "warn Personaen ukjent finnes ikke (test/personaer/ukjent.yaml)",
  ]);
  rmSync(root, { recursive: true });
});

test("en løsning i utkast trenger ikke bygger-pa ennå; ute av utkast gjør den det", () => {
  const root = repo();
  write(root, "losninger/ny/losning.yaml", "formal: Ny\neier: Kunden\nstatus: utkast\nintegrasjoner: []\nbygger-pa:\n");
  assert.deepEqual(msgs(run(root), "losning"), []);
  write(root, "losninger/ny/losning.yaml", "formal: Ny\neier: Kunden\nstatus: i-test\nintegrasjoner: []\nbygger-pa:\n");
  assert.deepEqual(msgs(run(root), "losning"), ["bygger-pa må være «egen», eller { standard: <navn>, versjon: <versjon> }, når løsningen er ute av utkast"]);
  rmSync(root, { recursive: true });
});

test("en referanse kan ha fil: true, men ikke andre felt eller en fil som ikke er sann eller usann", () => {
  assert.ok(isRef({ $env: "A", kilde: "azure-keyvault:kv/a", fil: true }));
  assert.ok(!isRef({ $env: "A", kilde: "azure-keyvault:kv/a", fil: "ja" }));
  assert.ok(!isRef({ $env: "A", kilde: "azure-keyvault:kv/a", verdi: "x" }));
});

test("en YAML-fil som ikke kan leses, er et funn med linjen", () => {
  const root = repo();
  write(root, "losninger/klage/losning.yaml", "formal: [a\n");
  assert.match(msgs(run(root), "losning")[0], /Kan ikke leses som YAML \(linje 2: /);
  rmSync(root, { recursive: true });
});
