# Snapshots

Det som kjører i Neo, per miljø, hentet med `/forvaltning:snapshot <miljø>`. Neo skriver filene (`export_config`), i
samme form som `oppsett/`, så en fil kan kopieres dit som den er. `ikke-med.md` sier hva Neo ikke skriver som fil
ennå. Git-historikken her er historikken til oppsettet. `raw/` er de uendrede svarene og committes ikke.

Filene er like når oppsettet er likt, så `git diff --no-index snapshots/sandkasse snapshots/produksjon` viser hva som
ikke er promotert ennå.
