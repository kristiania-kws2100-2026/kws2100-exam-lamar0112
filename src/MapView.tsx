import { useEffect, useRef } from "react";
import "ol/ol.css";

import OLMap from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import GeoJSON from "ol/format/GeoJSON";
import { OverviewMap } from "ol/control";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";

import { Fill, Stroke, Style, Circle as CircleStyle, Text } from "ol/style";
import type { FeatureLike } from "ol/Feature";

import type { SelectedFeature } from "./types";

// ─── Layer definitions ────────────────────────────────────────────────────────
// Each data source is defined here with its own style and label.
// Add new layers by appending to LAYER_CONFIGS.

type LayerConfig = {
  name: string;
  url: string;
  style: (feature: FeatureLike, hovered: boolean, selected: boolean) => Style;
  zIndex: number;
};

const BASE_URL = import.meta.env.BASE_URL;

const LAYER_CONFIGS: LayerConfig[] = [
  {
    name: "Fylke",
    url: `${BASE_URL}data/fylker.geojson`,
    zIndex: 10,
    style: (_f, hovered) =>
      new Style({
        stroke: new Stroke({ color: "#4a90d9", width: hovered ? 3 : 1.5 }),
        fill: new Fill({ color: hovered ? "rgba(74,144,217,0.15)" : "rgba(74,144,217,0.05)" }),
      }),
  },
  {
    name: "Kommune",
    url: `${BASE_URL}data/kommuner.geojson`,
    zIndex: 11,
    style: (_f, hovered) =>
      new Style({
        stroke: new Stroke({ color: "#7b68ee", width: hovered ? 2 : 1 }),
        fill: new Fill({ color: hovered ? "rgba(123,104,238,0.2)" : "rgba(123,104,238,0.05)" }),
      }),
  },
  {
    name: "Sivilforsvarsdistrikt",
    url: `${BASE_URL}data/sivilforsvardistrikter.geojson`,
    zIndex: 12,
    style: (_f, hovered) =>
      new Style({
        stroke: new Stroke({ color: "#0055ff", width: hovered ? 4 : 2 }),
        fill: new Fill({ color: hovered ? "rgba(0,85,255,0.25)" : "rgba(0,85,255,0.1)" }),
      }),
  },
  {
    name: "Tilfluktsrom",
    url: `${BASE_URL}data/tilfluktsrom.geojson`,
    zIndex: 30,
    style: (feature, hovered, selected) => {
      const plasser = Number(feature.get("plasser") ?? 0);
      const radius = Math.max(4, Math.min(plasser / 100, 14));
      return new Style({
        image: new CircleStyle({
          radius: radius + (selected ? 4 : hovered ? 2 : 0),
          fill: new Fill({ color: selected ? "#ff8800" : "#ffcc00" }),
          stroke: new Stroke({ color: "#000", width: selected ? 3 : hovered ? 2 : 1 }),
        }),
      });
    },
  },
  {
    name: "Sykehus",
    url: `${BASE_URL}data/sykehus.geojson`,
    zIndex: 31,
    style: (_f, hovered, selected) =>
      new Style({
        image: new CircleStyle({
          radius: selected ? 12 : hovered ? 10 : 8,
          fill: new Fill({ color: "#e74c3c" }),
          stroke: new Stroke({ color: "#fff", width: 2 }),
        }),
        text: new Text({
          text: "H",
          fill: new Fill({ color: "#fff" }),
          font: "bold 9px sans-serif",
        }),
      }),
  },
  {
    name: "Brannstasjon",
    url: `${BASE_URL}data/brannstasjoner.geojson`,
    zIndex: 32,
    style: (_f, hovered, selected) =>
      new Style({
        image: new CircleStyle({
          radius: selected ? 12 : hovered ? 10 : 8,
          fill: new Fill({ color: "#e67e22" }),
          stroke: new Stroke({ color: "#fff", width: 2 }),
        }),
      }),
  },
  {
    name: "AED",
    url: `${BASE_URL}data/aed.geojson`,
    zIndex: 33,
    style: (_f, hovered, selected) =>
      new Style({
        image: new CircleStyle({
          radius: selected ? 10 : hovered ? 8 : 6,
          fill: new Fill({ color: "#e94560" }),
          stroke: new Stroke({ color: "#fff", width: 1.5 }),
        }),
      }),
  },
  {
    name: "Politistasjon",
    url: `${BASE_URL}data/politistasjoner.geojson`,
    zIndex: 34,
    style: (_f, hovered, selected) =>
      new Style({
        image: new CircleStyle({
          radius: selected ? 12 : hovered ? 10 : 8,
          fill: new Fill({ color: "#2980b9" }),
          stroke: new Stroke({ color: "#fff", width: 2 }),
        }),
      }),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  onFeatureSelect: (f: SelectedFeature | null) => void;
  onVisibleFeaturesChange: (features: SelectedFeature[]) => void;
  selectedFeature: SelectedFeature | null;
};

export default function MapView({
  onFeatureSelect,
  onVisibleFeaturesChange,
  selectedFeature,
}: Props) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<OLMap | null>(null);

  const hoveredKeyRef = useRef<string | null>(null);

  const layerRefs = useRef<globalThis.Map<string, VectorLayer<VectorSource>>>(
    new globalThis.Map(),
  );

  useEffect(() => {
    if (mapRef.current) return;

    const vectorLayers = LAYER_CONFIGS.map((cfg) => {
      const source = new VectorSource({
        url: cfg.url,
        format: new GeoJSON({
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        }),
      });

      const layer = new VectorLayer({
        source,
        zIndex: cfg.zIndex,
        style: (feature) => {
          const key = featureKey(cfg.name, feature);
          const hovered = hoveredKeyRef.current === key;
          const selected =
            selectedFeature?.layerName === cfg.name &&
            featureKey(cfg.name, feature) === hoveredKeyRef.current;
          return cfg.style(feature, hovered, selected);
        },
      });

      layerRefs.current.set(cfg.name, layer);
      return layer;
    });

    const overviewMap = new OverviewMap({
      layers: [new TileLayer({ source: new OSM() })],
      collapsed: false,
    });

    const map = new OLMap({
      target: mapDivRef.current!,
      layers: [new TileLayer({ source: new OSM() }), ...vectorLayers],
      view: new View({
        center: fromLonLat([15.5, 65.5]),
        zoom: 4,
      }),
      controls: undefined,
    });

    map.addControl(overviewMap);
    mapRef.current = map;

    // Hover
    map.on("pointermove", (evt) => {
      let newKey: string | null = null;

      map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
        const cfg = LAYER_CONFIGS.find(
          (c) => layerRefs.current.get(c.name) === layer,
        );
        if (cfg) {
          newKey = featureKey(cfg.name, feature);
          return true;
        }
      });

      map.getTargetElement().style.cursor = newKey ? "pointer" : "";

      if (newKey !== hoveredKeyRef.current) {
        hoveredKeyRef.current = newKey;
        layerRefs.current.forEach((l: VectorLayer<VectorSource>) =>
          l.changed(),
        );
      }
    });

    // Click → show feature details
    map.on("singleclick", (evt) => {
      let found = false;

      map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
        if (found) return;
        const cfg = LAYER_CONFIGS.find(
          (c) => layerRefs.current.get(c.name) === layer,
        );
        if (cfg) {
          const props = { ...feature.getProperties() };
          delete props.geometry;
          onFeatureSelect({ layerName: cfg.name, properties: props });
          found = true;
          return true;
        }
      });

      if (!found) onFeatureSelect(null);
    });

    // Sidebar: update visible features when map moves
    const updateVisible = () => {
      const extent = map.getView().calculateExtent(map.getSize());
      const visible: SelectedFeature[] = [];

      LAYER_CONFIGS.forEach((cfg) => {
        const layer = layerRefs.current.get(cfg.name);
        if (!layer) return;
        layer
          .getSource()
          ?.getFeaturesInExtent(extent)
          .slice(0, 20)
          .forEach((feature: Feature) => {
            const props = { ...feature.getProperties() };
            delete props.geometry;
            visible.push({ layerName: cfg.name, properties: props });
          });
      });

      onVisibleFeaturesChange(visible);
    };

    map.getView().on("change", updateVisible);
    map.on("moveend", updateVisible);

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  // Re-style when selection changes
  useEffect(() => {
    layerRefs.current.forEach((l) => l.changed());
  }, [selectedFeature]);

  return <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />;
}

function featureKey(layerName: string, feature: FeatureLike): string {
  const p = feature.getProperties();
  const id = p.romnr ?? p.id ?? p.objectid ?? p.navn ?? p.name ?? Math.random();
  return `${layerName}:${id}`;
}
