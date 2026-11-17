# neo-forvaltning-mal

Malen for et repo som forvalter oppsettet til én kommune eller virksomhet i [Neo](https://neosystems.ai): sakstypene,
statusløpene, feltene, oppgavemalene og flytene som filer, endret med PR og godkjent av kunden før de tas i bruk.

Repoet ditt er ditt. Malen har bare struktur, regler og låste versjoner; alt innhold kommer fra pluginene i
[`neo-forvaltning`](https://github.com/Neo-Systems-AI/neo-forvaltning), som oppdateres sentralt.

**Et repo er én måte å forvalte på, ikke den eneste.** Oppsettet kan også forvaltes rett i Neo. Repoet gir det Neo
alene ikke gir: oppsettet som filer med historikk, en plan kunden godkjenner i en PR før noe endres, og verktøy som
sammenligner det Neo gjør med det de eksterne systemene selv sier. Malen bruker GitHub fordi det er git-verktøyet vi
kobler til i dag.

## Kom i gang

1. **Lag repoet:** «Use this template» → velg **din egen organisasjon** og **Private**. Et repo laget fra en mal er
   ikke en fork, så det kan være privat.
2. **Sett regler for `main`** (Settings → Rules → Rulesets): krev PR, krev at `check` er grønn, krev godkjenning fra
   CODEOWNERS, og tillat bare merge commit. På et privat repo krever dette GitHub Team eller høyere.
3. **Start Claude Code i repoet**, godta markedsplassen `neo-forvaltning`, og kjør `/forvaltning:oppstart`. Den
   intervjuer, fyller ut `kunde.yaml`, `.claude/neo.config.json` og `CODEOWNERS`, kobler til Neo og skrur på
   pluginene du trenger. Org-admin i Neo må først ha laget en kobling for Claude Code (*API-klienter → Koble til
   Claude*, slaget «Claude Code»), én i sandkassen og én i produksjonen.
4. **Hent hemmelighetene** til systemene du skal kalle (se under), og logg inn i Neo med `/mcp`.
5. **Ta det første snapshotet:** `/forvaltning:snapshot sandkasse`, og commit det på en branch med en PR.

## Pluginene og config-fila

Alle pluginene leser `.claude/neo.config.json`: miljøene i Neo og MCP-serveren for hvert, og én del per plugin. Et
eksternt system (Altinn, Documaster, KS Fiks, Kontaktregisteret og andre) har sine egne miljøer i sin del, for
eksempel `test` og `produksjon`. `/<plugin>:env` viser hva pluginen trenger og hva som mangler. En plugin skrus på
med `/forvaltning:oppstart`, eller i `.claude/settings.json`.

## Hemmelighetene

**Kundens hemmeligheter er kundens:** Maskinporten-klientene, nøklene, virksomhetssertifikatet og passordene ligger i
kundens hvelv. Config-fila sier bare hvor hver av dem ligger (`{"$env": "…", "kilde": "azure-keyvault:<hvelv>/<navn>"}`),
aldri verdien. Et menneske henter dem lokalt med sin egen innlogging (`/forvaltning:hemmeligheter`) til `.env.local`
og `.keys/`, som aldri committes. Når noen forvalter for kunden, bruker de kundens hvelv med en tilgang kunden har gitt
og kan trekke tilbake.

Hva som skal i hvelvet, under hvilke navn, og hvordan verdiene og tilstanden går mellom kunden og forvalteren
under oppstarten, står i [`medvirkning.md`](./medvirkning.md).

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
| Config-fila for pluginene | `.claude/neo.config.json` | et menneske, eller `/forvaltning:oppstart` |
| Beslutningsloggen | `beslutninger.md` | et menneske, eller agenten på oppdrag |
| Det kunden gjør i egne systemer, og hvordan verdiene går | `medvirkning.md` | forvalteren, med kunden |
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
