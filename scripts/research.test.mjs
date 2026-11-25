import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";
import { checkResearch, citations, claims, items } from "./research.mjs";

const git = (root, ...args) => execFileSync("git", ["-C", root, ...args], { stdio: ["ignore", "pipe", "pipe"] });
const write = (root, path, text) => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text);
};
const L = "losninger/tilskudd";
const repo = () => {
  const root = mkdtempSync(join(tmpdir(), "research-"));
  git(root, "init", "-q");
  git(root, "config", "user.email", "test@example.com");
  git(root, "config", "user.name", "Test");
  write(root, `${L}/1-kilder/kilder.md`, "| Id | Hva | Lagret |\n|---|---|---|\n| E1 | E-posten | – |\n| K1 | Utlysningen | [`filer/K1_utlysningen.md`](filer/K1_utlysningen.md) |\n| K2 | Forskriften | – |\n");
  write(root, `${L}/1-kilder/filer/K1_utlysningen.md`, "Fristen er 19. november.\n");
  write(root, `${L}/2-forstaelse/03-forlop.md`, "# Forløpet\n\n## Søknad og mottak\n\n- Fristen er 2026-11-19. [K1]\n- Delene i skjemaet [K1]:\n  - nøkkelopplysninger\n\n## Det kildene ikke svarer på\n\n- Hvem leser e-posten?\n");
  write(root, "virksomheten/kilder/kilder.md", "| Id | Hva | Lagret |\n|---|---|---|\n| K1 | Organisasjonskartet | – |\n");
  write(root, "virksomheten/forstaelse/04-roller-og-tilgang.md", "# Roller\n\n- Seksjonen har fem saksbehandlere. [K1]\n");
  git(root, "add", "-A");
  git(root, "commit", "-q", "-m", "init");
  return root;
};
const by = (f, check) => f.filter((x) => x.check === check).map((x) => x.message);

test("kildene i en tekst: ett id, en paragraf, flere, og et intervall", () => {
  assert.deepEqual(citations("Fristen [K1] og [K14 § 7], [E1, K3] og [K7–K9]."), ["K1", "K14", "E1", "K3", "K7", "K8", "K9"]);
  assert.deepEqual(citations("En lenke [tekst](K1) er ikke en kilde"), []);
});

test("en påstand er et øverste punkt med underpunktene sine; spørsmålene er ikke påstander", () => {
  const c = claims("## A\n\n- En [K1]:\n  - under\n- To\n\n## Det kildene ikke svarer på\n\n- Hvem?\n");
  assert.deepEqual(c.map((x) => [x.section, x.text.split("\n").length]), [["A", 2], ["A", 1], ["Det kildene ikke svarer på", 1]]);
});

test("et tomt repo og researchen slik den skal være, gir ingen funn", () => {
  const empty = mkdtempSync(join(tmpdir(), "research-"));
  git(empty, "init", "-q");
  git(empty, "-c", "user.email=t@example.com", "-c", "user.name=T", "commit", "-q", "--allow-empty", "-m", "init");
  assert.deepEqual(checkResearch(empty), []);
  const root = repo();
  assert.deepEqual(checkResearch(root), []);
  rmSync(root, { recursive: true });
  rmSync(empty, { recursive: true });
});

