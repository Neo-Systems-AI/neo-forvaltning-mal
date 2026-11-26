# Kildene

Kildene er det vi vet, lagret slik vi fikk det: i `felles/kilder/` det som gjelder alle løsningene (kunden, eller
målgruppen og feltet i et repo for standardløsninger), og i `losninger/<losning>/kilder/` det som gjelder én løsning.
Steg 01 og 02 i løypa (`solution`) skriver dem. Formen er den samme begge steder.

```markdown
<!-- losninger/parkering/kilder/kilder.md -->
| Id | Hva | Utgiver | Dato på dokumentet | Dato lest | Lenke | Lagret |
|---|---|---|---|---|---|---|
| K1 | Forskrift om parkering for forflytningshemmede | Samferdselsdepartementet | 2023-01-01 | 2026-11-26 | https://lovdata.no/… | [`filer/K1_forskriften.md`](filer/K1_forskriften.md) |
| E1 | Samtale med saksbehandlerne | Kunden | 2026-11-20 | 2026-11-20 | | [`filer/E1_samtale.md`](filer/E1_samtale.md) |
```

- **Registeret er `kilder/kilder.md`:** én rad per kilde, med id-en i første kolonne. `K<n>` er et dokument, `E<n>` en
  e-post, en samtale eller et møte. Id-ene gjelder der registeret står: `K1` i en løsning er en annen kilde enn `K1` i
  `felles/`.
- **Fila lagres i `kilder/filer/`,** med id-en først i navnet, og raden viser til den med stien under `kilder/`
  (`filer/K1_forskriften.md`). Tekst fra en nettside lagres ordrett som markdown, med lenken og datoen øverst.
- **En kilde endres og slettes aldri.** En ny versjon får en ny id og en ny fil. Skal en kilde ut (den skulle ikke vært
  lagret), trekkes den tilbake med `Trukket tilbake: <grunnen>` i raden, og da kan fila tas bort.
- **Det som ikke er kundens, lagres ikke:** personopplysninger, og hemmeligheter. Ta et utdrag uten dem.

Sjekken stopper en fil i `kilder/filer/` som er endret på endringen, en som er slettet uten å være trukket tilbake, en
fil som ikke står i registeret, og en kilde som er trukket tilbake uten grunn.
