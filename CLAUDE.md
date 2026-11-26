# Oppsettet i Neo, som filer

Dette repoet har oppsettet i Neo som filer: løsningene, det som er felles for org-en, og integrasjonene, med kildene og
kravene de bygger på. `type` i `repo.yaml` sier om det er for én kunde (`kunde`) eller har standardløsninger
(`standard`). Løypa og skillene står i pluginen `solution`.

## Hvor hva står

| Hva | Hvor | Formen |
|---|---|---|
| Typen, eieren og forvalteren | `repo.yaml` | |
| Godkjenneren | `.github/CODEOWNERS` | |
| Neo: adressen, org-en og MCP-serveren | `.claude/neo.config.json` | |
| Det som gjelder hele org-en | `felles/` | [løsningene og `felles/`](.claude/rules/losninger.md) |
| Løsningene | `losninger/<losning>/` | [løsningene](.claude/rules/losninger.md) |
| Kildene og forståelsen | `kilder/`, `forstaelse/` | [kildene](.claude/rules/kilder.md), [forståelsen](.claude/rules/forstaelse.md) |
| Kravene, og hva hvert krav ble | `krav/` | [kravene](.claude/rules/krav.md) |
| Valgene og avvikene fra mønstrene | `design/` | [designet](.claude/rules/design.md) |
| Konfigen i Neos format | `oppsett/` | [oppsettet](.claude/rules/oppsett.md) |
| Testcasene, testplanen og rundene | `losninger/<losning>/test/`, `test/` | [testene](.claude/rules/test.md) |
| Testbrukerne | `test/personaer/` | [personaene](.claude/rules/personaer.md) |
| Systemene Neo kobles til, og det kunden selv gjør | `integrasjoner/<system>/` | [integrasjonene](.claude/rules/integrasjoner.md) |

## Reglene

- **Det som ikke har en form her, finnes ikke.** Ingen andre mapper eller filer; sjekken stopper dem.
- **Neo endres bare etter en godkjent PR,** og bare sandkassen. Et menneske promoterer i Neo.
- **Ingen hemmeligheter i repoet.** Innloggingen mot Neo er personens egen. En hemmelighet står bare som en referanse
  til hvelvet, og verdien hentes ved hvert kall.
- **Kundespesifikt er kundens:** klienter, sertifikater, kontoer og delegeringer lages i kundens navn.
- **Hvorfor en endring ble gjort, står i PR-en.** Det som er avgjort og varer, står der det gjelder.
- **Lever ikke før sjekken er grønn** (`check` i `.claude/method.json`).
