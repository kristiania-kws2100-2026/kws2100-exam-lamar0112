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
      <h1>🌲 Norsk Natur- og Friluftskart</h1>
      <p className="undertittel">Dyreliv og friluftsliv i Norge</p>

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
        <span className="legende-boks" style={{ background: "#1b4332", border: "1px solid #1b4332" }} />
        Nasjonalpark (polygon)
      </div>
      <div className="legende">
        <span className="legende-boks" style={{ background: "rgba(45,106,79,0.4)", border: "1px solid #2d6a4f" }} />
        Verneområde (polygon)
      </div>
      <div className="legende">
        <span className="legende-linje" style={{ background: "#e76f00" }} />
        Tursti (linje)
      </div>
      <div className="legende">
        <span className="prikk" style={{ background: "#2f2f2f" }} /> DNT-hytte (punkt)
      </div>
      <div className="legende">
        <span className="prikk" style={{ background: "#4b4b4b" }} /> Fjelltopp (punkt)
      </div>
      <div className="legende">
        <span className="prikk" style={{ background: "#777" }} /> Badestrand (punkt)
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

      <hr />

      <p className="info">
        Data: GBIF, Geonorge, Kartverket N50.
        Klikk på et objekt for å se info.
      </p>
    </div>
  );
}
