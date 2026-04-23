import "./popup.css";

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

interface PopupProps {
  innhold: PopupInnhold | null;
  posisjon: { x: number; y: number } | null;
  onLukk: () => void;
}

const visTekst = (verdi: unknown, fallback = "Ikke oppgitt"): string => {
  if (typeof verdi === "string" && verdi.trim().length > 0) return verdi.trim();
  return fallback;
};

const visTall = (verdi: unknown, unit: string, fallback = "Ikke oppgitt"): string => {
  if (typeof verdi === "number" && Number.isFinite(verdi)) {
    return `${verdi.toLocaleString("no")} ${unit}`;
  }
  return fallback;
};

export default function Popup({ innhold, posisjon, onLukk }: PopupProps) {
  if (!innhold || !posisjon) return null;

  return (
    <div
      className={`popup-kort ${innhold.type}`}
      style={{ left: posisjon.x + 14, top: posisjon.y - 14 }}
    >
      <button className="popup-lukk" onClick={onLukk}>✕</button>

      {innhold.type === "nasjonalpark" && (
        <>
          <p className="popup-tittel">🏔️ {visTekst(innhold.navn, "Ukjent nasjonalpark")}</p>
          <p className="popup-info">{visTall(innhold.areal, "km²")}</p>
          <span className="popup-badge" style={{ background: "#e8f5e9", color: "#1b4332" }}>Nasjonalpark</span>
        </>
      )}

      {innhold.type === "verneomrade" && (
        <>
          <p className="popup-tittel">🌿 {visTekst(innhold.navn, "Ukjent verneområde")}</p>
          <p className="popup-info">{visTekst(innhold.vernetype)}</p>
          <span className="popup-badge" style={{ background: "#f1f8e9", color: "#2d6a4f" }}>Verneområde</span>
        </>
      )}

      {innhold.type === "tursti" && (
        <>
          <p className="popup-tittel">🥾 {visTekst(innhold.navn, "Ukjent tursti")}</p>
          <p className="popup-info">{visTall(innhold.lengde, "km")}</p>
          <span className="popup-badge" style={{ background: "#fff3e0", color: "#e76f00" }}>Tursti</span>
        </>
      )}

      {innhold.type === "dyr" && (
        <>
          <p className="popup-tittel">🦌 {innhold.art}</p>
          <p className="popup-info">Antall: {innhold.antall}</p>
          {innhold.dato && <p className="popup-detalj">{innhold.dato}</p>}
          <span className="popup-badge" style={{ background: "#e8f5e9", color: "#228b22" }}>Dyreobservasjon</span>
        </>
      )}

      {innhold.type === "hytte" && (
        <>
          <p className="popup-tittel">🏠 {visTekst(innhold.navn, "Ukjent hytte")}</p>
          <p className="popup-info">{visTekst(innhold.hyttetype, "Hyttetype ikke oppgitt")}</p>
          <p className="popup-detalj">{visTall(innhold.høyde, "moh")}</p>
          <span className="popup-badge" style={{ background: "#efebe9", color: "#8B4513" }}>DNT-hytte</span>
        </>
      )}

      {innhold.type === "fjelltopp" && (
        <>
          <p className="popup-tittel">⛰️ {visTekst(innhold.navn, "Ukjent fjelltopp")}</p>
          <p className="popup-info">{visTall(innhold.høyde, "moh")}</p>
          <span className="popup-badge" style={{ background: "#eceff1", color: "#37474f" }}>Fjelltopp</span>
        </>
      )}

      {innhold.type === "badestrand" && (
        <>
          <p className="popup-tittel">🏖️ {visTekst(innhold.navn, "Ukjent badestrand")}</p>
          <p className="popup-info">{visTekst(innhold.kommune, "Kommune ikke oppgitt")}</p>
          <span className="popup-badge" style={{ background: "#e1f5fe", color: "#0288d1" }}>Badestrand</span>
        </>
      )}
    </div>
  );
}
