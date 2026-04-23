# Norsk Natur- og Friluftskart

Gruppeeksamen i KWS2100 Kartbaserte websystemer, Høyskolen Kristiania 2026.

**Gruppe:** Lamar (lasa020), Asharib (asha023), Samir (sama)

**Live:** https://kristiania-kws2100-2026.github.io/kws2100-exam-lamar0112/

**Backend:** https://naturkart-server.onrender.com

---

## Om applikasjonen

Tenk deg at du planlegger en tur i norsk natur. Du vil vite: Hvor kan jeg gå? Er det noen vernede områder i nærheten? Er det en DNT-hytte å overnatte på? Hvilke dyr lever her?

Norsk Natur- og Friluftskart samler denne informasjonen på ett sted. Kartet er rettet mot turgåere, naturinteresserte og alle som vil utforske norsk natur — fra nasjonalparkene i nord til badestrendene langs kysten.

Applikasjonen viser opptil 15 000 dyreobservasjoner (pattedyr i Norge via GBIF), alle norske nasjonalparker og vernede naturområder, merkede turstier, DNT-hytter, fjelltopper og populære badestrander. Et klikk på et objekt gir deg navn, type og relevant info.

---

## Kartlag

| Lag | Type | Kilde |
|-----|------|-------|
| Dyreobservasjoner (cluster) | Punkt | GBIF / Artsdatabanken |
| Detaljerte observasjoner | Vector Tile (MVT) | Backend / PostGIS |
| Nasjonalparker | Polygon | Miljødirektoratets API |
| Verneområder | Polygon | Miljødirektoratets API |
| Turstier | Linje | Kartverket / egne data |
| DNT-hytter | Punkt | Kartverket N50 |
| Fjelltopper | Punkt | Kartverket N50 |
| Badestrander | Punkt | Geonorge |
| Kartverket topo | Flisekart | Kartverket WMTS |

Alle lag kan slås av og på i sidepanelet.

---

## Funksjonalitet

### Sidepanel-synkronisering med kartutsnitt
Sidepanelet viser en live liste over fjelltopper som er synlige i det gjeldende kartutsnittet, sortert etter høyde. Klikker du på en fjelltopp i listen, zoomer kartet automatisk inn på den valgte toppen med en animert overgang. Forrige kartvisning (senter og zoom) lagres i `sessionStorage`, slik at en "Tilbake til forrige visning"-knapp dukker opp og lar deg enkelt navigere tilbake. Dette er en funksjon som ikke ble gjennomgått i forelesningene.

### Cluster-lag + Vector Tile Layer
Dyreobservasjoner vises som et cluster-lag ved lavt zoom og som individuelle punkter via en Vector Tile Layer (MVT) fra backend ved høyt zoom (zoom ≥ 12). Cluster-størrelse og farge reflekterer antall observasjoner i gruppen.

### Hover og klikk-popup
Alle vektorlag har hover-stil. Klikk på et objekt åpner en popup med navn, type og relevant informasjon (areal for nasjonalparker, vernetype for verneområder, lengde for turstier, høyde for fjelltopper og hytter, kommune for badestrander).

### Oversiktskart
OverviewMap i nedre venstre hjørne viser alltid din posisjon i Norge.

### To basiskart
Veksle mellom OpenStreetMap og Kartverket topografisk kart via lagkontrollen.

---

## Teknisk

- **Frontend:** React 19 + TypeScript + Vite 7 + OpenLayers v10
- **Backend:** Hono + PostgreSQL/PostGIS på Render.com
- **Deploy:** GitHub Pages (frontend) + Render.com (backend)

### Pensum-krav fra KWS2100

- `useGeographic()` fra `ol/proj` — geografiske koordinater direkte (forelesning 3)
- `useMemo` for VectorSource — unngår unødvendig re-oppretting (forelesning 3)
- `useRef` + `useEffect` — kart-initialisering i React (forelesning 1+3)
- Alle tre geometrityper: polygon (nasjonalparker, verneomrader), linje (turstier), punkt (hytter, topper, strender, dyreobs)
- Hover-stil på alle 6 vektorlag
- Klikk → popup med typebasert info (generisk diskriminert union i TypeScript)
- VectorTileLayer (MVT) via backend — avansert feature ved zoom 12+
- Cluster-lag for tusenvis av dyreobservasjoner (GBIF, opptil 15 000) med størrelsesbasert stil
- OverviewMap control
- To basiskart: OSM + Kartverket topografisk (WMTS)

### Utenfor pensum (for A)

- **Hono + PostGIS backend** på Render.com med Vector Tile-endepunkt (`ST_AsMVT`)
- **Sidepanel-synkronisering** — live liste over fjelltopper i kartutsnittet, zoom til topp, `sessionStorage`-basert navigasjon tilbake
- **Ekte polygon-data** fra Miljødirektoratets REST API (nasjonalparker og verneområder)

### Arbeidsfordeling

Vi jobbet mye rundt samme skjerm og var alle tre til stede gjennom de to eksamendagene. Lamar eier repoet og mergde alle PR-er.

- **Lamar:** Backend (Hono, PostGIS, GBIF-paginering), clustering, Vector Tiles, GitHub Pages deploy, OverviewMap, Kartverket basiskart, popup-system, prosjektstruktur
- **Asharib:** Naturlag (nasjonalparker og verneomrader som polygoner, turstier som linjestrenger), hover-stiler, `useGeographic()` + `useMemo`
- **Samir:** Punktlag (hytter, fjelltopper, badestrander), GeoJSON-data, popup-forbedringer, fjelltoppliste og «tilbake»-flyt med `sessionStorage` (sammen med Lamar), dataforbedring fra Miljødirektoratets API

Mer detaljer i [CONTRIBUTIONS.md](CONTRIBUTIONS.md).

---

## Turstier

Kartet viser 11 kjente norske turstier som linjegeometri i GeoJSON. Hvert tursti-objekt har fire egenskaper:

| Felt | Eksempel |
|------|---------|
| `navn` | Besseggen |
| `lengde_km` | 22 |
| `vanskelighetsgrad` | lett / middels / krevende |
| `sesong` | sommer / helårs |

Klikker du på en tursti på kartet, viser popupen lengde, vanskelighetsgrad og sesong. Hover viser navnet i en hvit boble. Lag-stilen er en oransje stiplet linje (fargen skiller seg fra naturvernlag slik at det er lett å se hva som er hva).

---

## Datakilder (kort)

Dataene er hentet fra offentlige kilder med åpne lisenser (typisk CC BY 4.0 der kilden angir det). Detaljerte referanser i APA 7 finner du under.

## Referanser (APA 7)

Hentet 24. april 2026 (med mindre annet er angitt).

Artsdatabanken. (u.å.). *Artsdatabanken*. https://artsdatabanken.no

Geonorge. (u.å.). *Geonorge*. https://www.geonorge.no

Global Biodiversity Information Facility. (u.å.). *GBIF occurrence search API*. https://www.gbif.org/

Kartverket. (u.å.). *Kartverket*. https://www.kartverket.no

Miljødirektoratet. (u.å.). *Kartløsninger*. https://kart.miljodirektoratet.no

OpenStreetMap-bidragsytere. (u.å.). *OpenStreetMap*. https://www.openstreetmap.org/copyright
