import { useEffect, useMemo, useRef, useState } from "react";
import Popup from "./Popup";
import "ol/ol.css";
import type { FjelltoppInfo, ZoomMal } from "./types";
import Point from "ol/geom/Point";

import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorSource from "ol/source/Vector";
import VectorTileSource from "ol/source/VectorTile";
import Cluster from "ol/source/Cluster";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import GeoJSON from "ol/format/GeoJSON";
import MVT from "ol/format/MVT";
import { useGeographic } from "ol/proj";
import { Circle, Fill, Stroke, Style, Text } from "ol/style";
import OverviewMap from "ol/control/OverviewMap";
import type Feature from "ol/Feature";
import type { FeatureLike } from "ol/Feature";

// Gir OpenLayers beskjed om å bruke geografiske koordinater (lon/lat) direkte
useGeographic();

// BASE_URL er "/kws2100-exam-lamar0112/" i prod, "/" lokalt
const BASE = import.meta.env.BASE_URL;
// I produksjon må API-kall gå til Render-backend.
// Lokalt brukes Vite-proxyen, derfor er API_BASE tom i utvikling.
const API_BASE = import.meta.env.PROD
  ? "https://naturkart-server.onrender.com"
  : "";

interface Lag {
  id: string;
  navn: string;
  synlig: boolean;
}

interface MapViewProps {
  lag: Lag[];
  onSynligeFjelltopperEndret?: (topper: FjelltoppInfo[]) => void;
  zoomMal?: ZoomMal | null;
}
// Popup-typen samler de ulike egenskapene som finnes i kartlagene.
// Dette gjør at Popup-komponenten kan vise riktig informasjon for hvert lag.
type PopupInnhold =
  | { type: "dyr"; art: string; antall: number; dato: string | null }
  | { type: "nasjonalpark"; navn: string; areal: number | null }
  | { type: "verneomrade"; navn: string; vernetype: string }
  | { type: "tursti"; navn: string; lengde: number | null; vanskelighetsgrad: string | null; sesong: string | null }
  | { type: "hytte"; navn: string; hyttetype: string; høyde: number | null }
  | { type: "fjelltopp"; navn: string; høyde: number | null }
  | { type: "badestrand"; navn: string; kommune: string };
// Små hjelpefunksjoner som gjør popup-data tryggere hvis et datasett mangler verdier.
function tekstverdi(verdi: unknown, fallback: string): string {
  if (typeof verdi !== "string") return fallback;
  const trimmet = verdi.trim();
  return trimmet.length > 0 ? trimmet : fallback;
}

function tallverdi(verdi: unknown): number | null {
  if (typeof verdi === "number" && Number.isFinite(verdi)) return verdi;
  return null;
}
// Cluster-stilen samler mange dyreobservasjoner til ett symbol ved lav zoom.
// Det gjør kartet mer lesbart når datasettet inneholder mange tusen punkter.
function clusterStil(feature: FeatureLike): Style {
  const features = feature.get("features") as FeatureLike[];
  const antall = features.length;

  if (antall === 1) {
    return new Style({
      text: new Text({ text: "🦌", font: "18px sans-serif", offsetY: -2 }),
    });
  }

  const radius = Math.min(10 + antall * 0.4, 24);
  const farge = antall < 10 ? "rgba(255, 140, 0, 0.85)" : "rgba(34, 139, 34, 0.85)";

  return new Style({
    image: new Circle({
      radius,
      fill: new Fill({ color: farge }),
      stroke: new Stroke({ color: "white", width: 2 }),
    }),
    text: new Text({
      text: String(antall),
      fill: new Fill({ color: "white" }),
      font: "bold 12px sans-serif",
    }),
  });
}
// Enkel stil for detaljerte dyreobservasjoner som kommer fra vector tiles.
const vektorTilStil = new Style({
  text: new Text({ text: "🦌", font: "14px sans-serif" }),
});

