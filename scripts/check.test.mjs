import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkCommitted, checkConfig, run } from "./check.mjs";
import { execFileSync } from "node:child_process";

const here = join(dirname(fileURLToPath(import.meta.url)), "..");
// Malen slik en kunde får den: filene git følger, i et nytt repo med én commit.
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

test("en hemmelighet med verdi i config-fila stoppes; en referanse slipper", () => {
  const root = copy();
  writeFileSync(join(root, ".claude/neo.config.json"), JSON.stringify({
    version: 1,
    neo: { environments: ["sandkasse"], byEnv: { sandkasse: { mcpServer: "neo-sandkasse" } } },
    fiks: { byEnv: { test: { passord: "hemmelig", svarinnPassord: { $env: "X", kilde: "azure-keyvault:kv/x" }, nokkelFile: ".keys/x.pem" } } },
  }));
  const fails = checkConfig(root).filter((x) => x.level !== "warn");
  assert.equal(fails.length, 1);
  assert.match(fails[0].message, /fiks\.byEnv\.test\.passord står med verdi/);
});

test("en committet .env.local eller nøkkel stoppes", () => {
  const found = checkCommitted([".env.local", ".keys/mp.pem", "kunde.yaml", ".env.example"]).map((x) => x.file);
  assert.deepEqual(found, [".env.local", ".keys/mp.pem"]);
});

test("malen slik en kunde får den: bare gule funn", async () => {
  const f = await run(copy(), { offline: true });
  assert.ok(f.length > 0);
  assert.ok(f.every((x) => x.level === "warn"));
});

test("rå svar og ugyldig JSON stoppes", async () => {
  const root = copy();
  mkdirSync(join(root, "snapshots/sandkasse/raw"), { recursive: true });
  writeFileSync(join(root, "snapshots/sandkasse/raw/x.json"), "{}");
  writeFileSync(join(root, "oppsett/list_case_types.json"), "{");
  const fails = (await run(root, { offline: true })).filter((x) => x.level === "fail").map((x) => x.check);
  assert.deepEqual(fails, ["oppsett", "oppsett"]);
});

test("en nyere versjon gir et gult funn", async () => {
  const fetchText = async (u) => (u.endsWith("VERSION") ? "0.4.0\n" : JSON.stringify({ plugins: [{ name: "forvaltning", version: "0.1.0" }] }));
  const f = (await run(copy(), { fetchText })).filter((x) => x.check === "versjon");
  assert.equal(f.length, 1);
  assert.match(f[0].message, /Malen er 0.4.0/);
});
