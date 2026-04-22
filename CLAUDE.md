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

## STATUS PER 2026-04-23 (FERDIG — alle lag merget, A-tillegg gjort)

### ✅ Lamar — ferdig (main)
- Grunnkart med OSM
- Clustering av dyreobservasjoner (GBIF/backend)
- Vector Tile Layer (MVT) ved høy zoom
- Sidebar med lagkontroll
- Klikk-popup (art/antall/dato) på dyreobservasjoner
- Hono-backend på Render.com med PostGIS
- GitHub Pages deploy via Actions

### ✅ Asharib — ferdig (merget inn i main ✅)
- `public/data/nasjonalparker.geojson` — 21 norske nasjonalparker (polygon)
- `public/data/verneomrader.geojson` — verneområder (polygon)
- `public/data/turstier.geojson` — 11 turstier (linje)
- `useGeographic()` + `useMemo` + hover-stil + tooltip ✅

### ✅ Samir — ferdig (merget inn i main ✅)
- `public/data/hytter.geojson` — 12 DNT-hytter (punkt)
- `public/data/fjelltopper.geojson` — 13 fjelltopper (punkt)
- `public/data/badestrander.geojson` — 12 badestrander (punkt)
- Hover-stil + klikk-popup på alle tre lag ✅

### ✅ Lamar A-tillegg — ferdig (merget inn i main ✅)
- Klikk-popup for ALLE lag (generisk Popup.tsx med 7 typer) ✅
- Full fargelegende i sidebar ✅
- Kartverket topografisk kart som alternativt basiskart ✅
- README.md ✅

---

## 🎯 Lamar sine gjenstående oppgaver (A-karakter)

**Gjøres på Lamar sin PC — én ting om gangen med naturlige commits:**

### 1. ✅ Merge PR #2 fra Asharib — GJORT
### 2. ✅ Samir sin branch — GJORT (merget)
### 3–7. ✅ Alle A-tillegg gjort og merget

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

## Pensum-sjekkliste — ALT FERDIG ✅
- [x] `useGeographic()` fra `ol/proj` — modulnivå MapView.tsx
- [x] `useMemo` for VectorSource
- [x] `useRef` + `useEffect` for kart-init
- [x] Polygon-geometri (nasjonalparker, verneomrader)
- [x] Linje-geometri (turstier)
- [x] Punkt-geometri (hytter, fjelltopper, badestrander, dyreobs)
- [x] Hover-stil på alle lag
- [x] Klikk → vis info (popup for alle 7 lag-typer)
- [x] VectorLayer med GeoJSON
- [x] VectorTileLayer (MVT)
- [x] Cluster-lag
- [x] Kartverket WMTS (alternativt basiskart)

## Mappestruktur
```
src/App.tsx          — state, lag-liste, layout
src/MapView.tsx      — kart + alle lag + hover/klikk
src/Sidebar.tsx      — lagkontroll, legend, info
src/Popup.tsx        — klikk-popup (utvides til alle lag)
server/server.ts     — Hono backend
public/data/         — alle GeoJSON-filer
```
