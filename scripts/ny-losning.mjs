#!/usr/bin/env node
// Lager en ny løsning: losninger/<navn>/losning.yaml i status utkast, og registeret for kildene. Resten av mappene
// kommer når det er noe å legge i dem. Hva løsningen bygger på (bygger-pa), avgjøres i designet, og kreves først når
// løsningen går ut av utkast.
//
//   node scripts/ny-losning.mjs <navn> --formal "<formålet>" --eier "<eieren>" [--root <dir>]
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const NAVN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const quote = (s) => JSON.stringify(String(s));

export function newSolution(root, navn, { formal, eier }) {
  if (!NAVN.test(navn ?? "")) throw new Error(`Navnet «${navn ?? ""}» må ha små bokstaver, tall og bindestrek, som innovasjonstilskudd eller hc-parkering`);
  if (!formal?.trim() || !eier?.trim()) throw new Error("Si formålet og eieren: --formal \"<formålet>\" --eier \"<eieren>\"");
  const dir = join(root, "losninger", navn);
  if (existsSync(dir)) throw new Error(`losninger/${navn} finnes fra før`);
  mkdirSync(join(dir, "1-kilder"), { recursive: true });
  writeFileSync(
    join(dir, "losning.yaml"),
    [
      `formal: ${quote(formal.trim())}`,
      `eier: ${quote(eier.trim())}`,
      "status: utkast           # utkast, i-test, i-bruk eller avviklet",
      "integrasjoner: []        # systemene i integrasjoner/ løsningen bruker",
      "bygger-pa:               # egen, eller { standard: <navn>, versjon: <versjon> }; kreves når løsningen er ute av utkast",
      "",
    ].join("\n"),
  );
  writeFileSync(join(dir, "1-kilder", "kilder.md"), `# Kildene for ${navn}\n\n| Id | Hva | Utgiver | Dato på dokumentet | Dato lest | Lenke | Lagret |\n|---|---|---|---|---|---|---|\n`);
  return [`losninger/${navn}/losning.yaml`, `losninger/${navn}/1-kilder/kilder.md`];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
  const root = opt("--root") ?? process.cwd();
  const navn = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
  try {
    for (const f of newSolution(root, navn, { formal: opt("--formal"), eier: opt("--eier") })) console.log(`Skrev ${f}`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
