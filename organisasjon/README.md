# Organisasjonen

Konfigen i Neo som gjelder hele org-en, utenfor løsningene. Det som gjelder én sakstype, står i løsningen.

| Mappe | Hva |
|---|---|
| `ki/` | KI-bryterne, de tillatte modellene, modellpolicyen og innstillingene for metadata. KI-reglene, verktøyene og modellen for én sakstype står i løsningen |
| `team-og-roller/` | Teamene, jobbrollene, gruppene fra kundens identitetssystem, og personaene i `personaer/` |
| `tilgang/` | Tilgangen på tvers av løsningene |
| `innboks/` | Smarttaggene og rutingen. Posten kommer før noen vet hvilken løsning den hører til |
| `skriveregler/` | Reglene agenten i Neo skriver brev og sakstekster etter, når de er felles |
| `felles/` | Felt, statussett og maler flere løsninger bruker |
| `innsikt/` | Dashbord og rapporter på tvers |
| `miljoer/` | Sandkassen og det som kobles per miljø (formen kommer) |

Formen på konfigen kommer. Til den er satt, står mappene tomme, og designet i løsningene sier hva som skal hit. Formen
på personaene står i [`.claude/rules/personaer.md`](../.claude/rules/personaer.md).

Et repo for standardløsninger har ikke denne mappa.
