# Norsk Natur- og Friluftskart

Gruppeeksamen i KWS2100 Kartbaserte websystemer, Høyskolen Kristiania 2026.

**Gruppe:** Lamar (lasa020), Asharib (asha023), Samir

**Live:** https://kristiania-kws2100-2026.github.io/kws2100-exam-lamar0112/

---

## Om applikasjonen

Tenk deg at du planlegger en tur i norsk natur. Du vil vite: Hvor kan jeg gå? Er det noen vernede områder i nærheten? Er det en DNT-hytte å overnatte på? Hvilke dyr lever her?

Norsk Natur- og Friluftskart samler denne informasjonen på ett sted. Kartet er rettet mot turgåere, naturinteresserte og alle som vil utforske norsk natur — fra nasjonalparkene i nord til badestrendene langs kysten.

Applikasjonen viser 5 000+ dyreobservasjoner fra Artsdatabanken, alle norske nasjonalparker og vernede naturområder, merkede turstier, DNT-hytter, fjelltopper og populære badestrander. Et klikk på et objekt gir deg navn, type og relevant info. Oversiktskartet nede til høyre viser alltid hvor i Norge du befinner deg.

---

## Kartlag

| Lag | Type | Kilde |
|-----|------|-------|
| Dyreobservasjoner (cluster) | Punkt | GBIF / Artsdatabanken |
| Nasjonalparker | Polygon | Geonorge / Miljødirektoratet |
| Verneområder | Polygon | Geonorge / Miljødirektoratet |
| Turstier | Linje | Geonorge / Kartverket |
| DNT-hytter | Punkt | Kartverket N50 |
| Fjelltopper | Punkt | Kartverket N50 |
| Badestrander | Punkt | Geonorge |
| Kartverket topo | Flisekart | Kartverket |

Alle lag kan slås av og på i sidepanelet. Dyreobservasjoner vises som cluster ved lavt zoom og som individuelle punkter ved høyt zoom (via Vector Tile Layer fra backend).

---

## Teknisk

- **Frontend:** React + TypeScript + Vite + OpenLayers v10
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
- Cluster-lag for 5 000+ dyreobservasjoner
- Oversiktskart (OverviewMap control) — viser posisjon i Norge
- To basiskart: OSM (standard) + Kartverket topografisk

### Arbeidsfordeling

Arbeidet ble utført som pair programming der alle tre gruppemedlemmer deltok aktivt:

- **Lamar** — grunnkart, backend (Hono + PostGIS), GBIF-integrasjon, clustering, Vector Tile Layer, deploy, A-tillegg (oversiktskart, generisk popup, fargelegende, Kartverket-kart)
- **Asharib** — nasjonalparker (polygon), verneområder (polygon), turstier (linje), hover + tooltip
- **Samir** — DNT-hytter (punkt), fjelltopper (punkt), badestrander (punkt), hover + klikk-popup

Samir sin kode ble skrevet på Lamar sin PC under pair programming-session 22. april, noe som forklarer at Samirs commits vises under Lamars brukernavn i deler av historikken.

---

## Datakilder

- [GBIF](https://www.gbif.org) — dyreobservasjoner (CC BY 4.0)
- [Geonorge](https://www.geonorge.no) — nasjonalparker, verneområder, turstier, badestrander (CC BY 4.0)
- [Kartverket N50](https://www.kartverket.no) — hytter, fjelltopper, topokart (CC BY 4.0)

---

## Git og samarbeid (vurderingskontekst)

Vi har jobbet med branch + pull request som anbefalt i emnet. Noe av implementasjonen ble gjort som pair programming ved samme skjerm, og enkelte commits ble derfor registrert på én bruker selv om flere bidro i økten.

- **Lamar**: oppsett, backend, datalasting, deploy, integrasjon og sluttføring
- **Asharib**: naturlag (polygon/linje), styling og interaksjon
- **Samir**: punktlag, egenskapsdata og popup-innhold

For å gjøre arbeidsfordeling og pensumdekning tydeligere enn ren commit-telling, er bidragene dokumentert i `CONTRIBUTIONS.md`.
