# neo-forvaltning-mal

Malen for et repo med oppsettet i [Neo](https://neosystems.ai) som filer: løsningene, det som er felles for org-en,
og integrasjonene, med kildene og kravene de bygger på. Endringene går gjennom en PR, og godkjenneren godkjenner dem
før noe skrives til Neo. `type` i `repo.yaml` sier hva slags repo det er:

- **`kunde`:** oppsettet for én kommune eller virksomhet.
- **`standard`:** standardløsninger som en partner eller Neo eier, og som kundene tar i bruk.

## Kom i gang

Start Claude Code og kjør `/solution:set-up-repo`. Den lager repoet fra malen, fyller ut `repo.yaml`,
`.claude/neo.config.json` og `CODEOWNERS`, skrur på pluginene og kobler deg til Neo.

Pluginen `solution` kommer fra markedsplassen [`neo-forvaltning`](https://github.com/Neo-Systems-AI/neo-forvaltning).
I en klone av malen spør Claude Code om den (`.claude/settings.json`); ellers:
`/plugin marketplace add Neo-Systems-AI/neo-forvaltning` og `/plugin install solution@neo-forvaltning`. Løypa fra en
idé til en løsning i bruk står i README-en til `solution`.

## Hvor hva står

```text
repo.yaml                     typen (kunde eller standard), eieren og forvalteren
felles/                       det som gjelder hele org-en, med de samme leddene som en løsning
  kilder/ forstaelse/         det som gjelder hele kunden (bare i et kunderepo)
  krav/ design/ oppsett/      det som er felles for flere løsninger
losninger/<losning>/          losning.yaml, kilder/, forstaelse/, krav/, design/, oppsett/, test/
integrasjoner/<system>/       hos-kunden.md, hemmeligheter.yaml, og det systemet trenger fra oss
test/personaer/               testbrukerne, felles for alle løsningene
.claude/neo.config.json       Neo: adressen, org-en og MCP-serveren. Ingen hemmeligheter
.claude/rules/                formen på hver mappe, slik sjekken leser den
```

En mappe finnes når det er noe i den; malen har bare filene som gjelder hele repoet. Konfigen i `oppsett/` er Neos
eget format, og skjemaet hentes fra Neo. Hemmelighetene ligger i Azure Key Vault; repoet har bare referansene.

## Sjekken

`check` kjører på hver PR: sjekken av repoet fra pluginen `solution`, hentet i en låst versjon og kontrollert mot
sha256, og gitleaks. Rødt stopper; gult sier fra. Lokalt kjører pluginen den samme sjekken, og `check` i
`.claude/method.json` henter den låste versjonen. Versjonen byttes med en PR som endrer adressen og sha256 både i
`.github/workflows/check.yml` og i `.claude/method.json`.

Sett regler for `main` i GitHub (Settings → Rules → Rulesets) om org-en ikke har dem: krev PR, at `check` er grønn og
godkjenning fra CODEOWNERS.

## Versjonen

`VERSION` er malens versjon, og den første commiten i repoet sier hvilken versjon det er laget fra. En nyere versjon tas
inn for hånd, i en PR.

## Lisens

MIT, se [`LICENSE`](./LICENSE).
