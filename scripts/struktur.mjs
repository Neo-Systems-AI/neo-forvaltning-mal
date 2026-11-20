// Sjekkene for formen på filene repoet eier: losning.yaml i hver løsning, hemmelighetene og oppgavene til hver
// integrasjon, personaene og testcasene. Formen står i .claude/rules/. Konfigen (5-oppsett/, organisasjon/ utenom
// personaene, neo.yaml) har ingen fast form ennå, og sjekkes ikke her utover at ingen hemmelighet står med verdi.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { parseYaml } from "./yaml.mjs";
import { allRequirements, items, solutions, walk } from "./research.mjs";

export const STRUKTUR_CHECKS = [
  { name: "losning", about: "Hver løsning har losning.yaml med formål, eier, status, integrasjonene og hva den bygger på" },
  { name: "integrasjon", about: "Hemmelighetene er referanser til hvelvet, og oppgavene hos kunden har status, hvem og det de venter på" },
  { name: "persona", about: "Hver persona har navn og rolle, og passordene står som referanser til hvelvet" },
  { name: "test", about: "Hver testcase har en beskrivelse og det som skal skje, med krav som finnes" },
];

export const STATUS_LOSNING = ["utkast", "i-test", "i-bruk", "avviklet"];
export const STATUS_OPPGAVE = ["ikke-startet", "i-gang", "ferdig"];
export const PERSONAER = "organisasjon/team-og-roller/personaer";

const dirs = (root, dir) => (existsSync(join(root, dir)) ? readdirSync(join(root, dir)).filter((n) => statSync(join(root, dir, n)).isDirectory()).sort() : []);
const yamlFiles = (root, dir) => walk(join(root, dir)).filter((f) => /\.ya?ml$/.test(f)).map((f) => relative(root, f)).sort();
const isRef = (v) => v && typeof v === "object" && !Array.isArray(v) && typeof v.$env === "string" && v.$env && typeof v.kilde === "string" && v.kilde && Object.keys(v).length === 2;
const text = (v) => typeof v === "string" && v.trim() !== "";
const list = (v) => (v == null ? [] : Array.isArray(v) ? v.map(String) : [String(v)]);

// Leser en YAML-fil. En fil som ikke kan leses, er et funn i sjekken som eier fila.
export function readYaml(root, rel, check, f) {
  try {
    return parseYaml(readFileSync(join(root, rel), "utf8"));
  } catch (e) {
    f.push({ check, file: rel, message: `Kan ikke leses som YAML (${e.message})` });
    return undefined;
  }
}

// En nøkkel som ser ut som en hemmelighet, skal ha en referanse til hvelvet ({ $env, kilde }), aldri verdien.
export function secretValues(data, secretKey, path = "") {
  const out = [];
  if (isRef(data)) return out;
  if (data && typeof data === "object") {
    for (const [k, v] of Object.entries(data)) {
      const p = path ? `${path}.${k}` : k;
      if (secretKey.test(k) && v != null && typeof v !== "object" && !/Dir$|File$/i.test(k)) out.push(p);
      else out.push(...secretValues(v, secretKey, p));
    }
  }
  return out;
}

const noSecrets = (data, secretKey, check, file, f) => {
  for (const p of secretValues(data, secretKey)) f.push({ check, file, message: `${p} står med verdi. En hemmelighet står som { $env: …, kilde: … }, og verdien ligger i kundens hvelv` });
};

export function checkLosninger(root, f) {
  const systems = new Set(dirs(root, "integrasjoner"));
  for (const s of solutions(root)) {
    const file = `losninger/${s}/losning.yaml`;
    if (!existsSync(join(root, file))) {
      f.push({ check: "losning", file: `losninger/${s}`, message: "losning.yaml mangler. Den sier formålet, eieren, statusen, integrasjonene og hva løsningen bygger på" });
      continue;
    }
    const y = readYaml(root, file, "losning", f);
    if (y === undefined) continue;
    if (!y || typeof y !== "object" || Array.isArray(y)) {
      f.push({ check: "losning", file, message: "Fila er tom eller ikke et kart" });
      continue;
    }
    for (const k of ["formal", "eier"]) if (!text(y[k])) f.push({ check: "losning", file, message: `${k} mangler` });
    if (!STATUS_LOSNING.includes(y.status)) f.push({ check: "losning", file, message: `status må være ${STATUS_LOSNING.join(", ")}` });
    if (!Array.isArray(y.integrasjoner)) f.push({ check: "losning", file, message: "integrasjoner må være en liste (tom når løsningen ikke bruker noen)" });
    else for (const i of y.integrasjoner) if (!systems.has(String(i))) f.push({ check: "losning", level: "warn", file, message: `Integrasjonen ${i} står ikke i integrasjoner/` });
    const b = y["bygger-pa"];
    if (!(b === "egen" || (b && typeof b === "object" && text(b.standard) && text(String(b.versjon ?? ""))))) f.push({ check: "losning", file, message: "bygger-pa må være «egen», eller { standard: <navn>, versjon: <versjon> }" });
  }
}

// Oppgavene hos kunden, fra integrasjoner/<system>/hos-kunden.md.
export function tasks(root) {
  const out = [];
  for (const system of dirs(root, "integrasjoner")) {
    const file = `integrasjoner/${system}/hos-kunden.md`;
    if (!existsSync(join(root, file))) continue;
    for (const it of items(readFileSync(join(root, file), "utf8"))) out.push({ ...it, system, file, ref: `${system}/${it.id}`, etter: list(it.fields.etter).map((e) => (e.includes("/") ? e : `${system}/${e}`)) });
  }
  return out;
}

