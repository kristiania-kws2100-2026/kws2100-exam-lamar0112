# Norsk Natur- og Friluftskart

Gruppeeksamen i KWS2100 Kartbaserte websystemer, Høyskolen Kristiania 2026.

**Gruppenummer:** 12  
**Kandidater:** 19, 20 og 84

**GitHub-repository:** https://github.com/kristiania-kws2100-2026/kws2100-exam-lamar0112  
**Live nettside:** https://kristiania-kws2100-2026.github.io/kws2100-exam-lamar0112/  
**Backend:** https://naturkart-server.onrender.com

---

## Kort om prosjektet

Norsk Natur- og Friluftskart er en kartbasert webapplikasjon som samler natur-, frilufts- og dyrelivsdata i ett interaktivt kart. Målet har vært å lage en løsning som kan brukes til å utforske Norge gjennom flere typer geografisk informasjon, blant annet nasjonalparker, verneområder, turstier, DNT-hytter, fjelltopper, badestrender og dyreobservasjoner.

Vi ønsket at applikasjonen skulle ha en tydelig praktisk bruk. En bruker skal kunne åpne kartet, se hvilke naturområder og turmuligheter som finnes i et område, og samtidig få et inntrykk av hvilke dyreobservasjoner som er registrert der. Derfor har vi forsøkt å lage en helhetlig løsning, ikke bare et kart med tilfeldige lag.

Prosjektet er laget med React, TypeScript, Vite og OpenLayers. Frontend er publisert med GitHub Pages. Backend kjører på Render og bruker Hono, PostgreSQL og PostGIS for å lagre og servere dyreobservasjoner fra GBIF/Artsdatabanken. De største datamengdene håndteres med cluster og vector tiles, slik at kartet fortsatt skal være brukbart med mange observasjoner.

---

## Funksjonalitet

Kartet inneholder flere lag som kan slås av og på fra sidepanelet.

| Kartlag | Geometri | Beskrivelse |
|---|---:|---|
| Dyreobservasjoner | Punkt / cluster | Observasjoner hentet fra GBIF og lagret i PostGIS |
| Detaljerte dyreobservasjoner | Vector tiles | Store datamengder levert fra backend som MVT |
| Nasjonalparker | Polygon / multipolygon | Viser norske nasjonalparker |
| Verneområder | Polygon / multipolygon | Viser vernede naturområder |
| Turstier | Linje | Viser utvalgte turstier |
| DNT-hytter | Punkt | Viser hytter som turmål og overnattingspunkter |
| Fjelltopper | Punkt | Viser utvalgte fjelltopper med høyde |
| Badestrender | Punkt | Viser badeplasser og strender |
| OpenStreetMap | Flisekart | Standard bakgrunnskart |
| Kartverket topografisk kart | Flisekart | Alternativt bakgrunnskart med norsk topografisk preg |

Applikasjonen har blant annet:

- lagkontroll for å slå av og på kartlag
- popup ved klikk på objekter i kartet
- hover-effekt på flere kartlag
- cluster-visning for dyreobservasjoner ved lavere zoom
- vector tile-visning for dyreobservasjoner ved høyere zoom
- sidepanel med fjelltopper som oppdateres etter kartutsnittet
- zoom til fjelltopp fra sidepanelet
- mulighet til å gå tilbake til forrige kartutsnitt etter zoom
- OverviewMap nederst i kartet
- flere bakgrunnskart
- backend som leverer data fra PostgreSQL/PostGIS

---

## Hvordan prosjektet oppfyller eksamenskravene

### Deploy og grunnleggende krav

Applikasjonen er deployet som en fungerende webapplikasjon på GitHub Pages. I tillegg har vi en egen backend på Render med PostgreSQL/PostGIS-database. README inneholder lenke til GitHub-repository, live nettside og backend.

Kartet viser flere typer geografisk informasjon og bruker flere geometrier:

- punktdata, for eksempel DNT-hytter, fjelltopper, badestrender og dyreobservasjoner
- linjedata, for eksempel turstier
- polygondata, for eksempel nasjonalparker og verneområder

