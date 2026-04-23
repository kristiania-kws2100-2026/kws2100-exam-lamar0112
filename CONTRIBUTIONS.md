# Bidrag og pensumdekning

## Hvordan vi jobbet

Vi var alle tre til stede alle dagene eksamen varte. En god del av kodingen foregikk rundt én skjerm, særlig den første kvelden da vi klonet repoet og bygde opp hele strukturen på Asharibs PC. En del commits fra den perioden er derfor registrert under Asharibs og Lamars brukernavn, selv om alle tre bidro.

Vi delte opp ansvarsområdene tidlig og holdt oss ganske mye til dem, men hjalp hverandre en del underveis. Integrasjonsbiten, feilsøkingen rundt deploy og SSL, og popup-systemet som måtte håndtere alle lagtyper, krevde at vi jobbet gjennom ting i fellesskap.

## Hva hver person gjorde

Lamar satte opp prosjektet fra scratch: React, TypeScript, Vite og OpenLayers, Hono-backend med PostgreSQL og PostGIS på Render, datainnlasting fra GBIF med paginering (opptil 15 000 observasjoner), clustering og vector tiles, deploy til GitHub Pages og Render, og avslutningsvis oversiktskart, generisk popup-system og Kartverket-kart.

Asharib hadde naturlagene. Han la til nasjonalparker og verneområder som polygoner og turstier som linje, implementerte useGeographic() og useMemo for VectorSource, og laget hover-stil og tooltip på alle tre lag.

Samir hadde punktlagene: DNT-hytter, fjelltopper og badestrander. Han laget og utvidet GeoJSON-dataene, forbedret popup-håndteringen med null-sikre hjelpefunksjoner for alle feltene, og bidro til sidepanelet med fjelltoppliste og «tilbake til forrige visning» (lagring av kartutsnitt i `sessionStorage` sammen med Lamar i `App.tsx` / `MapView.tsx`).

## Pensumdekning

- React og TypeScript med komponentarkitektur (App, MapView, Sidebar, Popup)
- OpenLayers med useRef og useEffect for kartinitialisering
- useGeographic() fra ol/proj for geografiske koordinater
- useMemo for stabile VectorSource-instanser
- Alle tre geometrityper: punkt, linje og polygon
- Hover med tilpasset stil per lagtype
- Klikk-popup med TypeScript discriminated union
- To basiskart: OSM og Kartverket topografisk
- OverviewMap fra ol/control
- Backend-API med Hono
- PostGIS med GIST-indeks for romlige spørringer
- Vector tiles (MVT) via backend ved høyt zoom
- Cluster-lag med ol/source/Cluster for mange punkter
- Deploy av frontend og backend i skyen