export function checkIntegrasjoner(root, secretKey, f) {
  for (const system of dirs(root, "integrasjoner")) {
    const sec = `integrasjoner/${system}/hemmeligheter.yaml`;
    if (existsSync(join(root, sec))) {
      const y = readYaml(root, sec, "integrasjon", f);
      if (y !== undefined && y !== null) {
        if (typeof y !== "object" || Array.isArray(y)) f.push({ check: "integrasjon", file: sec, message: "Fila er et kart fra navnet på hemmeligheten til referansen" });
        else for (const [k, v] of Object.entries(y)) if (!isRef(v)) f.push({ check: "integrasjon", file: sec, message: `${k} må være { $env: <variabel>, kilde: <hvelv>/<navn> }, uten verdien` });
      }
    }
    for (const rel of yamlFiles(root, `integrasjoner/${system}`).filter((x) => x !== sec)) {
      const y = readYaml(root, rel, "integrasjon", f);
      if (y !== undefined) noSecrets(y, secretKey, "integrasjon", rel, f);
    }
  }
  const all = tasks(root);
  const refs = new Set();
  for (const t of all) {
    const at = { check: "integrasjon", file: t.file, line: t.line };
    if (t.error) {
      f.push({ ...at, message: `${t.id}: yaml-blokken kan ikke leses (${t.error})` });
      continue;
    }
    if (refs.has(t.ref)) f.push({ ...at, message: `Id-en ${t.id} er brukt før i ${t.file}` });
    refs.add(t.ref);
    if (!STATUS_OPPGAVE.includes(t.fields.status)) f.push({ ...at, message: `${t.id}: status må være ${STATUS_OPPGAVE.join(", ")}` });
    if (!text(t.fields.hvem)) f.push({ ...at, message: `${t.id}: hvem mangler (rollen hos kunden som gjør det)` });
  }
  for (const t of all) for (const e of t.etter) if (!refs.has(e)) f.push({ check: "integrasjon", file: t.file, line: t.line, message: `${t.id}: venter på ${e}, som ikke finnes` });
}

export function personas(root) {
  return yamlFiles(root, PERSONAER).map((rel) => ({ rel, id: rel.split("/").pop().replace(/\.ya?ml$/, "") }));
}

export function checkPersonaer(root, secretKey, f) {
  for (const { rel } of personas(root)) {
    const y = readYaml(root, rel, "persona", f);
    if (y === undefined) continue;
    if (!y || typeof y !== "object" || Array.isArray(y)) {
      f.push({ check: "persona", file: rel, message: "Fila er tom eller ikke et kart" });
      continue;
    }
    for (const k of ["navn", "rolle"]) if (!text(y[k])) f.push({ check: "persona", file: rel, message: `${k} mangler` });
    if (y.hemmeligheter != null) {
      if (typeof y.hemmeligheter !== "object" || Array.isArray(y.hemmeligheter)) f.push({ check: "persona", file: rel, message: "hemmeligheter er et kart fra navnet til referansen" });
      else for (const [k, v] of Object.entries(y.hemmeligheter)) if (!isRef(v)) f.push({ check: "persona", file: rel, message: `hemmeligheter.${k} må være { $env: <variabel>, kilde: <hvelv>/<navn> }, uten verdien` });
    }
    noSecrets(y, secretKey, "persona", rel, f);
  }
}

export function checkTester(root, secretKey, f) {
  const krav = new Set(allRequirements(root).map((r) => r.id));
  const known = new Set(personas(root).map((p) => p.id));
  const sols = new Set(solutions(root));
  const files = [...solutions(root).flatMap((s) => yamlFiles(root, `losninger/${s}/6-test/testcaser`)), ...yamlFiles(root, "test")];
  for (const rel of files) {
    const y = readYaml(root, rel, "test", f);
    if (y === undefined) continue;
    if (!y || typeof y !== "object" || Array.isArray(y)) {
      f.push({ check: "test", file: rel, message: "Fila er tom eller ikke et kart" });
      continue;
    }
    if (!text(y.beskrivelse)) f.push({ check: "test", file: rel, message: "beskrivelse mangler" });
    const fv = y.forventet;
    if (!fv || typeof fv !== "object" || Array.isArray(fv)) f.push({ check: "test", file: rel, message: "forventet mangler: det oppsettet skal gjøre med saken" });
    else {
      const ids = list(fv.krav);
      if (!ids.length) f.push({ check: "test", file: rel, message: "forventet.krav mangler: kravene testcasen prøver" });
      for (const id of ids) if (!krav.has(id)) f.push({ check: "test", file: rel, message: `Kravet ${id} finnes ikke i noen 3-krav/` });
    }
    for (const p of list(y.persona)) if (!known.has(p)) f.push({ check: "test", level: "warn", file: rel, message: `Personaen ${p} står ikke i ${PERSONAER}/` });
    if (rel.startsWith("test/")) {
      const ls = list(y.losninger);
      if (ls.length < 2) f.push({ check: "test", file: rel, message: "En test i test/ går gjennom flere løsninger: losninger må ha minst to" });
      for (const l of ls) if (!sols.has(l)) f.push({ check: "test", file: rel, message: `Løsningen ${l} finnes ikke i losninger/` });
    }
    noSecrets(y, secretKey, "test", rel, f);
  }
}

export function checkStruktur(root, { secretKey }) {
  const f = [];
  checkLosninger(root, f);
  checkIntegrasjoner(root, secretKey, f);
  checkPersonaer(root, secretKey, f);
  checkTester(root, secretKey, f);
  return f;
}
