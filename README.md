# neo-forvaltning-mal

Malen for et repo med oppsettet i [Neo](https://neosystems.ai) som filer: løsningene, det som er felles for org-en,
og integrasjonene, med kildene og kravene de bygger på. Endringene går gjennom en PR, og godkjenneren godkjenner dem
før noe skrives til Neo. `type` i `kunde.yaml` sier hva slags repo det er:

- **`kunde`:** oppsettet for én kommune eller virksomhet.
- **`standard`:** standardløsninger som en partner eller Neo eier, og som kundene tar i bruk.

## Kom i gang

Start Claude Code og kjør `/forvaltning:oppstart`. Den lager repoet fra malen, fyller ut `kunde.yaml`,
`.claude/neo.config.json` (sandkassen, produksjonen og maskinklienten) og `CODEOWNERS`, og skrur på pluginene.

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

```text
kunde.yaml                    typen (kunde eller standard), kunden, godkjenneren, forvalteren og versjonene
felles/                       det som gjelder hele org-en, med de samme leddene som en løsning
  kilder/ forstaelse/         det som gjelder hele kunden (bare i et kunderepo)
  krav/ design/               det som er felles for flere løsninger
losninger/<losning>/          losning.yaml, kilder/, forstaelse/, krav/, design/, test/
oppsett/                      konfigen i Neos format, slik Neo eksporterer den; manuelt/ for det som gjøres for hånd
snapshots/<miljø>/            det som kjører i sandkassen og produksjonen, skrevet av forvaltning
reports/                      planene fra Neo, skrevet av forvaltning
integrasjoner/<system>/       hos-kunden.md, og det systemet trenger fra oss
test/personaer/               testbrukerne, felles for alle løsningene
.claude/neo.config.json       hvelvet, miljøene i Neo, maskinklienten, og én del per system. Ingen hemmeligheter
.claude/rules/                formen på hver mappe, slik sjekken leser den
```

En mappe finnes når det er noe i den; malen har bare filene som gjelder hele repoet, og `oppsett/`, `snapshots/` og
`reports/`. Konfigen i `oppsett/` er Neos eget format: Neo skriver filene ved et snapshot, og vurderer dem i planen.
Nøklene ligger i kundens hvelv; repoet sier bare hvilket.

## Sjekken

`check` kjører på hver PR: sjekken av repoet fra pluginen `forvaltning`, hentet i en låst versjon og kontrollert mot
sha256, og gitleaks. Den ser at filene i `oppsett/` og `snapshots/` er Neos filer, ikke om innholdet er gyldig: det
avgjør Neo i planen. Rødt stopper; gult sier fra. Lokalt kjører pluginen den samme sjekken, og `check` i
`.claude/method.json` henter den låste versjonen. Versjonen byttes med en PR som endrer adressen og sha256 både i
`.github/workflows/check.yml` og i `.claude/method.json`.

Sett regler for `main` i GitHub (Settings → Rules → Rulesets) om org-en ikke har dem: krev PR, at `check` er grønn og
godkjenning fra CODEOWNERS.

## Versjonen

`VERSION` er malens versjon, og `verktoy` i `kunde.yaml` sier hvilken versjon av malen og `forvaltning` repoet er
laget for. En nyere versjon tas
inn for hånd, i en PR.

## Lisens

MIT, se [`LICENSE`](./LICENSE).
