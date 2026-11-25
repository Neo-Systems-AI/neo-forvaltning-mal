# Oppsettet i Neo, som filer

Dette repoet har oppsettet i Neo som filer: løsningene, konfigen for hele org-en og integrasjonene, med researchen og
kravene de bygger på. Les `repo.yaml` først: `type` sier om repoet er for én kunde (`kunde`) eller har
standardløsninger (`standard`, uten `profil.yaml` og `virksomheten/`).

Løpet fra en idé til en løsning i bruk står i pluginen `solution`. Veien inn og ut av Neo står i pluginen `config`.

## Hvor det står hva

| Hva | Hvor | Formen |
|---|---|---|
| Typen, eieren, godkjenneren og forvalteren | `repo.yaml` | |
| Løsningene kunden har tatt i bruk (bare et kunderepo) | `profil.yaml` | Settes av Neo |
| Det som gjelder hele kunden (bare et kunderepo) | `virksomheten/kilder/`, `virksomheten/forstaelse/` | [kildene](.claude/rules/kilder.md), [forståelsen](.claude/rules/forstaelse.md) |
| Valgene og konfigen som er felles for org-en | `organisasjon/4-design/`, `organisasjon/5-oppsett/` | [README](organisasjon/README.md), [oppsettet](.claude/rules/oppsett.md) |
| Løsningene, hver med samme faste struktur | `losninger/<losning>/` | [løsningene](.claude/rules/losninger.md), [kravene](.claude/rules/krav.md), [oppsettet](.claude/rules/oppsett.md) |
| Systemene Neo kobles til, og det kunden selv gjør | `integrasjoner/<system>/` | [integrasjonene](.claude/rules/integrasjoner.md) |
| Lista over det kunden må gjøre | `integrasjoner/README.md` | Generert av `scripts/hos-kunden.mjs` |
| Testene, i løsningen og på tvers, og personaene | `losninger/<losning>/6-test/`, `test/`, `test/personaer/` | [testene](.claude/rules/test.md), [personaene](.claude/rules/personaer.md) |
| Miljøet i Neo, adressen, org-en og MCP-serveren | `.claude/neo.config.json` | |
| Sjekkene, og en ny løsning | `scripts/`, kjørt av `check`; `scripts/ny-losning.mjs` | `.claude/method.json` |

## Reglene

- **Neo endres bare gjennom pluginen `config`, og bare etter en godkjent PR.** Godkjenneren står i `repo.yaml` og
  `.github/CODEOWNERS`. Bare sandkassen skrives til; et menneske promoterer i Neo.
- **Konfigen er Neos format, uendret,** i `5-oppsett/`. Skjemaet hentes fra Neo, og kopieres aldri hit.
- **Generert er generert:** `integrasjoner/README.md` skrives av skriptet, ikke for hånd.
- **Ingen hemmeligheter i repoet.** Innloggingen mot Neo er personens egen, gjennom `/mcp`. Hemmelighetene står bare
  som referanser til hvelvet (`$env`, `kilde`), der de brukes. Et menneske henter dem til `.env.local` og `.keys/`; les
  dem aldri, og kjør aldri hentingen (`/config:show-secrets`).
- **Kundespesifikt er kundens:** klienter, sertifikater, kontoer og delegeringer lages i kundens navn, aldri i
  forvalterens.
- **Feilsøk med systemenes egne svar:** når noe stopper mellom Neo og et eksternt system, sammenlign det Neo gjorde
  (`/monitoring:troubleshoot-run`) med det systemet selv sier (`/<system>:api`). Bare lesing.
- **Hvorfor en endring ble gjort, står i PR-en.** Det som er avgjort og varer, står der det gjelder.
- **Lever ikke før `check` er grønn:** `node --test && node scripts/check.mjs`.
