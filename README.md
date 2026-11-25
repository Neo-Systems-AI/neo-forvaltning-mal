# neo-forvaltning-mal

Malen for et repo med oppsettet i [Neo](https://neosystems.ai) som filer: løsningene, konfigen for hele org-en og
integrasjonene, med researchen og kravene de bygger på. Endringene går gjennom en PR, og godkjenneren godkjenner dem
før noe endres i Neo. Malen gir to slags repo, og `type` i `repo.yaml` sier hvilket:

- **`kunde`:** oppsettet for én kommune eller virksomhet.
- **`standard`:** standardløsninger som en partner eller Neo eier, og som kundene tar i bruk og tilpasser.

Malen har strukturen, reglene og sjekkene. Skillene som researcher, skriver krav, designer, bygger og tester, ligger i
pluginene i [`neo-forvaltning`](https://github.com/Neo-Systems-AI/neo-forvaltning), sammen med oppskriftene for
integrasjonene og mønstrene for god konfig. Løpet fra en idé til en løsning i bruk står i README-en til pluginen
`solution` der; veien inn og ut av Neo (hente, planlegge og skrive konfigen) står i pluginen `config`.

## Kom i gang

1. **Lag repoet som en kopi av malen.** Malen ligger på github.com og repoet ditt på GitHub Enterprise, så «Use this
   template» virker ikke. En org-admin lager et tomt, privat repo i org-en (uten README), og gjør den første pushen,
   fordi regelsettet i org-en krever PR for alt annet:

   ```bash
   git clone --depth 1 https://github.com/Neo-Systems-AI/neo-forvaltning-mal.git <repo>
   cd <repo> && rm -rf .git && git init -b main
   git add -A && git commit -m "Fra neo-forvaltning-mal $(cat VERSION)"
   git remote add origin <adressen til det tomme repoet> && git push -u origin main
   ```

2. **Sett regler for `main`** hvis org-en ikke har dem (Settings → Rules → Rulesets): krev PR, krev at `check` er grønn,
   krev godkjenning fra CODEOWNERS, og tillat bare merge commit.
3. **Installer sjekkene:** Node 22 (`.nvmrc`), så `npm ci --engine-strict`.
4. **Start Claude Code i repoet**, godta markedsplassen `neo-forvaltning`, og kjør `/config:set-up-repo`. Den fyller ut
   `repo.yaml`, org-en i `.claude/neo.config.json` og `CODEOWNERS`, og tar bort `profil.yaml` og `virksomheten/` i et
   standardrepo. Org-admin i Neo må først ha laget en kobling for Claude Code i org-en (*API-klienter → Koble til
   Claude*). Logg inn i Neo med `/mcp`, og sjekk oppsettet med `/config:check-setup`.
5. **Lag den første løsningen:**
   `node scripts/ny-losning.mjs <navn> --formal "<formålet>" --eier "<eieren>"`.

## Strukturen

```text
repo.yaml                  typen (kunde eller standard), eieren, godkjenneren og forvalteren
profil.yaml                løsningene kunden har tatt i bruk (bare et kunderepo)
virksomheten/              det som gjelder hele kunden: kildene og forståelsen (bare et kunderepo)
organisasjon/
  4-design/                valgene som gjelder på tvers av løsningene
  5-oppsett/               konfigen flere løsninger bruker, i Neos format
integrasjoner/<system>/    hvor langt kunden er kommet med hvert system, og referansene til hemmelighetene
losninger/<losning>/       én løsning: losning.yaml, 1-kilder, 2-forstaelse, 3-krav, 4-design, 5-oppsett, 6-test
test/                      testene som går gjennom flere løsninger, og personaene i test/personaer/
```

En mappe finnes når det er noe i den. Hva som står hvor, står i [`CLAUDE.md`](./CLAUDE.md), og formen på hver mappe i
[`.claude/rules/`](./.claude/rules/).

## Konfigen

Konfigen står i `5-oppsett/`, i Neos eget format: én fil per objekt, i mappa for typen, navngitt etter nøkkelen
(`case-types/hc-parkering.yaml`). Formatet og skjemaet er Neos, og hentes fra Neo for miljøet. Hvilke krav hver fil
oppfyller, står i `spor.yaml` i løsningen. Formen står i [`.claude/rules/oppsett.md`](./.claude/rules/oppsett.md).

En endring i konfigen går slik: filene endres i en PR, `/config:plan-change` legger planen fra Neo i PR-en,
godkjenneren godkjenner PR-en, og `/config:apply-change` skriver endringen til sandkassen. Et menneske promoterer den i
Neo. Det som er endret i Neo utenom repoet, hentes med `/config:fetch-config` og viser seg som en diff i git. Miljøet
er `development` (`.claude/neo.config.json`).

## Hemmelighetene

Verdien ligger i Azure Key Vault, i hvelvet til den som eier den: kundens for kundens systemer, og forvalterens for
testidentitetene. Repoet har bare referansen, der den brukes (`integrasjoner/<system>/hemmeligheter.yaml` og
`test/personaer/`): `{ $env: <NAVN>, kilde: azure-keyvault:<hvelv>/<navn> }`, med `fil: true` for en nøkkelfil. Et
menneske henter verdiene med sin egen innlogging (`/config:show-secrets`) til `.env.local` og `.keys/`, som aldri
committes. `.claude/neo.config.json` har ingen hemmeligheter.

## Sjekkene

`check` kjører på hver PR: testene av skriptene og `node scripts/check.mjs`. Den sjekker `repo.yaml` og konfigfila,
at ingen hemmelighet er committet, at kildene er uendret og at påstandene og kravene har kilde, at løsningene,
integrasjonene, personaene og testcasene har formen sin, at hver fil i `5-oppsett/` er gyldig mot skjemaet fra Neo og
står ett sted, og at lista over det kunden må gjøre er oppdatert. Gitleaks leser endringen etter hemmeligheter. Rødt
stopper PR-en; gult sier fra uten å stoppe. Får sjekken ikke hentet skjemaet fra Neo, er det rødt.

```bash
npm ci --engine-strict && node --test && node scripts/check.mjs
```

## Versjonene

`VERSION` er malens versjon, og den første commiten i repoet sier hvilken versjon det er laget fra. En nyere versjon av
malen tas inn for hånd, i en PR.

## Lisens

MIT, se [`LICENSE`](./LICENSE).
