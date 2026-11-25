---
paths:
  - "test/personaer/**"
---

# Personaene

En persona er en testbruker: en person med rolle og team i Neo, og med identitetene den trenger i systemene rundt.
Samme persona brukes i alle løsningene. Én fil per persona, i `test/personaer/<navn>.yaml`, og testcasene viser til
den med navnet på fila, uten `.yaml`.

```yaml
# test/personaer/saksbehandler.yaml: testcasene skriver «persona: saksbehandler»
navn: Sara Saksbehandler
rolle: saksbehandler                 # jobbrollen i Neo
team: [tilskudd]
identiteter:
  neo: { epost: sara@<testdomene> }
  entra: { bruker: sara@<testdomene> }
  altinn: { fnr: "<testbruker i tt02>" }
  idporten: { fnr: "<syntetisk person fra Tenor>" }
  organisasjon: { orgnr: "<test-organisasjonsnummer>" }
  arkiv: { bruker: sara }
hemmeligheter:
  passord: { $env: SARA_PASSORD, kilde: azure-keyvault:<hvelv>/<navn> }
  sertifikat: { $env: SARA_SERTIFIKAT, kilde: azure-keyvault:<hvelv>/<navn>, fil: true }
```

- **Identitetene er testidentiteter:** testbrukere i Altinn (tt02), syntetiske personer fra Tenor i ID-porten,
  test-organisasjonsnumre og testkontoer i arkivet og Entra. Aldri en ekte person.
- **Passord og nøkler** står under `hemmeligheter`, som referanser til hvelvet. Verdien ligger i hvelvet til den som
  eier testidentiteten; `fil: true` betyr at verdien er en fil (en nøkkel eller et sertifikat).
- **Rollen og teamet** settes opp i Neo av et menneske. De er miljø, ikke konfig.

`check` sjekker at hver persona har navn og rolle, og at ingen hemmelighet står med verdi.