const nasjonalparkStil = new Style({
  stroke: new Stroke({ color: "#1b4332", width: 2.4 }),
  fill: new Fill({ color: "rgba(27, 67, 50, 0.32)" }),
});

const turstiStil = new Style({
  stroke: new Stroke({ color: "#e76f00", width: 3, lineDash: [8, 4] }),
});

const nasjonalparkHoverStil = new Style({
  stroke: new Stroke({ color: "#1b4332", width: 3.2 }),
  fill: new Fill({ color: "rgba(27, 67, 50, 0.6)" }),
});

const naturvernHoverStil = new Style({
  stroke: new Stroke({ color: "#2d6a4f", width: 3.2 }),
  fill: new Fill({ color: "rgba(45, 106, 79, 0.35)" }),
});

const turstiHoverStil = new Style({
  stroke: new Stroke({ color: "#e76f00", width: 6, lineDash: [6, 4] }),
});

const hytterStil = new Style({ text: new Text({ text: "🏠", font: "18px sans-serif" }) });
const hytterHoverStil = new Style({ text: new Text({ text: "🏠", font: "22px sans-serif" }) });
const fjelltopperStil = new Style({ text: new Text({ text: "⛰️", font: "18px sans-serif" }) });
const fjelltopperHoverStil = new Style({ text: new Text({ text: "⛰️", font: "22px sans-serif" }) });
const badestranderStil = new Style({ text: new Text({ text: "🏖️", font: "18px sans-serif" }) });
const badestranderHoverStil = new Style({ text: new Text({ text: "🏖️", font: "22px sans-serif" }) });

