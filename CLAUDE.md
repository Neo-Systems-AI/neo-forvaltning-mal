# Forvaltningen av oppsettet i Neo

Dette repoet forvalter oppsettet til kunden i `kunde.yaml`. Les den først.

## Regler

- **Bruk pluginen `forvaltning`** til alt som leser eller endrer Neo: `/forvaltning:snapshot`, `/forvaltning:plan`,
  `/forvaltning:gjennomfor`. Ikke kall MCP-verktøyene som endrer noe, utenom `gjennomfor`.
- **Ingen endring i Neo uten godkjent PR.** Godkjenneren står i `kunde.yaml` og `.github/CODEOWNERS`.
- **Sandkassen først.** Produksjonen endres ved promotering i Neo, av kundens org-admin, aldri herfra.
- **Snapshot før og etter** hver endring.
- **Generert er generert:** `snapshots/`, `state/` og `reports/` skrives av pluginen, ikke for hånd.
- **Hver endring og hvert avvik får en rad i `beslutninger.md`**, med dato, hva, hvorfor og hvem som godkjente.
- **Ingen hemmeligheter i repoet.** Innloggingen mot Neo er personens egen, gjennom `/mcp`. Hemmelighetene til de
  eksterne systemene ligger i kundens hvelv og står i `.claude/neo.config.json` bare som referanse (`$env`, `kilde`).
  Et menneske henter dem til `.env.local` og `.keys/`; les dem aldri, og kjør aldri hentingen (`/forvaltning:hemmeligheter`).
- **Kundespesifikt er kundens:** Maskinporten-klienter, sertifikater, kontoer og delegeringer hører til kunden og
  lages i kundens navn. Ikke opprett noe slikt i forvalterens navn.
- **Feilsøk med systemenes egne svar:** når noe stopper mellom Neo og et eksternt system, sammenlign det Neo gjorde
  (`/helse:feilsok`) med det systemet selv sier (`/fiks:fiks`, `/documaster:documaster`, `/altinn:altinn-kall` og de
  andre). Bare lesing.
- **Config-fila** (`.claude/neo.config.json`) er felles for alle pluginene. `/<plugin>:env` viser hva som mangler.

## Låste versjoner

Repoet er laget for versjonene i `kunde.yaml` (`verktoy`). Er pluginen som er installert, nyere eller eldre, si fra
før du gjør noe som endrer Neo.
