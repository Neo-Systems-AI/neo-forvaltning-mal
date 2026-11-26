# Oppsettet

Det ønskede oppsettet i Neo, som filer. En endring her er en PR, og planen (`/forvaltning:plan`) viser hva PR-en vil
gjøre i sandkassen. Neo lager planen: hver fil prøves i sandkassen uten å lagres.

**Filene er Neo sine.** Neo skriver dem (`/forvaltning:snapshot`), og Neo leser dem (plan og gjennomføring). Den
enkleste måten å begynne på er å ta et snapshot av sandkassen og kopiere filene du vil styre, fra
`snapshots/sandkasse/` hit, med samme mappe og filnavn. Det som ikke står her, styres ikke fra repoet; planen nevner
det som «ikke styrt», og gjennomføringen rører det ikke.

| Mappe | Hva | Nøkkelen |
|---|---|---|
| `case-types/` | En sakstype, med statusene og feltene sine | `slug` |
| `custom-fields/` | Et felt uten sakstype | `entityType` og `name` |
| `task-status-groups/`, `block-status-groups/`, `artifact-status-groups/` | Statusene for oppgaver, blokker og dokumenter | `label` |
| `task-template-sets/` | Et sett med oppgavemaler | `name` |
| `workflows/` | En flyt | `name` |
| `relation-views/` | En relasjonsvisning | sakstypene, retningen og `name` |
| `case-wizards/` | Veiviseren for en sakstype | sakstypen |
| `instructions/` | En behandlingsregel | `name` |
| `document-templates/` | En dokumentmal | `name` |
| `case-run-instructions/` | En saksdatainstruks | `name` |
| `case-data-templates/` | En saksdatamal | `name` |
| `inbox-tags/` | En tagg i innboksen | `name` |
| `flow-event-types/` | En hendelsestype for flytene | `name` |

Mappene, nøklene og rekkefølgen står i Neo sitt manifest (`<adresse>/api/config/schema`); tabellen over er det det
sier i dag. Hver fil har ett objekt:

```yaml
# case-types/skjenkebevilling.yaml (oppdiktet og forkortet)
apiVersion: neo-config/v1
kind: caseType
spec:
  name: Søknad om skjenkebevilling
  slug: skjenkebevilling
  # … alle feltene, med en peker skrevet som nøkkelen til det den peker på
```

Reglene, kort (Neo sjekker dem i planen):

- **Ingen id-er.** En peker er nøkkelen til objektet den peker på. I en flyt står den som `ref:<type>:<nøkkel>`.
- **Alle felt står med.** Fila er fasit for objektet; `null` betyr «ingen».
- **Filnavnet er nøkkelen.** Får et objekt nytt navn i fila, må fila også få nytt navn.
- **Det fila fjerner, blir stående i Neo.** Planen viser det som «blir stående», og det fjernes for hånd.

Det Neo ikke skriver som fil ennå (for eksempel skjemaer, lagrede visninger, saksnummeret og Innsikt), står i
`ikke-med.md` i snapshotet. Det som gjøres for hånd i Neo, står på kravet det gjelder, som et steg
(`blir: { steg, hvorfor }`), ikke her.

## Formen

Oppsettet er konfigen i Neo som filer, i Neos eget format, uendret: det samme Neo gir ved export og tar imot ved plan
og apply. Det står i `oppsett/` i roten, med samme mapper og filnavn som Neo eksporterer. Skjemaet er
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
