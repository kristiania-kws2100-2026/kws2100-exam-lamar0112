import { useState } from "react";
import MapView from "./MapView";
import Sidebar from "./Sidebar";

const STARTLAG = [
  {
    id: "cluster",
    navn: "Dyreobservasjoner",
    ikon: "🦌",
    synlig: true,
  },
  {
    id: "vektortil",
    navn: "Detaljerte observasjoner",
    ikon: "🔬",
    synlig: true,
  },
  {
    id: "nasjonalpark",
    navn: "Nasjonalparker",
    ikon: "🏔️",
    synlig: true,
  },
  {
    id: "naturvern",
    navn: "Verneområder",
    ikon: "🌿",
    synlig: true,
  },
  {
    id: "tursti",
    navn: "Turstier",
    ikon: "🥾",
    synlig: true,
  },
  {
    id: "hytter",
    navn: "DNT-hytter",
    ikon: "🏠",
    synlig: true,
  },
];

export default function App() {
  const [lag, setLag] = useState(STARTLAG);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <Sidebar lag={lag} setLag={setLag} />
      <MapView lag={lag} />
    </div>
  );
}
