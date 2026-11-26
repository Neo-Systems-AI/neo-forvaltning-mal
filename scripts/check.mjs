#!/usr/bin/env node
// Kontrollen for kunderepoet: kundefila er fylt ut, oppsettet er gyldige filer, ingen rå svar er committet, researchen,
// løsningene, integrasjonene, personaene og testene har formen sin, lista over det kunden må gjøre er oppdatert, og
// repoet sier fra når malen eller pluginen har en nyere versjon. Rødt stopper PR-en; gult sier fra uten å stoppe.
//
//   node scripts/check.mjs [--annotate] [--summary] [--offline] [--root <dir>]
import { appendFileSync, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";
import { parseYaml } from "./yaml.mjs";
import { checkResearch, RESEARCH_CHECKS } from "./research.mjs";
import { checkStruktur, STRUKTUR_CHECKS } from "./struktur.mjs";
import { checkListe, HOS_KUNDEN_CHECKS } from "./hos-kunden.mjs";

export const CHECKS = [
  { name: "kunde", about: "kunde.yaml finnes og har kunde, godkjenner og versjoner" },
  { name: "config", about: ".claude/neo.config.json er gyldig, har miljøene, og ingen hemmelighet står med verdi" },
  { name: "hemmeligheter", about: "Ingen .env-fil eller nøkkel er committet" },
  { name: "oppsett", about: "Hver fil i oppsett/ og snapshots/ er en konfig-fil fra Neo (neo-config/v1), og ingen rå svar er committet" },
  { name: "godkjenner", about: "CODEOWNERS nevner en ekte godkjenner" },
  ...RESEARCH_CHECKS,
  ...STRUKTUR_CHECKS,
  ...HOS_KUNDEN_CHECKS,
  { name: "versjon", about: "Malen og pluginen er på nyeste versjon" },
];

export const UPSTREAM = {
  mal: "https://raw.githubusercontent.com/Neo-Systems-AI/neo-forvaltning-mal/main/VERSION",
  marked: "https://raw.githubusercontent.com/Neo-Systems-AI/neo-forvaltning/main/.claude-plugin/marketplace.json",
};

const walk = (dir) => (existsSync(dir) ? readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)])) : []);

// En fil i oppsett/ og snapshots/ er en konfig-fil i Neo sitt format, ett objekt per fil. Her sjekkes bare at den er det;
// om innholdet er gyldig, avgjør Neo i planen (`/forvaltning:plan`). Unntak: README-ene, `ikke-med.md` fra snapshotet
// og det som gjøres for hånd i `oppsett/manuelt/`.
export function checkConfigFile(rel, text) {
  if (/(^|\/)README\.md$/.test(rel) || /(^|\/)ikke-med\.md$/.test(rel) || /^oppsett\/manuelt\//.test(rel) || rel.endsWith(".gitkeep")) return [];
  if (rel.endsWith(".json")) return [{ check: "oppsett", file: rel, message: "Formen fra før forvaltning 0.2.0. Ta et nytt snapshot (/forvaltning:snapshot) og bygg oppsettet fra filene Neo skriver" }];
  if (!rel.endsWith(".yaml")) return [{ check: "oppsett", file: rel, message: "Ikke en konfig-fil. Oppsettet er .yaml-filer fra Neo; det som gjøres for hånd, står i oppsett/manuelt/" }];
  const missing = [/^apiVersion: neo-config\/v1$/m, /^kind: \S+/m, /^spec:/m].filter((re) => !re.test(text));
  return missing.length ? [{ check: "oppsett", file: rel, message: "Ikke en konfig-fil fra Neo: den må ha apiVersion: neo-config/v1, kind og spec øverst" }] : [];
}

// En nøkkel med et navn som dette er en hemmelighet, og skal stå som { "$env": … }, aldri med verdien.
export const SECRET_KEY = /(passord|password|secret|hemmelig|token|apikey|api_key|privatekey|private_key|nokkel|nøkkel|^key$|keypem)/i;

export function checkConfig(root) {
  const f = [];
  const file = ".claude/neo.config.json";
  if (!existsSync(join(root, file))) return [{ check: "config", file, message: "Mangler. Pluginene leser den; kjør /forvaltning:oppstart" }];
  let data;
  try {
    data = JSON.parse(readFileSync(join(root, file), "utf8"));
  } catch (e) {
    return [{ check: "config", file, message: `Ikke gyldig JSON: ${e.message}` }];
  }
  if (data.version !== 1) f.push({ check: "config", file, message: "version må være 1" });
  const envs = data.neo?.environments;
  if (!Array.isArray(envs) || !envs.length) f.push({ check: "config", file, message: "neo.environments mangler" });
  for (const [env, v] of Object.entries(data.neo?.byEnv ?? {})) {
    if (!v?.mcpServer) f.push({ check: "config", level: "warn", file, message: `MCP-serveren for ${env} er ikke satt` });
    if (String(v?.url ?? "").includes("<")) f.push({ check: "config", level: "warn", file, message: `Adressen til Neo for ${env} er ikke fylt ut` });
    if (v?.apiClient !== undefined && String(v.apiClient?.clientId ?? "").includes("<")) f.push({ check: "config", level: "warn", file, message: `Maskinklienten for ${env} er ikke fylt ut (neo.byEnv.${env}.apiClient). Skriptene i forvaltning trenger den` });
  }
  const walkJson = (x, path) => {
    if (x && typeof x === "object" && !Array.isArray(x) && "$env" in x) return;
    if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) {
      const p = path ? `${path}.${k}` : k;
      if (SECRET_KEY.test(k) && typeof v === "string" && v && !/Dir$|File$/i.test(k)) f.push({ check: "config", file, message: `${p} står med verdi. En hemmelighet skal stå som {"$env": "…", "kilde": "…"}, og verdien ligge i kundens hvelv` });
      walkJson(v, p);
    }
  };
  walkJson(data, "");
  return f;
}

