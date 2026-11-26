---
paths:
  - "losninger/*/test/**"
  - "test/**"
---

# Testene

Testene prøver oppsettet i Neo slik en saksbehandler møter det, med syntetiske saker. Ingen ekte personer.

| Hva | Hvor |
|---|---|
| Testcasene for én løsning, én fil per sak | `losninger/<losning>/test/testcaser/<navn>.yaml` |
| Testplanen, og det et menneske lager i sandkassen før runden | `losninger/<losning>/test/testplan.md` |
| En runde i UI, med resultatene og funnene | `losninger/<losning>/test/runder/<ÅÅÅÅ-MM-DD>.md` |
| Testene som går gjennom flere løsninger | `test/<navn>.yaml` |
| Testbrukerne, felles for alle løsningene | `test/personaer/<navn>.yaml` ([personaene](personaer.md)) |

```yaml
# losninger/parkering/test/testcaser/etter-fristen.yaml
beskrivelse: En søknad som kommer inn etter fristen, og avvises
persona: saksbehandler        # test/personaer/saksbehandler.yaml
inn:                          # saken slik kanalen leverer den
  mottatt: 2027-03-02
forventet:
  krav: [frist-tre-uker]      # kravene testcasen prøver
  utfall: avvist
```

- **`forventet`** sier hva oppsettet skal gjøre med saken, og `forventet.krav` hvilke krav den prøver. Kravene finnes
  i en `krav/`.
- **`persona`** er navnet på fila i `test/personaer/`, uten `.yaml`. En persona som ikke finnes, er gul.
- **`inn`** har formen til kanalen saken kommer fra.
- **En test i `test/`** har i tillegg `losninger:`, med minst to løsninger den går gjennom.
- **En runde som er kjørt, endres ikke.** Neste runde er en ny fil.
- **Passord og nøkler** står aldri i en testcase. Personaen har referansene.