Kartet har også interaksjon gjennom popup, hover, sidepanel, zoom, lagkontroll og OverviewMap.

### Datakilder og geometri

Vi har brukt flere datasett og flere typer geometri. Prosjektet viser både punkt-, linje- og polygondata, og flere av datasettene er lagt inn som GeoJSON-filer. Dyreobservasjonene kommer fra GBIF og lagres i backend-databasen.

Kartlagene er valgt fordi de passer sammen tematisk. Applikasjonen handler om natur og friluftsliv, og funksjonene er laget rundt dette temaet.

### Backend og stort datasett

For å oppfylle kravet om en mer avansert løsning har vi laget en egen backend. Backend er bygget med Hono og kjører på Render. Den kobler seg til PostgreSQL/PostGIS og brukes til å lagre og hente dyreobservasjoner.

Importscriptet vårt er satt opp til å hente opptil 30 000 dyreobservasjoner fra GBIF. Målet var å fylle Render-databasen med hele dette datasettet for å dekke kravet om et stort backend-datasett.

Under siste innlasting før innlevering opplevde vi at importen til Render/PostGIS tok lang tid, fordi observasjonene ble skrevet inn i databasen rad for rad. Vi testet importen flere ganger og kontrollerte antallet direkte i databasen med SQL. På grunn av tid før innlevering valgte vi å dokumentere faktisk innlastet antall i stedet for å skrive at hele maksgrensen var ferdig importert.

Ved innlevering inneholdt Render-databasen **over 16 000 dyreobservasjoner**. Koden er likevel satt opp til å kunne hente opptil 30 000 observasjoner ved å kjøre `npm run load-data` på nytt med Render sin `DATABASE_URL`.

Observasjonene brukes på to måter:

1. Som GeoJSON-data til cluster-laget.
2. Som vector tiles fra backend ved høyere zoom.

Vector tile-løsningen gjør at frontend ikke må laste alle observasjonene som én stor fil. I stedet hentes data etter kartutsnitt og zoomnivå. Dette er viktig når datamengden blir stor, og det er en av grunnene til at vi valgte å bruke PostGIS og MVT.

### Cluster-visning

Dyreobservasjonene vises som cluster ved lavere zoom. Det gjør kartet mer oversiktlig, fordi mange punkter som ligger nær hverandre samles til ett symbol med antall observasjoner. Cluster-stilen gjør det lettere å se hvor det finnes mange observasjoner uten at kartet blir fullt av overlappende punkter.

### Vector tiles

For detaljerte dyreobservasjoner bruker vi vector tiles fra backend. Backend lager MVT-data fra PostGIS, og frontend viser dem med `VectorTileLayer` og `VectorTileSource`.

Dette var ikke en enkel standarddel av forelesningsoppgavene, men vi valgte det fordi eksamensoppgaven etterspør et større datasett fra backend. Vector tiles passer godt til dette fordi bare relevante deler av datasettet sendes til nettleseren.

### Interaksjon mellom kart og sidepanel

Sidepanelet viser fjelltopper som ligger innenfor det synlige kartutsnittet. Når brukeren flytter eller zoomer kartet, oppdateres listen. Brukeren kan også klikke på en fjelltopp i sidepanelet for å zoome inn til den.

Før kartet zoomer inn, lagres forrige kartutsnitt i `sessionStorage`. Det gjør at brukeren kan gå tilbake til området de så på tidligere. Denne funksjonen er tatt med for å gjøre kartet mer brukbart, ikke bare for å vise data.

### OverviewMap og bakgrunnskart

Kartet har OverviewMap for å gi bedre oversikt over hvor i Norge brukeren befinner seg. Vi har også lagt inn mer enn ett bakgrunnskart. Brukeren kan bruke OpenStreetMap som standard bakgrunn eller slå på Kartverket sitt topografiske kart.

Kartverket-kartet passer godt til prosjektets tema fordi topografiske kart ofte er mer relevante for natur og friluftsliv enn vanlige veikart.

---

## Bruk av pensum

