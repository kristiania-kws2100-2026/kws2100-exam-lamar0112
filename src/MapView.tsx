import { useEffect, useMemo, useRef, useState } from "react";
import Popup from "./Popup";
import "ol/ol.css";

import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorSource from "ol/source/Vector";
import VectorTileSource from "ol/source/VectorTile";
import Cluster from "ol/source/Cluster";
import OSM from "ol/source/OSM";
import GeoJSON from "ol/format/GeoJSON";
import MVT from "ol/format/MVT";
import { useGeographic } from "ol/proj";
import { Circle, Fill, Stroke, Style, Text } from "ol/style";
import type Feature from "ol/Feature";
import type { FeatureLike } from "ol/Feature";

// Gir OpenLayers beskjed om å bruke geografiske koordinater (lon/lat) direkte
useGeographic();

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
}

type PopupInnhold =
  | { type: "dyr"; art: string; antall: number; dato: string | null }
  | { type: "tursti"; navn: string; lengde: number | null; vanskelighetsgrad: string | null; sesong: string | null }
  | { type: "naturlag"; navn: string; kategori: string; detalj: string };

function tekstverdi(verdi: unknown, fallback: string): string {
  if (typeof verdi !== "string") return fallback;
  const trimmet = verdi.trim();
  return trimmet.length > 0 ? trimmet : fallback;
}

