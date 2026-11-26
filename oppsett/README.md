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
`ikke-med.md` i snapshotet og
beskrives for hånd i [`manuelt/`](manuelt/README.md).