Prosjektet bygger på flere teknikker og temaer fra KWS2100:

- React-komponenter for å dele opp applikasjonen
- TypeScript for tydeligere datatyper
- Vite som utviklings- og byggverktøy
- OpenLayers som kartbibliotek
- `Map`, `View`, `VectorLayer`, `VectorSource`, `TileLayer` og `XYZ`
- `GeoJSON` for å lese inn lokale geografiske data
- punkt-, linje- og polygongeometri
- styling med `Style`, `Fill`, `Stroke`, `Circle` og `Text`
- `useGeographic()` for å arbeide enklere med lengdegrad og breddegrad
- React-hooks som `useEffect`, `useRef`, `useState` og `useMemo`
- event-håndtering i kartet, blant annet klikk og hover
- popup/overlay for informasjon om kartobjekter
- GitHub Actions og GitHub Pages for deploy
- Docker Compose for lokal database under utvikling
- Render for deploy av backend og database

Mye av grunnstrukturen følger måten vi har arbeidet på i forelesninger og oppgaver: først sette opp et OpenLayers-kart i React, deretter legge til kilder, lag, styling og interaksjon. Etter hvert bygget vi videre med flere datakilder, backend og mer avansert datavisning.

---

## Teknikk som går utover forelesningene

Noen deler av prosjektet går lenger enn det som ble direkte vist i forelesningene. Vi har derfor forsøkt å forklare disse delene i både kode og dokumentasjon.

### Hono-backend

Vi brukte Hono for å lage en enkel backend med API-endepunkter. Backend brukes til å hente dyreobservasjoner fra databasen og levere dem til frontend.

Vi valgte Hono fordi det er lett, raskt og enkelt å bruke sammen med Node på Render. Det passet godt til et eksamensprosjekt der vi ønsket en backend som var enkel å forstå, men samtidig kunne levere ekte kartdata.

### PostgreSQL og PostGIS

PostgreSQL brukes som database, og PostGIS brukes for geografiske spørringer. Dyreobservasjonene lagres som punktgeometri i databasen.

PostGIS gjør det mulig å bruke romlige funksjoner, blant annet for å lage vector tiles og filtrere data geografisk. Dette er mer robust enn å bare ha alle observasjoner i én stor GeoJSON-fil.

### Mapbox Vector Tiles fra PostGIS

Backend bruker PostGIS til å lage MVT/vector tiles. Dette gjør at store datamengder kan vises mer effektivt i kartet.

Dette er spesielt relevant for A-kravet, siden eksamensoppgaven ber om et større datasett fra backend som vises som Vector Tile Layer. Koden er derfor laget for å kunne hente opptil 30 000 observasjoner, selv om faktisk innlastet antall i Render-databasen ved innlevering var over 16 000.

### Cluster kombinert med vector tiles

Vi bruker cluster for oversikt på lavere zoomnivå og vector tiles for detaljer på høyere zoomnivå. Tanken er at brukeren først skal få en enkel oversikt, og deretter kunne zoome inn for mer detaljer.

Denne kombinasjonen gjør kartet mer lesbart og mer effektivt enn om alle punktene alltid skulle vært vist samtidig.

### Synkronisering mellom kart og sidepanel

Sidepanelet oppdateres basert på kartutsnittet. Dette gir en kobling mellom dataene i kartet og informasjonen i brukergrensesnittet.

Vi valgte å gjøre dette fordi et kart med mange lag kan bli vanskelig å bruke hvis all informasjon bare ligger i selve kartflaten. Sidepanelet gjør det lettere å se relevante fjelltopper i området brukeren ser på.

### Bruk av sessionStorage

Når brukeren zoomer til en fjelltopp fra sidepanelet, lagres forrige kartposisjon. På den måten kan brukeren gå tilbake til forrige visning.

Dette er ikke nødvendig for å vise kartdata, men det gjør applikasjonen mer brukervennlig.

---

## Kodestruktur

Prosjektet er delt inn slik:

