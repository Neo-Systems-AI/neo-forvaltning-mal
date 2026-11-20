#!/usr/bin/env node
// Lista over det kunden må gjøre, på tvers av integrasjonene: lages fra oppgavene i integrasjoner/<system>/hos-kunden.md
// og skrives til integrasjoner/README.md, som GitHub viser når kunden åpner mappa. Lista skrives aldri for hånd; check
// stopper når den ikke stemmer med oppgavene.
//
//   node scripts/hos-kunden.mjs [--root <dir>]      skriver lista
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tasks } from "./struktur.mjs";

export const LISTE = "integrasjoner/README.md";
export const HOS_KUNDEN_CHECKS = [{ name: "liste", about: "Lista over det kunden må gjøre, stemmer med oppgavene i integrasjonene" }];

// Oppskriftene står i docs/integrasjoner/ i repoet til markedsplassen pluginene kommer fra (.claude/settings.json).
export function recipeBase(root) {
  const file = join(root, ".claude/settings.json");
  const repo = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")).extraKnownMarketplaces?.["neo-forvaltning"]?.source?.repo : undefined;
  if (!repo) throw new Error(".claude/settings.json sier ikke hvilket repo markedsplassen neo-forvaltning er i, så lista kan ikke lenke til oppskriftene");
  return `https://github.com/${repo}/blob/main/docs/integrasjoner`;
}

// Ankeret GitHub lager for en overskrift.
const anchor = (h) => h.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s/g, "-");
const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

export function render(root) {
  const base = recipeBase(root);
  const all = tasks(root).filter((t) => !t.error);
  const status = new Map(all.map((t) => [t.ref, t.fields.status]));
  const open = all.filter((t) => t.fields.status !== "ferdig");
  const waiting = (t) => t.etter.filter((e) => status.get(e) !== "ferdig");
  const now = open.filter((t) => !waiting(t).length);
  const later = open.filter((t) => waiting(t).length);
  const row = (t, extra = []) => `| ${t.system} | [${cell(t.title || t.id)}](${t.system}/hos-kunden.md#${anchor(`${t.id} ${t.title}`)}) | ${cell(t.fields.status)} | ${cell(t.fields.hvem)} | ${extra.map((x) => `${cell(x)} | `).join("")}[${t.system}](${base}/${t.system}.md) |`;
  const out = [
    "<!-- Generert av scripts/hos-kunden.mjs fra integrasjoner/*/hos-kunden.md. Skrives ikke for hånd. -->",
    "",
    "# Det kunden må gjøre",
    "",
    "Oppgavene kunden selv gjør for at Neo skal kobles til systemene, samlet fra `hos-kunden.md` i hver integrasjon.",
    "Formen står i [`.claude/rules/integrasjoner.md`](../.claude/rules/integrasjoner.md).",
    "",
  ];
  if (!all.length) return [...out, "Ingen integrasjoner har oppgaver hos kunden ennå.", ""].join("\n");
  out.push("## Nå", "");
  if (now.length) out.push("| System | Oppgaven | Status | Hvem | Oppskriften |", "|---|---|---|---|---|", ...now.map((t) => row(t)), "");
  else out.push("Ingenting kan gjøres nå: alt som står igjen, venter på noe annet.", "");
  if (later.length) out.push("## Senere", "", "| System | Oppgaven | Status | Hvem | Venter på | Oppskriften |", "|---|---|---|---|---|---|", ...later.map((t) => row(t, [waiting(t).join(", ")])), "");
  out.push("## Ferdig", "", `${all.length - open.length} av ${all.length} oppgaver er ferdige.`, "");
  return out.join("\n");
}

export function checkListe(root) {
  let want;
  try {
    want = render(root);
  } catch (e) {
    return [{ check: "liste", file: LISTE, message: e.message }];
  }
  const have = existsSync(join(root, LISTE)) ? readFileSync(join(root, LISTE), "utf8") : null;
  if (have === want) return [];
  return [{ check: "liste", file: LISTE, message: `${have === null ? "Lista mangler" : "Lista stemmer ikke med oppgavene"}. Lag den på nytt med node scripts/hos-kunden.mjs; den skrives ikke for hånd` }];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const root = args.includes("--root") ? args[args.indexOf("--root") + 1] : process.cwd();
  mkdirSync(join(root, "integrasjoner"), { recursive: true });
  writeFileSync(join(root, LISTE), render(root));
  console.log(`Skrev ${LISTE}`);
}
