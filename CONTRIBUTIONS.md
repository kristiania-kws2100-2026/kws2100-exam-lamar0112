# Contributions and Course Coverage

Dette dokumentet beskriver hvem som gjorde hva i gruppeeksamen, og hvordan løsningen dekker sentrale tema i KWS2100.

## Arbeidsmåte

- Vi jobbet med feature-branches og pull requests.
- Flere økter ble gjennomfort som pair programming ved samme PC.
- Derfor samsvarer ikke commit-antall alltid 1:1 med faktisk faglig bidrag.

## Bidrag per gruppemedlem

### Lamar

- Oppsett av prosjektstruktur (React, TypeScript, Vite, OpenLayers)
- Backend med Hono + PostgreSQL/PostGIS
- Datainnhenting fra GBIF og innlasting til PostGIS
- Cluster-lag + vector tiles (MVT) for skalerbar visning
- Deploy til GitHub Pages og Render
- Integrasjon og sluttforbedringer (overview map, basiskartvalg, helhet)

### Asharib

- Nasjonalparker (polygon) med stil og interaksjon
- Verneområder (polygon) med stil og interaksjon
- Turstier (linje) med stil og interaksjon
- Hover-tilbakemelding og tydeliggjort kartlesbarhet

### Samir

- DNT-hytter (punkt) med egenskaper
- Fjelltopper (punkt) med egenskaper
- Badestrander (punkt) med egenskaper
- Popup-innhold og brukerrettet informasjon for punktlag

## Dekning av pensumtema

- React + TypeScript komponentarkitektur
- OpenLayers med `useRef` + `useEffect` for kartinitialisering
- `useGeographic()` og geografiske koordinater
- `useMemo` for stabile datasources i kartlag
- Geometrier: punkt, linje og polygon
- Hover + klikkinteraksjon med popup/tooltip
- Flere basiskart (OSM + Kartverket)
- Backend-API med Hono
- PostGIS-lagring av geografiske data
- Vector tiles (MVT) for effektiv dataoverforing
- Deploy av frontend/backend i sky (GitHub Pages + Render)

## Kommentar om commit-fordeling

Sensor skal vurdere faglig resultat, begrunnelser og pensumbruk. Commit-historikk gir nyttig sporbarhet, men ved samarbeid pa samme maskin kan den undervurdere enkelte bidrag. Denne filen og README brukes derfor for presis og etterprøvbar rollebeskrivelse.
