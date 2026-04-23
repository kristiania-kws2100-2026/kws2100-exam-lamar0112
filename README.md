# Norsk Natur- og Friluftskart

Gruppeeksamen i KWS2100 (Kartbaserte websystemer), Høyskolen Kristiania 2026.

Prosjektet er en kartbasert webapplikasjon for visualisering av natur- og friluftsdata i Norge. Løsningen kombinerer punktdata, polygondata og linjedata i et interaktivt kart med hover, klikk og popup.

## Gruppe

- Lamar (`lasa020@student.kristiania.no`)
- Asharib (`asha023@student.kristiania.no`)
- Samir

Store deler av arbeidet er gjort i samarbeid og perioder med pair programming. Noe arbeid er derfor utført fra samme maskin, selv om bidragene er fordelt mellom gruppemedlemmer.

## Teknologi

- React + TypeScript + Vite
- OpenLayers
- Hono (API)
- PostgreSQL + PostGIS
- GitHub Pages (frontend) og Render (backend)

## Funksjonalitet

- Interaktivt kart med OpenStreetMap som basiskart
- Lagkontroll i sidebar
- Punktbaserte observasjoner med clustering
- Vector tiles ved høyere zoomnivå
- Naturlag:
  - Nasjonalparker (polygon)
  - Verneområder (polygon)
  - Turstier (linje)
- Hover og tooltip for geografiske objekter
- Klikk-popup med relevant informasjon per lag

## Datakilder

- Dyreobservasjoner: GBIF / Artsdatabanken
- Nasjonalparker og verneområder: Geonorge / Miljødirektoratet
- Turstier: Geonorge / Kartverket

## Kjøring lokalt

### 1) Installer avhengigheter

```bash
npm install
```

### 2) Start frontend

```bash
npm run dev
```

### 3) Start backend

```bash
npm run server
```

## Kvalitetssjekk

```bash
npm run typecheck
npm run build
```

## Struktur

- `src/App.tsx` - applikasjonslayout og lag-state
- `src/MapView.tsx` - kartoppsett, lag, hover og klikk
- `src/Sidebar.tsx` - lagkontroll og forklaring/legend
- `src/Popup.tsx` - visning av popupinnhold
- `server/server.ts` - API-endepunkter (GeoJSON + vector tiles)
- `server/load-gbif.ts` - dataimport fra GBIF
- `public/data/` - lokale GeoJSON-datasett

## Refleksjon

Målet med prosjektet har vært å bygge en realistisk GIS-webapplikasjon med teknikker fra pensum: React-komponentstruktur, OpenLayers-lag, interaksjon i kart, API mot geografisk database og deploy i sky. Arbeidet er gjort iterativt, med fokus på fungerende funksjonalitet først og deretter robusthet, lesbarhet og dokumentasjon.
