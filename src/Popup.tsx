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

export default function Popup({ innhold, posisjon, onLukk }: PopupProps) {
  if (!innhold || !posisjon) return null;

  const visTekst = (verdi: unknown, fallback = "Ikke oppgitt"): string => {
    if (typeof verdi === "string" && verdi.trim().length > 0) return verdi.trim();
    return fallback;
  };

  const visTall = (
    verdi: unknown,
    unit: string,
    fallback = "Ikke oppgitt",
  ): string => {
    if (typeof verdi === "number" && Number.isFinite(verdi)) {
      return `${verdi.toLocaleString("no")} ${unit}`;
    }
    return fallback;
  };

  return (
    <div
      style={{
        position: "absolute",
        left: posisjon.x + 12,
        top: posisjon.y - 10,
        background: "white",
        border: "1px solid #ccc",
        borderRadius: "6px",
        padding: "10px 14px",
        fontSize: "13px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        zIndex: 1000,
        minWidth: "160px",
        pointerEvents: "auto",
      }}
    >
      <button
        onClick={onLukk}
        style={{
          position: "absolute",
          top: "4px",
          right: "8px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "14px",
          color: "#999",
        }}
      >
        ✕
      </button>

      {innhold.type === "nasjonalpark" && (
        <>
          <p style={{ margin: "0 0 4px", fontWeight: "bold", color: "#1e3a2f" }}>
            🏔️ {visTekst(innhold.navn, "Ukjent nasjonalpark")}
          </p>
          <p style={{ margin: 0, color: "#555" }}>
            {visTall(innhold.areal, "km²")}
          </p>
        </>
      )}

      {innhold.type === "verneomrade" && (
        <>
          <p style={{ margin: "0 0 4px", fontWeight: "bold", color: "#1e3a2f" }}>
            🌿 {visTekst(innhold.navn, "Ukjent verneområde")}
          </p>
          <p style={{ margin: 0, color: "#555" }}>
            {visTekst(innhold.vernetype)}
          </p>
        </>
      )}

      {innhold.type === "tursti" && (
        <>
          <p style={{ margin: "0 0 4px", fontWeight: "bold", color: "#1e3a2f" }}>
            🥾 {visTekst(innhold.navn, "Ukjent tursti")}
          </p>
          <p style={{ margin: 0, color: "#555" }}>
            {visTall(innhold.lengde, "km")}
          </p>
        </>
      )}

      {innhold.type === "dyr" && (
        <>
          <p style={{ margin: "0 0 4px", fontWeight: "bold", color: "#1e3a2f" }}>
            🦌 {innhold.art}
          </p>
          <p style={{ margin: "0 0 2px", color: "#555" }}>
            Antall: {innhold.antall}
          </p>
          {innhold.dato && (
            <p style={{ margin: 0, color: "#888", fontSize: "12px" }}>
              {innhold.dato}
            </p>
          )}
        </>
      )}

      {innhold.type === "hytte" && (
        <>
          <p style={{ margin: "0 0 4px", fontWeight: "bold", color: "#1e3a2f" }}>
            🏠 {visTekst(innhold.navn, "Ukjent hytte")}
          </p>
          <p style={{ margin: "0 0 2px", color: "#555" }}>
            {visTekst(innhold.hyttetype, "Hyttetype ikke oppgitt")}
          </p>
          <p style={{ margin: 0, color: "#888", fontSize: "12px" }}>
            {visTall(innhold.høyde, "moh")}
          </p>
        </>
      )}

      {innhold.type === "fjelltopp" && (
        <>
          <p style={{ margin: "0 0 4px", fontWeight: "bold", color: "#1e3a2f" }}>
            ⛰️ {visTekst(innhold.navn, "Ukjent fjelltopp")}
          </p>
          <p style={{ margin: 0, color: "#555" }}>
            {visTall(innhold.høyde, "moh")}
          </p>
        </>
      )}

      {innhold.type === "badestrand" && (
        <>
          <p style={{ margin: "0 0 4px", fontWeight: "bold", color: "#1e3a2f" }}>
            🏖️ {visTekst(innhold.navn, "Ukjent badestrand")}
          </p>
          <p style={{ margin: 0, color: "#555" }}>
            {visTekst(innhold.kommune, "Kommune ikke oppgitt")}
          </p>
        </>
      )}
    </div>
  );
}