```text
.
├── public/
│   └── data/
│       ├── nasjonalparker.geojson
│       ├── verneomrader.geojson
│       ├── turstier.geojson
│       ├── hytter.geojson
│       ├── fjelltopper.geojson
│       └── badestrender.geojson
├── server/
│   ├── server.ts
│   └── load-gbif.ts
├── src/
│   ├── App.tsx
│   ├── MapView.tsx
│   ├── Sidebar.tsx
│   ├── Popup.tsx
│   ├── types.ts
│   ├── popup.css
│   └── sidebar.css
├── docker-compose.yml
├── package.json
├── vite.config.ts
└── README.md
```

De viktigste filene er:

- `src/MapView.tsx`: setter opp OpenLayers-kartet, kartlag, styling, popup, hover, cluster, vector tiles og OverviewMap.
- `src/Sidebar.tsx`: viser lagkontroll og liste over fjelltopper i kartutsnittet.
- `src/Popup.tsx`: viser informasjon om objektene brukeren klikker på.
- `src/App.tsx`: holder på felles state, blant annet aktive lag og valgt objekt.
- `server/server.ts`: backend med API-endepunkter for GeoJSON og vector tiles.
- `server/load-gbif.ts`: henter dyreobservasjoner fra GBIF og lagrer dem i PostGIS.
- `docker-compose.yml`: lokal PostgreSQL/PostGIS-database for utvikling.
- `.github/workflows/`: GitHub Actions for bygg og deploy til GitHub Pages.

---

## Arbeidsprosess

Vi jobbet både individuelt og sammen. En del av arbeidet ble gjort som felles programmering rundt samme maskin, spesielt da vi satte sammen kartlagene, testet deploy, rettet feil og kontrollerte at kravene i eksamensoppgaven var dekket.

Gruppen hadde også noen praktiske utfordringer med Git og GitHub underveis. Ikke alle var like vant til å jobbe med branches, commits, pull, push og merge-konflikter. På grunn av dette ble commit-historikken mer ujevn enn arbeidsfordelingen egentlig var.

Vi støtte også på praktiske problemer med lokale miljøer, databasekobling og datainnlasting til Render. Dette ble feilsøkt sammen, og vi brukte både forelesningskode, dokumentasjon og KI-verktøy som støtte til å forstå feilmeldinger og kontrollere løsningen. Den endelige koden og dokumentasjonen ble likevel gjennomgått og tilpasset av gruppen.

I noen perioder ble kode skrevet eller testet lokalt av ett gruppemedlem, sendt videre, og deretter committet fra en annen konto. Vi måtte også rydde opp i repoet underveis etter problemer med oppsett og deploy.

Dette betyr at antall commits per person ikke viser hele bildet av hvem som gjorde hva. Vi har derfor valgt å beskrive arbeidsprosessen tydelig her. Alle i gruppen har bidratt med planlegging, kode, testing, datakilder og gjennomgang av løsningen. Den endelige koden er også gjennomgått sammen, slik at alle skulle forstå hvordan applikasjonen fungerer.

---

## Arbeidsfordeling

Arbeidsfordelingen under beskriver hovedansvar. Flere deler ble likevel diskutert, testet og rettet sammen.

### Kandidat 19

Kandidat 19 hadde hovedansvar for prosjektoppsett, integrasjon og backend-delen. Dette inkluderte blant annet:

- oppsett av React, TypeScript, Vite og OpenLayers
- oppsett av GitHub Pages og GitHub Actions
- oppsett av Render-backend
- arbeid med PostgreSQL og PostGIS
- innlasting av GBIF-data
- API-endepunkter for dyreobservasjoner
- vector tile-endepunkt med MVT fra PostGIS
- cluster-lag for dyreobservasjoner
- integrasjon mellom frontend og backend
- testing av deploy og feilretting
- generell sammensetting av kartlag og funksjonalitet

Kandidat 19 gjorde også mye av den praktiske Git/GitHub-håndteringen fordi en del av arbeidet ble samlet og pushet fra samme maskin.

### Kandidat 20

Kandidat 20 jobbet særlig med punktbaserte friluftsdata og brukerrettet informasjon i kartet. Dette inkluderte blant annet:

