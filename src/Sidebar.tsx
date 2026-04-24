import { type Dispatch, type SetStateAction } from "react";
import "./sidebar.css";
import type { FjelltoppInfo } from "./types";

interface Lag {
  id: string;
  navn: string;
  ikon: string;
  synlig: boolean;
}

interface SidebarProps {
  lag: Lag[];
  setLag: Dispatch<SetStateAction<Lag[]>>;
  synligeFjelltopper: FjelltoppInfo[];
  onZoomTilTopp: (koordinater: [number, number]) => void;
  onGaTilbake: () => void;
  harTilbake: boolean;
}

export default function Sidebar({
  lag,
  setLag,
  synligeFjelltopper,
  onZoomTilTopp,
  onGaTilbake,
  harTilbake,
}: SidebarProps) {
  // Oppdaterer React-state for kartlagene. MapView bruker samme state til å styre OpenLayers-lagene.
  function toggleLag(id: string) {
    setLag((forrige) =>
      forrige.map((l) => (l.id === id ? { ...l, synlig: !l.synlig } : l)),
    );
  }
// Sidepanelet samler lagkontroll, fjelltoppliste og tegnforklaring i ett brukergrensesnitt.
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>🌲 Norsk Natur- og Friluftskart</h1>
        <p className="undertittel">Dyreliv og friluftsliv i Norge</p>
      </div>

      <div className="sidebar-section">
        <h3>Kartlag</h3>
        {lag.map((l) => (
          <label key={l.id} className="lag-rad">
            <input
              type="checkbox"
              checked={l.synlig}
              onChange={() => toggleLag(l.id)}
            />
            <span>
              {l.ikon} {l.navn}
            </span>
          </label>
        ))}
      </div>

      <div className="sidebar-section">
        <h3>Fjelltopper i kartet</h3>
        {harTilbake && (
          <button className="tilbake-knapp" onClick={onGaTilbake}>
            ← Tilbake til forrige visning
          </button>
        )}
        {synligeFjelltopper.length === 0 ? (
          <p className="ingen-topper">Zoom inn for å se fjelltopper</p>
        ) : (
          <ul className="topp-liste">
            {synligeFjelltopper.map((topp) => (
              <li
                key={`${topp.koordinater[0]}-${topp.koordinater[1]}`}
                className="topp-rad"
                onClick={() => onZoomTilTopp(topp.koordinater)}
              >
                <span className="topp-navn">⛰️ {topp.navn}</span>
                <span className="topp-høyde">{topp.høyde} moh</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="sidebar-section">
        <h3>Forklaring</h3>
        <div className="legende">
          <span className="legende-boks" style={{ background: "rgba(27,67,50,0.6)", border: "2px solid #1b4332" }} />
          Nasjonalpark
        </div>
        <div className="legende">
          <span className="legende-boks" style={{ background: "rgba(45,106,79,0.35)", border: "1.5px solid #2d6a4f" }} />
          Verneområde
        </div>
        <div className="legende">
          <span className="legende-linje" style={{ background: "#e76f00" }} />
          Tursti
        </div>
        <div className="legende">
          <span>🏠</span> DNT-hytte
        </div>
        <div className="legende">
          <span>⛰️</span> Fjelltopp
        </div>
        <div className="legende">
          <span>🏖️</span> Badestrand
        </div>
        <div className="legende">
          <span className="prikk rod" /> 1 dyreobs.
        </div>
        <div className="legende">
          <span className="prikk oransje" /> 2–9 dyreobs.
        </div>
        <div className="legende">
          <span className="prikk gronn" /> 10+ dyreobs.
        </div>
      </div>

      <div className="sidebar-section">
        <p className="info">
          Data: GBIF, Geonorge, Kartverket N50, Miljødirektoratet.<br />
          Klikk på et objekt for å se detaljer.
        </p>
      </div>
    </div>
  );
}