test("en påstand uten kilde, eller med en kilde som ikke står i registeret på samme sted, er et funn", () => {
  const root = repo();
  write(root, `${L}/2-forstaelse/05-data-og-regler.md`, "# Data\n\n- Timesatsen er maks 1 400.\n- Maks 1 850 timer. [K99]\n- Fristene står i `03-forlop.md`.\n");
  write(root, "virksomheten/forstaelse/09-systemer.md", "# Systemer\n\n- Arkivet er Documaster. [K2]\n");
  const f = by(checkResearch(root), "forstaelse").sort();
  assert.equal(f.length, 3);
  assert.match(f[0], /K2 står ikke i registeret \(virksomheten\/kilder/);
  assert.match(f[1], /K99 står ikke i registeret \(losninger\/tilskudd\/1-kilder/);
  assert.match(f[2], /viser ikke til en kilde/);
  rmSync(root, { recursive: true });
});

test("en lagret kilde som endres eller ikke står i registeret, er et funn, i løsningen og i virksomheten", () => {
  const root = repo();
  write(root, `${L}/1-kilder/filer/K1_utlysningen.md`, "Fristen er 20. november.\n");
  write(root, `${L}/1-kilder/filer/K3_ny.pdf`, "x");
  write(root, "virksomheten/kilder/filer/K2_kart.pdf", "x");
  git(root, "add", "-A");
  git(root, "commit", "-q", "-m", "endret");
  const f = checkResearch(root).filter((x) => x.check === "kilder");
  assert.ok(f.some((x) => x.file === `${L}/1-kilder/filer/K3_ny.pdf` && /står ikke i registeret/.test(x.message)));
  assert.ok(f.some((x) => x.file === "virksomheten/kilder/filer/K2_kart.pdf"));
  assert.ok(f.some((x) => x.file === `${L}/1-kilder/filer/K1_utlysningen.md` && /En lagret kilde er endret/.test(x.message)));
  rmSync(root, { recursive: true });
});

test("et krav trenger flyt, hvorfor og en kilde som finnes, og en id som er brukt én gang", () => {
  const root = repo();
  write(root, `${L}/3-krav/03-forlop.md`, "# Kravene\n\n## frist-mottatt Mottatt innen fristen\n\n```yaml\nid: frist-mottatt\nflyt: deterministisk\nhvorfor: Fristen står i utlysningen.\nkilde: [K1, 2-forstaelse/03-forlop.md#søknad-og-mottak, ../../virksomheten/forstaelse/04-roller-og-tilgang.md]\nblir:\n```\n\n## vurdering Vurdering per kriterium\n\n```yaml\nid: vurdering\nflyt: automatisk\nkilde: [K9, 2-forstaelse/03-forlop.md#borte]\n```\n");
  write(root, "losninger/klage/3-krav/03-forlop.md", "## frist-mottatt Igjen\n\n```yaml\nflyt: menneske\nhvorfor: x\nkilde: [2-forstaelse/finnes-ikke.md]\n```\n\n## rar Rar\n\n```yaml\nflyt: [menneske\n```\n");
  const f = by(checkResearch(root), "krav");
  assert.deepEqual(f.sort(), [
    "Id-en frist-mottatt er brukt før, i losninger/klage/3-krav/03-forlop.md",
    "frist-mottatt: 2-forstaelse/finnes-ikke.md finnes ikke (stien er relativ til losninger/klage/)",
    "rar: yaml-blokken kan ikke leses (linje 1: Flow sequence in block collection must be sufficiently indented and end with a ])",
    "vurdering: K9 står ikke i registeret (losninger/tilskudd/1-kilder/kilder.md)",
    "vurdering: flyt må være deterministisk, agentisk, menneske",
    "vurdering: hvorfor mangler",
    "vurdering: overskriften #borte finnes ikke i 2-forstaelse/03-forlop.md",
  ]);
  rmSync(root, { recursive: true });
});

test("items leser overskriften og blokken", () => {
  const [a] = items("## a Tittelen her\n\n```yaml\nkilde: [K1, K2]\nhvorfor: \"Fordi: det står der.\"\n```\n");
  assert.deepEqual([a.id, a.title, a.line, a.fields], ["a", "Tittelen her", 1, { kilde: ["K1", "K2"], hvorfor: "Fordi: det står der." }]);
  // YAML er YAML: et kolon med mellomrom i en tekst uten anførselstegn er en feil, og sies med linjen.
  const [b] = items("## b B\n\n```yaml\nhvorfor: Fordi: det står der.\n```\n");
  assert.match(b.error, /^linje 1: /);
});
