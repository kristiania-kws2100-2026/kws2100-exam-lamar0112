import { type Dispatch, type SetStateAction } from "react";
import "./sidebar.css";

interface Lag {
  id: string;
  navn: string;
  ikon: string;
  synlig: boolean;
}

interface SidebarProps {
  lag: Lag[];
  setLag: Dispatch<SetStateAction<Lag[]>>;
}

export default function Sidebar({ lag, setLag }: SidebarProps) {
  function toggleLag(id: string) {
    setLag((forrige) =>
      forrige.map((l) => (l.id === id ? { ...l, synlig: !l.synlig } : l)),
    );
  }

  return (
    <div className="sidebar">
      <h1>🌲 Norsk Naturkart</h1>
      <p className="undertittel">Dyreliv & Natur i Norge</p>

      <hr />

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

      <hr />

      <h3>Forklaring</h3>
      <div className="legende">
        <span className="prikk rod" /> 1 observasjon
      </div>
      <div className="legende">
        <span className="prikk oransje" /> 2–9 observasjoner
      </div>
      <div className="legende">
        <span className="prikk gronn" /> 10+ observasjoner
      </div>

      <hr />

      <p className="info">
        Data fra <strong>GBIF / Artsdatabanken</strong>. Zoom inn for å se
        enkeltobservasjoner.
      </p>
    </div>
  );
}
