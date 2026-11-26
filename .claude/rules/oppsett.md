---
paths:
  - "oppsett/**"
  - "snapshots/**"
---

# Oppsettet

Oppsettet er konfigen i Neo som filer, i Neos eget format, uendret: det samme Neo gir ved export og tar imot ved plan
og apply. Det står i `oppsett/` i roten, med samme mapper og filnavn som Neo eksporterer, og det Neo ikke skriver som
fil ennå, i `oppsett/manuelt/`. Hva hver mappe er, står i [`oppsett/README.md`](../../oppsett/README.md). Skjemaet er
Neos, og hentes fra Neo (`GET <url>/api/config/schema`); det kopieres aldri hit.

- **Én fil per objekt, i mappa for typen:** `oppsett/<mappa>/<navn>.yaml`, for eksempel
  `oppsett/case-types/parkering.yaml`. Hver fil har `apiVersion: neo-config/v1`, `kind` og `spec` øverst. Bare `.yaml`.
- **Stien Neo får, er stien under `oppsett/`.** Om innholdet og stien stemmer, avgjør Neo i planen.
- **En løsning har ingen egen `oppsett/`,** og `felles/` har ingen. Et krav peker på fila det ble
  (`blir: [{ fil: oppsett/case-types/parkering.yaml }]`), også når flere løsninger bruker den.
- **En fil finnes fordi et krav ble den.** En fil uten krav bak seg er gul.
- **En løsning som bygger på en standard,** er en full kopi av filene, med versjonen i `losning.yaml`. Neo krever hele
  fila.
- **`snapshots/<miljø>/`** er det som kjører i sandkassen og produksjonen, slik Neo eksporterte det, med
  `ikke-med.md`. Det skrives av `forvaltning`, ikke for hånd.
- **Ingen hemmeligheter** i konfigen.

Sjekken vurderer ikke innholdet i filene. Den ser at hver fil i `oppsett/` og `snapshots/` er en konfigfil fra Neo, og
stopper den gamle JSON-formen fra før `forvaltning` 0.2.0 og et rått svar (`raw/`). Innholdet vurderer Neo i planen
(`plan_config`, fil for fil), og gjennomgangen av konfigen mot mønstrene leser den slik den kjører i et miljø.
