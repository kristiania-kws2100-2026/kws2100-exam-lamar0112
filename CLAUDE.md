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

## Pensum-krav som MÅ være i koden (viktig for karakter!)
- `useGeographic()` fra `ol/proj` — fra forelesning 3, **mangler i main**, må legges til
- `useMemo` for VectorSource — fra forelesning 3, **mangler i main**, må legges til
- `useRef` + `useEffect` for kart-init — forelesning 1+3 ✅
- Alle tre geometrityper: polygon, linje, punkt
- Hover-stil på features
- Klikk → vis info i sidebar/popup

## Hva er gjort (Lamar, 21. april)
- Grunnkart med OSM ✅
- Clustering av dyreobservasjoner fra GBIF ✅
- Vector Tile Layer (MVT) ved høy zoom ✅
- Sidebar med lagkontroll + forklaring ✅
- Klikk-popup med art/antall/dato ✅
- Naturvernområder fra Geonorge (i `public/naturvernomrader.geojson`) ✅
- Hono-backend på Render.com med PostGIS ✅
- GitHub Pages deploy via Actions ✅

## Asharib sin jobb (branch: lamar/asharib-naturlag)
Filer som skal hentes fra Geonorge og legges i `public/data/`:
1. `nasjonalparker.geojson` — søk "Nasjonalparker" på kartkatalog.geonorge.no
2. `verneomrader.geojson` — søk "Naturvernområder"
3. `turstier.geojson` — søk "Turkart ruter" (LineString — viktig!)

Lag-stiler (bruk backup-koden i `~/kws2100-backup/src/MapView.tsx` som referanse):
- Nasjonalparker: mørk grønn polygon (`#1b4332`)
- Verneområder: lys grønn polygon (`#52b788`)
- Turstier: oransje linje (`#f4a261`)

## Samir sin jobb (branch: lamar/samir-friluft)
Filer som skal hentes fra Geonorge/ut.no og legges i `public/data/`:
1. `hytter.geojson` — DNT-hytter (punkt, oransje)
2. `fjelltopper.geojson` — fjelltopper (punkt, mørk blå)
3. `badestrander.geojson` — badestrander (punkt, lyseblå)

## Mappestruktur
```
src/App.tsx          — state, lag-liste, layout
src/MapView.tsx      — OpenLayers kart + alle lag + hover/klikk
src/Sidebar.tsx      — lagkontroll, forklaring, info
src/Popup.tsx        — klikk-popup
server/server.ts     — Hono: /api/dyr/geojson + /api/tiles/dyr/{z}/{x}/{y}
server/load-gbif.ts  — henter data fra GBIF → PostGIS
public/data/         — GeoJSON-filer for Asharib og Samir (legg her!)
public/naturvernomrader.geojson — Lamars naturvernlag
```

## Git workflow
```bash
# Sjekk at du er på riktig branch
git branch

# Legg til filer og commit
git add public/data/nasjonalparker.geojson
git commit -m "la til nasjonalparker GeoJSON fra Geonorge"

# Push
git push origin lamar/asharib-naturlag

# Lag Pull Request på GitHub når ferdig
```

## Commit-historikk (21. april — alt gjort av Lamar)
Startet ved å klone i IntelliJ på Asharib sin PC, jobbet steg for steg tre rundt skjermen.
Brukte Arbeidskrav-kode og forelesningseksempler som referanse.

## Referanser
- Backup med planlagt kode: `~/kws2100-backup/src/` (inneholder stilkode for alle lag)
- Forelesning 1 kode: `~/Desktop/KartbasertWebsystemer/Forelesning1/`
- Forelesning 3 kode: `~/Desktop/KartbasertWebsystemer/Forelesning3/`
- Geonorge nedlasting: https://kartkatalog.geonorge.no
- OpenLayers docs: https://openlayers.org/en/latest/apidoc/
