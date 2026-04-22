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

## STATUS PER 2026-04-23 (oppdatert etter merge av Asharib sin PR)

### ✅ Lamar — ferdig (main)
- Grunnkart med OSM
- Clustering av dyreobservasjoner (GBIF/backend)
- Vector Tile Layer (MVT) ved høy zoom
- Sidebar med lagkontroll
- Klikk-popup (art/antall/dato) på dyreobservasjoner
- Hono-backend på Render.com med PostGIS
- GitHub Pages deploy via Actions

### ✅ Asharib — ferdig (PR #2 merget inn i main ✅)
Branch: `lamar/asharib-naturlag`
- `public/data/nasjonalparker.geojson` — 21 norske nasjonalparker (polygon, EPSG:4326, props: navn/areal_km2)
- `public/data/verneomrader.geojson` — verneområder (polygon, EPSG:4326, props: navn/vernetype)
- `public/data/turstier.geojson` — 11 turstier (linje, EPSG:4326, props: navn/lengde_km)
- `useGeographic()` på modulnivå i MapView.tsx ✅
- `useMemo` for alle tre VectorSource ✅
- Hover-stil (mørk/lys grønn polygon, oransje linje) + tooltip med navn ✅
- Lag i sidebar: Nasjonalparker 🏔️, Verneområder 🌿, Turstier 🥾

### ⏳ Samir — gjenstår (branch: lamar/samir-friluft)
- `public/data/hytter.geojson` — DNT-hytter (Point, props: navn, type, høyde_moh)
- `public/data/fjelltopper.geojson` — fjelltopper (Point, props: navn, høyde_moh)
- `public/data/badestrander.geojson` — badestrander (Point, props: navn, kommune)
- Egne ikoner: 🏠 hytter / ⛰️ fjelltopper / 🏖️ badestrander
- Hover-stil + tooltip på alle tre lag
- Klikk → popup med relevant info

---

## 🎯 Lamar sine gjenstående oppgaver (A-karakter)

**Gjøres på Lamar sin PC — én ting om gangen med naturlige commits:**

### 1. ✅ Merge PR #2 fra Asharib — GJORT
- Fikset sidetittel 'Norsk Naturkart' → 'Norsk Natur- og Friluftskart'
- Merget lamar/asharib-naturlag → main

### 2. Samir sin branch (lamar/samir-friluft)
Opprett branch, lag GeoJSON-data + lag i MapView + hover + klikk.
Samme mønster som Asharib — ett lag per commit.

### 3. Utvide Popup.tsx — generisk (VIKTIG for A)
Popup.tsx håndterer i dag bare dyreobservasjoner `{ art, antall, dato }`.
Utvid til å vise info for alle lag:
- Nasjonalpark: navn + areal_km2
- Tursti: navn + lengde_km
- Hytte: navn + type
- Fjelltopp: navn + høyde_moh
- Badestrand: navn + kommune

Hint — nytt popup-state i MapView.tsx:
```ts
type PopupInnhold =
  | { type: "dyr"; art: string; antall: number; dato: string | null }
  | { type: "naturlag"; navn: string; detalj: string };
```

### 4. Klikk på naturlag i MapView.tsx
I `map.on("click", ...)` — sjekk om feature er fra naturlag og vis popup:
```ts
const navn = enkelt.get("navn");
const areal = enkelt.get("areal_km2");
const km = enkelt.get("lengde_km");
if (navn) {
  setPopup({ type: "naturlag", navn, detalj: areal ? `${areal} km²` : km ? `${km} km` : "" });
}
```

### 5. Sidebar.tsx — full legend
Legg til fargesymboler for alle lag under "Forklaring":
```tsx
<div className="legende"><span style={{background:"#1b4332", width:14, height:14, display:"inline-block", marginRight:6}}/> Nasjonalpark</div>
<div className="legende"><span style={{background:"rgba(45,106,79,0.5)", ...}}/> Verneområde</div>
// osv
```

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

### 7. README.md
```markdown
# Norsk Natur- og Friluftskart
Gruppeeksamen KWS2100, Høyskolen Kristiania 2026.
Lamar (lasa020), Asharib (asha023), Samir

## Datakilder
- Dyreobservasjoner: GBIF / Artsdatabanken
- Nasjonalparker + Verneområder: Geonorge / Miljødirektoratet (CC BY 4.0)
- Turstier: Geonorge / Kartverket
- DNT-hytter + Fjelltopper: Kartverket N50
- Badestrander: Geonorge

## Teknisk
React + TypeScript + OpenLayers v10 + Hono + PostGIS på Render.com
```

---

## Pensum-sjekkliste
- [x] `useGeographic()` fra `ol/proj` — modulnivå MapView.tsx
- [x] `useMemo` for VectorSource
- [x] `useRef` + `useEffect` for kart-init
- [x] Polygon-geometri
- [x] Linje-geometri
- [ ] Punkt-geometri (Samir)
- [x] Hover-stil
- [x] Klikk → vis info (dyr)
- [ ] Klikk → vis info alle lag (Lamar A-tillegg)
- [x] VectorLayer med GeoJSON
- [x] VectorTileLayer (MVT)
- [x] Cluster-lag
- [ ] Kartverket WMTS (Lamar A-tillegg)

## Mappestruktur
```
src/App.tsx          — state, lag-liste, layout
src/MapView.tsx      — kart + alle lag + hover/klikk
src/Sidebar.tsx      — lagkontroll, legend, info
src/Popup.tsx        — klikk-popup (utvides til alle lag)
server/server.ts     — Hono backend
public/data/         — alle GeoJSON-filer
```
