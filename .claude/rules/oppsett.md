---
paths:
  - "felles/oppsett/**"
  - "losninger/*/oppsett/**"
---

# Oppsettet

Oppsettet er konfigen i Neo som filer, i Neos eget format, uendret: det samme Neo gir ved export og tar imot ved plan
og apply. Skjemaet er Neos, og hentes fra Neo (`GET <neo.url>/api/config/schema`, adressen i
`.claude/neo.config.json`). Det kopieres aldri hit. Formen på et objekt som finnes, gir `export_config`.

```yaml
# felles/oppsett/inbox-tags/faktura.yaml
apiVersion: neo-config/v1
kind: inboxTag
spec:
  name: faktura
  label: Faktura
  description: E-post med en faktura som skal til økonomiavdelingen.
  color: null
  applicationMode: manual
  verifyBelowConfidence: null
```

- **Én fil per objekt, i mappa for typen:** `<mappa>/<navn>.yaml` rett under `oppsett/`, for eksempel
  `case-types/parkering.yaml` eller `custom-fields/case-gnr.yaml`. Mappa per type, nøkkelen og regelen for filnavnet
  står i skjemaet. Bare `.yaml`.
- **Stien Neo får, er stien under `oppsett/`.** Om den stemmer med nøkkelen, avgjør Neo i planen.
- **Det en løsning bruker alene,** står i løsningen. Det flere løsninger bruker (felt, statussett, innboks-tagger),
  står i `felles/oppsett/`. **Et objekt står ett sted:** samme type og nøkkel to steder er rødt.
- **En fil finnes fordi et krav ble den** (`blir: { fil }` i kravet). En fil uten krav bak seg er gul.
- **En løsning som bygger på en standard,** er en full kopi av filene, med versjonen i `losning.yaml`. Neo krever hele
  fila.
- **Ingen hemmeligheter** i konfigen.

Sjekken validerer hver fil mot skjemaet fra Neo, ser at typen stemmer med mappa og at samme objekt ikke står to steder,
og kjører reglene i mønstrene som kan sjekkes maskinelt. Får den ikke hentet skjemaet, er det rødt: filene er da ikke
validert. Det skjemaet ikke kan si (pekerne mellom objektene, stien, unike etiketter i en liste), sier planen fra Neo.
