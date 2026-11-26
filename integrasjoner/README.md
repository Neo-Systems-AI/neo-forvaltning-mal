# Integrasjonene

Hvert system Neo kobles til hos kunden (Altinn, arkivet, Maskinporten, Entra, KS Fiks …) har en mappe her, med navnet
på systemet i små bokstaver. Hvordan et system settes opp, er likt for alle kunder og står i oppskriften i `docs/` i
pluginen til systemet. Her står hvor langt denne kunden er kommet.

| Hva | Hvor |
|---|---|
| Det kunden selv gjør, med status og hvem | `integrasjoner/<system>/hos-kunden.md` |
| Det systemet trenger fra oss, for eksempel Altinn-appen | `integrasjoner/<system>/<navn>/` |
| Oppsettet av systemet (nøklene ligger i hvelvet, med faste navn) | `<system>` i `.claude/neo.config.json` |

Noe annet i mappa til et system er rødt. Lista kunden jobber fra, på tvers av systemene, skrives ut av sjekken
(`sjekk.mjs hos-kunden` i pluginen `forvaltning`); den står ikke i repoet.

Oppskriften for hvert system står i `docs/` i pluginen til systemet (`altinn`, `documaster`, `entra`, `fiks`, `krr`,
`maskinporten`), og hvordan en flyt bruker en integrasjon, i mønstrene i `solution` (`11-integrasjoner.md`).

## `hos-kunden.md`

En oppgave er et item: `## <id> <tittel>` og en yaml-blokk rett under.

````markdown
## delegering Deleger tilgangen i Altinn til Neo

```yaml
status: ikke-startet       # ikke-startet, i-gang eller ferdig
hvem: Hovedadministratoren i Altinn
etter: [maskinporten/klient]
```

Det som er spesielt for denne kunden. Fremgangsmåten står i oppskriften.
````

- **`hvem`** er rollen hos kunden som gjør det, ikke et navn.
- **`etter`** er oppgavene som må være ferdige først: `<id>` i samme system, eller `<system>/<id>` i et annet. De
  finnes.

## Nøklene

Nøklene ligger bare i hvelvet til den som eier dem (kundens for kundens systemer). Config-fila sier bare hvilket hvelv
(`"hvelv": "kv-kunde"`), og pluginene bestemmer navnene, i formen `<system>--<navn>`: `fiks--integrasjon-passord`,
`maskinporten--<klient>-nokkel`, `neo--sandkasse-klient`. README-en til hver plugin sier hvilke den bruker.

- **Ingen referanser i repoet.** Ingen `hemmeligheter`, `$env` eller `kilde` i config-fila.
- **Én kommando legger dem inn:** `/forvaltning:nokler` viser hva pluginene som er på, trenger, og om det står i
  hvelvet, og et menneske legger inn det som mangler med `fyll`. Når en plugin eller en klient kommer til, kjøres den
  igjen.
- **Skriptene henter nøkkelen fra hvelvet for kjøringen,** med personens egen innlogging, og ingen kopi lagres lokalt.
  I en jobb i GitHub har jobbens hemmeligheter de samme navnene, med store bokstaver og `_`.
- **Klienter, sertifikater, kontoer og delegeringer** hører til kunden, og lages i kundens navn.

Sjekken stopper en oppgave uten gyldig `status` eller `hvem`, en id som er brukt før, en `etter` som ikke finnes, en
referanse eller `hemmeligheter` i config-fila, en hemmelighet med verdi i config-fila eller i hvilken som helst YAML-fil
i `integrasjoner/`, og en `hemmeligheter.yaml`.
