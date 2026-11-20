import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { checkListe, LISTE, render } from "./hos-kunden.mjs";

const write = (root, path, text) => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text);
};
const repo = () => {
  const root = mkdtempSync(join(tmpdir(), "hos-kunden-"));
  write(root, ".claude/settings.json", JSON.stringify({ extraKnownMarketplaces: { "neo-forvaltning": { source: { source: "github", repo: "eier/plugins" } } } }));
  write(root, "integrasjoner/entra/hos-kunden.md", "## sso Sett opp SSO\n\n```yaml\nstatus: i-gang\nhvem: IT\n```\n\n## postboks Felles postboks\n\n```yaml\nstatus: ferdig\nhvem: IT\n```\n");
  write(root, "integrasjoner/altinn/hos-kunden.md", "## delegering Deleger tilgangen | rollen\n\n```yaml\nstatus: ikke-startet\nhvem: Hovedadministratoren\netter: [entra/sso, entra/postboks]\n```\n");
  return root;
};

test("lista har det som kan gjøres nå, det som venter, og hvor mye som er ferdig, med lenker", () => {
  const root = repo();
  const md = render(root);
  assert.match(md, /## Nå\n\n\| System \| Oppgaven \| Status \| Hvem \| Oppskriften \|\n\|---\|---\|---\|---\|---\|\n\| entra \| \[Sett opp SSO\]\(entra\/hos-kunden.md#sso-sett-opp-sso\) \| i-gang \| IT \| \[entra\]\(https:\/\/github.com\/eier\/plugins\/blob\/main\/docs\/integrasjoner\/entra.md\) \|\n\n/);
  assert.match(md, /## Senere\n\n.*\n.*\n\| altinn \| \[Deleger tilgangen \\\| rollen\]\(altinn\/hos-kunden.md#delegering-deleger-tilgangen--rollen\) \| ikke-startet \| Hovedadministratoren \| entra\/sso \| \[altinn\]/);
  assert.match(md, /1 av 3 oppgaver er ferdige/);
  rmSync(root, { recursive: true });
});

test("uten oppgaver sier lista det", () => {
  const root = mkdtempSync(join(tmpdir(), "hos-kunden-"));
  write(root, ".claude/settings.json", JSON.stringify({ extraKnownMarketplaces: { "neo-forvaltning": { source: { repo: "eier/plugins" } } } }));
  assert.match(render(root), /Ingen integrasjoner har oppgaver hos kunden ennå/);
  rmSync(root, { recursive: true });
});

test("check stopper når lista mangler, er rettet for hånd, eller ikke kan lenke til oppskriftene", () => {
  const root = repo();
  assert.match(checkListe(root)[0].message, /Lista mangler/);
  write(root, LISTE, render(root));
  assert.deepEqual(checkListe(root), []);
  write(root, LISTE, `${render(root)}\nEn linje for hånd.\n`);
  assert.match(checkListe(root)[0].message, /stemmer ikke med oppgavene/);
  write(root, ".claude/settings.json", "{}");
  assert.match(checkListe(root)[0].message, /sier ikke hvilket repo markedsplassen/);
  rmSync(root, { recursive: true });
});
