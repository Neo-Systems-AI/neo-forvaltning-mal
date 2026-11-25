// Sjekken av konfigfilene i 5-oppsett/, i hver løsning og i organisasjon/: hver fil er Neos format, validert mot
// skjemaet Neo serverer for miljøet (GET <neo>/api/config/schema), ligger på stien nøkkelen gir, og står bare ett sted.
// spor.yaml i en løsning viser til filer og krav som finnes. Formen står i .claude/rules/oppsett.md.
//
// Skjemaet hentes, det kopieres aldri. Når det ikke kan hentes, er det et rødt funn: filene er da ikke validert, og
// sjekken hopper ikke stille over dem. Reglene skjemaet ikke uttrykker (pekerne mellom objektene, unike etiketter i en
// liste), sjekker planen i Neo (/config:plan-change).
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import Ajv from "ajv";
import { parseYaml } from "./yaml.mjs";
import { allRequirements, solutions, walk } from "./research.mjs";

export const OPPSETT_CHECKS = [
  { name: "oppsett", about: "Hver fil i 5-oppsett/ er Neos format, gyldig mot skjemaet fra Neo, på stien nøkkelen gir, og bare ett sted" },
  { name: "spor", about: "spor.yaml i hver løsning viser til filer og krav som finnes" },
];

export const SPOR = "spor.yaml";
const IGNORED = new Set(["README.md", ".gitkeep"]);

// Stedene oppsettet står. Stien Neo får, er stien under 5-oppsett/.
export const places = (root) => [
  { dir: "organisasjon/5-oppsett" },
  ...solutions(root).map((s) => ({ dir: `losninger/${s}/5-oppsett`, losning: s })),
];

// Filnavnet for en nøkkel, som i Neo (fileStemOf): små bokstaver, æøå omskrevet, aksenter fjernet, og alt annet enn
// a–z og 0–9 som én bindestrek.
const TRANSLITERATE = { æ: "ae", ø: "o", å: "a" };
export const fileStemOf = (key) =>
  String(key)
    .toLowerCase()
    .replace(/[æøå]/g, (c) => TRANSLITERATE[c] ?? c)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Konfigfilene: alt under 5-oppsett/ unntatt spor.yaml i roten av en løsnings 5-oppsett/.
export function configFiles(root) {
  const out = [];
  for (const place of places(root)) {
    for (const abs of walk(join(root, place.dir))) {
      const path = relative(join(root, place.dir), abs).split("\\").join("/");
      if (IGNORED.has(path.split("/").pop())) continue;
      if (place.losning && path === SPOR) continue;
      out.push({ place, path, file: relative(root, abs) });
    }
  }
  return out;
}

const defaultFetchJson = (url) =>
  fetch(url, { signal: AbortSignal.timeout(20000) }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))));

// Samme sti to steder: Neo har én fil per nøkkel, så to steder ville skrevet over hverandre.
function duplicates(files, f) {
  const byPath = new Map();
  for (const x of files) byPath.set(x.path, [...(byPath.get(x.path) ?? []), x]);
  for (const [path, xs] of byPath) {
    if (xs.length < 2) continue;
    for (const x of xs) f.push({ check: "oppsett", file: x.file, message: `Samme nøkkel (${path}) står også i ${xs.filter((y) => y !== x).map((y) => y.place.dir).join(", ")}. Et objekt står ett sted: i organisasjon/5-oppsett/ når flere løsninger bruker det` });
  }
}

