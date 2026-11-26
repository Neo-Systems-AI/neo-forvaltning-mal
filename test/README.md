# Testene

Testene prøver oppsettet i Neo, skrevet i steg 07 og kjørt i steg 08, slik en saksbehandler møter det, med syntetiske saker. Ingen ekte personer.

| Hva | Hvor |
|---|---|
| Testcasene for én løsning, én fil per sak | `losninger/<losning>/test/testcaser/<navn>.yaml` |
| Testplanen, og det et menneske lager i sandkassen før runden | `losninger/<losning>/test/testplan.md` |
| En runde i UI, med resultatene og funnene | `losninger/<losning>/test/runder/<ÅÅÅÅ-MM-DD>.md`, og `<ÅÅÅÅ-MM-DD>-2.md` for neste samme dag |
| Testene som går gjennom flere løsninger | `test/<navn>.yaml` |
| Testbrukerne, felles for alle løsningene | `test/personaer/<navn>.yaml` ([personaene](personaer/README.md)) |

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
- **En runde som er kjørt, endres ikke.** Neste runde er en ny fil, med datoen i navnet.
- **Testplanen har et punkt per krav:** en overskrift med en yaml-blokk rett under som sier kravene punktet prøver.
  Riggen og resten av planen står som vanlig tekst.

````markdown
<!-- losninger/parkering/test/testplan.md -->
## p1 Søknaden kommer inn etter fristen

```yaml
krav: [frist-tre-uker]
```

Saksbehandleren ser at fristen er passert, og avslaget foreslås.
````

- **Passord og nøkler** står aldri i en testcase eller en persona.

Sjekken stopper en testcase uten `beskrivelse` eller `forventet.krav`, et krav som ikke finnes, en runde som ikke heter
etter datoen, noe annet i `test/` i en løsning enn `testcaser/`, `testplan.md` og `runder/`, og et krav i løsningen
uten et punkt i testplanen når testplanen finnes.
