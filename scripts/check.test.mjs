import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { checkCommitted, checkConfig, checkRepo, run } from "./check.mjs";

const here = join(dirname(fileURLToPath(import.meta.url)), "..");
// Malen slik den kopieres inn i et nytt repo: filene git følger, i et nytt repo med én commit.
const copy = () => {
  const root = mkdtempSync(join(tmpdir(), "mal-"));
  const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: here, encoding: "utf8" }).split("\n").filter((f) => f && existsSync(join(here, f)));
  for (const f of files) cpSync(join(here, f), join(root, f), { recursive: true });
  const git = (...a) => execFileSync("git", ["-C", root, "-c", "user.email=t@example.com", "-c", "user.name=T", ...a], { stdio: "ignore" });
  git("init", "-q");
  git("add", "-A");
  git("commit", "-q", "-m", "Initial commit");
  return root;
};
const write = (root, path, text) => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text);
};
const REPO = (type) => `type: ${type}\neier: { navn: Eier }\ngodkjenner: { navn: G, github: g }\nforvalter: { navn: F, github: f }\n`;

test("malen slik den kopieres: bare gule funn, og Neo kalles ikke når det ikke er noen konfigfiler", async () => {
  const fetchJson = () => assert.fail("skjemaet hentes bare når det er filer å validere");
  const f = await run(copy(), { fetchJson });
  assert.ok(f.length > 0);
  assert.deepEqual(f.filter((x) => x.level !== "warn"), []);
});

test("konfigfila har ingen hemmeligheter, og sier adressen, org-en og MCP-serveren", () => {
  const root = copy();
  write(root, ".claude/neo.config.json", JSON.stringify({
    version: 1,
    neo: { environments: ["development"], defaultEnv: "development", byEnv: { development: { mcpServer: "neo-development", org: "", token: "hemmelig" } } },
  }));
  const f = checkConfig(root).map((x) => `${x.level ?? "fail"} ${x.message}`).sort();
  assert.equal(f.length, 3);
  assert.match(f[0], /^fail Adressen til Neo i development/);
  assert.match(f[1], /^fail neo\.byEnv\.development\.token står med verdi/);
  assert.match(f[2], /^warn Org-en i Neo for development/);
  rmSync(root, { recursive: true });
});

test("en committet .env.local eller nøkkel stoppes", () => {
  const found = checkCommitted([".env.local", ".keys/mp.pem", "repo.yaml", ".env.example"]).map((x) => x.file);
  assert.deepEqual(found, [".env.local", ".keys/mp.pem"]);
});

test("repo.yaml: typen, og repoet har det typen sier", () => {
  const root = mkdtempSync(join(tmpdir(), "repo-"));
  const fails = () => checkRepo(root).findings.filter((x) => (x.level ?? "fail") === "fail").map((x) => `${x.file} ${x.message}`).sort();
  assert.deepEqual(fails(), ["repo.yaml Mangler. repo.yaml sier hva repoet er, og hvem som eier og godkjenner"]);
  write(root, "repo.yaml", "type: partner\neier: { navn: E }\n");
  assert.deepEqual(fails(), ["repo.yaml forvalter mangler (navn og github)", "repo.yaml godkjenner mangler (navn og github)", "repo.yaml type må være kunde eller standard"]);
  write(root, "repo.yaml", REPO("kunde"));
  assert.deepEqual(fails(), ["profil.yaml Et kunderepo har profil.yaml: løsningene kunden har tatt i bruk"]);
  write(root, "profil.yaml", "");
  assert.deepEqual(fails(), []);
  write(root, "repo.yaml", REPO("standard"));
  write(root, "virksomheten/kilder/kilder.md", "");
  assert.deepEqual(fails(), [
    "profil.yaml Et standardrepo har ikke profil.yaml: det hører til en kunde. Slett det",
    "virksomheten Et standardrepo har ikke virksomheten: det hører til en kunde. Slett det",
  ]);
  rmSync(root, { recursive: true });
});

test("et standardrepo laget fra malen, uten profil.yaml og virksomheten/, har bare gule funn", async () => {
  const root = copy();
  write(root, "repo.yaml", REPO("standard"));
  rmSync(join(root, "profil.yaml"));
  rmSync(join(root, "virksomheten"), { recursive: true });
  const f = await run(root);
  assert.deepEqual(f.filter((x) => x.level !== "warn"), []);
  rmSync(root, { recursive: true });
});
