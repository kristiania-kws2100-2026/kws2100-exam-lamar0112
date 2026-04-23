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

---

## STATUS PER 2026-04-23 (oppdatert etter åpne PR-er fra Asharib og Samir)

### ✅ Lamar — ferdig (main)
- Grunnkart med OSM
- Clustering av dyreobservasjoner (GBIF/backend)
- Vector Tile Layer (MVT) ved høy zoom
- Sidebar med lagkontroll
- Klikk-popup (art/antall/dato) på dyreobservasjoner
- Hono-backend på Render.com med PostGIS
- GitHub Pages deploy via Actions

### ✅ Asharib — ferdig (natur-lag + robusthet + dokumentasjon)
Branch: `lamar/asharib-naturlag`
- `public/data/nasjonalparker.geojson` — 21 norske nasjonalparker (polygon, EPSG:4326, props: navn/areal_km2)
- `public/data/verneomrader.geojson` — verneområder (polygon, EPSG:4326, props: navn/vernetype)
- `public/data/turstier.geojson` — 11 turstier (linje, EPSG:4326, props: navn/lengde_km)
- `useGeographic()` på modulnivå i MapView.tsx ✅
- `useMemo` for alle tre VectorSource ✅
- Hover-stil (mørk/lys grønn polygon, oransje linje) + tooltip med navn ✅
- Lag i sidebar: Nasjonalparker 🏔️, Verneområder 🌿, Turstier 🥾
- Robust popup for naturlag (fallback og trygg felthåndtering) ✅
- Robust hover/tooltip ved manglende felt (unngår tom/undefined navn) ✅
- Små stilforbedringer for naturlag (kontrast, fill og linjebredde) ✅
- Tydeligere legend i sidebar for naturlag (polygon/linje-symboler) ✅
- `README.md` lagt til og oppdatert med prosjektbeskrivelse, datakilder og refleksjon ✅
- PR: **#4** "Forbedret robusthet og visning for naturlag" (åpen)

### 🔄 Samir — punktlag klart i egen PR, må sammenslås kontrollert
- Brancher funnet: `lamar/samir-friluft` og `samir/punktlag-kvalitet`
- `public/data/hytter.geojson` — DNT-hytter (Point, props: navn, type, høyde_moh)
- `public/data/fjelltopper.geojson` — fjelltopper (Point, props: navn, høyde_moh)
- `public/data/badestrander.geojson` — badestrander (Point, props: navn, kommune)
- Egne ikoner: 🏠 hytter / ⛰️ fjelltopper / 🏖️ badestrander
- Hover-stil + tooltip på alle tre lag
- Klikk → popup med relevant info
- Verifisert mot Git: punktfiler finnes, og `samir/punktlag-kvalitet` endrer hovedsakelig `src/MapView.tsx`, `src/Popup.tsx`, `src/Sidebar.tsx`.
- Merk: branchen sin `CLAUDE.md` sier at alt er merget i `main`, men det stemmer ikke fullt ut med faktisk branch-diff. Bruk git-diff som fasit.
- PR: **#3** "Punktlag: mer robust popup og tydeligere forklaring i kartet" (åpen)

---

## 🎯 Lamar sine gjenstående oppgaver (A-karakter)

**Gjøres på Lamar sin PC — én ting om gangen med naturlige commits:**

### 1. Merge PR #4 (Asharib) og PR #3 (Samir) i riktig rekkefølge
- Merge PR #4 først (robust naturlag + README + statusoppdatering)
- Merge PR #3 etterpå, med konfliktløsning i `MapView`, `Popup`, `Sidebar`
- Behold robust felthåndtering/fallback fra Asharib der kode overlapper

### 2. Verifisering etter merge
- `npm run typecheck`
- `npm run build`
- Rask manuell test: hover + klikk-popup + lagtoggle på alle lag

### 6. Kartverket topo-kart som alternativt basiskart
```ts
import XYZ from "ol/source/XYZ";

const kartverketLag = new TileLayer({
  source: new XYZ({
    url: "https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png",
    attributions: "© Kartverket",
  }),
  visible: false, // togges via sidebar
});
```
Legg til i App.tsx lag-liste: `{ id: "kartverket", navn: "Kartverket topo", ikon: "🗺️", synlig: false }`

### 3. A-tillegg som gjenstår
- Kartverket topo som alternativt basiskart
- Eventuelt overview map / projeksjon dersom tid

---

## Pensum-sjekkliste
- [x] `useGeographic()` fra `ol/proj` — modulnivå MapView.tsx
- [x] `useMemo` for VectorSource
- [x] `useRef` + `useEffect` for kart-init
- [x] Polygon-geometri
- [x] Linje-geometri
- [x] Punkt-geometri (Samir i PR #3)
- [x] Hover-stil
- [x] Klikk → vis info (dyr)
- [x] Klikk → vis info naturlag (Asharib)
- [x] VectorLayer med GeoJSON
- [x] VectorTileLayer (MVT)
- [x] Cluster-lag
- [ ] Kartverket WMTS (Lamar A-tillegg)

## Nåværende lokale filer som ikke er pushet ennå
- Untracked: `slim.mjs` (lokalt hjelpeverktøy, ikke nødvendig for app/commit)

## Neste steg (anbefalt rekkefølge)
1. Lamar merger PR #4 (Asharib), deretter PR #3 (Samir).
2. Løs konflikter i `MapView`, `Popup`, `Sidebar` med fokus på å bevare robust felthåndtering.
3. Kjør `npm run typecheck` og `npm run build`.
4. Gjennomfør siste manuell test av hover/popup/lag.

## Mappestruktur
```
src/App.tsx          — state, lag-liste, layout
src/MapView.tsx      — kart + alle lag + hover/klikk
src/Sidebar.tsx      — lagkontroll, legend, info
src/Popup.tsx        — klikk-popup (utvides til alle lag)
server/server.ts     — Hono backend
public/data/         — alle GeoJSON-filer
```
