# Norsk Natur- og Friluftskart

Gruppeeksamen i KWS2100 Kartbaserte websystemer, Høyskolen Kristiania 2026.

**Gruppe:** Lamar (lasa020), Asharib (asha023), Samir

**Live:** https://kristiania-kws2100-2026.github.io/kws2100-exam-lamar0112/

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

## Teknisk

- **Frontend:** React + TypeScript + Vite + OpenLayers v10
- **Backend:** Hono + PostgreSQL/PostGIS på Render.com
- **Deploy:** GitHub Pages (frontend) + Render.com (backend)

### Pensum-krav fra KWS2100

- `useGeographic()` fra `ol/proj` — geografiske koordinater direkte
- `useMemo` for VectorSource — unngår unødvendig re-oppretting
- `useRef` + `useEffect` — kart-initialisering i React
- Alle tre geometrityper: polygon, linje, punkt
- Hover-stil på alle lag
- Klikk → popup med info
- VectorTileLayer (MVT) via backend
- Cluster-lag for dyreobservasjoner

## Datakilder

- [GBIF](https://www.gbif.org) — dyreobservasjoner (CC BY 4.0)
- [Geonorge](https://www.geonorge.no) — nasjonalparker, verneområder, turstier, badestrander (CC BY 4.0)
- [Kartverket N50](https://www.kartverket.no) — hytter, fjelltopper, topokart (CC BY 4.0)
