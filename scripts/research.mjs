// Sjekkene for researchen, i virksomheten/ og i hver løsning: kildene står uendret og i registeret, hver påstand i
// forståelsen viser til en kilde som finnes, og hvert krav har flyt, hvorfor og en kilde som finnes. Formen står i
// .claude/rules/ (kilder.md, forstaelse.md, krav.md). Om en påstand stemmer med kilden, sjekkes ikke her; det gjør
// kontrollen mot kildene.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";
import { parseYaml } from "./yaml.mjs";

export const RESEARCH_CHECKS = [
  { name: "kilder", about: "En lagret kilde endres aldri, og hver fil står i registeret" },
  { name: "forstaelse", about: "Hver påstand i forståelsen viser til en kilde som finnes" },
  { name: "krav", about: "Hvert krav har flyt, hvorfor og en kilde som finnes, og en id som bare er brukt én gang" },
];

export const FLYT = ["deterministisk", "agentisk", "menneske"];

export const walk = (dir) => (existsSync(dir) ? readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)])) : []);
const md = (dir) => walk(dir).filter((f) => f.endsWith(".md") && !f.endsWith("README.md"));

// Løsningene: hver mappe i losninger/.
export const solutions = (root) => (existsSync(join(root, "losninger")) ? readdirSync(join(root, "losninger")).filter((n) => statSync(join(root, "losninger", n)).isDirectory()).sort() : []);

// Stedene researchen står: virksomheten (uten krav) og hver løsning. Stiene er relative til repoet.
export function places(root) {
  return [
    { dir: "virksomheten", kilder: "virksomheten/kilder", forstaelse: "virksomheten/forstaelse" },
    ...solutions(root).map((s) => ({ dir: `losninger/${s}`, kilder: `losninger/${s}/1-kilder`, forstaelse: `losninger/${s}/2-forstaelse`, krav: `losninger/${s}/3-krav` })),
  ];
}

// Id-ene i registeret: første kolonne i tabellen i kilder.md (E1, K1, K20 …).
export function registry(root, kilder) {
  const file = join(root, kilder, "kilder.md");
  const ids = new Map();
  if (!existsSync(file)) return ids;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = /^\|\s*([EK]\d+)\s*\|/.exec(line);
    if (m) ids.set(m[1], line);
  }
  return ids;
}

// Id-ene en tekst viser til i hakeparentes: [K1], [K14 § 7], [E1, K3], [K7–K9] (et intervall gir hvert tall i det).
export function citations(text) {
  const out = [];
  for (const [, inner] of text.matchAll(/\[([^\]]*\b[EK]\d+\b[^\]]*)\](?!\()/g)) {
    for (const m of inner.matchAll(/\b([EK])(\d+)(?:\s*[–-]\s*\1?(\d+))?/g)) {
      const [from, to] = [Number(m[2]), m[3] ? Number(m[3]) : Number(m[2])];
      for (let n = from; n <= to && n - from < 100; n++) out.push(`${m[1]}${n}`);
    }
  }
  return out;
}

// De øverste punktene i en markdown-fil, hvert med underpunktene og linjene som hører til, og overskriften det står
// under. Et punkt slutter ved neste punkt på samme nivå, en tom linje eller en overskrift.
export function claims(text) {
  const out = [];
  let section = "";
  let cur = null;
  let fence = false;
  text.split("\n").forEach((line, i) => {
    if (/^\s*```/.test(line)) fence = !fence;
    if (fence) return;
    const h = /^#{1,6}\s+(.*)$/.exec(line);
    if (h) {
      section = h[1].trim();
      cur = null;
      return;
    }
    if (/^- /.test(line)) {
      cur = { line: i + 1, section, text: line };
      out.push(cur);
    } else if (cur && line.trim() && /^\s+/.test(line)) cur.text += `\n${line}`;
    else if (!line.trim()) cur = null;
  });
  return out;
}

// Spørsmålene til kunden står under denne overskriften, og er ikke påstander.
const QUESTIONS = /^det kildene ikke svarer på/i;

// Ankerne i en markdown-fil, slik GitHub lager dem, og id-ene til items («## <id> <tittel>»).
const slug = (h) => h.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s/g, "-");
export const anchors = (text) => {
  const out = new Set();
  for (const [, h] of text.matchAll(/^#{1,6}\s+(.*?)\s*$/gm)) {
    out.add(slug(h.replace(/[`*_]/g, "")));
    const id = /^([a-z0-9][a-z0-9-]*)\s/.exec(h);
    if (id) out.add(id[1]);
  }
  return out;
};

// Items i en markdown-fil: «## <id> <tittel>» med en yaml-blokk rett under. Kravene og oppgavene hos kunden har
// denne formen. En blokk leseren ikke forstår, gir feltet `error` i stedet for feltene.
export function items(text) {
  const out = [];
  const re = /^## (\S+)([^\n]*)\n+```yaml\n([\s\S]*?)\n```/gm;
  let m;
  while ((m = re.exec(text))) {
    const line = text.slice(0, m.index).split("\n").length;
    let fields = {};
    let error;
    try {
      fields = parseYaml(m[3]) ?? {};
      if (typeof fields !== "object" || Array.isArray(fields)) throw new Error("blokken er ikke et kart");
    } catch (e) {
      error = e.message;
      fields = {};
    }
    out.push({ id: m[1], title: m[2].trim(), line, fields, error });
  }
  return out;
}

