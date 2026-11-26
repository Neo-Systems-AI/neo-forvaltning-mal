# Oppsettet i Neo, som filer

Dette repoet har oppsettet i Neo som filer: løsningene, det som er felles for org-en, og integrasjonene, med kildene og
kravene de bygger på. `type` i `kunde.yaml` sier om det er for én kunde (`kunde`) eller har standardløsninger
(`standard`). Løypa fra en idé til en løsning står i pluginen `solution`; veien inn og ut av Neo, og repoet, i pluginen
`forvaltning`.

## Hvor hva står

| Hva | Hvor | Formen |
|---|---|---|
| Typen, kunden, godkjenneren, forvalteren og versjonene | `kunde.yaml` | |
| Godkjenneren, slik GitHub håndhever den | `.github/CODEOWNERS` | |
| Miljøene i Neo (sandkasse og produksjon), maskinklienten, og oppsettet av hvert system med referansene til hvelvet | `.claude/neo.config.json` | [integrasjonene](.claude/rules/integrasjoner.md) |
| Det som gjelder hele org-en | `felles/` | [løsningene og `felles/`](.claude/rules/losninger.md) |
| Løsningene | `losninger/<losning>/` | [løsningene](.claude/rules/losninger.md) |
| Kildene og forståelsen | `kilder/`, `forstaelse/` | [kildene](.claude/rules/kilder.md), [forståelsen](.claude/rules/forstaelse.md) |
| Kravene, og hva hvert krav ble | `krav/` | [kravene](.claude/rules/krav.md) |
| Valgene og avvikene fra mønstrene | `design/` | [designet](.claude/rules/design.md) |
| Konfigen i Neos format, og det som gjøres for hånd | `oppsett/`, `oppsett/manuelt/` | [oppsettet](.claude/rules/oppsett.md) |
| Det som kjører i Neo per miljø, og planene | `snapshots/<miljø>/`, `reports/` | Skrevet av `forvaltning` |
| Testcasene, testplanen og rundene | `losninger/<losning>/test/`, `test/` | [testene](.claude/rules/test.md) |
| Testbrukerne | `test/personaer/` | [personaene](.claude/rules/personaer.md) |
| Systemene Neo kobles til, og det kunden selv gjør | `integrasjoner/<system>/` | [integrasjonene](.claude/rules/integrasjoner.md) |

## Reglene

- **Det som ikke har en form her, finnes ikke.** Ingen andre mapper eller filer; sjekken stopper dem.
- **Neo endres bare gjennom pluginen `forvaltning`, og bare etter en godkjent PR,** fra `main` etter merge, og bare
  sandkassen. Kundens org-admin promoterer til produksjonen i Neo.
- **Generert er generert:** `snapshots/` og `reports/` skrives av `forvaltning`, ikke for hånd.
- **Ingen hemmeligheter i repoet.** Snapshot, plan og gjennomføring går med en maskinklient i sandkassen. Hemmeligheten
  dens og hemmelighetene til systemene ligger i kundens hvelv, og står i repoet bare som referanse (`$env`, `kilde`).
  Skriptene henter verdien fra hvelvet for kjøringen; hent aldri en verdi selv, og legg den aldri i en fil
  (`/forvaltning:hemmeligheter`).
- **Kundespesifikt er kundens:** klienter, sertifikater, kontoer og delegeringer lages i kundens navn.
- **Feilsøk med systemenes egne svar:** når noe stopper mellom Neo og et eksternt system, sammenlign det Neo gjorde
  (`/monitoring:troubleshoot-run`) med det systemet selv sier (`/<system>:api`). Bare lesing.
- **Hvorfor en endring ble gjort, står i PR-en.** Det som er avgjort og varer, står der det gjelder.
- **Lever ikke før sjekken er grønn** (`check` i `.claude/method.json`).
