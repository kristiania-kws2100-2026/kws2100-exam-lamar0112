# KWS2100 Eksamen — Norsk Natur- og Friluftskart

## Prosjekt
- **Repo:** https://github.com/kristiania-kws2100-2026/kws2100-exam-lamar0112
- **Live:** https://kristiania-kws2100-2026.github.io/kws2100-exam-lamar0112/
- **Backend:** https://naturkart-server.onrender.com (Hono + PostgreSQL/PostGIS på Render.com)
- **Stack:** React + TypeScript + Vite + OpenLayers (ol v10) + Hono + PostGIS

## Gruppemedlemmer
| Person | Student-epost | Rolle |
|--------|--------------|-------|
| Lamar | lasa020@student.kristiania.no | Eier, merger alle PR-er |
| Asharib | asha023@student.kristiania.no | lamar/asharib-naturlag |
| Samir | (ukjent) | lamar/samir-friluft |

## Viktige regler
- **Aldri push til `main`** — alltid branch + Pull Request
- Branch-format: `lamar/<navn>`
- Commit-meldinger på **norsk**
- GeoJSON må være **EPSG:4326**, legges i `public/data/`
- Lamar merger alle PR-er selv

## Mål: Karakter A
Forskjellen på B og A:
1. **Klikk-info på ALLE lag** — popup for nasjonalpark (navn+areal), tursti (navn+km), hytte (navn+type), fjelltopp (navn+høyde), strand (navn)
2. **Full legend i Sidebar** — fargede symboler for hvert lag
3. **README.md** — datakilder, tekniske valg, gruppefordeling
4. **Kartverket topo-kart** — WMTS som alternativt basiskart til OSM
5. **Alle punkt-lag** med hover + klikk (Samir)

## Pensum-krav (sjekkliste)
- [x] `useGeographic()` fra `ol/proj` — modulnivå i MapView.tsx
- [x] `useMemo` for VectorSource
- [x] `useRef` + `useEffect` for kart-init
- [x] Polygon-geometri (nasjonalparker, verneomrader)
- [x] Linje-geometri (turstier)
- [ ] Punkt-geometri — Samir
- [x] Hover-stil på features
- [ ] Hover på punkt-lag — Samir
- [x] Klikk → vis info (dyreobservasjoner)
- [ ] Klikk → vis info på alle naturlag — Lamar (A-tillegg)
- [x] VectorLayer med GeoJSON
- [x] VectorTileLayer (MVT)
- [x] Cluster-lag
- [ ] Kartverket WMTS basiskart — Lamar (A-tillegg)

## Status per person
| Person | Oppgave | Status |
|--------|---------|--------|
| **Lamar** | Backend, VectorTiles, Clustering, deploy, popup, sidebar | ✅ Ferdig |
| **Lamar** | Utvide popup (alle lag), Kartverket basiskart, README, full legend | ⏳ Gjøres på Lamar sin PC |
| **Asharib** | nasjonalparker + verneomrader + turstier, useGeographic, useMemo, hover | ✅ Ferdig — **push mangler** |
| **Samir** | hytter + fjelltopper + badestrander, ikoner, hover, klikk | ⏳ Gjøres på Samir sin PC (eller her) |

## Asharib — neste steg (push mangler!)
```bash
git push origin lamar/asharib-naturlag
# Deretter lag PR på GitHub mot main
```

## Samir sin jobb (branch: lamar/samir-friluft)
`public/data/`:
1. `hytter.geojson` — DNT-hytter (Point, properties: navn, type, høyde_moh)
2. `fjelltopper.geojson` — fjelltopper (Point, properties: navn, høyde_moh)
3. `badestrander.geojson` — badestrander (Point, properties: navn, kommune)
- Egne ikoner: 🏠 hytter / ⛰️ fjelltopper / 🏖️ badestrander
- Hover-stil på alle lag
- Klikk → popup med relevant info per lag

## Lamar sine A-tillegg (gjøres på Lamar sin PC)
1. Utvide `Popup.tsx` — generisk feature-info (ikke bare dyr)
2. `MapView.tsx` — klikk på naturlag viser navn + egenskaper i popup
3. `Sidebar.tsx` — full legend med fargesymboler for alle lag
4. Kartverket WMTS topo-kart som valgbart basiskart
5. `README.md`

## Kartverket WMTS-URL (for A-karakter)
```
https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png
```
Bruk XYZ-kilde i TileLayer.

## GeoJSON properties per fil
| Fil | Properties |
|-----|-----------|
| nasjonalparker.geojson | navn, areal_km2 |
| verneomrader.geojson | navn, vernetype |
| turstier.geojson | navn, lengde_km |
| hytter.geojson | navn, type, høyde_moh |
| fjelltopper.geojson | navn, høyde_moh |
| badestrander.geojson | navn, kommune |

## Mappestruktur
```
src/App.tsx          — state, lag-liste, layout
src/MapView.tsx      — kart + alle lag + hover/klikk
src/Sidebar.tsx      — lagkontroll, legend, info
src/Popup.tsx        — klikk-popup (utvides til alle lag)
server/server.ts     — Hono backend
public/data/         — alle GeoJSON-filer
```
