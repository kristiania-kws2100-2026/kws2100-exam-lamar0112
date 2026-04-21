import { useEffect, useRef, useState } from "react";
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
import { fromLonLat } from "ol/proj";
import { Circle, Fill, Stroke, Style, Text } from "ol/style";
import type { FeatureLike } from "ol/Feature";

// Bruk Render-backend i produksjon, lokal proxy i utvikling
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

// Stil for cluster-lag
function clusterStil(feature: FeatureLike): Style {
  const features = feature.get("features") as FeatureLike[];
  const antall = features.length;

  // Enkeltobservasjon — vis hjort-emoji
  if (antall === 1) {
    return new Style({
      text: new Text({
        text: "🦌",
        font: "18px sans-serif",
        offsetY: -2,
      }),
    });
  }

  // Klynge — vis sirkel med antall
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

// Stil for Vector Tile-laget ved høy zoom — vis også emoji
const vektorTilStil = new Style({
  text: new Text({
    text: "🦌",
    font: "14px sans-serif",
  }),
});

export default function MapView({ lag }: MapViewProps) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const clusterLagRef = useRef<VectorLayer | null>(null);
  const vektorTilLagRef = useRef<VectorTileLayer | null>(null);
  const naturvernLagRef = useRef<VectorLayer | null>(null);

  const [popup, setPopup] = useState<{
    innhold: { art: string; antall: number; dato: string | null };
    posisjon: { x: number; y: number };
  } | null>(null);

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

    // Naturvernområder fra Geonorge (grenser som linjer)
    const naturvernLag = new VectorLayer({
      source: new VectorSource({
        url: "/naturvernomrader.geojson",
        format: new GeoJSON(),
      }),
      style: new Style({
        stroke: new Stroke({ color: "#2d6a4f", width: 2 }),
        fill: new Fill({ color: "rgba(45, 106, 79, 0.1)" }),
      }),
    });

    clusterLagRef.current = clusterLag;
    vektorTilLagRef.current = vektorTilLag;
    naturvernLagRef.current = naturvernLag;

    const map = new Map({
      target: mapDivRef.current!,
      layers: [osmLag, naturvernLag, vektorTilLag, clusterLag],
      view: new View({
        center: fromLonLat([15.5, 65.5]),
        zoom: 5,
      }),
    });

    mapRef.current = map;

    // Klikk-interaksjon — vis popup med info om observasjonen
    map.on("click", (e) => {
      const feature = map.forEachFeatureAtPixel(e.pixel, (f) => f);

      if (!feature) {
        setPopup(null);
        return;
      }

      // Cluster-features har en "features"-liste inni seg
      const features = feature.get("features") as FeatureLike[] | undefined;
      const enkelt = features ? features[0] : feature;

      if (!enkelt) return;

      setPopup({
        innhold: {
          art: enkelt.get("art") ?? "Ukjent art",
          antall: enkelt.get("antall") ?? 1,
          dato: enkelt.get("observert_dato") ?? null,
        },
        posisjon: { x: e.pixel[0], y: e.pixel[1] },
      });
    });

    return () => {
      mapRef.current?.setTarget(undefined);
      mapRef.current = null;
    };
  }, []);

  // Oppdater synlighet når lag-prop endres
  useEffect(() => {
    for (const l of lag) {
      if (l.id === "cluster") clusterLagRef.current?.setVisible(l.synlig);
      if (l.id === "vektortil") vektorTilLagRef.current?.setVisible(l.synlig);
      if (l.id === "naturvern") naturvernLagRef.current?.setVisible(l.synlig);
    }
  }, [lag]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />
      <Popup
        innhold={popup?.innhold ?? null}
        posisjon={popup?.posisjon ?? null}
        onLukk={() => setPopup(null)}
      />
    </div>
  );
}
