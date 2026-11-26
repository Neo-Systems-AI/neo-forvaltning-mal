---
paths:
  - "losninger/**"
  - "felles/**"
---

# Løsningene og `felles/`

En løsning er konfigen i Neo for én sakstype eller én prosess, med det den bygger på. Mappa heter etter løsningen, med
små bokstaver, tall og bindestrek (`losninger/parkering/`), og har bare dette:

| Hva | Hvor | Formen |
|---|---|---|
| Hva løsningen er | `losning.yaml` | Under |
| Det vi vet, ordrett med opphav | `kilder/` | [kildene](kilder.md) |
| Hjemmelen, sakene og variantene, forløpet, data og regler, dokumentene | `forstaelse/` | [forståelsen](forstaelse.md) |
| Det som må holde, og hva hvert krav ble | `krav/` | [kravene](krav.md) |
| Valgene, med avvikene fra mønstrene | `design/` | [designet](design.md) |
| Konfigen i Neos format | `oppsett/` | [oppsettet](oppsett.md) |
| Testcasene, testplanen og rundene | `test/` | [testene](test.md) |

En mappe finnes når det er noe i den. **`felles/`** har de samme leddene, for det som gjelder hele org-en eller flere
løsninger: `kilder/` og `forstaelse/` (bare i et kunderepo), `krav/`, `design/` og `oppsett/`. Begge kan ha en
`README.md`. Noe annet er rødt i sjekken.

## `losning.yaml`

```yaml
formal: Behandle søknader om parkeringstillatelse for forflytningshemmede
eier: Kunden
status: utkast              # utkast, i-test, i-bruk eller avviklet
integrasjoner: []           # mappene i integrasjoner/ løsningen bruker, for eksempel [altinn, documaster]
bygger-pa: egen             # eller { standard: <navn>, versjon: <versjon> }
```

- **`eier`** er den som eier løsningen: kunden, en partner eller Neo.
- **`integrasjoner`** er en liste, også når den er tom. Et navn som ikke har en mappe i `integrasjoner/`, er gult.
- **`bygger-pa`** avgjøres i designet: `egen`, eller standardløsningen og versjonen den er kopiert fra. Den kan stå
  ute mens løsningen er i `utkast`, og kreves etter det.
- **`status`** styrer kravene: ute av `utkast` sier hvert krav hva det ble (`blir`).
