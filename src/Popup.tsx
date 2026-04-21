interface PopupProps {
  innhold: { art: string; antall: number; dato: string | null } | null;
  posisjon: { x: number; y: number } | null;
  onLukk: () => void;
}

export default function Popup({ innhold, posisjon, onLukk }: PopupProps) {
  if (!innhold || !posisjon) return null;

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
    </div>
  );
}
