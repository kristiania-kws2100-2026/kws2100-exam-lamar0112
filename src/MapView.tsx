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
  stroke: new Stroke({ color: "#1b4332", width: 2 }),
  fill: new Fill({ color: "rgba(27, 67, 50, 0.25)" }),
});

const turstiStil = new Style({
  stroke: new Stroke({ color: "#e76f00", width: 2.5, lineDash: [6, 4] }),
});

// Hover-stiler — lysere/tykkere versjon av hvert lag
const nasjonalparkHoverStil = new Style({
  stroke: new Stroke({ color: "#1b4332", width: 3 }),
  fill: new Fill({ color: "rgba(27, 67, 50, 0.45)" }),
});

const naturvernHoverStil = new Style({
  stroke: new Stroke({ color: "#2d6a4f", width: 3 }),
  fill: new Fill({ color: "rgba(45, 106, 79, 0.28)" }),
});

const turstiHoverStil = new Style({
  stroke: new Stroke({ color: "#e76f00", width: 4, lineDash: [6, 4] }),
});

// Stiler for punkt-lag
const hytterStil = new Style({
  text: new Text({ text: "🏠", font: "18px sans-serif" }),
});

const hytterHoverStil = new Style({
  text: new Text({ text: "🏠", font: "22px sans-serif" }),
});

const fjelltopperStil = new Style({
  text: new Text({ text: "⛰️", font: "18px sans-serif" }),
});

const fjelltopperHoverStil = new Style({
  text: new Text({ text: "⛰️", font: "22px sans-serif" }),
});

const badestranderStil = new Style({
  text: new Text({ text: "🏖️", font: "18px sans-serif" }),
});

