---
paths:
  - "losninger/**"
---

# Løsningene

En løsning er en pakke av konfig i Neo for én sakstype eller én prosess, slik Neo selv grupperer den. Repoet kan ha
mange, og hver har den samme faste strukturen:

| Hva | Hvor |
|---|---|
| Hva løsningen er | `losning.yaml` |
| Det vi vet, ordrett med opphav | `1-kilder/` |
| Hjemmelen, sakene og variantene, forløpet, data og regler, og dokumentene | `2-forstaelse/` |
| Det som må holde | `3-krav/` |
| Valgene for løsningen | `4-design/` |
| Konfigen, eller det kunden endrer på en standard | `5-oppsett/` (formen kommer) |
| Testcasene, testplanen og funnene per runde | `6-test/` |

Mappa heter etter løsningen, med små bokstaver og bindestrek (`innovasjonstilskudd`).

## `losning.yaml`

```yaml
formal: Behandle søknader om innovasjonstilskudd fra mottak til arkiv
eier: Seksjon for tilskudd
status: utkast           # utkast, i-test, i-bruk eller avviklet
integrasjoner: [altinn, documaster]
bygger-pa: egen          # eller { standard: <navn>, versjon: <versjon> } for en standardløsning som tilpasses
```

- **`eier`** er den som eier løsningen: kunden, en partner eller Neo.
- **`integrasjoner`** er systemene i `integrasjoner/` løsningen bruker, med navnet på mappa. Flytene viser til systemet
  med det samme navnet. Er lista tom, står det `[]`.
- **`bygger-pa`** sier om løsningen er bygget her, eller er en standardløsning som tilpasses. Bygger den på en
  standard, står bare det kunden endrer, i `5-oppsett/`.

## `4-design/`

Valgene som former oppsettet, skrevet som tilstand: hva som er valgt, hvorfor, og hvem som valgte det, med dato. Det
som er felles med andre løsninger, står i `organisasjon/`, og designet viser dit. Hvorfor et valg ble endret, står i
PR-en.

## `5-oppsett/`

Formen på konfigen kommer. Til den er satt, står mappa tom.

`check` sjekker at hver løsning har `losning.yaml` med formål, eier, status, integrasjonene og hva den bygger på.
