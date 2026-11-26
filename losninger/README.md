# Løsningene

En løsning er konfigen i Neo for én sakstype eller én prosess, med det den bygger på. Mappa heter etter løsningen, med
små bokstaver, tall og bindestrek (`losninger/parkering/`), og har bare dette:

| Hva | Hvor | Formen |
|---|---|---|
| Hva løsningen er | `losning.yaml` | Under |
| Det vi vet, ordrett med opphav | `kilder/` | [kildene](../felles/kilder/README.md) |
| Hjemmelen, sakene og variantene, forløpet, data og regler, dokumentene | `forstaelse/` | [forståelsen](../felles/forstaelse/README.md) |
| Det som må holde, og hva hvert krav ble | `krav/` | [kravene](../felles/krav/README.md) |
| Valgene, med avvikene fra mønstrene | `design/` | [designet](../felles/design/README.md) |
| Testcasene, testplanen og rundene | `test/` | [testene](../test/README.md) |

En ny løsning lages i steg 02 i løypa, med mappa og `losning.yaml`; leddene fylles etter hvert som løypa går.
**`felles/`** har de samme leddene, for det som gjelder alle løsningene ([`felles/`](../felles/README.md)). Noe annet
er rødt i sjekken. Konfigen står i `oppsett/` i roten, ikke i løsningen ([oppsettet](../oppsett/README.md)); kravene
peker på filene der.

```text
losninger/<losning>/
  losning.yaml
  kilder/        kilder.md og filer/
  forstaelse/    hjemmel.md, saker-og-varianter.md, forlop.md, data-og-regler.md, dokumenter.md
  krav/          én fil per dimensjon, med samme navn som i forståelsen
  design/
  test/          testcaser/, testplan.md, runder/
```

## `losning.yaml`

```yaml
formal: Behandle søknader om parkeringstillatelse for forflytningshemmede
eier: Kunden
status: utkast              # utkast, i-test, i-bruk eller avviklet
integrasjoner: []           # mappene i integrasjoner/ løsningen bruker, for eksempel [altinn, documaster]
bygger-pa: egen             # eller { standard: <navn>, versjon: <versjon> }
```

- **`eier`** er den som eier løsningen: kunden i et kunderepo, Neo eller en partner i et repo for standardløsninger.
- **`integrasjoner`** er en liste, også når den er tom. Et navn som ikke har en mappe i `integrasjoner/`, er gult.
- **`bygger-pa`** avgjøres i designet: `egen`, eller standardløsningen og versjonen den er kopiert fra. Den kan stå
  ute mens løsningen er i `utkast`, og kreves etter det.
- **`status`** styrer kravene: ute av `utkast` sier hvert krav hva det ble (`blir`).