// Filene git følger. I CI er det det som er committet; lokalt er en hentet .env.local ikke et funn før den legges til.
export function tracked(root) {
  try {
    return execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

export const checkCommitted = (files) =>
  files.filter((p) => /(^|\/)(\.env(\.[^/]*)?|\.keys\/.*)$/.test(p) && !p.endsWith(".example")).map((p) => ({ check: "hemmeligheter", file: p, message: "Hemmeligheter er committet. Fjern fila fra git, og bytt verdiene i hvelvet: de er ikke hemmelige lenger" }));

const newer = (a, b) => {
  const [x, y] = [a, b].map((v) => String(v).split(".").map(Number));
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) > (y[i] ?? 0);
  return false;
};

export async function run(root, { offline = false, fetchText = (u) => fetch(u).then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.status)))) } = {}) {
  const f = [];
  const kf = join(root, "kunde.yaml");
  let kunde = {};
  if (!existsSync(kf)) f.push({ check: "kunde", file: "kunde.yaml", message: "Mangler. Kundefila sier hvem repoet forvalter for" });
  else {
    try {
      kunde = parseYaml(readFileSync(kf, "utf8")) ?? {};
    } catch (e) {
      f.push({ check: "kunde", file: "kunde.yaml", message: `Kan ikke leses som YAML (${e.message})` });
    }
    for (const k of ["kunde", "godkjenner", "verktoy"]) if (!kunde[k]) f.push({ check: "kunde", file: "kunde.yaml", message: `«${k}» mangler` });
  }
  f.push(...checkConfig(root));
  f.push(...checkCommitted(tracked(root)));
  for (const file of [...walk(join(root, "oppsett")), ...walk(join(root, "snapshots"))]) {
    const rel = relative(root, file);
    if (/(^|\/)raw\//.test(rel)) f.push({ check: "oppsett", file: rel, message: "Et rått svar er committet. raw/ skal stå i .gitignore" });
    else f.push(...checkConfigFile(rel, readFileSync(file, "utf8")));
  }
  f.push(...checkResearch(root));
  f.push(...checkStruktur(root, { secretKey: SECRET_KEY }));
  f.push(...checkListe(root));
  const co = join(root, ".github/CODEOWNERS");
  if (!existsSync(co) || /@ENDRE-MEG/.test(readFileSync(co, "utf8"))) f.push({ check: "godkjenner", level: "warn", file: ".github/CODEOWNERS", message: "Godkjenneren er ikke satt. Uten den kan hvem som helst med skrivetilgang godkjenne en endring" });
  if (!offline) {
    try {
      const mal = (await fetchText(UPSTREAM.mal)).trim();
      const have = kunde.verktoy?.mal ?? readFileSync(join(root, "VERSION"), "utf8").trim();
      if (newer(mal, have)) f.push({ check: "versjon", level: "warn", file: "kunde.yaml", message: `Malen er ${mal}, repoet er laget fra ${have}. Se hva som er endret i neo-forvaltning-mal` });
      const market = JSON.parse(await fetchText(UPSTREAM.marked));
      const latest = market.plugins?.find((p) => p.name === "forvaltning")?.version;
      if (latest && kunde.verktoy?.forvaltning && newer(latest, kunde.verktoy.forvaltning)) f.push({ check: "versjon", level: "warn", file: "kunde.yaml", message: `forvaltning er ${latest}, repoet sier ${kunde.verktoy.forvaltning}. Oppdater pluginen og versjonen i kunde.yaml` });
    } catch (e) {
      f.push({ check: "versjon", level: "warn", file: "kunde.yaml", message: `Kunne ikke lese nyeste versjon (${e.message})` });
    }
  }
  return f.map((x) => ({ level: "fail", ...x }));
}

const esc = (s) => String(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");

export function summary(findings) {
  const rows = CHECKS.map(({ name, about }) => {
    const mine = findings.filter((x) => x.check === name);
    const fails = mine.filter((x) => x.level === "fail").length;
    return `| ${name} | ${about} | ${fails ? `❌ ${fails} å rette` : mine.length ? `⚠️ ${mine.length} å se på` : "✅ ok"} |`;
  });
  const details = findings.length ? `\n<details><summary>Funnene</summary>\n\n${findings.map((x) => `- ${x.level === "fail" ? "❌" : "⚠️"} \`${x.file}${x.line ? `:${x.line}` : ""}\`: ${x.message}`).join("\n")}\n</details>\n` : "";
  return `## Kunderepoet\n\n| Sjekk | Hva den sjekker | Resultat |\n|---|---|---|\n${rows.join("\n")}\n${details}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const root = args.includes("--root") ? args[args.indexOf("--root") + 1] : process.cwd();
  const findings = await run(root, { offline: args.includes("--offline") });
  for (const x of findings) console.log(`${x.level === "fail" ? "✗" : "!"} ${x.file}${x.line ? `:${x.line}` : ""}: ${x.message}`);
  if (args.includes("--annotate")) for (const x of findings) console.log(`::${x.level === "fail" ? "error" : "warning"} file=${x.file}${x.line ? `,line=${x.line}` : ""},title=${x.check}::${esc(x.message)}`);
  if (args.includes("--summary")) {
    const text = summary(findings);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text);
    else console.log(text);
  }
  if (!findings.length) console.log("Ingen funn.");
  process.exit(findings.some((x) => x.level === "fail") ? 1 : 0);
}
