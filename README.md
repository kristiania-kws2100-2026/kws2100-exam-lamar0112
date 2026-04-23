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

Vi var alle tre til stede alle dagene og jobbet mye rundt samme skjerm. Lamar eier repoet og mergde alle PR-er, men de lange kveldene satt vi som regel alle tre inne i koden, særlig da grunnstrukturen ble bygd den første kvelden.

Lamar hadde backend, GBIF-integrasjon, clustering og deploy. Asharib tok seg av naturlagene: nasjonalparker og verneområder som polygoner, turstier som linje, med hover og tooltip. Samir hadde punktlagene: hytter, fjelltopper og badestrander, pluss GeoJSON-dataene for disse.

21. april kveld klonet vi repoet på Asharibs PC og bygde prosjektet opp derfra. En del commits fra den perioden ligger under Asharibs og Lamars navn. Mer detaljer i [CONTRIBUTIONS.md](CONTRIBUTIONS.md).

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

## Datakilder

- [GBIF](https://www.gbif.org) — dyreobservasjoner (CC BY 4.0)
- [Geonorge](https://www.geonorge.no) — nasjonalparker, verneområder, turstier, badestrander (CC BY 4.0)
- [Kartverket N50](https://www.kartverket.no) — hytter, fjelltopper, topokart (CC BY 4.0)
