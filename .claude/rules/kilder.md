---
paths:
  - "virksomheten/kilder/**"
  - "losninger/*/1-kilder/**"
---

# Kildene

Kildene er det vi vet, lagret slik vi fikk det. Virksomheten har sine i `virksomheten/kilder/`, og hver løsning sine i
`1-kilder/`.

- **Registeret er `kilder.md`:** én rad per kilde, med id, hva det er, utgiveren, datoen på dokumentet, datoen den ble
  lest, lenken og fila den er lagret i. Id-en er `K<n>` for et dokument og `E<n>` for en e-post, en samtale eller et
  møte. Id-ene gjelder der registeret står: `K1` i en løsning er en annen kilde enn `K1` i virksomheten.
- **Fila lagres i `filer/`**, med id-en først i navnet (`K3_forskriften.pdf`), og lenkes fra registeret. Tekst fra en
  nettside lagres ordrett som markdown, med lenken og datoen øverst.
- **En kilde endres og slettes aldri.** En ny versjon får en ny id og en ny fil. `check` stopper en endring eller en
  sletting i `filer/`, og en fil som ikke står i registeret.
- **Det som ikke er kundens, lagres ikke:** personopplysninger om andre enn de som er part i avtalen, og hemmeligheter.
