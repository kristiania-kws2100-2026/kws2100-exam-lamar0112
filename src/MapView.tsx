import { useEffect, useRef } from "react";
import "ol/ol.css";

import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";

export default function MapView() {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    const map = new Map({
      target: mapDivRef.current!,
      layers: [new TileLayer({ source: new OSM() })],
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