export async function checkOppsett(root, { schemaUrl, env, fetchJson = defaultFetchJson } = {}) {
  const f = [];
  const files = configFiles(root);
  duplicates(files, f);
  checkSpor(root, files, f);
  if (!files.length) return f;

  const where = `${files.length} fil${files.length === 1 ? "" : "er"} i 5-oppsett/ er ikke validert`;
  if (!schemaUrl) return [...f, { check: "oppsett", file: ".claude/neo.config.json", message: `Adressen til Neo (neo.byEnv.<miljø>.url) mangler, så skjemaet kan ikke hentes: ${where}` }];
  let manifest;
  try {
    manifest = await fetchJson(schemaUrl);
    if (!Array.isArray(manifest?.kinds)) throw new Error("svaret er ikke manifestet for konfig som fil");
  } catch (e) {
    return [...f, { check: "oppsett", file: ".claude/neo.config.json", message: `Fikk ikke hentet skjemaet fra Neo${env ? ` i ${env}` : ""} (${schemaUrl}: ${e.message}), så ${where}. Sjekk nettet og at Neo svarer, og kjør sjekken på nytt` }];
  }

  const byDir = new Map(manifest.kinds.map((k) => [k.directory, k]));
  const byKind = new Map(manifest.kinds.map((k) => [k.kind, k]));
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validators = new Map();
  const validator = async (k) => {
    if (!validators.has(k.kind)) validators.set(k.kind, fetchJson(k.schema).then((s) => ajv.compile(s)));
    return validators.get(k.kind);
  };
  const dirs = [...byDir.keys()].join(", ");

  for (const x of files) {
    const at = { check: "oppsett", file: x.file };
    const parts = x.path.split("/");
    const k = byDir.get(parts[0]);
    if (parts.length !== 2 || !k || !x.path.endsWith(".yaml")) {
      f.push({ ...at, message: `Ligger ikke i en mappe for en type i Neo. En konfigfil er <mappe>/<nøkkel>.yaml under 5-oppsett/, med mappene ${dirs}` });
      continue;
    }
    let doc;
    try {
      doc = parseYaml(readFileSync(join(root, x.file), "utf8"));
    } catch (e) {
      f.push({ ...at, message: `Kan ikke leses som YAML (${e.message})` });
      continue;
    }
    if (doc?.kind && doc.kind !== k.kind && byKind.has(doc.kind)) {
      f.push({ ...at, message: `Fila er ${doc.kind}, men ligger i mappa for ${k.kind} (${k.directory}/). Flytt den til ${byKind.get(doc.kind).directory}/` });
      continue;
    }
    let validate;
    try {
      validate = await validator(k);
    } catch (e) {
      f.push({ ...at, message: `Fikk ikke hentet skjemaet for ${k.kind} (${k.schema}: ${e.message}), så fila er ikke validert` });
      continue;
    }
    if (!validate(doc)) {
      for (const err of validate.errors.slice(0, 10)) f.push({ ...at, message: `${err.instancePath || "/"} ${err.message}${err.params?.additionalProperty ? ` (${err.params.additionalProperty})` : ""}` });
      continue;
    }
    const key = k.keyFields.map((n) => doc.spec?.[n]).join("/");
    const want = `${k.directory}/${fileStemOf(key)}.yaml`;
    if (x.path !== want) f.push({ ...at, message: `Nøkkelen «${key}» gir ${want}, men fila heter ${x.path}. Gi fila navnet nøkkelen gir, eller rett nøkkelen` });
  }
  return f;
}

// spor.yaml: et kart fra stien under 5-oppsett/ til kravene fila oppfyller, med id-ene fra 3-krav/ i samme løsning.
export function checkSpor(root, files, f) {
  const krav = allRequirements(root);
  for (const s of solutions(root)) {
    const dir = `losninger/${s}/5-oppsett`;
    const rel = `${dir}/${SPOR}`;
    const mine = files.filter((x) => x.place.losning === s);
    const ids = new Set(krav.filter((r) => r.place.dir === `losninger/${s}`).map((r) => r.id));
    let spor = {};
    if (existsSync(join(root, rel))) {
      try {
        spor = parseYaml(readFileSync(join(root, rel), "utf8")) ?? {};
      } catch (e) {
        f.push({ check: "spor", file: rel, message: `Kan ikke leses som YAML (${e.message})` });
        continue;
      }
      if (typeof spor !== "object" || Array.isArray(spor)) {
        f.push({ check: "spor", file: rel, message: "spor.yaml er et kart fra fila (stien under 5-oppsett/) til kravene den oppfyller" });
        continue;
      }
      for (const [path, v] of Object.entries(spor)) {
        if (!mine.some((x) => x.path === path)) f.push({ check: "spor", file: rel, message: `${path} finnes ikke i ${dir}/` });
        const list = Array.isArray(v) ? v.map(String) : v == null ? [] : [String(v)];
        if (!list.length) f.push({ check: "spor", file: rel, message: `${path}: kravene fila oppfyller, mangler` });
        for (const id of list) if (!ids.has(id)) f.push({ check: "spor", file: rel, message: `${path}: kravet ${id} finnes ikke i losninger/${s}/3-krav/` });
      }
    }
    for (const x of mine) if (!(x.path in spor)) f.push({ check: "spor", level: "warn", file: x.file, message: `Står ikke i ${rel}: hvilke krav fila oppfyller` });
  }
}

