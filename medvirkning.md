# Kundens medvirkning

Det kunden gjør i egne systemer før Neo kan kobles til, og hvordan verdiene og tilstanden går mellom kunden og
forvalteren. Dette er et startpunkt fra den første implementeringen. Bygg videre på det, og skriv inn det dere lærer.

## Slik går verdiene og tilstanden

- **Kundens hvelv er kanalen for verdiene.** Hemmeligheter og ID-er legges i hvelvet i det øyeblikket kunden lager
  dem, under navnene i oppgavene under. Forvalteren har rollen Key Vault Secrets Officer på hvelvet. Den lar
  forvalteren lese og legge inn verdier, men ikke endre tilgangene, og kunden kan fjerne den når som helst. Kunden kan
  legge verdiene inn i Neo selv under integrasjonene og teste tilkoblingen der, eller la forvalteren gjøre det fra
  hvelvet. Kopien i hvelvet brukes når noe skal byttes, settes opp på nytt eller feilsøkes. Ingen
  verdi går på e-post eller i et dokument. Config-fila viser til navnene (`"kilde": "azure-keyvault:<hvelv>/<navn>"`).
- **Ett felles dokument for tilstanden.** Hver oppgave står ett sted: hvem hos kunden som vanligvis tar den, når den
  trengs, oppskriften, stegene for kunden («Dere») og forvalteren («Vi») med en avkrysningsboks hver, og «Ferdig».
  Kunden og forvalteren krysser av der, og spørsmål står som kommentarer. Da trengs ingen status på e-post.
- **Fire slag innhold, med hver sin farge:**
  - oppskriften for kundens egne systemer (oransje);
  - det som legges i hvelvet (blå);
  - det kunden fyller inn i dokumentet: valg, lister, navn og datoer (grønn);
  - det forvalteren lager i Neo og kunden trenger, for eksempel adresser å lime inn (grå).
- **Kunden eier sin egen systemadministrasjon.** Oppskriften sier hva kunden gjør, hvor og i hvilken rekkefølge, og når
  det er ferdig. Den har ingen kommandoer, og kunden velger selv verktøyet. Oppsettet inne i Neo gjør forvalteren.
- **Spør ikke om det Neo henter selv,** som appene i Altinn-organisasjonen, rollene i Folkeregisteret og
  forsendelsestypene.
- **Prøv ett ledd før det neste slås på,** for eksempel innloggingen før brukerprovisjoneringen.

## Oppgavene

Oppskriftene for Entra ID og Exchange følger oppsettskillene `entra:sso-scim` og `entra:felles-postboks` i
`neo-forvaltning`. Documaster, Maskinporten og Altinn følger integrasjonene i Neo og skillen
`altinn:altinn-publisering`. KS Fiks, digital post, Kontakt- og reservasjonsregisteret og eSignering følger labben
(`fellestjenester/kunnskap/` i `lab`) og leverandørenes egne sider, lest 2026-11-17. Det som må avklares med
leverandøren, står som et steg.

### Hvelvet

1. Lag et Azure Key Vault i kundens Azure, med tilgangsmodellen Azure RBAC.
2. Gi forvalterens personer rollen Key Vault Secrets Officer på hvelvet.

### Innlogging og brukere (Entra ID)

Kunden trenger Cloud Application Administrator, eller rettigheter til å opprette en app, gi administratorsamtykke og
tildele grupper til appen. Tildeling av grupper krever Entra ID P1 eller P2.

1. Lag appen fra Microsofts mal for egne apper (Enterprise applications, «Create your own application»). Malen gir
   automatisk provisjonering (SCIM). En app laget bare som appregistrering har det ikke.
2. Sett appen til kun egen organisasjon, og legg det valgfrie claimet `upn` på ID-tokenet.
3. Gi administratorsamtykke for `openid` og `profile`.
4. Lag sikkerhetsgruppene, med brukerne som direkte medlemmer, og tildel dem til appen. Nestede grupper telles ikke.
5. Lag én client secret, og noter utløpsdatoen.
6. Legg inn redirect-adressen fra forvalteren, tegn for tegn, og TXT-posten for domenet i DNS. Verdien i TXT-posten
   gjelder i 7 døgn.
