#!/usr/bin/env node
// Kontrollen for kunderepoet: kundefila er fylt ut, oppsettet er gyldige filer, ingen rå svar er committet, og
// repoet sier fra når malen eller pluginen har en nyere versjon. Rødt stopper PR-en; gult sier fra uten å stoppe.
//
//   node scripts/check.mjs [--annotate] [--summary] [--offline] [--root <dir>]
import { appendFileSync, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export const CHECKS = [
  { name: "kunde", about: "kunde.yaml finnes og har kunde, miljøer, godkjenner og versjoner" },
  { name: "oppsett", about: "Hver fil i oppsett/ og snapshots/ er gyldig JSON, og ingen rå svar er committet" },
  { name: "godkjenner", about: "CODEOWNERS nevner en ekte godkjenner" },
  { name: "versjon", about: "Malen og pluginen er på nyeste versjon" },
];

export const UPSTREAM = {
  mal: "https://raw.githubusercontent.com/Neo-Systems-AI/neo-forvaltning-mal/main/VERSION",
  marked: "https://raw.githubusercontent.com/Neo-Systems-AI/neo-forvaltning/main/.claude-plugin/marketplace.json",
};

const walk = (dir) => (existsSync(dir) ? readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)])) : []);

// Bare det vi trenger av YAML: «nøkkel: verdi» med innrykk, så sjekken ikke har avhengigheter.
export function readYaml(text) {
  const out = {};
  const stack = [{ indent: -1, obj: out }];
  for (const raw of text.split("\n")) {
    const line = raw.replace(/\s+#.*$/, "");
    const m = line.match(/^(\s*)([\wæøåÆØÅ-]+):\s*(.*)$/);
    if (!m || line.trim().startsWith("#")) continue;
    const indent = m[1].length;
    while (stack.at(-1).indent >= indent) stack.pop();
    const parent = stack.at(-1).obj;
    if (m[3] === "") {
      parent[m[2]] = {};
      stack.push({ indent, obj: parent[m[2]] });
    } else parent[m[2]] = m[3].replace(/^["']|["']$/g, "");
  }
  return out;
}

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
    kunde = readYaml(readFileSync(kf, "utf8"));
    for (const k of ["kunde", "miljoer", "godkjenner", "verktoy"]) if (!kunde[k]) f.push({ check: "kunde", file: "kunde.yaml", message: `«${k}» mangler` });
    for (const [env, v] of Object.entries(kunde.miljoer ?? {})) if (!v?.mcp || v.mcp.includes("<")) f.push({ check: "kunde", level: "warn", file: "kunde.yaml", message: `MCP-adressen for ${env} er ikke fylt ut` });
  }
  for (const file of [...walk(join(root, "oppsett")), ...walk(join(root, "snapshots"))]) {
    const rel = relative(root, file);
    if (/(^|\/)raw\//.test(rel)) f.push({ check: "oppsett", file: rel, message: "Et rått svar er committet. raw/ skal stå i .gitignore" });
    else if (rel.endsWith(".json")) {
      try {
        JSON.parse(readFileSync(file, "utf8"));
      } catch (e) {
        f.push({ check: "oppsett", file: rel, message: `Ikke gyldig JSON: ${e.message}` });
      }
    }
  }
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
  const details = findings.length ? `\n<details><summary>Funnene</summary>\n\n${findings.map((x) => `- ${x.level === "fail" ? "❌" : "⚠️"} \`${x.file}\`: ${x.message}`).join("\n")}\n</details>\n` : "";
  return `## Kunderepoet\n\n| Sjekk | Hva den sjekker | Resultat |\n|---|---|---|\n${rows.join("\n")}\n${details}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const root = args.includes("--root") ? args[args.indexOf("--root") + 1] : process.cwd();
  const findings = await run(root, { offline: args.includes("--offline") });
  for (const x of findings) console.log(`${x.level === "fail" ? "✗" : "!"} ${x.file}: ${x.message}`);
  if (args.includes("--annotate")) for (const x of findings) console.log(`::${x.level === "fail" ? "error" : "warning"} file=${x.file},title=${x.check}::${esc(x.message)}`);
  if (args.includes("--summary")) {
    const text = summary(findings);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text);
    else console.log(text);
  }
  if (!findings.length) console.log("Ingen funn.");
  process.exit(findings.some((x) => x.level === "fail") ? 1 : 0);
}
