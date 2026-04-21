import { useEffect, useRef } from "react";
import "ol/ol.css";

import OLMap from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorSource from "ol/source/Vector";
import VectorTileSource from "ol/source/VectorTile";
import OSM from "ol/source/OSM";
import GeoJSON from "ol/format/GeoJSON";
import MVT from "ol/format/MVT";
import { OverviewMap } from "ol/control";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";

import { Fill, Stroke, Style, Circle as CircleStyle } from "ol/style";
import type { FeatureLike } from "ol/Feature";

import type { SelectedFeature } from "./types";

// ─── Layer definitions ────────────────────────────────────────────────────────
// Legg til nye lag ved å appende til LAYER_CONFIGS.
// Asharib: legg til nasjonalparker, verneomrader, turstier her
// Samir: legg til hytter, fjelltopper, badestrander her

type LayerConfig = {
  name: string;
  url: string;
  style: (feature: FeatureLike, hovered: boolean, selected: boolean) => Style;
  zIndex: number;
};

const BASE_URL = import.meta.env.BASE_URL;

const LAYER_CONFIGS: LayerConfig[] = [
  // ── POLYGON-LAG ──────────────────────────────────────────────────────────────

  // Asharib: nasjonalparker.geojson
  {
    name: "Nasjonalparker",
    url: `${BASE_URL}data/nasjonalparker.geojson`,
    zIndex: 10,
    style: (_f, hovered) =>
      new Style({
        stroke: new Stroke({
          color: "#1b4332",
          width: hovered ? 3 : 1.5,
        }),
        fill: new Fill({
          color: hovered ? "rgba(27,67,50,0.35)" : "rgba(27,67,50,0.15)",
        }),
      }),
  },

  // Asharib: verneomrader.geojson
  {
    name: "Verneområder",
    url: `${BASE_URL}data/verneomrader.geojson`,
    zIndex: 11,
    style: (_f, hovered) =>
      new Style({
        stroke: new Stroke({
          color: "#52b788",
          width: hovered ? 2 : 1,
        }),
        fill: new Fill({
          color: hovered ? "rgba(82,183,136,0.25)" : "rgba(82,183,136,0.08)",
        }),
      }),
  },

  // ── LINJE-LAG ────────────────────────────────────────────────────────────────

  // Asharib: turstier.geojson (linestring — viktig for karakterkravet)
  {
    name: "Turstier",
    url: `${BASE_URL}data/turstier.geojson`,
    zIndex: 20,
    style: (_f, hovered) =>
      new Style({
        stroke: new Stroke({
          color: hovered ? "#e76f51" : "#f4a261",
          width: hovered ? 3 : 2,
        }),
      }),
  },

  // ── PUNKT-LAG ────────────────────────────────────────────────────────────────

  // Samir: hytter.geojson
  {
    name: "DNT-hytter",
    url: `${BASE_URL}data/hytter.geojson`,
    zIndex: 30,
    style: (_f, hovered, selected) =>
      new Style({
        image: new CircleStyle({
          radius: selected ? 12 : hovered ? 10 : 8,
          fill: new Fill({ color: "#e76f51" }),
          stroke: new Stroke({ color: "#fff", width: 2 }),
        }),
      }),
  },

  // Samir: fjelltopper.geojson
  {
    name: "Fjelltopper",
    url: `${BASE_URL}data/fjelltopper.geojson`,
    zIndex: 31,
    style: (_f, hovered, selected) =>
      new Style({
        image: new CircleStyle({
          radius: selected ? 10 : hovered ? 8 : 6,
          fill: new Fill({ color: "#264653" }),
          stroke: new Stroke({ color: "#fff", width: 2 }),
        }),
      }),
  },

  // Samir: badestrander.geojson
  {
    name: "Badestrander",
    url: `${BASE_URL}data/badestrander.geojson`,
    zIndex: 32,
    style: (_f, hovered, selected) =>
      new Style({
        image: new CircleStyle({
          radius: selected ? 10 : hovered ? 8 : 6,
          fill: new Fill({ color: "#48cae4" }),
          stroke: new Stroke({ color: "#fff", width: 2 }),
        }),
      }),
  },

  // Lamar (backend): dyreobservasjoner kommer som Vector Tile Layer — legges til separat
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
            selectedFeature?.properties === feature.getProperties();
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
        zoom: 5,
      }),
    });

    // ── Vector Tile-lag for dyreobservasjoner (fra Hono-backend) ──────────────
    // Henter MVT-tiles fra /api/tiles/dyr/{z}/{x}/{y}
    // Vite proxy videresender til localhost:3000 under utvikling
    const dyrLayer = new VectorTileLayer({
      source: new VectorTileSource({
        url: "/api/tiles/dyr/{z}/{x}/{y}",
        format: new MVT(),
      }),
      zIndex: 50,
      style: (feature) => {
        // Farge varierer etter dyregruppe basert på art-feltet
        const art = String(feature.get("art") ?? "");
        let farge = "#95d5b2"; // standard grønn

        if (art.toLowerCase().includes("lupus")) farge = "#e63946"; // ulv → rød
        else if (art.toLowerCase().includes("arctos")) farge = "#f4a261"; // bjørn → oransje
        else if (art.toLowerCase().includes("alces")) farge = "#457b9d"; // elg → blå
        else if (art.toLowerCase().includes("vulpes")) farge = "#e9c46a"; // rev → gul

        return new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({ color: farge }),
            stroke: new Stroke({ color: "#fff", width: 1 }),
          }),
        });
      },
    });

    map.addLayer(dyrLayer);
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

    // Klikk → vis feature-detaljer i sidebar
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

    // Oppdater sidebar med synlige features når kartet flyttes
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
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    layerRefs.current.forEach((l: VectorLayer<VectorSource>) => l.changed());
  }, [selectedFeature]);

  return <div ref={mapDivRef} style={{ position: "absolute", inset: 0 }} />;
}

function featureKey(layerName: string, feature: FeatureLike): string {
  const p = feature.getProperties();
  const id =
    p.id ?? p.objectid ?? p.lokalid ?? p.navn ?? p.name ?? Math.random();
  return `${layerName}:${id}`;
}
