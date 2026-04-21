import { useEffect, useRef } from "react";
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

// Stil for cluster-lag — viser antall observasjoner i hver klynge
function clusterStil(feature: FeatureLike): Style {
  const features = feature.get("features") as FeatureLike[];
  const antall = features.length;

  // Størrelse og farge avhenger av antall punkter i klyngen
  const radius = antall === 1 ? 6 : Math.min(8 + antall * 0.5, 22);
  const farge =
    antall === 1
      ? "rgba(220, 53, 69, 0.85)"   // rødt for enkeltobservasjoner
      : antall < 10
        ? "rgba(255, 140, 0, 0.85)" // oransje for små klynger
        : "rgba(34, 139, 34, 0.85)"; // grønt for store klynger

  return new Style({
    image: new Circle({
      radius,
      fill: new Fill({ color: farge }),
      stroke: new Stroke({ color: "white", width: 2 }),
    }),
    text:
      antall > 1
        ? new Text({
            text: String(antall),
            fill: new Fill({ color: "white" }),
            font: "bold 12px sans-serif",
          })
        : undefined,
  });
}

// Stil for Vector Tile-laget (enkle prikker ved høy zoom)
const vektorTilStil = new Style({
  image: new Circle({
    radius: 4,
    fill: new Fill({ color: "rgba(220, 53, 69, 0.6)" }),
    stroke: new Stroke({ color: "white", width: 1 }),
  }),
});

export default function MapView() {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    // Grunnkart
    const osmLag = new TileLayer({ source: new OSM() });

    // Cluster-lag: henter alle punkter som GeoJSON og grupperer dem
    const dyrKilde = new VectorSource({
      url: "/api/dyr/geojson",
      format: new GeoJSON(),
    });

    const clusterKilde = new Cluster({
      distance: 40, // piksel-avstand for gruppering
      source: dyrKilde,
    });

    const clusterLag = new VectorLayer({
      source: clusterKilde,
      style: clusterStil,
      maxZoom: 12, // skjules ved høy zoom
    });

    // Vector Tile-lag: vises ved høy zoom for detaljerte observasjoner
    const vektorTilLag = new VectorTileLayer({
      source: new VectorTileSource({
        format: new MVT(),
        url: "/api/tiles/dyr/{z}/{x}/{y}",
      }),
      style: vektorTilStil,
      minZoom: 12, // vises bare ved høy zoom
    });

    const map = new Map({
      target: mapDivRef.current!,
      layers: [osmLag, vektorTilLag, clusterLag],
      view: new View({
        center: fromLonLat([15.5, 65.5]),
        zoom: 5,
      }),
    });

    mapRef.current = map;

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, []);

  return <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />;
}
