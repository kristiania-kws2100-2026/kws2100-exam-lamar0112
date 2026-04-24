import { useState } from "react";
import MapView from "./MapView";
import Sidebar from "./Sidebar";
import type { FjelltoppInfo, ZoomMal } from "./types";
// Startoppsett for kartlagene i sidepanelet.
// Disse id-ene brukes senere til å slå riktige OpenLayers-lag av og på.
const STARTLAG = [
  { id: "cluster", navn: "Dyreobservasjoner", ikon: "🦌", synlig: true },
  { id: "vektortil", navn: "Detaljerte observasjoner", ikon: "🔬", synlig: true },
  { id: "nasjonalpark", navn: "Nasjonalparker", ikon: "🏔️", synlig: true },
  { id: "naturvern", navn: "Verneområder", ikon: "🌿", synlig: true },
  { id: "tursti", navn: "Turstier", ikon: "🥾", synlig: true },
  { id: "hytter", navn: "DNT-hytter", ikon: "🏠", synlig: true },
  { id: "fjelltopper", navn: "Fjelltopper", ikon: "⛰️", synlig: true },
  { id: "badestrander", navn: "Badestrander", ikon: "🏖️", synlig: true },
  { id: "kartverket", navn: "Kartverket topo", ikon: "🗺️", synlig: false },
];

export default function App() {
  const [lag, setLag] = useState(STARTLAG);
  const [synligeFjelltopper, setSynligeFjelltopper] = useState<FjelltoppInfo[]>([]);
  const [zoomMal, setZoomMal] = useState<ZoomMal | null>(null);
  // Brukes for å vise tilbake-knapp etter at brukeren har zoomet til en fjelltopp.
  const [harTilbake, setHarTilbake] = useState(
    () => !!sessionStorage.getItem("forrigeVisning"),
  );
// Sender et zoom-mål til MapView når brukeren klikker på en fjelltopp i sidepanelet.
  function zoomTilTopp(koordinater: [number, number]) {
    setHarTilbake(true);
    setZoomMal((prev) => ({
      koordinater,
      zoom: 12,
      id: (prev?.id ?? 0) + 1,
      erTilbake: false,
    }));
  }
// Henter forrige kartutsnitt fra sessionStorage, slik at brukeren kan gå tilbake
// etter å ha zoomet inn på en fjelltopp.
  function gaTilbake() {
    const lagret = sessionStorage.getItem("forrigeVisning");
    if (!lagret) return;
    const visning = JSON.parse(lagret) as { senter: [number, number]; zoom: number };
    sessionStorage.removeItem("forrigeVisning");
    setHarTilbake(false);
    setZoomMal((prev) => ({
      koordinater: visning.senter,
      zoom: visning.zoom,
      id: (prev?.id ?? 0) + 1,
      erTilbake: true,
    }));
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <Sidebar
        lag={lag}
        setLag={setLag}
        synligeFjelltopper={synligeFjelltopper}
        onZoomTilTopp={zoomTilTopp}
        onGaTilbake={gaTilbake}
        harTilbake={harTilbake}
      />
      <MapView
        lag={lag}
        onSynligeFjelltopperEndret={setSynligeFjelltopper}
        zoomMal={zoomMal}
      />
    </div>
  );
}
