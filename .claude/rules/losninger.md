---
paths:
  - "losninger/**"
---

# Løsningene

En løsning er en pakke av konfig i Neo for én sakstype eller én prosess, slik Neo selv grupperer den. Repoet kan ha
mange, og hver har den samme faste strukturen:

| Hva | Hvor | Formen |
|---|---|---|
| Hva løsningen er | `losning.yaml` | Under |
| Det vi vet, ordrett med opphav | `1-kilder/` | [kildene](kilder.md) |
| Hjemmelen, sakene og variantene, forløpet, data og regler, og dokumentene | `2-forstaelse/` | [forståelsen](forstaelse.md) |
| Det som må holde | `3-krav/` | [kravene](krav.md) |
| Valgene for løsningen | `4-design/` | Under |
| Konfigen i Neos format, og hvilke krav hver fil oppfyller | `5-oppsett/`, `5-oppsett/spor.yaml` | [oppsettet](oppsett.md) |
| Testcasene, testplanen og funnene per runde | `6-test/` | [testene](test.md) |

En ny løsning lages med skriptet, som skriver `losning.yaml` i status `utkast` og registeret for kildene:

```bash
node scripts/ny-losning.mjs hc-parkering --formal "Behandle søknader om parkeringstillatelse" --eier "Kunden"
```

Mappa heter etter løsningen, med små bokstaver, tall og bindestrek. De andre mappene kommer når det er noe å legge i
dem.

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
- **`bygger-pa`** sier om løsningen er bygget her, eller er en standardløsning som tilpasses. Det avgjøres i designet,
  så det kan stå tomt så lenge løsningen er i `utkast`. Bygger den på en standard, står bare det kunden endrer, i
  `5-oppsett/`.

## `4-design/`

Valgene som former oppsettet, skrevet som tilstand: hva som er valgt, hvorfor, og hvem som valgte det, med dato. Det
som er felles med andre løsninger, står i `organisasjon/4-design/`, og designet viser dit. Hvorfor et valg ble endret,
står i PR-en.

`check` sjekker at hver løsning har `losning.yaml` med formål, eier, status og integrasjonene, og hva den bygger på
når den er ute av utkast.