function tallverdi(verdi: unknown): number | null {
  if (typeof verdi === "number" && Number.isFinite(verdi)) return verdi;
  if (typeof verdi === "string" && verdi.trim().length > 0) {
    const parsed = Number(verdi);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function clusterStil(feature: FeatureLike): Style {
  const features = feature.get("features") as FeatureLike[];
  const antall = features.length;

  if (antall === 1) {
    return new Style({
      text: new Text({
        text: "🦌",
        font: "18px sans-serif",
        offsetY: -2,
      }),
    });
  }

  const radius = Math.min(10 + antall * 0.4, 24);
  const farge =
    antall < 10 ? "rgba(255, 140, 0, 0.85)" : "rgba(34, 139, 34, 0.85)";

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

// Hover-stiler — lysere/tykkere versjon av hvert lag
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

export default function MapView({ lag }: MapViewProps) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const clusterLagRef = useRef<VectorLayer | null>(null);
  const vektorTilLagRef = useRef<VectorTileLayer | null>(null);
  const naturvernLagRef = useRef<VectorLayer | null>(null);
  const nasjonalparkLagRef = useRef<VectorLayer | null>(null);
  const turstiLagRef = useRef<VectorLayer | null>(null);

  const hoverFeatureRef = useRef<Feature | null>(null);
  const hoverNavnRef = useRef<string | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{
    navn: string;
    x: number;
    y: number;
  } | null>(null);

  const [popup, setPopup] = useState<{
    innhold: PopupInnhold;
    posisjon: { x: number; y: number };
  } | null>(null);

  // useMemo sikrer at VectorSource ikke gjenskapes ved re-render
  const naturvernSource = useMemo(
    () =>
      new VectorSource({
        url: "/data/verneomrader.geojson",
        format: new GeoJSON(),
      }),
    [],
  );

  const nasjonalparkSource = useMemo(
    () =>
      new VectorSource({
        url: "/data/nasjonalparker.geojson",
        format: new GeoJSON(),
      }),
    [],
  );

  const turstiSource = useMemo(
    () =>
      new VectorSource({
        url: "/data/turstier.geojson",
        format: new GeoJSON(),
      }),
    [],
  );

  useEffect(() => {
    if (mapRef.current) return;

    const osmLag = new TileLayer({ source: new OSM() });

    const clusterLag = new VectorLayer({
      source: new Cluster({
        distance: 40,
        source: new VectorSource({
          url: `${API_BASE}/api/dyr/geojson`,
          format: new GeoJSON(),
        }),
      }),
      style: clusterStil,
      maxZoom: 12,
    });

    const vektorTilLag = new VectorTileLayer({
      source: new VectorTileSource({
        format: new MVT(),
        url: `${API_BASE}/api/tiles/dyr/{z}/{x}/{y}`,
      }),
      style: vektorTilStil,
      minZoom: 12,
    });

    const naturvernLag = new VectorLayer({
      source: naturvernSource,
      style: new Style({
        stroke: new Stroke({ color: "#2d6a4f", width: 2.2 }),
        fill: new Fill({ color: "rgba(45, 106, 79, 0.2)" }),
      }),
    });

    const nasjonalparkLag = new VectorLayer({
      source: nasjonalparkSource,
      style: nasjonalparkStil,
    });

    const turstiLag = new VectorLayer({
      source: turstiSource,
      style: turstiStil,
    });

    clusterLagRef.current = clusterLag;
    vektorTilLagRef.current = vektorTilLag;
    naturvernLagRef.current = naturvernLag;
    nasjonalparkLagRef.current = nasjonalparkLag;
    turstiLagRef.current = turstiLag;

    const map = new Map({
      target: mapDivRef.current!,
      layers: [
        osmLag,
        naturvernLag,
        nasjonalparkLag,
        turstiLag,
        vektorTilLag,
        clusterLag,
      ],
      view: new View({
        // Med useGeographic() brukes lon/lat direkte — ingen fromLonLat nødvendig
        center: [15.5, 65.5],
        zoom: 5,
      }),
    });

    mapRef.current = map;

    map.on("click", (e) => {
      const feature = map.forEachFeatureAtPixel(e.pixel, (f) => f);

      if (!feature) {
        setPopup(null);
        return;
      }

      const features = feature.get("features") as FeatureLike[] | undefined;
      const enkelt = features ? features[0] : feature;

      if (!enkelt) {
        setPopup(null);
        return;
      }

      const art = enkelt.get("art");
      if (art !== undefined) {
        setPopup({
          innhold: {
            type: "dyr",
            art: tekstverdi(art, "Ukjent art"),
            antall: tallverdi(enkelt.get("antall")) ?? 1,
            dato:
              typeof enkelt.get("observert_dato") === "string"
                ? enkelt.get("observert_dato")
                : null,
          },
          posisjon: { x: e.pixel[0], y: e.pixel[1] },
        });
        return;
      }

      const navn = tekstverdi(enkelt.get("navn"), "Uten navn");
      const areal = tallverdi(enkelt.get("areal_km2"));
      const lengde = tallverdi(enkelt.get("lengde_km"));
      const vernetype = tekstverdi(enkelt.get("vernetype"), "Ikke oppgitt");

      if (lengde !== null) {
        setPopup({
          innhold: {
            type: "tursti",
            navn,
            lengde,
            vanskelighetsgrad: tekstverdi(enkelt.get("vanskelighetsgrad"), "") || null,
            sesong: tekstverdi(enkelt.get("sesong"), "") || null,
          },
          posisjon: { x: e.pixel[0], y: e.pixel[1] },
        });
        return;
      }

      let kategori = "Naturlag";
      let detalj = "Ingen ekstra felt tilgjengelig";

      if (areal !== null) {
        kategori = "Nasjonalpark";
        detalj = `Areal: ${areal.toFixed(2)} km²`;
      } else if (enkelt.get("vernetype") !== undefined) {
        kategori = "Verneomrade";
        detalj = `Vernetype: ${vernetype}`;
      }

      setPopup({
        innhold: { type: "naturlag", navn, kategori, detalj },
        posisjon: { x: e.pixel[0], y: e.pixel[1] },
      });
    });

    map.on("pointermove", (e) => {
      const treff = map.forEachFeatureAtPixel(e.pixel, (f) => f, {
        layerFilter: (l) =>
          l === naturvernLag || l === nasjonalparkLag || l === turstiLag,
      });

      if (treff) {
        const feature = treff as Feature;

        // Unngar unodvendig reset/repaint nar musepeker blir pa samme feature.
        if (hoverFeatureRef.current && hoverFeatureRef.current !== feature) {
          hoverFeatureRef.current.setStyle(undefined);
        }
        hoverFeatureRef.current = feature;

        if (feature.get("areal_km2") !== undefined) {
          feature.setStyle(nasjonalparkHoverStil);
        } else if (feature.get("vernetype") !== undefined) {
          feature.setStyle(naturvernHoverStil);
        } else if (feature.get("lengde_km") !== undefined) {
          feature.setStyle(turstiHoverStil);
        }

        const navn = tekstverdi(feature.get("navn"), "Ukjent omrade");
        hoverNavnRef.current = navn;
        setHoverInfo({ navn, x: e.pixel[0], y: e.pixel[1] });
        map.getViewport().style.cursor = "pointer";
      } else {
        if (hoverFeatureRef.current) {
          hoverFeatureRef.current.setStyle(undefined);
          hoverFeatureRef.current = null;
        }
        hoverNavnRef.current = null;
        setHoverInfo(null);
        map.getViewport().style.cursor = "";
      }
    });

    return () => {
      mapRef.current?.setTarget(undefined);
      mapRef.current = null;
    };
  }, [naturvernSource, nasjonalparkSource, turstiSource]);

  useEffect(() => {
    for (const l of lag) {
      if (l.id === "cluster") clusterLagRef.current?.setVisible(l.synlig);
      if (l.id === "vektortil") vektorTilLagRef.current?.setVisible(l.synlig);
      if (l.id === "naturvern") naturvernLagRef.current?.setVisible(l.synlig);
      if (l.id === "nasjonalpark")
        nasjonalparkLagRef.current?.setVisible(l.synlig);
      if (l.id === "tursti") turstiLagRef.current?.setVisible(l.synlig);
    }
  }, [lag]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />
      {hoverInfo && (
        <div
          style={{
            position: "absolute",
            left: hoverInfo.x + 14,
            top: hoverInfo.y - 36,
            background: "rgba(255,255,255,0.96)",
            color: "#1e3a2f",
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: 13,
            fontWeight: 600,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
            border: "1px solid rgba(27,67,50,0.2)",
          }}
        >
          {hoverInfo.navn}
        </div>
      )}
      <Popup
        innhold={popup?.innhold ?? null}
        posisjon={popup?.posisjon ?? null}
        onLukk={() => setPopup(null)}
      />
    </div>
  );
}