const badestranderHoverStil = new Style({
  text: new Text({ text: "🏖️", font: "22px sans-serif" }),
});

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
  const [hoverInfo, setHoverInfo] = useState<{
    navn: string;
    x: number;
    y: number;
  } | null>(null);

  type PopupInnhold =
    | { type: "dyr"; art: string; antall: number; dato: string | null }
    | { type: "nasjonalpark"; navn?: string | null; areal?: number | null }
    | { type: "verneomrade"; navn?: string | null; vernetype?: string | null }
    | { type: "tursti"; navn?: string | null; lengde?: number | null }
    | {
        type: "hytte";
        navn?: string | null;
        hyttetype?: string | null;
        høyde?: number | null;
      }
    | { type: "fjelltopp"; navn?: string | null; høyde?: number | null }
    | { type: "badestrand"; navn?: string | null; kommune?: string | null };

  const [popup, setPopup] = useState<{
    innhold: PopupInnhold;
    posisjon: { x: number; y: number };
  } | null>(null);

  // useMemo sikrer at VectorSource ikke gjenskapes ved re-render
  const naturvernSource = useMemo(
    () =>
      new VectorSource({
        url: `${BASE}data/verneomrader.geojson`,
        format: new GeoJSON(),
      }),
    [],
  );

  const nasjonalparkSource = useMemo(
    () =>
      new VectorSource({
        url: `${BASE}data/nasjonalparker.geojson`,
        format: new GeoJSON(),
      }),
    [],
  );

  const turstiSource = useMemo(
    () =>
      new VectorSource({
        url: `${BASE}data/turstier.geojson`,
        format: new GeoJSON(),
      }),
    [],
  );

  const hytterSource = useMemo(
    () =>
      new VectorSource({
        url: `${BASE}data/hytter.geojson`,
        format: new GeoJSON(),
      }),
    [],
  );

  const fjelltopperSource = useMemo(
    () =>
      new VectorSource({
        url: `${BASE}data/fjelltopper.geojson`,
        format: new GeoJSON(),
      }),
    [],
  );

  const badestranderSource = useMemo(
    () =>
      new VectorSource({
        url: `${BASE}data/badestrander.geojson`,
        format: new GeoJSON(),
      }),
    [],
  );

  useEffect(() => {
    if (mapRef.current) return;

    const osmLag = new TileLayer({ source: new OSM() });

    // Kartverket topografisk kart (WMTS via XYZ-kilde)
    const kartverketLag = new TileLayer({
      source: new XYZ({
        url: "https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png",
        attributions: "© Kartverket",
      }),
      visible: false,
    });

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
        stroke: new Stroke({ color: "#2d6a4f", width: 2 }),
        fill: new Fill({ color: "rgba(45, 106, 79, 0.1)" }),
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

    const hytterLag = new VectorLayer({
      source: hytterSource,
      style: hytterStil,
    });

    const fjelltopperLag = new VectorLayer({
      source: fjelltopperSource,
      style: fjelltopperStil,
    });

    const badestranderLag = new VectorLayer({
      source: badestranderSource,
      style: badestranderStil,
    });

    clusterLagRef.current = clusterLag;
    vektorTilLagRef.current = vektorTilLag;
    naturvernLagRef.current = naturvernLag;
    nasjonalparkLagRef.current = nasjonalparkLag;
    turstiLagRef.current = turstiLag;
    hytterLagRef.current = hytterLag;
    fjelltopperLagRef.current = fjelltopperLag;
    badestranderLagRef.current = badestranderLag;
    kartverketLagRef.current = kartverketLag;

    const map = new Map({
      target: mapDivRef.current!,
      layers: [
        osmLag,
        kartverketLag,
        naturvernLag,
        nasjonalparkLag,
        turstiLag,
        hytterLag,
        fjelltopperLag,
        badestranderLag,
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

    // Oversiktskart i hjørnet — viser hvor i Norge du er
    const oversiktskart = new OverviewMap({
      collapsed: false,
      layers: [new TileLayer({ source: new OSM() })],
    });
    map.addControl(oversiktskart);

    map.on("click", (e) => {
      const feature = map.forEachFeatureAtPixel(e.pixel, (f) => f);

      if (!feature) {
        setPopup(null);
        return;
      }

      const features = feature.get("features") as FeatureLike[] | undefined;
      const enkelt = features ? features[0] : feature;

      if (!enkelt) return;

      const pos = { x: e.pixel[0], y: e.pixel[1] };
      const tekst = (verdi: unknown): string | null =>
        typeof verdi === "string" && verdi.trim() ? verdi.trim() : null;
      const tall = (verdi: unknown): number | null =>
        typeof verdi === "number" && Number.isFinite(verdi) ? verdi : null;

      // Nasjonalparker — har areal_km2
      if (enkelt.get("areal_km2") !== undefined) {
        setPopup({
          innhold: {
            type: "nasjonalpark",
            navn: tekst(enkelt.get("navn")),
            areal: tall(enkelt.get("areal_km2")),
          },
          posisjon: pos,
        });
        return;
      }

      // Verneområder — har vernetype
      if (enkelt.get("vernetype") !== undefined) {
        setPopup({
          innhold: {
            type: "verneomrade",
            navn: tekst(enkelt.get("navn")),
            vernetype: tekst(enkelt.get("vernetype")),
          },
          posisjon: pos,
        });
        return;
      }

      // Turstier — har lengde_km
      if (enkelt.get("lengde_km") !== undefined) {
        setPopup({
          innhold: {
            type: "tursti",
            navn: tekst(enkelt.get("navn")),
            lengde: tall(enkelt.get("lengde_km")),
          },
          posisjon: pos,
        });
        return;
      }

      // Sjekk hyttetype-prop for DNT-hytter
      if (enkelt.get("type") !== undefined && enkelt.get("høyde_moh") !== undefined) {
        setPopup({
          innhold: {
            type: "hytte",
            navn: tekst(enkelt.get("navn")),
            hyttetype: tekst(enkelt.get("type")),
            høyde: tall(enkelt.get("høyde_moh")),
          },
          posisjon: pos,
        });
        return;
      }

      // Fjelltopper — har høyde_moh men ikke type
      if (enkelt.get("høyde_moh") !== undefined) {
        setPopup({
          innhold: {
            type: "fjelltopp",
            navn: tekst(enkelt.get("navn")),
            høyde: tall(enkelt.get("høyde_moh")),
          },
          posisjon: pos,
        });
        return;
      }

      // Badestrander — har kommune-prop
      if (enkelt.get("kommune") !== undefined) {
        setPopup({
          innhold: {
            type: "badestrand",
            navn: tekst(enkelt.get("navn")),
            kommune: tekst(enkelt.get("kommune")),
          },
          posisjon: pos,
        });
        return;
      }

      // Dyreobservasjoner (cluster eller enkelt)
      setPopup({
        innhold: {
          type: "dyr",
          art: enkelt.get("art") ?? "Ukjent art",
          antall: enkelt.get("antall") ?? 1,
          dato: enkelt.get("observert_dato") ?? null,
        },
        posisjon: pos,
      });
    });

    map.on("pointermove", (e) => {
      // Nullstill forrige hover-feature
      if (hoverFeatureRef.current) {
        hoverFeatureRef.current.setStyle(undefined);
        hoverFeatureRef.current = null;
      }

      const treff = map.forEachFeatureAtPixel(e.pixel, (f) => f, {
        layerFilter: (l) =>
          l === naturvernLag ||
          l === nasjonalparkLag ||
          l === turstiLag ||
          l === hytterLag ||
          l === fjelltopperLag ||
          l === badestranderLag,
      });

      if (treff) {
        const feature = treff as Feature;
        hoverFeatureRef.current = feature;

        if (feature.get("areal_km2") !== undefined) {
          feature.setStyle(nasjonalparkHoverStil);
        } else if (feature.get("vernetype") !== undefined) {
          feature.setStyle(naturvernHoverStil);
        } else if (feature.get("lengde_km") !== undefined) {
          feature.setStyle(turstiHoverStil);
        } else if (feature.get("type") !== undefined) {
          feature.setStyle(hytterHoverStil);
        } else if (feature.get("høyde_moh") !== undefined) {
          feature.setStyle(fjelltopperHoverStil);
        } else if (feature.get("kommune") !== undefined) {
          feature.setStyle(badestranderHoverStil);
        }

        const navn = feature.get("navn") as string | undefined;
        setHoverInfo(
          navn ? { navn, x: e.pixel[0], y: e.pixel[1] } : null,
        );
        map.getViewport().style.cursor = "pointer";
      } else {
        setHoverInfo(null);
        map.getViewport().style.cursor = "";
      }
    });

    // Oppdater listen over synlige fjelltopper når kartet flyttes eller data lastes
    const oppdaterFjelltopper = () => {
      if (!onSynligeFjelltopperEndret) return;
      const size = map.getSize();
      if (!size) return;
      const extent = map.getView().calculateExtent(size);
      const features = fjelltopperSource.getFeaturesInExtent(extent);
      const topper: FjelltoppInfo[] = features
        .map((f) => {
          const geom = f.getGeometry();
          if (!(geom instanceof Point)) return null;
          const [lng, lat] = geom.getCoordinates();
          return {
            navn: (f.get("navn") as string) || "Ukjent",
            høyde: (f.get("høyde_moh") as number) || 0,
            koordinater: [lng, lat] as [number, number],
          };
        })
        .filter((t): t is FjelltoppInfo => t !== null)
        .sort((a, b) => b.høyde - a.høyde);
      onSynligeFjelltopperEndret(topper);
    };

    map.on("moveend", oppdaterFjelltopper);
    fjelltopperSource.on("featuresloadend", oppdaterFjelltopper);

    return () => {
      mapRef.current?.setTarget(undefined);
      mapRef.current = null;
    };
  }, [naturvernSource, nasjonalparkSource, turstiSource, hytterSource, fjelltopperSource, badestranderSource, onSynligeFjelltopperEndret]);

  // Zoom-animasjon når bruker klikker en fjelltopp i sidepanelet
  useEffect(() => {
    if (!zoomMal || !mapRef.current) return;
    const view = mapRef.current.getView();

    if (!zoomMal.erTilbake) {
      sessionStorage.setItem(
        "forrigeVisning",
        JSON.stringify({ senter: view.getCenter(), zoom: view.getZoom() }),
      );
    }

    view.animate({
      center: zoomMal.koordinater,
      zoom: zoomMal.zoom,
      duration: 800,
    });
  }, [zoomMal]);

  useEffect(() => {
    for (const l of lag) {
      if (l.id === "cluster") clusterLagRef.current?.setVisible(l.synlig);
      if (l.id === "vektortil") vektorTilLagRef.current?.setVisible(l.synlig);
      if (l.id === "naturvern") naturvernLagRef.current?.setVisible(l.synlig);
      if (l.id === "nasjonalpark")
        nasjonalparkLagRef.current?.setVisible(l.synlig);
      if (l.id === "tursti") turstiLagRef.current?.setVisible(l.synlig);
      if (l.id === "hytter") hytterLagRef.current?.setVisible(l.synlig);
      if (l.id === "fjelltopper")
        fjelltopperLagRef.current?.setVisible(l.synlig);
      if (l.id === "badestrander")
        badestranderLagRef.current?.setVisible(l.synlig);
      if (l.id === "kartverket") {
        kartverketLagRef.current?.setVisible(l.synlig);
        // OSM skjules når Kartverket er aktiv
        const osmLayers = mapRef.current
          ?.getLayers()
          .getArray()
          .filter((l) => l instanceof TileLayer && l !== kartverketLagRef.current);
        osmLayers?.forEach((osm) => osm.setVisible(!l.synlig));
      }
    }
  }, [lag]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />
      {hoverInfo && (
        <div
          style={{
            position: "absolute",
            left: hoverInfo.x + 12,
            top: hoverInfo.y - 8,
            background: "rgba(0,0,0,0.75)",
            color: "white",
            padding: "4px 8px",
            borderRadius: 4,
            fontSize: 13,
            pointerEvents: "none",
            whiteSpace: "nowrap",
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
