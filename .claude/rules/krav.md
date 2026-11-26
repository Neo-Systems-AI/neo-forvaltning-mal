---
paths:
  - "felles/krav/**"
  - "losninger/*/krav/**"
---

# Kravene

Kravene er det som må holde, ett per vilkår, regel, steg, dokument eller rolle. De står i `krav/` i løsningen, i en
fil per dimensjon med samme navn som i forståelsen (`krav/forlop.md`), og det som er felles for flere løsninger, i
`felles/krav/`. Et krav sier hva som må holde; designet og oppsettet sier hvordan.

Et krav er et item: `## <id> <tittel>`, en yaml-blokk rett under, og forklaringen som tekst.

````markdown
## frist-tre-uker Søknaden behandles innen tre uker

```yaml
flyt: deterministisk
hvorfor: Forskriften gir søkeren svar innen tre uker etter mottak.
kilde: [K1, forstaelse/forlop.md#forløpet]
blir:
  - fil: oppsett/case-types/parkering.yaml
  - steg: Teamet «Parkering» settes opp i Neo
    hvorfor: Team er miljø, ikke konfig
  - onske: Fristen vises i oversikten over sakene
    hvorfor: Neo viser ikke fristen der ennå
```

Det som trengs for å forstå kravet, og det som er uavklart.
````

- **Id-en** er kort, med små bokstaver og bindestrek, og brukes bare én gang i repoet. Testene viser til den.
- **`flyt`** sier hvem som utfører kravet: `deterministisk` (en fast regel på dataene), `agentisk` (en agent leser og
  foreslår, og et menneske godkjenner) eller `menneske` (skjønn eller en beslutning).
- **`hvorfor`** er én setning, med hjemmelen eller grunnen.
- **`kilde`** er id-er i registeret på samme sted, eller stier til forståelsen, relative til løsningen (eller
  `felles/`), med anker: `forstaelse/forlop.md#forløpet`. Det som gjelder hele kunden, nås fra en løsning med
  `../../felles/forstaelse/roller-og-tilgang.md`. Et repo for standardløsninger har ingen kilder i `felles/`, så et
  krav i `felles/krav/` viser der til forståelsen i en løsning: `../losninger/parkering/forstaelse/forlop.md`.
- **`blir`** er hva kravet ble, én linje per ting: `fil` (en konfigfil i `oppsett/`, fra roten:
  `oppsett/<mappa for typen>/<navn>.yaml`), `steg` (noe et menneske gjør i Neo, også det Neo ikke skriver som fil ennå)
  eller `onske` (noe Neo ikke har ennå). `steg` og `onske` har `hvorfor`. Det finnes ingen egen sporingsfil.
- **`blir` kan stå tomt** mens løsningen er i `utkast`. Når den er `i-test` eller `i-bruk`, er et krav uten `blir`
  rødt. I `felles/krav/` er det gult.
- **Et krav fra hjemmelen tas aldri bort.** Det kan oppfylles på en annen måte.

Sjekken stopper en overskrift i `krav/` uten yaml-blokken rett under, et krav uten `flyt`, `hvorfor` eller en kilde som
finnes, en id som er brukt før, og en `blir.fil` som ikke finnes eller ikke er en konfigfil i `oppsett/`.
