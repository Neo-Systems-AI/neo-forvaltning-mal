import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { newSolution } from "./ny-losning.mjs";
import { checkStruktur } from "./struktur.mjs";
import { checkResearch } from "./research.mjs";
import { SECRET_KEY } from "./check.mjs";

test("en ny løsning er i utkast, og sjekken er grønn før designet er valgt", () => {
  const root = mkdtempSync(join(tmpdir(), "ny-"));
  assert.deepEqual(newSolution(root, "hc-parkering", { formal: "Behandle søknader: om parkering", eier: "Kunden" }), ["losninger/hc-parkering/losning.yaml", "losninger/hc-parkering/1-kilder/kilder.md"]);
  assert.match(readFileSync(join(root, "losninger/hc-parkering/losning.yaml"), "utf8"), /^formal: "Behandle søknader: om parkering"\neier: "Kunden"\nstatus: utkast/);
  assert.deepEqual([...checkStruktur(root, { secretKey: SECRET_KEY }), ...checkResearch(root).filter((x) => x.level !== "warn")], []);
  assert.throws(() => newSolution(root, "hc-parkering", { formal: "x", eier: "y" }), /finnes fra før/);
  assert.throws(() => newSolution(root, "HC Parkering", { formal: "x", eier: "y" }), /små bokstaver/);
  assert.throws(() => newSolution(root, "klage", { formal: "x" }), /Si formålet og eieren/);
  rmSync(root, { recursive: true });
});
