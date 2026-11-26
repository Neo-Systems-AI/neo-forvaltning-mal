---
paths:
  - "integrasjoner/**"
  - ".claude/neo.config.json"
---

# Integrasjonene

Hvert system Neo kobles til hos kunden (Altinn, arkivet, Maskinporten, Entra, KS Fiks …) har en mappe her, med navnet
på systemet i små bokstaver. Hvordan et system settes opp, er likt for alle kunder og står i oppskriften i `docs/` i
pluginen til systemet. Her står hvor langt denne kunden er kommet.

| Hva | Hvor |
|---|---|
| Det kunden selv gjør, med status og hvem | `integrasjoner/<system>/hos-kunden.md` |
| Det systemet trenger fra oss, for eksempel Altinn-appen | `integrasjoner/<system>/<navn>/` |
| Oppsettet av systemet, og referansene til hemmelighetene i hvelvet | `<system>` i `.claude/neo.config.json` |

Noe annet i mappa til et system er rødt. Lista kunden jobber fra, på tvers av systemene, lages av sjekken
(`sjekk.mjs hos-kunden` i pluginen `solution`) og committes ikke.

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

## Hemmelighetene

Referansene står ved siden av oppsettet av systemet i `.claude/neo.config.json`, under `<system>.hemmeligheter`: et
kart fra navnet pluginen ser etter, til hvor verdien ligger i Azure Key Vault, i hvelvet til den som eier den (kundens
for kundens systemer). Verdien står aldri i repoet. README-en til pluginen for systemet sier hvilke navn den trenger.

```json
"maskinporten": {
  "miljo": "test",
  "klienter": { "fiks": { "clientId": "<klient-ID fra selvbetjeningen>", "scopes": ["ks:fiks"] } },
  "hemmeligheter": {
    "fiks-nokkel": { "kilde": "azure-keyvault:kv-kunde/maskinporten-fiks-nokkel", "fil": true }
  }
}
```

- **Formen er `{ "kilde": "azure-keyvault:<hvelv>/<navn>" }`,** og `"fil": true` når verdien er en fil, for eksempel en
  nøkkel (PEM). Ingen andre felt, og ingen referanser andre steder i fila.
- **Skriptene i pluginene henter verdien fra hvelvet ved hvert kall,** med personens egen innlogging. Ingen verdi
  lagres på disk.
- **Klienter, sertifikater, kontoer og delegeringer** hører til kunden, og lages i kundens navn.

Sjekken stopper en oppgave uten gyldig `status` eller `hvem`, en id som er brukt før, en `etter` som ikke finnes, en
referanse i en annen form eller utenfor `<system>.hemmeligheter`, en hemmelighet med verdi i config-fila eller i
hvilken som helst YAML-fil i `integrasjoner/`, og en `hemmeligheter.yaml`.
