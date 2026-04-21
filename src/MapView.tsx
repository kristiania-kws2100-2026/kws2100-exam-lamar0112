import { useEffect, useRef } from "react";
import "ol/ol.css";

import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import OSM from "ol/source/OSM";
import MVT from "ol/format/MVT";
import { fromLonLat } from "ol/proj";
import { Circle, Fill, Stroke, Style } from "ol/style";

// Stil for dyreobservasjoner — enkle røde prikker
const dyrStyle = new Style({
  image: new Circle({
    radius: 5,
    fill: new Fill({ color: "rgba(220, 53, 69, 0.8)" }),
    stroke: new Stroke({ color: "white", width: 1 }),
  }),
});

export default function MapView() {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    // Grunnkart (OpenStreetMap)
    const osmLag = new TileLayer({ source: new OSM() });

    // Vector Tile-lag for dyreobservasjoner fra vår Hono-server
    const dyrLag = new VectorTileLayer({
      source: new VectorTileSource({
        format: new MVT(),
        url: "/api/tiles/dyr/{z}/{x}/{y}",
      }),
      style: dyrStyle,
    });

    const map = new Map({
      target: mapDivRef.current!,
      layers: [osmLag, dyrLag],
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