export default function MapView({ lag, onSynligeFjelltopperEndret, zoomMal }: MapViewProps) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const clusterLagRef = useRef<VectorLayer | null>(null);
  const vektorTilLagRef = useRef<VectorTileLayer | null>(null);
  const naturvernLagRef = useRef<VectorLayer | null>(null);
  const nasjonalparkLagRef = useRef<VectorLayer | null>(null);
  const turstiLagRef = useRef<VectorLayer | null>(null);
  const hytterLagRef = useRef<VectorLayer | null>(null);
  const fjelltopperLagRef = useRef<VectorLayer | null>(null);
  const badestranderLagRef = useRef<VectorLayer | null>(null);
  const kartverketLagRef = useRef<TileLayer | null>(null);

  const hoverFeatureRef = useRef<Feature | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ navn: string; x: number; y: number } | null>(null);
  const [popup, setPopup] = useState<{ innhold: PopupInnhold; posisjon: { x: number; y: number } } | null>(null);
  // GeoJSON-kildene opprettes med useMemo slik at de ikke lages på nytt ved hver render.
  // Det gjør OpenLayers-oppsettet mer stabilt i React.
  const naturvernSource = useMemo(() => new VectorSource({ url: `${BASE}data/verneomrader.geojson`, format: new GeoJSON() }), []);
  const nasjonalparkSource = useMemo(() => new VectorSource({ url: `${BASE}data/nasjonalparker.geojson`, format: new GeoJSON() }), []);
  const turstiSource = useMemo(() => new VectorSource({ url: `${BASE}data/turstier.geojson`, format: new GeoJSON() }), []);
  const hytterSource = useMemo(() => new VectorSource({ url: `${BASE}data/hytter.geojson`, format: new GeoJSON() }), []);
  const fjelltopperSource = useMemo(() => new VectorSource({ url: `${BASE}data/fjelltopper.geojson`, format: new GeoJSON() }), []);
  const badestranderSource = useMemo(() => new VectorSource({ url: `${BASE}data/badestrander.geojson`, format: new GeoJSON() }), []);
  // Dette useEffect-oppsettet kjører én gang og bygger selve OpenLayers-kartet.
  useEffect(() => {
    if (mapRef.current) return;

    const osmLag = new TileLayer({ source: new OSM() });
// Kartverket-laget er et ekstra bakgrunnskart som passer bedre til friluftsliv enn vanlig veikart.
    const kartverketLag = new TileLayer({
      source: new XYZ({
        url: "https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png",
        attributions: "© Kartverket",
      }),
      visible: false,
    });
// Ved lavere zoom bruker vi GeoJSON + Cluster.
// Da får brukeren oversikt uten at 30 000 observasjoner tegnes som enkeltpunkter.
    const clusterLag = new VectorLayer({
      source: new Cluster({
        distance: 40,
        source: new VectorSource({ url: `${API_BASE}/api/dyr/geojson`, format: new GeoJSON() }),
      }),
      style: clusterStil,
      maxZoom: 12,
    });
// Ved høyere zoom bruker vi vector tiles fra backend.
// Dette er mer effektivt for store datasett fordi kartet bare henter flisene som trengs.
    const vektorTilLag = new VectorTileLayer({
      source: new VectorTileSource({ format: new MVT(), url: `${API_BASE}/api/tiles/dyr/{z}/{x}/{y}` }),
      style: vektorTilStil,
      minZoom: 12,
    });

    const naturvernLag = new VectorLayer({
      source: naturvernSource,
      style: new Style({ stroke: new Stroke({ color: "#2d6a4f", width: 2.2 }), fill: new Fill({ color: "rgba(45, 106, 79, 0.2)" }) }),
    });

    const nasjonalparkLag = new VectorLayer({ source: nasjonalparkSource, style: nasjonalparkStil });
    const turstiLag = new VectorLayer({ source: turstiSource, style: turstiStil });
    const hytterLag = new VectorLayer({ source: hytterSource, style: hytterStil });
    const fjelltopperLag = new VectorLayer({ source: fjelltopperSource, style: fjelltopperStil });
    const badestranderLag = new VectorLayer({ source: badestranderSource, style: badestranderStil });

    clusterLagRef.current = clusterLag;
    vektorTilLagRef.current = vektorTilLag;
    naturvernLagRef.current = naturvernLag;
    nasjonalparkLagRef.current = nasjonalparkLag;
    turstiLagRef.current = turstiLag;
    hytterLagRef.current = hytterLag;
    fjelltopperLagRef.current = fjelltopperLag;
    badestranderLagRef.current = badestranderLag;
    kartverketLagRef.current = kartverketLag;
// OverviewMap gir brukeren en liten oversikt over hvor hovedkartet befinner seg.
    const oversiktskart = new OverviewMap({
      collapsed: false,
      layers: [new TileLayer({ source: new OSM() })],
    });

    const map = new Map({
      target: mapDivRef.current!,
      layers: [osmLag, kartverketLag, naturvernLag, nasjonalparkLag, turstiLag, hytterLag, fjelltopperLag, badestranderLag, vektorTilLag, clusterLag],
      view: new View({ center: [15.5, 65.5], zoom: 5 }),
    });

    map.addControl(oversiktskart);
    mapRef.current = map;
// Klikk på kartet finner nærmeste feature og bygger popup-innhold ut fra hvilke egenskaper laget har.
    map.on("click", (e) => {
      const feature = map.forEachFeatureAtPixel(e.pixel, (f) => f);
      if (!feature) { setPopup(null); return; }
// Cluster-features inneholder en liste med originale features.
// Hvis brukeren klikker på en cluster, bruker vi første observasjon som eksempel i popupen.
      const features = feature.get("features") as FeatureLike[] | undefined;
      const enkelt = features ? features[0] : feature;
      if (!enkelt) { setPopup(null); return; }

      const pos = { x: e.pixel[0], y: e.pixel[1] };

      if (enkelt.get("areal_km2") !== undefined) {
        setPopup({ innhold: { type: "nasjonalpark", navn: tekstverdi(enkelt.get("navn"), "Ukjent nasjonalpark"), areal: tallverdi(enkelt.get("areal_km2")) }, posisjon: pos });
        return;
      }
      if (enkelt.get("vernetype") !== undefined) {
        setPopup({ innhold: { type: "verneomrade", navn: tekstverdi(enkelt.get("navn"), "Ukjent verneområde"), vernetype: tekstverdi(enkelt.get("vernetype"), "Ikke oppgitt") }, posisjon: pos });
        return;
      }
      if (enkelt.get("lengde_km") !== undefined) {
        setPopup({ innhold: { type: "tursti", navn: tekstverdi(enkelt.get("navn"), "Ukjent tursti"), lengde: tallverdi(enkelt.get("lengde_km")), vanskelighetsgrad: tekstverdi(enkelt.get("vanskelighetsgrad"), "") || null, sesong: tekstverdi(enkelt.get("sesong"), "") || null }, posisjon: pos });
        return;
      }
      if (enkelt.get("type") !== undefined && enkelt.get("høyde_moh") !== undefined) {
        setPopup({ innhold: { type: "hytte", navn: tekstverdi(enkelt.get("navn"), "Ukjent hytte"), hyttetype: tekstverdi(enkelt.get("type"), ""), høyde: tallverdi(enkelt.get("høyde_moh")) }, posisjon: pos });
        return;
      }
      if (enkelt.get("høyde_moh") !== undefined) {
        setPopup({ innhold: { type: "fjelltopp", navn: tekstverdi(enkelt.get("navn"), "Ukjent fjelltopp"), høyde: tallverdi(enkelt.get("høyde_moh")) }, posisjon: pos });
        return;
      }
      if (enkelt.get("kommune") !== undefined) {
        setPopup({ innhold: { type: "badestrand", navn: tekstverdi(enkelt.get("navn"), "Ukjent strand"), kommune: tekstverdi(enkelt.get("kommune"), "") }, posisjon: pos });
        return;
      }

      setPopup({ innhold: { type: "dyr", art: tekstverdi(enkelt.get("art"), "Ukjent art"), antall: tallverdi(enkelt.get("antall")) ?? 1, dato: typeof enkelt.get("observert_dato") === "string" ? enkelt.get("observert_dato") : null }, posisjon: pos });
    });
// Hover brukes for å gi visuell respons og gjøre det tydelig hvilke objekter som er klikkbare.
    map.on("pointermove", (e) => {
      if (hoverFeatureRef.current) {
        hoverFeatureRef.current.setStyle(undefined);
        hoverFeatureRef.current = null;
      }

      const treff = map.forEachFeatureAtPixel(e.pixel, (f) => f, {
        layerFilter: (l) => l === naturvernLag || l === nasjonalparkLag || l === turstiLag || l === hytterLag || l === fjelltopperLag || l === badestranderLag,
      });

      if (treff) {
        const f = treff as Feature;
        hoverFeatureRef.current = f;

        if (f.get("areal_km2") !== undefined) f.setStyle(nasjonalparkHoverStil);
        else if (f.get("vernetype") !== undefined) f.setStyle(naturvernHoverStil);
        else if (f.get("lengde_km") !== undefined) f.setStyle(turstiHoverStil);
        else if (f.get("type") !== undefined) f.setStyle(hytterHoverStil);
        else if (f.get("høyde_moh") !== undefined) f.setStyle(fjelltopperHoverStil);
        else if (f.get("kommune") !== undefined) f.setStyle(badestranderHoverStil);

        const navn = f.get("navn") as string | undefined;
        setHoverInfo(navn ? { navn, x: e.pixel[0], y: e.pixel[1] } : null);
        map.getViewport().style.cursor = "pointer";
      } else {
        setHoverInfo(null);
        map.getViewport().style.cursor = "";
      }
    });

    // Finner fjelltopper innenfor nåværende kartutsnitt og sender dem til sidepanelet.
    // Listen sorteres etter høyde slik at de mest markante toppene vises først.
    const oppdaterSynligeTopper = () => {
      if (!onSynligeFjelltopperEndret) return;
      const extent = map.getView().calculateExtent(map.getSize());
      const features = fjelltopperSource.getFeaturesInExtent(extent);
      const topper: FjelltoppInfo[] = features
        .map((f) => {
          const geom = f.getGeometry();
          if (!(geom instanceof Point)) return null;
          const [lon, lat] = geom.getCoordinates();
          return { navn: tekstverdi(f.get("navn"), "Ukjent"), høyde: tallverdi(f.get("høyde_moh")) ?? 0, koordinater: [lon, lat] as [number, number] };
        })
        .filter((t): t is FjelltoppInfo => t !== null)
        .sort((a, b) => b.høyde - a.høyde);
      onSynligeFjelltopperEndret(topper);
    };

    map.on("moveend", oppdaterSynligeTopper);

    return () => {
      mapRef.current?.setTarget(undefined);
      mapRef.current = null;
    };
  }, [naturvernSource, nasjonalparkSource, turstiSource, hytterSource, fjelltopperSource, badestranderSource, onSynligeFjelltopperEndret]);

  // Zoom-animasjon når brukeren klikker på en fjelltopp i sidepanelet.
