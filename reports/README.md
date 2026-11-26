# Planene

Planene fra Neo, skrevet av `/forvaltning:plan`: `plan-<miljø>.md` (i klartekst, til PR-en) og `plan-<miljø>.json` (det
gjennomføringen sjekker mot). Neo prøver alle filene i `oppsett/` samlet i sandkassen uten å lagre, og sier per fil hva
den vil gjøre: opprette, endre, la stå, eller avvise med grunnen.

Godkjenningen av PR-en er godkjenningen av akkurat denne planen. Gjennomføringen (`/forvaltning:gjennomfor`) kjører
fra `main` etter merge, lager planen på nytt, og stopper hvis den ikke er den som ble godkjent. Ikke skriv her for
hånd.
