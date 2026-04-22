# KWS2100 Eksamen — Norsk Natur- og Friluftskart

## Prosjekt
- **Repo:** https://github.com/kristiania-kws2100-2026/kws2100-exam-lamar0112
- **Live:** https://kristiania-kws2100-2026.github.io/kws2100-exam-lamar0112/
- **Backend:** https://naturkart-server.onrender.com (Hono + PostgreSQL/PostGIS på Render.com)
- **Stack:** React + TypeScript + Vite + OpenLayers (ol v10) + Hono + PostGIS

## Gruppefordeling
| Person | Ansvar | Status |
|--------|--------|--------|
| Lamar (lamar0112) | Dyreobservasjoner via GBIF/backend, clustering, Vector Tiles, deploy | ✅ Ferdig |
| Asharib | Nasjonalparker (polygon), Verneområder (polygon), Turstier (linje) | 🔄 Pågår |
| Samir | DNT-hytter (punkt), Fjelltopper (punkt), Badestrander (punkt) | ⏳ Venter |

## Viktige regler
- **Aldri push til `main`** — alltid branch + Pull Request
- Branch-format: `lamar/<navn>` (f.eks. `lamar/asharib-naturlag`)
- Commit-meldinger på **norsk**
- GeoJSON-filer må være **EPSG:4326**, legges i `public/data/`
- Lamar merger alle PR-er selv

## Pensum-krav som MÅ være i koden
- `useGeographic()` fra `ol/proj` — forelesning 3
- `useMemo` for VectorSource — forelesning 3
- `useRef` + `useEffect` for kart-init — forelesning 1+3
- Alle tre geometrityper: polygon, linje, punkt
- Hover-stil på features
- Klikk → vis info i sidebar/popup

## Hva er gjort (Lamar)
- Grunnkart med OSM ✅
- Clustering av dyreobservasjoner fra GBIF ✅
- Vector Tile Layer (MVT) ved høy zoom ✅
- Sidebar med lagkontroll + forklaring ✅
- Klikk-popup med art/antall/dato ✅
- Naturvernområder fra Geonorge ✅
- Hono-backend på Render.com med PostGIS ✅
- GitHub Pages deploy via Actions ✅

## Asharib sin jobb (branch: lamar/asharib-naturlag)
GeoJSON fra kartkatalog.geonorge.no → legges i `public/data/`:
1. `nasjonalparker.geojson` — søk "Nasjonalparker"
2. `verneomrader.geojson` — søk "Naturvernområder"
3. `turstier.geojson` — søk "Turkart ruter" (LineString!)

## Samir sin jobb (branch: lamar/samir-friluft)
GeoJSON → legges i `public/data/`:
1. `hytter.geojson` — DNT-hytter
2. `fjelltopper.geojson` — fjelltopper
3. `badestrander.geojson` — badestrander

## Mappestruktur
```
src/App.tsx          — state, lag-liste, layout
src/MapView.tsx      — kart + alle lag + hover/klikk
src/Sidebar.tsx      — lagkontroll, info
src/Popup.tsx        — klikk-popup
server/server.ts     — Hono backend
public/data/         — GeoJSON-filer hit!
```
