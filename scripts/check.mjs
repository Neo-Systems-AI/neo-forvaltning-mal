#!/usr/bin/env node
// Kontrollen for repoet: repo.yaml og konfigfila er fylt ut, ingen hemmelighet er committet, researchen, løsningene,
// integrasjonene, personaene og testene har formen sin, konfigfilene i 5-oppsett/ er gyldige mot skjemaet fra Neo, og
// lista over det kunden må gjøre er oppdatert. Rødt stopper PR-en; gult sier fra uten å stoppe.
//
//   node scripts/check.mjs [--annotate] [--summary] [--root <dir>]
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { parseYaml } from "./yaml.mjs";
import { checkResearch, RESEARCH_CHECKS } from "./research.mjs";
import { checkStruktur, STRUKTUR_CHECKS } from "./struktur.mjs";
import { checkOppsett, OPPSETT_CHECKS } from "./oppsett.mjs";
import { checkListe, HOS_KUNDEN_CHECKS } from "./hos-kunden.mjs";

export const CHECKS = [
  { name: "repo", about: "repo.yaml har typen, eieren, godkjenneren og forvalteren, og repoet har det typen sier" },
  { name: "config", about: ".claude/neo.config.json har miljøet, adressen, org-en og MCP-serveren, og ingen hemmelighet" },
  { name: "hemmeligheter", about: "Ingen .env-fil eller nøkkel er committet" },
  { name: "godkjenner", about: "CODEOWNERS nevner en ekte godkjenner" },
  ...RESEARCH_CHECKS,
  ...STRUKTUR_CHECKS,
  ...OPPSETT_CHECKS,
  ...HOS_KUNDEN_CHECKS,
];

export const TYPER = ["kunde", "standard"];

// En nøkkel med et navn som dette er en hemmelighet, og skal stå som { "$env": … }, aldri med verdien.
export const SECRET_KEY = /(passord|password|secret|hemmelig|token|apikey|api_key|privatekey|private_key|nokkel|nøkkel|^key$|keypem)/i;

// repo.yaml: typen, og eieren, godkjenneren og forvalteren. Et kunderepo har profil.yaml og virksomheten/; et
// standardrepo har ingen av dem.
export function checkRepo(root) {
  const f = [];
  const file = "repo.yaml";
  if (!existsSync(join(root, file))) return { type: undefined, findings: [{ check: "repo", file, message: "Mangler. repo.yaml sier hva repoet er, og hvem som eier og godkjenner" }] };
  let y;
  try {
    y = parseYaml(readFileSync(join(root, file), "utf8")) ?? {};
  } catch (e) {
    return { type: undefined, findings: [{ check: "repo", file, message: `Kan ikke leses som YAML (${e.message})` }] };
  }
  if (!TYPER.includes(y.type)) f.push({ check: "repo", file, message: `type må være ${TYPER.join(" eller ")}` });
  for (const k of ["eier", "godkjenner", "forvalter"]) {
    if (!y[k] || typeof y[k] !== "object" || Array.isArray(y[k])) f.push({ check: "repo", file, message: `${k} mangler (navn${k === "eier" ? "" : " og github"})` });
    else if (!String(y[k].navn ?? "").trim()) f.push({ check: "repo", level: "warn", file, message: `${k}.navn er ikke fylt ut` });
  }
  if (y.type === "kunde" && !existsSync(join(root, "profil.yaml"))) f.push({ check: "repo", file: "profil.yaml", message: "Et kunderepo har profil.yaml: løsningene kunden har tatt i bruk" });
  if (y.type === "standard") for (const p of ["profil.yaml", "virksomheten"]) if (existsSync(join(root, p))) f.push({ check: "repo", file: p, message: `Et standardrepo har ikke ${p}: det hører til en kunde. Slett det` });
  return { type: y.type, findings: f };
}

// Konfigfila pluginene leser. Miljøet, adressen til Neo, org-en og MCP-serveren; aldri en hemmelighet.
export function readConfig(root) {
  const file = ".claude/neo.config.json";
  if (!existsSync(join(root, file))) return { findings: [{ check: "config", file, message: "Mangler. Pluginene leser den; kjør /config:set-up-repo" }] };
  let data;
  try {
    data = JSON.parse(readFileSync(join(root, file), "utf8"));
  } catch (e) {
    return { findings: [{ check: "config", file, message: `Ikke gyldig JSON: ${e.message}` }] };
  }
  const f = [];
  if (data.version !== 1) f.push({ check: "config", file, message: "version må være 1" });
  const envs = data.neo?.environments;
  if (!Array.isArray(envs) || !envs.length) f.push({ check: "config", file, message: "neo.environments mangler" });
  const env = data.neo?.defaultEnv ?? envs?.[0];
  if (Array.isArray(envs) && !envs.includes(env)) f.push({ check: "config", file, message: `neo.defaultEnv (${env}) er ikke i neo.environments` });
  for (const [e, v] of Object.entries(data.neo?.byEnv ?? {})) {
    if (!String(v?.url ?? "").startsWith("https://")) f.push({ check: "config", file, message: `Adressen til Neo i ${e} (neo.byEnv.${e}.url) mangler` });
    if (!v?.mcpServer) f.push({ check: "config", level: "warn", file, message: `MCP-serveren for ${e} (neo.byEnv.${e}.mcpServer) er ikke satt` });
    if (!String(v?.org ?? "").trim()) f.push({ check: "config", level: "warn", file, message: `Org-en i Neo for ${e} (neo.byEnv.${e}.org) er ikke fylt ut` });
  }
  const walkJson = (x, path) => {
    if (x && typeof x === "object" && !Array.isArray(x) && "$env" in x) return;
    if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) {
      const p = path ? `${path}.${k}` : k;
      if (SECRET_KEY.test(k) && typeof v === "string" && v && !/Dir$|File$/i.test(k)) f.push({ check: "config", file, message: `${p} står med verdi. Konfigfila har ingen hemmeligheter: referansen står der hemmeligheten brukes (integrasjoner/<system>/hemmeligheter.yaml, test/personaer/)` });
      walkJson(v, p);
    }
  };
  walkJson(data, "");
  const url = data.neo?.byEnv?.[env]?.url;
  return { env, schemaUrl: url ? `${String(url).replace(/\/+$/, "")}/api/config/schema` : undefined, findings: f };
}

export const checkConfig = (root) => readConfig(root).findings;

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

export async function run(root, { fetchJson } = {}) {
  const f = [];
  f.push(...checkRepo(root).findings);
  const config = readConfig(root);
  f.push(...config.findings);
  f.push(...checkCommitted(tracked(root)));
  f.push(...checkResearch(root));
  f.push(...checkStruktur(root, { secretKey: SECRET_KEY }));
  f.push(...(await checkOppsett(root, { schemaUrl: config.schemaUrl, env: config.env, ...(fetchJson ? { fetchJson } : {}) })));
  f.push(...checkListe(root));
  const co = join(root, ".github/CODEOWNERS");
  if (!existsSync(co) || /@ENDRE-MEG/.test(readFileSync(co, "utf8"))) f.push({ check: "godkjenner", level: "warn", file: ".github/CODEOWNERS", message: "Godkjenneren er ikke satt. Uten den kan hvem som helst med skrivetilgang godkjenne en endring" });
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
  return `## Repoet\n\n| Sjekk | Hva den sjekker | Resultat |\n|---|---|---|\n${rows.join("\n")}\n${details}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const root = args.includes("--root") ? args[args.indexOf("--root") + 1] : process.cwd();
  const findings = await run(root);
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
