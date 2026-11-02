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
- **Ingen hemmeligheter i repoet.** Innloggingen mot Neo er personens egen, gjennom `/mcp`.

## Låste versjoner

Repoet er laget for versjonene i `kunde.yaml` (`verktoy`). Er pluginen som er installert, nyere eller eldre, si fra
før du gjør noe som endrer Neo.