// Før vi zoomer inn, lagres forrige kartutsnitt slik at brukeren kan gå tilbake.
  useEffect(() => {
    if (!zoomMal || !mapRef.current) return;
    const view = mapRef.current.getView();

    if (!zoomMal.erTilbake) {
      sessionStorage.setItem("forrigeVisning", JSON.stringify({ senter: view.getCenter(), zoom: view.getZoom() }));
    }

    view.animate({ center: zoomMal.koordinater, zoom: zoomMal.zoom, duration: 800 });
  }, [zoomMal]);
// Synkroniserer avkryssingene i sidepanelet med synligheten til OpenLayers-lagene.
  useEffect(() => {
    for (const l of lag) {
      if (l.id === "cluster") clusterLagRef.current?.setVisible(l.synlig);
      if (l.id === "vektortil") vektorTilLagRef.current?.setVisible(l.synlig);
      if (l.id === "naturvern") naturvernLagRef.current?.setVisible(l.synlig);
      if (l.id === "nasjonalpark") nasjonalparkLagRef.current?.setVisible(l.synlig);
      if (l.id === "tursti") turstiLagRef.current?.setVisible(l.synlig);
      if (l.id === "hytter") hytterLagRef.current?.setVisible(l.synlig);
      if (l.id === "fjelltopper") fjelltopperLagRef.current?.setVisible(l.synlig);
      if (l.id === "badestrander") badestranderLagRef.current?.setVisible(l.synlig);
      // Når Kartverket-laget slås på, skjules OSM-bakgrunnen slik at bakgrunnskartene ikke ligger oppå hverandre.
      if (l.id === "kartverket") {
        kartverketLagRef.current?.setVisible(l.synlig);
        mapRef.current?.getLayers().getArray().filter((layer) => layer instanceof TileLayer && layer !== kartverketLagRef.current).forEach((osm) => osm.setVisible(!l.synlig));
      }
    }
  }, [lag]);

  return (
    <div style={{ position: "relative", flex: 1, height: "100%" }}>
      <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />
      {hoverInfo && (
        <div style={{ position: "absolute", left: hoverInfo.x + 14, top: hoverInfo.y - 36, background: "rgba(255,255,255,0.96)", color: "#1e3a2f", padding: "6px 12px", borderRadius: "20px", fontSize: 13, fontWeight: 600, pointerEvents: "none", whiteSpace: "nowrap", boxShadow: "0 2px 12px rgba(0,0,0,0.18)", border: "1px solid rgba(27,67,50,0.2)" }}>
          {hoverInfo.navn}
        </div>
      )}
      <Popup innhold={popup?.innhold ?? null} posisjon={popup?.posisjon ?? null} onLukk={() => setPopup(null)} />
    </div>
  );
}