7. Prøv innloggingen med én bruker før provisjoneringen slås på.
8. Provisjonering: sett den til automatisk med Tenant URL fra forvalteren og tokenet fra hvelvet, og test tilkoblingen.
9. Mappingene: hent både `userName` og e-posten fra `userPrincipalName`, ellers blir brukeren opprettet to ganger. La
   `objectId` til `externalId` stå for grupper.
10. Prøv én bruker med «Provision on demand», og start provisjoneringen.
11. En administrator hos kunden logger inn i Neo med Entra ID og slår på «Kun SSO». Rollene fra gruppene gjelder bare
    da.
12. Kjør kontrollrunden: legg en ny bruker i en gruppe, flytt en bruker til en annen gruppe, ta en ut av alle
    gruppene, deaktiver en, og aktiver den igjen. Forvalteren kontrollerer hver handling i Neo.

**Valgfritt: testbrukere.** Kunden kan prøve løpet på testbrukere i et testunderdomene. Kunden kan også lage to
medlemsbrukere i domenet for forvalteren. Gjestebrukere virker ikke, fordi Neo krever at UPN er i domenet. Med
testbrukerne prøver forvalteren innloggingen og slår på «Kun SSO» selv. Kunden bestemmer MFA og tilgangsreglene for
dem, og deaktiverer dem når prosjektet er ferdig.

**Når innloggingen er i drift:** En bruker som ikke er provisjonert, kommer ikke inn. En bruker som deaktiveres eller tas
ut av appen, mister tilgangen med en gang. Medlemmer Entra styrer, fjernes i Entra. Tilgangsnivået i Neo settes i Neo,
aldri fra Entra. Tenant, domene og innloggingsoppsettet kan ikke endres før provisjoneringen er slått av. Client secret
byttes før utløpsdatoen.

Hvelvet: `entra-tenant-id`, `entra-sso-client-id`, `entra-sso-client-secret`, `entra-grupper`, og `entra-scim-token`
fra forvalteren.

### Postboksene (Exchange Online)

1. Lag en app i Entra ID, kun for egen organisasjon.
2. Gi appen de delegerte e-posttillatelsene forvalteren oppgir, og gi administratorsamtykke. Gi den ingen
   e-posttillatelser som applikasjonstillatelser i Entra ID: de ville gjelde alle postboksene.
3. Lag én client secret, og noter utløpsdatoen.
4. Lag de felles postboksene hvis de ikke finnes. Neo kobler bare til felles postbokser.
5. Registrer appen som tjenesteprinsipal i Exchange Online, og lag et omfang (management scope) med bare de felles
   postboksene.
6. Gi appen Application Mail.Read og Application MailboxSettings.Read i omfanget. Skal Neo sende, gi også Application
   Mail.ReadWrite og Application Mail.Send.
7. Kontroller at rollene gjelder hver felles postboks og ingen andre. Send en e-post til en postboks i omfanget og en
   utenfor, og se at bare den første kommer inn i Neo.

Hvelvet: `exchange-client-id`, `exchange-client-secret`.

### Arkivet (Documaster med Entra ID)

Neo kobles til Documaster gjennom kundens Entra ID, med to app-registreringer. Neo støtter også Documasters egen
innlogging; da lager Documaster klientene.

1. Finn app-ID-URI-en til Documaster-appen i kundens Entra ID. Den gir scopet for tjenestekontoen.
2. Tjenestekontoen: en app-registrering med én client secret, som henter token med client credentials og scopet
   app-ID-URI-en etterfulgt av `/.default`.
3. Innlogging på vegne av brukeren: en egen app-registrering med én client secret og `openid`, `profile`, `email` og
   `offline_access`. Redirect-adressen fra Neo legges inn under Web.
4. Bestill et eget testarkiv med egne arkivdeler hos Documaster.
5. Gi tjenestekontoen tilgang i Documaster til å lese arkivstrukturen og kodelistene, og opprette og oppdatere
   saksmapper, journalposter og dokumenter i arkivdelene Neo skal bruke.
