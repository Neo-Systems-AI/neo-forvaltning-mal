---
paths:
  - "virksomheten/forstaelse/**"
  - "losninger/*/2-forstaelse/**"
---

# Forståelsen

Forståelsen er prosessen slik kildene beskriver den, i ti dimensjoner. Hver dimensjon finnes fordi noe i konfigen
trenger den. Den samme lista brukes for hver kunde, så det som mangler, synes som en tom fil og ikke som et hull.

| Hvor | Fila | Hva den svarer på |
|---|---|---|
| Løsningen | `01-hjemmel.md` | Lovene og forskriftene som styrer saken, med ordrett tekst. Begrunnelse, klage, innsyn, inhabilitet, unntak fra offentlighet, journalføring og oppbevaring |
| Løsningen | `02-saker-og-varianter.md` | Hva én sak er, hvor den begynner og slutter, hva som deler sakene i varianter, og hvor mange det er |
| Løsningen | `03-forlop.md` | Fasene fra søknad til arkiv, med frister og kontrollpunkter (godkjenninger, vurderinger, høring) |
| Virksomheten | `04-roller-og-tilgang.md` | Hvem som gjør hva, hvem som godkjenner, hvem som ser hva, og inhabilitet |
| Løsningen | `05-data-og-regler.md` | Egenskapene saken har (type, lovlige verdier, hvor de kommer fra), og betingelsene på dem |
| Løsningen | `06-dokumenter.md` | Det som kommer inn og det som går ut, med maler, flettefelt og skjerming |
| Virksomheten | `07-spraket.md` | Hvordan kunden skriver: standardformuleringer, begrunnelser, tone og klarspråk, også for tekst en agent skriver |
| Virksomheten | `08-parter-og-kanaler.md` | Hvem sakene har med å gjøre utenfor kunden, og kanalene inn og ut, også selvbetjening |
| Virksomheten | `09-systemer.md` | Systemene rundt: arkiv, registre, økonomi og rapportering, og det som skal oppdateres der |
| Virksomheten | `10-portefoljen.md` | Det som går på tvers av sakene: budsjettet, rangeringen, oversiktene og den årlige rapporteringen |

Virksomhetens filer står i `virksomheten/forstaelse/`, og løsningens i `losninger/<losning>/2-forstaelse/`. Gjelder en
felles dimensjon noe som bare finnes i én løsning (en egen godkjenner for én sakstype), står det i løsningen, i en fil
med samme navn.

- **Hver påstand viser til en kilde** i registeret på samme sted, i hakeparentes: `[K1]`, `[K14 § 7]`, `[E1, K3]`,
  `[K7–K9]`. En påstand er et øverste punkt i en liste, med underpunktene sine.
- **Spørsmålene til kunden** står til slutt, under overskriften «Det kildene ikke svarer på». De er ikke påstander, og
  trenger ingen kilde.
- **Det samme står ett sted.** Den andre dimensjonen henviser til fila: «står i `03-forlop.md`».
- **Forståelsen er kildene, ikke løsningen.** Hva Neo skal gjøre, står i kravene og designet.

`check` sjekker at hver påstand viser til en kilde som finnes. Om påstanden stemmer med kilden, avgjør ingen sjekk:
det gjør en egen agent som leser hver påstand mot de lagrede kildene, og et menneske som leser avvikene.