const list = (v) => (v == null ? [] : Array.isArray(v) ? v.map(String) : [String(v)]);

// Endringer og slettinger av lagrede kilder i historikken, i alle løsningene og i virksomheten. Trenger hele
// historikken (fetch-depth: 0 i CI).
export function changedSources(root) {
  try {
    const out = execFileSync("git", ["-c", "core.quotePath=false", "log", "--format=", "--name-status", "--no-renames", "--", ":(glob)virksomheten/kilder/filer/**", ":(glob)losninger/*/1-kilder/filer/**"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return out.split("\n").filter((l) => /^[MD]\t/.test(l)).map((l) => ({ status: l[0], file: l.slice(2) }));
  } catch {
    return null;
  }
}

// Alle kravene i repoet, med stedet de står. Brukes også av testsjekken.
export function allRequirements(root) {
  const out = [];
  for (const p of places(root).filter((x) => x.krav)) {
    for (const file of md(join(root, p.krav))) for (const r of items(readFileSync(file, "utf8"))) out.push({ ...r, place: p, file: relative(root, file) });
  }
  return out;
}

export function checkResearch(root) {
  const f = [];

  // 1. Kildene: ingen er endret eller slettet i historikken.
  const changed = changedSources(root);
  if (changed === null) f.push({ check: "kilder", level: "warn", file: ".", message: "Fikk ikke lest historikken, så det er ikke sjekket at kildene er uendret" });
  else for (const c of changed) f.push({ check: "kilder", file: c.file, message: c.status === "M" ? "En lagret kilde er endret. En kilde endres aldri: en ny versjon får en ny id og en ny fil" : "En lagret kilde er slettet. En kilde slettes aldri" });

  for (const p of places(root)) {
    const ids = registry(root, p.kilder);

    // 2. Hver lagret fil står i registeret.
    const kilder = join(root, p.kilder, "kilder.md");
    const register = existsSync(kilder) ? readFileSync(kilder, "utf8") : "";
    for (const file of walk(join(root, p.kilder, "filer")).filter((x) => !x.endsWith(".gitkeep"))) {
      const name = relative(join(root, p.kilder), file);
      if (!register.includes(`(${name})`) && !register.includes(`\`${name}\``)) f.push({ check: "kilder", file: relative(root, file), message: `Fila står ikke i registeret (${p.kilder}/kilder.md). En lagret kilde har en id og opphav` });
    }

    // 3. Forståelsen: hvert punkt viser til en kilde, og hver kilde det viser til, finnes i registeret på samme sted.
    for (const file of md(join(root, p.forstaelse))) {
      const rel = relative(root, file);
      for (const c of claims(readFileSync(file, "utf8"))) {
        if (QUESTIONS.test(c.section)) continue;
        const cited = citations(c.text);
        // En henvisning til en annen dimensjon («står i `03-forlop.md`») er ikke en påstand, og trenger ingen kilde.
        if (!cited.length && /`\d\d-[\w-]+\.md`/.test(c.text)) continue;
        if (!cited.length) f.push({ check: "forstaelse", file: rel, line: c.line, message: `Påstanden viser ikke til en kilde: «${c.text.split("\n")[0].slice(2, 80)}»` });
        for (const id of cited) if (!ids.has(id)) f.push({ check: "forstaelse", file: rel, line: c.line, message: `${id} står ikke i registeret (${p.kilder}/kilder.md)` });
      }
    }
  }

  // 4. Kravene: flyt, hvorfor og en kilde som finnes, og ingen id to ganger i repoet. En sti i kilde er relativ til
  // løsningen, som en lenke i markdown.
  const seen = new Map();
  for (const r of allRequirements(root)) {
    const at = { check: "krav", file: r.file, line: r.line };
    if (r.error) {
      f.push({ ...at, message: `${r.id}: yaml-blokken kan ikke leses (${r.error})` });
      continue;
    }
    if (seen.has(r.id)) f.push({ ...at, message: `Id-en ${r.id} er brukt før, i ${seen.get(r.id)}` });
    else seen.set(r.id, r.file);
    if (r.fields.id != null && r.fields.id !== r.id) f.push({ ...at, message: `id i blokken (${r.fields.id}) er ikke den i overskriften (${r.id})` });
    if (!FLYT.includes(r.fields.flyt)) f.push({ ...at, message: `${r.id}: flyt må være ${FLYT.join(", ")}` });
    if (!r.fields.hvorfor) f.push({ ...at, message: `${r.id}: hvorfor mangler` });
    const kilde = list(r.fields.kilde);
    if (!kilde.length) f.push({ ...at, message: `${r.id}: kilde mangler` });
    const ids = registry(root, r.place.kilder);
    for (const k of kilde) {
      if (/^[EK]\d+$/.test(k)) {
        if (!ids.has(k)) f.push({ ...at, message: `${r.id}: ${k} står ikke i registeret (${r.place.kilder}/kilder.md)` });
        continue;
      }
      const [path, anchor] = k.split("#");
      const target = join(root, r.place.dir, path);
      if (!existsSync(target)) f.push({ ...at, message: `${r.id}: ${path} finnes ikke (stien er relativ til ${r.place.dir}/)` });
      else if (anchor && !anchors(readFileSync(target, "utf8")).has(decodeURIComponent(anchor).toLowerCase())) f.push({ ...at, message: `${r.id}: overskriften #${anchor} finnes ikke i ${path}` });
    }
  }
  return f;
}