- DNT-hytter
- fjelltopper
- badestrender
- GeoJSON-struktur for punktdata
- popup-innhold for punktlag
- testing av hvordan punktene vises i kartet
- arbeid med sidepanel og fjelltoppliste
- kontroll av navn, høyder og informasjon som vises til brukeren
- testing av zoom til fjelltopp og tilbake-funksjonalitet

Kandidat 20 bidro også i felles gjennomgang av design, lagkontroll og hvordan kartet skulle oppleves for en bruker.

### Kandidat 84

Kandidat 84 jobbet særlig med natur- og områdebaserte kartlag. Dette inkluderte blant annet:

- nasjonalparker
- verneområder
- turstier
- polygon- og linjedata
- styling av polygoner og linjer
- hover-effekter og visuell tydelighet
- testing av GeoJSON-lag i OpenLayers
- kontroll av at kartet viser flere geometrier
- vurdering av hvordan naturdataene passer inn i helheten

Kandidat 84 bidro også til testing av kartlagene, visuell utforming og kontroll av at prosjektet oppfylte kravene til flere datakilder og flere geometrier.

---

## Om commit-historikk

Commit-historikken er ikke helt jevnt fordelt mellom gruppemedlemmene. Dette skyldes hovedsakelig arbeidsformen vår og ulik erfaring med Git.

Vi jobbet mye sammen fysisk og digitalt, og en del kode ble skrevet, testet og rettet på samme maskin. I tillegg ble enkelte filer sendt mellom gruppemedlemmer før de ble lagt inn i repoet. Derfor kan noen commits inneholde arbeid som flere personer har bidratt til, selv om committen bare står på én bruker.

Vi har forsøkt å være åpne om dette i README, fordi eksamensoppgaven sier at gruppen skal forklare arbeidsprosessen dersom alle ikke har committet like mye. Vi mener likevel at alle tre har bidratt faglig og praktisk til løsningen.

---

## Kommentarer i koden

Vi har lagt inn korte kommentarer på de viktigste og mest avanserte delene av koden. Målet har vært å forklare hvorfor enkelte løsninger er brukt, uten å kommentere helt selvforklarende kode.

Kommentarene forklarer blant annet:

- hvorfor importscriptet er satt opp til opptil 30 000 GBIF-observasjoner
- hvorfor store datamengder vises med cluster og vector tiles
- hvordan backend lager vector tiles fra PostGIS
- hvordan sidepanelet kobles til kartutsnittet
- hvorfor forrige kartutsnitt lagres i `sessionStorage`
- hvordan ulike OpenLayers-lag brukes for punkt, linje og polygon

Vi har forsøkt å holde kommentarene korte og faglige, slik at koden fortsatt er ryddig.

---

## Bruk av hjelpemidler

Vi har brukt forelesningskode, tidligere oppgaver, dokumentasjon og åpne datakilder underveis i prosjektet. Vi har også brukt KI-verktøy som støtte til feilsøking, forklaring av feilmeldinger, strukturering av dokumentasjon og kontroll av kravene i eksamensoppgaven.

KI-verktøyene er brukt som hjelpemiddel, ikke som erstatning for egen forståelse. Gruppen har selv valgt løsningene, testet koden, tilpasset funksjonaliteten og satt sammen den endelige applikasjonen. Når vi har brukt kode eller teknikker inspirert av dokumentasjon, forelesninger eller eksterne kilder, har vi tilpasset dette til vårt eget prosjekt.

---

## Lokal kjøring

Installer avhengigheter:

```bash
npm ci
```

Start frontend lokalt:

```bash
npm run dev
```

Start lokal database med Docker:

```bash
docker compose up -d
```

Last inn GBIF-data i databasen:

```bash
npm run load-data
```

Start backend lokalt:

```bash
npm run server
```

Bygg prosjektet:

```bash
npm run build
```

Kjør TypeScript-sjekk:

```bash
npm run typecheck
```

---

## Backend og API

