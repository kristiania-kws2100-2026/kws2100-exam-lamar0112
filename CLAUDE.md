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

## STATUS PER 2026-04-23 (oppdatert etter Asharib sin siste økt)

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

### 🔄 Samir — oppdatert branch funnet, må fortsatt sammenslås kontrollert
- Brancher funnet: `lamar/samir-friluft` og `samir/punktlag-kvalitet`
- `public/data/hytter.geojson` — DNT-hytter (Point, props: navn, type, høyde_moh)
- `public/data/fjelltopper.geojson` — fjelltopper (Point, props: navn, høyde_moh)
- `public/data/badestrander.geojson` — badestrander (Point, props: navn, kommune)
- Egne ikoner: 🏠 hytter / ⛰️ fjelltopper / 🏖️ badestrander
- Hover-stil + tooltip på alle tre lag
- Klikk → popup med relevant info
- Verifisert mot Git: punktfiler finnes, og `samir/punktlag-kvalitet` endrer hovedsakelig `src/MapView.tsx`, `src/Popup.tsx`, `src/Sidebar.tsx`.
- Merk: branchen sin `CLAUDE.md` sier at alt er merget i `main`, men det stemmer ikke fullt ut med faktisk branch-diff. Bruk git-diff som fasit.

---

## 🎯 Lamar sine gjenstående oppgaver (A-karakter)

**Gjøres på Lamar sin PC — én ting om gangen med naturlige commits:**

### 1. Merge/oppdatere Asharib-arbeid
```bash
git pull origin main   # etter merge på GitHub
```

### 2. Samir sin branch (lamar/samir-friluft)
Punktdata ligger på branch og skal merges kontrollert senere.
Behold Asharib sin robuste hover/popup-løsning ved sammenslåing.

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
`README.md` er nå lagt til i repo med:
- prosjektfortelling og gruppekontekst
- datakilder
- lokal kjøring (`dev`, `server`, `typecheck`, `build`)
- teknisk stack og kort refleksjon

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
- [x] Klikk → vis info naturlag (Asharib)
- [x] VectorLayer med GeoJSON
- [x] VectorTileLayer (MVT)
- [x] Cluster-lag
- [ ] Kartverket WMTS (Lamar A-tillegg)

## Nåværende lokale filer som ikke er pushet ennå
- Endret: `src/MapView.tsx`
- Endret: `src/Popup.tsx`
- Endret: `src/Sidebar.tsx`
- Endret: `src/sidebar.css`
- Endret: `CLAUDE.md`
- Ny: `README.md`
- Untracked: `slim.mjs` (må avklares før commit)

## Neste steg (anbefalt rekkefølge)
1. Fullfør og push Asharib-branch med robuste naturlag-endringer + README.
2. Be Samir åpne PR fra `samir/punktlag-kvalitet` (eller `lamar/samir-friluft`) med kort testplan.
3. Lamar gjør kontrollert merge, løser konflikter i `MapView`, `Popup`, `Sidebar` uten å miste Asharib-robusthet.
4. Kjør `npm run typecheck` og `npm run build` etter sammenslåing.

## Mappestruktur
```
src/App.tsx          — state, lag-liste, layout
src/MapView.tsx      — kart + alle lag + hover/klikk
src/Sidebar.tsx      — lagkontroll, legend, info
src/Popup.tsx        — klikk-popup (utvides til alle lag)
server/server.ts     — Hono backend
public/data/         — alle GeoJSON-filer
```
