# Oppsettet i Neo, som filer

Dette repoet har oppsettet i Neo som filer: løsningene, det som er felles for org-en, og integrasjonene, med kildene og
kravene de bygger på. `type` i `kunde.yaml` sier om det er for én kunde (`kunde`) eller har standardløsninger
(`standard`). Løypa fra en idé til en løsning står i pluginen `solution`; veien inn og ut av Neo, og repoet, i pluginen
`forvaltning`.

## Hvor hva står

Hver mappe har en README med formen, og hvilket steg i løypa som skriver der. Les den før du skriver i mappa.

| Hva | Hvor |
|---|---|
| Hvem som eier løsningene, godkjenneren, forvalteren, versjonene | `kunde.yaml` |
| Hvelvet, miljøene i Neo, maskinklienten, og oppsettet av hvert system | `.claude/neo.config.json` |
| Det som gjelder alle løsningene | [`felles/`](felles/README.md) |
| Løsningene | [`losninger/`](losninger/README.md) |
| Systemene Neo kobles til, og det kunden selv gjør | [`integrasjoner/`](integrasjoner/README.md) |
| Testene på tvers, og testbrukerne | [`test/`](test/README.md) |
| Konfigen i Neos format | [`oppsett/`](oppsett/README.md) |
| Det som kjører i Neo per miljø, og planene | [`snapshots/`](snapshots/README.md), [`reports/`](reports/README.md) |

## Reglene

- **Det som ikke har en form her, finnes ikke.** Ingen andre mapper eller filer enn dem README-ene beskriver; sjekken
  stopper dem.
- **Neo endres bare gjennom pluginen `forvaltning`, og bare etter en godkjent PR,** fra `main` etter merge, og bare
  sandkassen. Kundens org-admin promoterer til produksjonen i Neo.
- **Generert er generert:** `snapshots/` og `reports/` skrives av `forvaltning`, ikke for hånd.
- **Ingen hemmeligheter i repoet.** Snapshot, plan og gjennomføring går med en maskinklient i sandkassen. Nøklene
  ligger bare i kundens hvelv, med faste navn, og skriptene henter dem for kjøringen. Hent eller legg aldri inn en
  verdi selv; et menneske gjør det med `/forvaltning:nokler`.
- **Kundespesifikt er kundens:** klienter, sertifikater, kontoer og delegeringer lages i kundens navn.
- **Feilsøk med systemenes egne svar:** når noe stopper mellom Neo og et eksternt system, sammenlign det Neo gjorde
  (`/monitoring:troubleshoot-run`) med det systemet selv sier (`/<system>:api`). Bare lesing.
- **Hvorfor en endring ble gjort, står i PR-en.** Det som er avgjort og varer, står der det gjelder.
- **Lever ikke før sjekken er grønn** (`check` i `.claude/method.json`).