Backend kjører på Render og har endepunkter for dyreobservasjoner. Rotadressen til backend viser en enkel JSON-statusside, mens kartdataene hentes fra API-endepunktene under.

Eksempler:

```text
GET /
```

Returnerer enkel statusinformasjon om backend og tilgjengelige API-endepunkter.

```text
GET /api/dyr/geojson
```

Returnerer dyreobservasjoner som GeoJSON. Dette brukes blant annet til cluster-laget.

```text
GET /api/tiles/dyr/{z}/{x}/{y}
```

Returnerer dyreobservasjoner som Mapbox Vector Tiles. Dette brukes ved høyere zoomnivå for å vise store datamengder mer effektivt.

---

## Data og kilder

### GBIF / Artsdatabanken

Dyreobservasjonene hentes fra GBIF sitt API. Vi filtrerer på Norge og relevante observasjoner med koordinater. Dataene lagres i PostgreSQL/PostGIS, slik at backend kan servere dem videre til kartet.

Noen observasjoner og cluster-symboler kan vises nær riksgrensen, fordi GBIF-data bygger på registrerte koordinater og fordi cluster-symboler plasseres som en samlet representasjon av flere punkter.

### Miljødirektoratet og Geonorge

Nasjonalparker, verneområder og andre naturdata er basert på åpne geografiske datasett fra norske kilder som Miljødirektoratet og Geonorge.

### Kartverket

Kartverket brukes som alternativt topografisk bakgrunnskart. Dette passer godt til prosjektet fordi topografisk informasjon er relevant for natur og friluftsliv.

### OpenStreetMap

OpenStreetMap brukes som standard bakgrunnskart.

---

## Referanser

Artsdatabanken. (u.å.). *Artsdatabanken*. Hentet 24. april 2026 fra https://artsdatabanken.no

Geonorge. (u.å.). *Geonorge*. Hentet 24. april 2026 fra https://www.geonorge.no

Global Biodiversity Information Facility. (u.å.). *GBIF occurrence search API*. Hentet 24. april 2026 fra https://www.gbif.org

GitHub. (u.å.). *GitHub Pages documentation*. Hentet 24. april 2026 fra https://docs.github.com/pages

Kartverket. (u.å.). *Kartverket*. Hentet 24. april 2026 fra https://www.kartverket.no

Miljødirektoratet. (u.å.). *Kartløsninger*. Hentet 24. april 2026 fra https://kart.miljodirektoratet.no

OpenLayers. (u.å.). *OpenLayers documentation*. Hentet 24. april 2026 fra https://openlayers.org

OpenStreetMap-bidragsytere. (u.å.). *OpenStreetMap copyright and license*. Hentet 24. april 2026 fra https://www.openstreetmap.org/copyright

Render. (u.å.). *Render documentation*. Hentet 24. april 2026 fra https://render.com/docs

---

## Hva vi ønsker at sensor skal legge merke til

Vi ønsker spesielt at sensor legger merke til at prosjektet ikke bare er et enkelt kart med noen få statiske GeoJSON-filer. Vi har forsøkt å lage en fullverdig kartapplikasjon med flere datakilder, flere geometrier, interaksjon, backend, database og deploy.

De viktigste punktene er:

- frontend er deployet på GitHub Pages
- backend er deployet på Render
- databasen bruker PostgreSQL/PostGIS
- kartet viser punkt, linje og polygon
- applikasjonen bruker flere datakilder
- dyreobservasjoner hentes fra backend
- importscriptet er satt opp til opptil 30 000 dyreobservasjoner, og README dokumenterer faktisk innlastet antall i Render-databasen ved innlevering
- store datamengder håndteres med cluster og vector tiles
- brukeren kan klikke på objekter og få popup
- sidepanelet reagerer på kartutsnittet
- brukeren kan zoome til fjelltopper fra sidepanelet
- kartet har OverviewMap
- kartet har flere bakgrunnskart
- README forklarer arbeidsprosess og ujevn commit-historikk

Prosjektet viser både pensumteknikker og videre arbeid med teknikker som ikke ble direkte gjennomgått i forelesningene.