6. Kontroller arkivstrukturen: arkivdeler, klassifikasjon, administrative enheter, skjermingskoder og journalposttyper.

Ferdig når testen i Neo henter token og leser arkivdelene. Hvelvet: `documaster-api-url`,
`documaster-tjenestekonto-client-id`, `-client-secret`, `-scope`, `documaster-bruker-client-id`, `-client-secret`,
`-scope`. Tenant-ID-en er `entra-tenant-id`.

### Maskinporten

Hver integrasjon har sin egen klient hos kunden, i test og i produksjon: én for Altinn, én for KS Fiks og én for
Kontakt- og reservasjonsregisteret. Da får hver klient bare de scopene integrasjonen trenger, og et scope som mangler,
stopper ikke de andre integrasjonene. Neo lager nøkkelparet per klient, og den private nøkkelen forlater aldri Neo.
Ingen Maskinporten-tilgang delegeres til forvalteren.

1. Er kunden ikke i Digdirs samarbeidsportal: send informasjonsskjemaet, og signer bruksvilkårene for offentlige kunder.
2. Hovedadministratoren i Altinn gir den som skal lage klientene, rettigheten «Selvbetjening av klienter i
   ID-porten/Maskinporten». I produksjon logger de inn med Ansattporten.
3. Lag klientene på kundens organisasjonsnummer.
4. Registrer hver klient i Neo med klient-ID og miljø. Neo viser den offentlige nøkkelen; legg den til på klienten.
5. Legg scopene på klienten for integrasjonen når eierne har gitt tilgang.
6. Trykk «Hent status» i Neo. «Ikke lagt på klienten» betyr at scopet mangler på klienten. «Virksomheten har ikke
   tilgang» betyr at eieren av API-et må gi kunden tilgang.

Hvelvet: `maskinporten-<integrasjon>-test-client-id` og `maskinporten-<integrasjon>-prod-client-id`, der integrasjonen
er `altinn`, `fiks` eller `krr`.

### Altinn

Kunden er tjenesteeier, og alt i Altinn Studio er kundens. Forvalteren bistår. Neo henter selv appene i organisasjonen,
abonnerer på hendelsene og leser innsendingene.

1. Kunden er tjenesteeier, med en organisasjon i Altinn Studio. Ellers: Digdirs veiledning «Bli tjenesteeier i Altinn».
2. Legg `altinn:serviceowner/instances.read`, `altinn:serviceowner/instances.write`, `altinn:serviceowner/events` og
   `altinn:events.subscribe` på Altinn-klienten.
3. Sender prosessene vedtak eller meldinger i Altinn: legg også på `altinn:serviceowner` og
   `altinn:correspondence.write`, og lag en meldingstjeneste i Ressursregisteret med kunden som kompetent myndighet.
4. Flytt appene forvalteren har laget, inn i kundens organisasjon. To veier er prøvd i Altinn Studio:
   - Kunden gir forvalterens utviklere tilgang i organisasjonen, og de bruker «Lag kopi» med kundens organisasjon som
     eier. «Lag kopi» kan bare velge brukerens egen konto eller en organisasjon brukeren er medlem av.
   - Kunden kloner appen selv. Appene i en offentlig organisasjon (som `ddlabs`) kan klones med git uten innlogging.
5. Hver app gir organisasjonen tilgang til innsendingene i tilgangspolicyen (`[ORG]`).
6. Publiser i tt02, og i produksjon før produksjonsstart.

Ferdig når Neo viser appene i organisasjonen, og hver app svarer. En app får ny ID i kundens organisasjon, så det som
peker på den i Neo, må pekes om.

### KS Fiks

1. Signer hovedavtalen med KS Digital, med tjenestevedleggene for SvarUt, SvarInn og Fiks folkeregister.
2. Be Skatteetaten om tilgang til Folkeregisteret, og godkjenn vilkårene.
3. Be KS om tilgang til `ks:fiks` for kundens organisasjonsnummer, i test og produksjon, på fiks@ksdigital.no, og legg
   det på KS Fiks-klienten.
