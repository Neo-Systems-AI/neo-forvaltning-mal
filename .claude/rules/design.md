---
paths:
  - "felles/design/**"
  - "losninger/*/design/**"
---

# Designet

Designet er valgene som former oppsettet, skrevet som tilstand: hva som er valgt, hvorfor, og kravene valget dekker.
Det som gjelder én løsning, står i `losninger/<losning>/design/`; det som gjelder flere eller hele org-en (KI, team og
roller, tilgang, skrivereglene), i `felles/design/`. Hvorfor et valg ble endret, står i PR-en, ikke her.

- **Team, roller og tilgang er miljø, ikke konfig.** Designet sier hvilke som trengs; et menneske setter dem opp i Neo,
  og kravet sier det med `blir: { steg, hvorfor }`.
- **Et avvik fra en regel i mønstrene** er et item med regelens id og grunnen, så det ikke meldes på nytt:

````markdown
## to-sakstyper To sakstyper med samme navn i overgangen

```yaml
avvik: navn-er-nokkelen
fil: case-types/parkering.yaml     # når avviket bare gjelder én fil, stien under oppsett/
grunn: Den gamle og den nye står side om side til de gamle sakene er avsluttet.
```
````

Mønstrene og id-ene står i `docs/monstre/` i pluginen `solution`. Sjekken stopper et avvik som viser til en regel som
ikke finnes, et uten `grunn`, og en `fil` som ikke finnes i `oppsett/` når løsningen er ute av utkast.
