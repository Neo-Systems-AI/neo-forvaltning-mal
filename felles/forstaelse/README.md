# Forståelsen

Forståelsen er prosessen slik kildene beskriver den, én fil per dimensjon. Den samme lista brukes hver gang, så det
som mangler, synes som en tom seksjon og ikke som et hull.

| Hvor | Fila | Hva den svarer på |
|---|---|---|
| Løsningen | `hjemmel.md` | Lovene og forskriftene som styrer saken, med ordrett tekst |
| Løsningen | `saker-og-varianter.md` | Hva én sak er, hvor den begynner og slutter, og hva som deler sakene i varianter |
| Løsningen | `forlop.md` | Fasene fra henvendelse til arkiv, med frister og kontrollpunkter |
| Løsningen | `data-og-regler.md` | Egenskapene saken har, og betingelsene på dem |
| Løsningen | `dokumenter.md` | Det som kommer inn og det som går ut, med maler og skjerming |
| `felles/` | `roller-og-tilgang.md` | Hvem som gjør hva, godkjenner og ser hva, teamene, og inhabilitet |
| `felles/` | `spraket.md` | Hvordan kunden skriver, også tekst en agent skriver |
| `felles/` | `parter-og-kanaler.md` | Hvem kunden har med å gjøre, og kanalene inn og ut |
| `felles/` | `systemer.md` | Systemene rundt, og det som skal oppdateres der |
| `felles/` | `portefoljen.md` | Det som går på tvers av sakene: budsjettet, oversiktene og rapporteringen |

De felles dimensjonene gjelder kunden i et kunderepo, og målgruppen og feltet i et repo for standardløsninger: hvordan
kundene er organisert, felles hjemmel, vanlige roller og systemer, og hvordan kundene skiller seg fra hverandre. Steg 01
skriver dem, og steg 02 dimensjonene for en løsning. Har en løsning noe eget i en felles dimensjon, står det i
løsningen, i en fil med samme navn.

```markdown
<!-- losninger/parkering/forstaelse/forlop.md -->
# Forløpet

- Søknaden behandles innen tre uker etter at den er mottatt. [K1 § 4]
- Saksbehandleren kontrollerer legeerklæringen før vedtaket. [E1]
  Kontrollen gjøres i dag på papir.
- Hvem som godkjenner vedtaket, står i `roller-og-tilgang.md` i `felles/forstaelse/`.

## Det kildene ikke svarer på

- Hvem leser e-posten når saksbehandleren er borte?
```

- **En påstand er et øverste punkt i en liste,** med underpunktene og linjene under. Den viser til kilden i
  hakeparentes: `[K1]`, `[K1 § 4]`, `[E1, K3]`, `[K7–K9]`. Kilden står i registeret på samme sted, og er ikke trukket
  tilbake.
- **Det samme står ett sted.** Et punkt som bare viser til en annen fil (med navnet i backticks, som `forlop.md`), er en
  henvisning og trenger ingen kilde.
- **Spørsmålene til kunden** står til slutt, under overskriften «Det kildene ikke svarer på». De er ikke påstander.
- **Forståelsen er kildene, ikke løsningen.** Hva Neo skal gjøre, står i kravene og designet.

Sjekken stopper en påstand uten kilde, og en kilde som ikke står i registeret eller er trukket tilbake. Om påstanden
stemmer med kilden, avgjør ingen sjekk: det gjør kontrollen mot kildene, av en agent som ikke skrev forståelsen.