4. I Fiks forvaltning: sett opp organisasjonen, og lag en SvarUt-konto.
5. Lag integrasjonen på kontoen, med kundens organisasjonsnummer som autorisert organisasjon og KS Fiks-klienten. Gi
   den tilgang til å sende.
6. Under Fiks register: sett opp Fiks folkeregister, lag en rolle med hjemmel og bare de opplysningene som trengs, og
   gi integrasjonen tilgang til rollen.
7. Bestill et mottakersystem for SvarInn hos KS. Lag service-passordet, og last opp sertifikatet Neo lager, på fanen
   Service.
8. Deleger i Altinn (Maskinportenadministrasjon) til KS (971 032 146) for Folkeregister-API-et «på vegne av». Hvilket
   API, med eller uten hjemmel, avklares med KS. Den som delegerer, trenger tilgangspakken «Delegerbare Maskinporten
   scopes».

**Digital post til innbyggere** krever i tillegg: skjemaet til Digdir og bruksvilkårene i Samarbeidsportalen,
delegering i Altinn til KS (971 032 146) av «Delegere rettighet til å sende DPI-meldinger på vegne av virksomheten»,
«Digital postkasse til innbyggere» slått på for SvarUt-kontoen i Fiks forvaltning, og en ROS-analyse. Uten dette
sender SvarUt til Altinn.

Hvelvet: `fiks-integrasjon-id`, `fiks-integrasjon-passord`, `fiks-svarut-konto-ider`, `fiks-folkeregister-rolle-id`,
`fiks-svarinn-mottakersystem-id`, `fiks-svarinn-service-passord`, og `fiks-svarinn-sertifikat`.

### Kontakt- og reservasjonsregisteret og eSignering

1. Send informasjonsskjemaet for Kontakt- og reservasjonsregisteret. Begrunn bruken etter retningslinjene, godkjenn
   bruksvilkårene, og gjennomfør en ROS-analyse.
2. Legg `krr:global/kontaktinformasjon.read` og `krr:global/digitalpost.read` på KRR-klienten når tilgangen er gitt.
   Registrer et varslingspunkt.
3. Send informasjonsskjemaet for eSignering, og signer bruksvilkårene.
4. Deleger i Altinn til Posten Bring AS (984 661 185): API-et «Delegere rettighet til å sende DPI-meldinger på vegne av
   virksomheten». Det må være på plass før eSignering kan brukes.
5. eSignering bruker et virksomhetssertifikat, ikke Maskinporten. Om det er kundens eller forvalterens, er ikke avgjort;
   det avgjøres etter testen mot Digdirs testmiljø.
6. Registrer varslingspunkt og fakturainformasjon.

Navnet i hvelvet starter med systemet verdien hører til. Avtalene med KS, Digdir og Skatteetaten har egen
behandlingstid. Start dem med en gang.

## Det den første implementeringen lærte

- **Oppskriften skal følge det som faktisk implementeres for kunden,** ikke leverandørenes generelle sider. Kilden er
  integrasjonen i Neo, oppsettskillene og labben. Det som ikke kan sjekkes, som hva som finnes i kundens tenant, skrives
  som det kunden skal finne og gi oss.
- **Kommandoene ble tatt ut, og kundens steg forsvant med dem.** Sammenlign alltid oppskriften med oppsettskillen:
  kontrollrunden, driftsreglene, utløpet av client secret og feilene hører med.
- **Apper forvalteren har laget, må inn i kundens egne kontoer.** En Altinn-app får ny ID i kundens organisasjon.
- **Testene trenger sin egen plass hos kunden,** som et eget testarkiv i Documaster.
- **Noen steg i Neo må tas av en som er logget inn med kundens Entra ID,** som «Kun SSO». Testbrukere for forvalteren i
  kundens domene løser det.
- **Fristene regnes fra signeringen,** så de flytter seg når signeringen gjør det.
- **Dokumentet ble skrevet for hånd.** Det tok mange runder og ligger utenfor repoet. Neste steg er å lage kundens
  dokument fra denne fila.
