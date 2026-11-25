---
paths:
  - "losninger/*/5-oppsett/**"
  - "organisasjon/5-oppsett/**"
---

# Oppsettet

Oppsettet er konfigen i Neo som filer, i Neos eget format, uendret: det samme formatet Neo gir ved export og tar imot
ved plan og apply. Formatet og skjemaet er Neos, og hentes fra Neo for miljøet (`GET <neo>/api/config/schema`); de
kopieres aldri hit.

- **Én fil per objekt, i mappa for typen, navngitt etter nøkkelen:** `case-types/hc-parkering.yaml`,
  `custom-fields/case-gnr.yaml`, `workflows/behandling.yaml`. Mappene og nøkkelen per type står i skjemaet. Filnavnet
  er nøkkelen med små bokstaver, æ→ae, ø→o, å→a, og alt annet enn a–z og 0–9 som én bindestrek.
- **Stien Neo får, er stien under `5-oppsett/`.** Det en løsning bruker alene, står i `losninger/<losning>/5-oppsett/`;
  det flere løsninger bruker (felt, statussett, innboks-tagger), står i `organisasjon/5-oppsett/`.
- **Et objekt står ett sted.** Samme nøkkel i to `5-oppsett/` er rødt.
- **Bygger løsningen på en standard,** står bare det kunden endrer, her.

```yaml
# losninger/hc-parkering/5-oppsett/case-types/hc-parkering.yaml
apiVersion: neo-config/v1
kind: caseType
spec:
  name: Parkeringstillatelse for forflytningshemmede
  slug: hc-parkering
  # resten av feltene står i skjemaet for caseType
```

## `spor.yaml`

Hvilke krav hver fil oppfyller, i `losninger/<losning>/5-oppsett/spor.yaml`: stien under `5-oppsett/` og id-ene fra
`3-krav/` i samme løsning.

```yaml
case-types/hc-parkering.yaml: [soknad-mottatt, frist-mottatt]
workflows/behandling.yaml: [vurdering-vilkar, vedtak-sendt]
```

`check` validerer hver fil mot skjemaet fra Neo for miljøet i `.claude/neo.config.json`, sjekker at fila ligger på
stien nøkkelen gir, og at ingen nøkkel står to steder. Får den ikke hentet skjemaet, er det rødt: filene er da ikke
validert. Det skjemaet ikke kan si (pekerne mellom objektene, unike etiketter i en liste), sier planen i Neo
(`/config:plan-change`). `spor.yaml` må vise til filer og krav som finnes; en fil uten spor er gul.
