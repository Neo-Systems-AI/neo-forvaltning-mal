---
paths:
  - "losninger/*/3-krav/**"
---

# Kravene

Kravene er det som må holde, ett per vilkår, regel, steg, dokument eller rolle. De står i `3-krav/` i løsningen, i en
fil per dimensjon med samme navn som i forståelsen (`03-forlop.md`). Kravene er kanalnøytrale: de sier hva som må
holde, og designet og oppsettet sier hvordan.

Et krav er et item: en overskrift med id og tittel, en yaml-blokk rett under, og forklaringen som tekst.

````markdown
## frist-mottatt Søknaden er mottatt innen fristen

```yaml
flyt: deterministisk
hvorfor: Fristen er et tidspunkt i utlysningen; mottakstidspunktet står på e-posten.
kilde: [K1, 2-forstaelse/03-forlop.md#søknad-og-mottak]
blir:
```

Det som trengs for å forstå kravet, og det som er uavklart.
````

- **Id-en** er kort, med små bokstaver og bindestrek, og brukes bare én gang i repoet. Testene viser til den.
- **`flyt`** sier hvem som utfører kravet:
  - `deterministisk`: en fast regel på dataene
  - `agentisk`: en agent leser og foreslår, og et menneske godkjenner
  - `menneske`: skjønn eller en beslutning et menneske tar
- **`hvorfor`** er én setning, med hjemmelen eller grunnen.
- **`kilde`** er id-er i registeret til løsningen, eller stier til forståelsen med anker. En sti er relativ til
  løsningen, som en lenke i markdown: `2-forstaelse/03-forlop.md#søknad-og-mottak`, eller
  `../../virksomheten/forstaelse/04-roller-og-tilgang.md` for det som gjelder hele kunden.
- **`blir`** fylles ut når kravet kobles til oppsettet: konfigobjektet kravet blir, eller et ønske til produktet når det
  er sjekket at Neo ikke har det. Kravene antar ikke hva produktet har.
- **Et krav fra hjemmelen tas aldri bort.** Oppsettet kan oppfylle det på en annen måte.

`check` sjekker at hvert krav har `flyt`, `hvorfor` og en kilde som finnes, og at ingen id er brukt to ganger.
