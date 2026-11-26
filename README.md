# neo-forvaltning-mal

Malen for et repo med oppsettet i [Neo](https://neosystems.ai) for én kommune eller virksomhet: løsningene, konfigen
for hele org-en og integrasjonene, som filer, med researchen og kravene de bygger på. Endringene går gjennom en PR, og
kunden godkjenner dem før de tas i bruk. Malen gir også et repo for standardløsninger, som en partner eller Neo eier.

Repoet ditt er ditt. Malen har strukturen, reglene og sjekkene. Skillene som researcher, skriver krav, designer, bygger
og tester, ligger i pluginene i [`neo-forvaltning`](https://github.com/Neo-Systems-AI/neo-forvaltning), sammen med
oppskriftene for integrasjonene og mønstrene for god konfig. Løpet fra en idé til en løsning i bruk står i README-en til
pluginen `solution` der.

**Et repo er én måte å forvalte oppsettet på.** Oppsettet kan også forvaltes rett i Neo. Repoet gir oppsettet som filer
med historikk, en endring kunden godkjenner i en PR før noe endres i Neo, og sjekker som holder formen. Malen bruker
GitHub fordi det er git-verktøyet vi kobler til i dag.

## Kom i gang

1. **Lag repoet:** «Use this template» → velg **din egen organisasjon** og **Private**. Et repo laget fra en mal er
   ikke en fork, så det kan være privat.
2. **Sett regler for `main`** (Settings → Rules → Rulesets): krev PR, krev at `check` er grønn, krev godkjenning fra
   CODEOWNERS, og tillat bare merge commit. På et privat repo krever dette GitHub Team eller høyere.
3. **Start Claude Code i repoet**, godta markedsplassen `neo-forvaltning`, og kjør `/forvaltning:oppstart`. Den
   intervjuer, fyller ut `kunde.yaml`, `.claude/neo.config.json` og `CODEOWNERS`, og registrerer maskinklienten. Org-admin
   i Neo må først ha laget en maskinklient i sandkassen (*API-klienter → Ny API-klient*, slaget «Maskin») med scopene
   for konfig, og lagt hemmeligheten i kundens hvelv.
4. **Hent hemmelighetene**, også maskinklientens, til `.env.local` (se under).

Et repo for standardløsninger trenger ikke `organisasjon/` og `profil.yaml`; slett dem i den første PR-en.

## Strukturen

Repoet speiler modellen i Neo: løsningene (pakker av konfig, én per sakstype eller prosess), profilen (løsningene
kunden har tatt i bruk) og konfigen for hele org-en. Hva som står hvor, står i [`CLAUDE.md`](./CLAUDE.md), og formen på
hver mappe i [`.claude/rules/`](./.claude/rules/).

Det kunden selv må gjøre for at Neo skal kobles til systemene, står samlet i
[`integrasjoner/README.md`](./integrasjoner/README.md). Lista lages fra statusen i hver integrasjon, og skrives ikke for
hånd.

## Hemmelighetene

**Kundens hemmeligheter er kundens:** Maskinporten-klientene, nøklene, virksomhetssertifikatet og passordene ligger i
kundens hvelv. Repoet sier bare hvor hver av dem ligger (`{"$env": "…", "kilde": "azure-keyvault:<hvelv>/<navn>"}`),
aldri verdien. Et menneske henter dem lokalt med sin egen innlogging (`/forvaltning:hemmeligheter`) til `.env.local`
og `.keys/`, som aldri committes. Når noen forvalter for kunden, bruker de kundens hvelv med en tilgang kunden har gitt
og kan trekke tilbake.

## Sjekkene

`check` kjører på hver PR: testene av skriptene, og `node scripts/check.mjs`. Den sjekker kundefila og konfigfila, at
ingen hemmelighet er committet, at kildene er uendret og at påstandene og kravene har kilde, at løsningene,
integrasjonene, personaene og testcasene har formen sin, og at lista over det kunden må gjøre er oppdatert. Gitleaks
leser endringen etter hemmeligheter. Rødt stopper PR-en; gult sier fra uten å stoppe.

Kjør den samme sjekken lokalt:

```bash
node --test "scripts/*.test.mjs" && node scripts/check.mjs
```

## Versjonene

`VERSION` er malens versjon, og `kunde.yaml` sier hvilken versjon av malen og pluginen repoet er laget fra. `check` sier
fra (gult) når malen eller pluginen har en nyere versjon, og du bestemmer når du tar den inn.

## Lisens

MIT, se [`LICENSE`](./LICENSE).
