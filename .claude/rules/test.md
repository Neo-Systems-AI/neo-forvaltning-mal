---
paths:
  - "losninger/*/6-test/**"
  - "test/**"
---

# Testene

Testene prøver oppsettet i Neo slik en saksbehandler møter det, med syntetiske saker. Ingen ekte søkere eller personer.

| Hva | Hvor |
|---|---|
| Testcasene for én løsning, én fil per sak | `losninger/<losning>/6-test/testcaser/<navn>.yaml` |
| Testplanen: hvilke testcaser som kjøres, i hvilken rekkefølge, av hvilken persona | `losninger/<losning>/6-test/testplan.md` |
| Funnene fra én runde i UI, med observasjonene ordrett | `losninger/<losning>/6-test/runder/<nn>-<ÅÅÅÅ-MM-DD>.md` |
| Testene som går gjennom flere løsninger | `test/<navn>.yaml` |
| Testbrukerne, felles for alle løsningene | `test/personaer/<navn>.yaml` ([personaene](personaer.md)) |

## En testcase

```yaml
beskrivelse: En søknad som kommer inn etter fristen, og avvises
persona: saksbehandler        # test/personaer/saksbehandler.yaml
inn:                          # saken slik den kommer inn: skjemaet, e-posten, vedleggene
  mottatt: 2027-03-02
forventet:
  krav: [frist-mottatt]       # kravene testcasen prøver
  utfall: avvist
```

- **`forventet`** sier det oppsettet skal gjøre med saken, og `forventet.krav` hvilke krav det prøver. Hvert krav
  finnes i en `3-krav/`.
- **`inn`** har formen til kanalen saken kommer fra. Den er fri.
- **En test i `test/`** har i tillegg `losninger:`, med minst to løsninger den går gjennom (en e-post inn i innboksen
  som havner i riktig løsning).
- **Passord og nøkler** står aldri i en testcase. Personaen har referansene.

`check` sjekker at hver testcase har en beskrivelse og kravene den prøver, og at kravene finnes. En persona som ikke
finnes i `test/personaer/`, gir et gult funn.
