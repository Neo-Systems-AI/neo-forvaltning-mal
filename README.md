# neo-forvaltning-mal

Malen for et repo med oppsettet i [Neo](https://neosystems.ai) som filer: løsningene, det som er felles for org-en,
og integrasjonene, med kildene og kravene de bygger på. Endringene går gjennom en PR, og godkjenneren godkjenner dem
før noe skrives til Neo. `type` i `kunde.yaml` sier hva slags repo det er:

- **`kunde`:** oppsettet for én kommune eller virksomhet.
- **`standard`:** standardløsninger som en partner eller Neo eier, og som kundene tar i bruk.

## Kom i gang

Start Claude Code og kjør `/forvaltning:oppstart`. Den lager repoet fra malen, fyller ut `kunde.yaml`,
`.claude/neo.config.json` (hvelvet, sandkassen, produksjonen og maskinklienten), og skrur på pluginene.

- **Før oppstarten:** org-admin i Neo har laget en maskinklient i sandkassen (*API-klienter → Ny API-klient*, slaget
  «Maskin») med scopene for konfig, og kunden har et Key Vault-hvelv. Snapshot, plan og gjennomføring går med
  maskinklienten, ikke gjennom MCP.
- **Nøklene** ligger bare i hvelvet, med faste navn pluginene bestemmer. Etter oppstarten legger du dem inn med én
  kommando (`/forvaltning:nokler`), og skriptene henter dem for kjøringen med din egen `az login`. Ingen kopi lagres
  lokalt.

Pluginene `forvaltning` og `solution` kommer fra markedsplassen
[`neo-forvaltning`](https://github.com/Neo-Systems-AI/neo-forvaltning). I en klone av malen spør Claude Code om dem
(`.claude/settings.json`); ellers: `/plugin marketplace add Neo-Systems-AI/neo-forvaltning` og
`/plugin install forvaltning@neo-forvaltning`. Løypa fra en idé til en løsning i bruk står i README-en til `solution`,
og veien inn og ut av Neo i README-en til `forvaltning`.

## Hvor hva står

Hele treet finnes fra start, og hver mappe har en README som sier hva som står der, formen, og hvilket steg i løypa
som skriver det. Les den før du skriver i mappa.

```text
kunde.yaml                    hvem som eier løsningene (type), godkjenneren, forvalteren og versjonene
felles/                       det som gjelder alle løsningene, med de samme leddene som en løsning
  kilder/                     det vi vet, ordrett med opphav (steg 01)
  forstaelse/                 roller, språket, partene og kanalene, systemene, porteføljen (steg 01)
  krav/                       kravene flere løsninger deler (steg 03)
  design/                     valgene for flere løsninger eller hele org-en (steg 04)
losninger/                    én mappe per løsning: losning.yaml, kilder/, forstaelse/, krav/, design/, test/
integrasjoner/                systemene Neo kobles til: hos-kunden.md, og det systemet trenger fra oss
test/                         testene som går gjennom flere løsninger
  personaer/                  testbrukerne, felles for alle løsningene
oppsett/                      konfigen i Neos format, én fil per objekt (steg 05)
snapshots/                    det som kjører i hvert miljø, skrevet av forvaltning
reports/                      planene fra Neo, skrevet av forvaltning
.claude/neo.config.json       hvelvet, miljøene i Neo, maskinklienten, og én del per system. Ingen hemmeligheter
```

Løypa fra en idé til en løsning i bruk (01–09) står i README-en til pluginen `solution`. Et kunderepo og et repo for
standardløsninger har samme struktur; forskjellen er hvem som eier løsningene. Konfigen i `oppsett/` er Neos eget
format: Neo skriver filene ved et snapshot, og vurderer dem i planen. Nøklene ligger i hvelvet; repoet sier bare
hvilket.

## Sjekken

`check` kjører på hver PR: sjekken av repoet fra pluginen `forvaltning`, hentet i en låst versjon og kontrollert mot
sha256, og gitleaks. Den ser at filene i `oppsett/` og `snapshots/` er Neos filer, ikke om innholdet er gyldig: det
avgjør Neo i planen. Rødt stopper; gult sier fra. Lokalt kjører pluginen den samme sjekken, og `check` i
`.claude/method.json` henter den låste versjonen. Versjonen byttes med en PR som endrer taggen (`sjekk-v<versjon>`) og
sha256 i `.github/workflows/check.yml` og `.claude/method.json`; `scripts/las-malen.mjs` i neo-forvaltning skriver begge.

## Godkjenningen

Fra repoet endres Neo bare fra en PR som er merget: gjennomføringen kjører fra `main`, og bare planen som ble godkjent.
Det som endres i Neo, er like gyldig, og tas inn i `oppsett/` med snapshotet før neste plan. Hvem som
godkjenner, og hvordan det håndheves, følger rutinene til den som eier repoet. Et forslag, ikke et krav: regler for
`main` (Settings → Rules → Rulesets) som krever PR og at `check` er grønn, og eventuelt en `CODEOWNERS`.

## Versjonen

`VERSION` er malens versjon, og `verktoy` i `kunde.yaml` sier hvilken versjon av malen og `forvaltning` repoet er
laget for. En nyere versjon tas inn for hånd, i en PR.

## Lisens

MIT, se [`LICENSE`](./LICENSE).
