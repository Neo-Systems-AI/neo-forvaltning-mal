# neo-forvaltning-mal

Malen for et repo som forvalter oppsettet til én kommune eller virksomhet i [Neo](https://neosystems.ai): sakstypene,
statusløpene, feltene, oppgavemalene og flytene som filer, endret med PR og godkjent av kunden før de tas i bruk.

Repoet ditt er ditt. Malen har bare struktur, regler og låste versjoner; alt innhold kommer fra pluginen
[`forvaltning`](https://github.com/Neo-Systems-AI/neo-forvaltning), som oppdateres sentralt.

## Kom i gang

1. **Lag repoet:** «Use this template» → velg **din egen organisasjon** og **Private**. Et repo laget fra en mal er
   ikke en fork, så det kan være privat.
2. **Fyll ut `kunde.yaml`** og sett godkjenneren i `.github/CODEOWNERS`.
3. **Sett regler for `main`** (Settings → Rules → Rulesets): krev PR, krev at `check` er grønn, krev godkjenning fra
   CODEOWNERS, og tillat bare merge commit. På et privat repo krever dette GitHub Team eller høyere.
4. **Koble Claude Code til Neo.** Org-admin i Neo lager en kobling under *API-klienter → Koble til Claude*, slaget
   «Claude Code», én i sandkassen og én i produksjonen. Neo viser en kommando; legg den inn i repoet med navnet for
   miljøet:

   ```bash
   claude mcp add --scope project --transport http --client-id <klient-id> neo-sandkasse <adresse>/api/mcp
   claude mcp add --scope project --transport http --client-id <klient-id> neo-produksjon <adresse>/api/mcp
   ```

   Klient-ID-en er ikke en hemmelighet (Claude Code er en offentlig klient), så `.mcp.json` kan committes. Hver
   person logger inn som seg selv med `/mcp`.
5. **Start Claude Code i repoet** og godta markedsplassen `neo-forvaltning` når du blir spurt. Pluginen `forvaltning`
   er slått på i `.claude/settings.json`.
6. **Ta det første snapshotet:** `/forvaltning:snapshot sandkasse`, og commit det.

## Slik endres oppsettet

| Steg | Hvem | Hvordan |
|---|---|---|
| 1. Snapshot før | forvalteren | `/forvaltning:snapshot sandkasse` |
| 2. Endringen | forvalteren | på en branch, i `oppsett/`, med en rad i `beslutninger.md` |
| 3. Planen | forvalteren | `/forvaltning:plan`, limt inn i PR-en |
| 4. Godkjenning | kunden | godkjenner PR-en (CODEOWNERS) |
| 5. Gjennomføring | forvalteren | `/forvaltning:gjennomfor` i sandkassen, med snapshot etter |
| 6. Promotering | org-admin | i Neo, fra sandkassen til produksjonen |
| 7. Snapshot etter | forvalteren | `/forvaltning:snapshot produksjon` |

Endringer gjort i Neo utenom repoet dukker opp i neste snapshot. Ta dem inn i `oppsett/`, eller meld dem til kunden.

## Mappene

| Hva | Hvor | Skrevet av |
|---|---|---|
| Kundefila | `kunde.yaml` | et menneske |
| Beslutningsloggen | `beslutninger.md` | et menneske, eller agenten på oppdrag |
| Det ønskede oppsettet | `oppsett/` | et menneske, gjennom PR |
| Det som gjøres for hånd | `oppsett/manuelt/` | et menneske |
| Det som kjører | `snapshots/<miljø>/oppsett/` | generert |
| Id-ene per miljø | `state/<miljø>.lock.json` | generert |
| Planer og rapporter | `reports/` | generert |

## Versjonene

`VERSION` er malens versjon, og `kunde.yaml` sier hvilke versjoner repoet er laget for. `check` sier fra (gult) når
malen eller pluginen har en nyere versjon. Den stopper ingenting; du bestemmer når du oppdaterer.

## Lisens

MIT, se [`LICENSE`](./LICENSE).
