# Oppsettet til kunden i Neo

Dette repoet har oppsettet i Neo for kunden i `kunde.yaml`, som filer: løsningene, konfigen for hele org-en og
integrasjonene, med researchen og kravene de bygger på. Les `kunde.yaml` først. Et repo for standardløsninger har den
samme formen, uten `organisasjon/` og `profil.yaml`.

Løpet fra en idé til en løsning i bruk står i pluginen `solution`. Veien inn og ut av Neo står i pluginen `forvaltning`.

## Hvor det står hva

| Hva | Hvor | Formen |
|---|---|---|
| Hvem repoet er for, godkjenneren og forvalteren | `kunde.yaml` | |
| Løsningene og versjonene kunden har tatt i bruk | `profil.yaml` | Kommer |
| Det som gjelder hele kunden: kildene og forståelsen | `virksomheten/kilder/`, `virksomheten/forstaelse/` | [kildene](.claude/rules/kilder.md), [forståelsen](.claude/rules/forstaelse.md) |
| Konfigen utenfor løsningene, og personaene | `organisasjon/` | [README](organisasjon/README.md), [personaene](.claude/rules/personaer.md) |
| Systemene Neo kobles til, og det kunden selv gjør | `integrasjoner/<system>/` | [integrasjonene](.claude/rules/integrasjoner.md) |
| Lista over det kunden må gjøre | `integrasjoner/README.md` | Generert av `scripts/hos-kunden.mjs` |
| Løsningene, hver med samme faste struktur | `losninger/<losning>/` | [løsningene](.claude/rules/losninger.md), [kravene](.claude/rules/krav.md) |
| Testene, i løsningen og på tvers | `losninger/<losning>/6-test/`, `test/` | [testene](.claude/rules/test.md) |
| Konfigfila pluginene leser: miljøene, MCP-serverne og systemene | `.claude/neo.config.json` | |
| Det som kjører i Neo, id-ene per miljø, og planene | `snapshots/`, `state/`, `reports/` | Generert av `forvaltning` |
| Sjekkene | `scripts/`, kjørt av `check` | `.claude/method.json` |

## Reglene

- **Neo endres bare gjennom pluginen `forvaltning`, og bare etter en godkjent PR.** Godkjenneren står i `kunde.yaml` og
  `.github/CODEOWNERS`. Sandkassen endres først; produksjonen endres ved promotering i Neo, av kundens org-admin.
- **Generert er generert:** `snapshots/`, `state/`, `reports/` og `integrasjoner/README.md` skrives av skript, ikke for
  hånd.
- **Ingen hemmeligheter i repoet.** Innloggingen mot Neo er personens egen, gjennom `/mcp`. Hemmelighetene til de
  eksterne systemene ligger i kundens hvelv, og står i repoet bare som referanse (`$env`, `kilde`). Et menneske henter
  dem til `.env.local` og `.keys/`; les dem aldri, og kjør aldri hentingen (`/forvaltning:hemmeligheter`).
- **Kundespesifikt er kundens:** klienter, sertifikater, kontoer og delegeringer lages i kundens navn, aldri i
  forvalterens.
- **Feilsøk med systemenes egne svar:** når noe stopper mellom Neo og et eksternt system, sammenlign det Neo gjorde
  (`/monitoring:troubleshoot-run`) med det systemet selv sier (`/<system>:api`). Bare lesing.
- **Hvorfor en endring ble gjort, står i PR-en.** Det som er avgjort og varer, står der det gjelder.
- **Lever ikke før `check` er grønn:** `node --test "scripts/*.test.mjs" && node scripts/check.mjs`.
