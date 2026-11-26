---
paths:
  - "test/personaer/**"
---

# Personaene

En persona er en testbruker: en person med rolle og team i Neo, og identitetene den trenger i systemene rundt. Samme
persona brukes i alle løsningene, én fil per persona.

```yaml
# test/personaer/saksbehandler.yaml: testcasene skriver «persona: saksbehandler»
navn: Sara Saksbehandler
rolle: saksbehandler                 # jobbrollen i Neo
team: [parkering]
identiteter:
  neo: { epost: sara@test.example }
  altinn: { fnr: "<testbruker i tt02>" }
  idporten: { fnr: "<syntetisk person fra Tenor>" }
hemmeligheter:
  passord: { kilde: azure-keyvault:kv-forvalter-test/sara-passord }
  sertifikat: { kilde: azure-keyvault:kv-forvalter-test/sara-sertifikat, fil: true }
```

- **Identitetene er testidentiteter:** testbrukere i Altinn (tt02), syntetiske personer fra Tenor, test-
  organisasjonsnumre og testkontoer. Aldri en ekte person.
- **Passord og nøkler** står under `hemmeligheter`, som referanser til hvelvet til den som eier testidentiteten:
  `{ kilde: azure-keyvault:<hvelv>/<navn> }`, og `fil: true` når verdien er en fil. Verdien står aldri i repoet.
- **Rollen og teamet** settes opp i Neo av et menneske. De er miljø, ikke konfig.

Sjekken stopper en persona uten `navn` eller `rolle`, en referanse i en annen form, og en hemmelighet med verdi.
