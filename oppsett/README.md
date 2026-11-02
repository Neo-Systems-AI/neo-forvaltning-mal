# Oppsettet

Det ønskede oppsettet i Neo, som filer. En endring her er en PR, og planen (`/forvaltning:plan`) viser hva PR-en vil
endre i Neo.

**Formen er den samme som snapshotet.** Den enkleste måten å begynne på er å ta et snapshot
(`/forvaltning:snapshot sandkasse`) og kopiere filene du vil styre, fra `snapshots/sandkasse/oppsett/` hit. Det som
ikke står her, er ikke styrt fra repoet ennå; planen nevner det som `ikke-styrt`, men rører det ikke.

| Fil | Hva |
|---|---|
| `list_case_types.json` | Sakstypene |
| `get_case_status_pipeline.json` | Statusløpet |
| `list_custom_fields.json` | Feltene |
| `get_task_template_set--<nøkkel>.json` | Et sett med oppgavemaler |
| `get_workflow--<nøkkel>.json` | En flyt |

Et objekt kjennes igjen på nøkkelen sin (`slug`, ellers `key`, `name`, `title` eller `label`), aldri på id. En
referanse til et annet objekt skrives `ref:<nøkkel>`. Id-ene står i `state/<miljø>.lock.json`.

Et oppdiktet eksempel på `list_case_types.json`:

```json
[
  { "name": "Søknad om skjenkebevilling", "slug": "skjenkebevilling", "statusGroupId": "ref:standard" }
]
```
