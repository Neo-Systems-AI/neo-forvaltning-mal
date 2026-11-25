---
paths:
  - "integrasjoner/**"
---

# Integrasjonene

Hvert system Neo kobles til hos kunden (Altinn, arkivet, Maskinporten, Entra, Exchange, KS Fiks og de andre), har en
mappe her, med navnet på systemet i små bokstaver. Hvordan et system settes opp, er likt for alle kunder, og står i
oppskriften i `docs/` i pluginen til systemet i [`neo-forvaltning`](https://github.com/Neo-Systems-AI/neo-forvaltning)
(et system uten egen plugin står i `config`). Her står hvor langt denne kunden er kommet.

| Hva | Hvor |
|---|---|
| Oppsettet i Neo: klienten, appen, abonnementene, e-posten | `integrasjoner/<system>/neo.yaml` (formen settes av Neo) |
| Det kunden selv gjør, med status og hvem | `integrasjoner/<system>/hos-kunden.md` |
| Referansene til hemmelighetene i kundens hvelv | `integrasjoner/<system>/hemmeligheter.yaml` |
| Endepunktene per miljø | `integrasjoner/<system>/miljoer/` (formen settes av Neo) |
| Det systemet trenger fra oss, for eksempel Altinn-appen | `integrasjoner/<system>/<navn>/` |
| Lista over det kunden må gjøre, på tvers av systemene | `integrasjoner/README.md`, generert |

## `hos-kunden.md`

En oppgave er et item: en overskrift med id og tittel, og en yaml-blokk rett under.

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
- **`etter`** er oppgavene som må være ferdige først: `<id>` i samme system, eller `<system>/<id>` i et annet.
- **Lista i `integrasjoner/README.md` lages av `node scripts/hos-kunden.mjs`,** og skrives aldri for hånd. Den viser
  det som kan gjøres nå, det som venter, og lenken til oppskriften. Kjør skriptet etter hver endring i en
  `hos-kunden.md`; `check` stopper når lista ikke stemmer.

## `hemmeligheter.yaml`

Et kart fra navnet på hemmeligheten til hvor den ligger. Verdien står aldri i repoet: den ligger i Azure Key Vault, i
hvelvet til den som eier den (kundens for kundens systemer).

```yaml
klient-id:
  $env: MASKINPORTEN_CLIENT_ID
  kilde: azure-keyvault:<hvelv>/<navn>
nokkel:
  $env: MASKINPORTEN_KEY_FILE
  kilde: azure-keyvault:<hvelv>/<navn>
  fil: true                # verdien er en fil, og hentes til .keys/
```

Et menneske henter verdiene med sin egen innlogging (`/config:show-secrets`) til `.env.local` og `.keys/`, som aldri
committes. Klienter, sertifikater, kontoer og delegeringer hører til kunden, og lages i kundens navn. `check` stopper en
hemmelighet med verdi i hvilken som helst YAML-fil her.
