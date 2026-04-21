import type { SelectedFeature } from "./types";

type Props = {
  selectedFeature: SelectedFeature | null;
  visibleFeatures: SelectedFeature[];
  onFeatureSelect: (f: SelectedFeature | null) => void;
  onClear: () => void;
};

export default function Sidebar({
  selectedFeature,
  visibleFeatures,
  onFeatureSelect,
  onClear,
}: Props) {
  return (
    <aside
      style={{
        width: 320,
        background: "#16213e",
        borderLeft: "1px solid #0f3460",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "1rem", borderBottom: "1px solid #0f3460" }}>
        <h1 style={{ fontSize: "1.1rem", color: "#e94560" }}>
          Norsk Beredskapsatlas
        </h1>
        <p style={{ fontSize: "0.75rem", color: "#aaa", marginTop: 4 }}>
          Klikk på et objekt i kartet for detaljer
        </p>
      </div>

      {selectedFeature && (
        <div
          style={{
            padding: "1rem",
            borderBottom: "1px solid #0f3460",
            background: "#0f3460",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <strong style={{ color: "#e94560", fontSize: "0.85rem" }}>
              {selectedFeature.layerName}
            </strong>
            <button
              onClick={onClear}
              style={{
                background: "none",
                border: "none",
                color: "#aaa",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              ✕
            </button>
          </div>
          {Object.entries(selectedFeature.properties)
            .filter(([, v]) => v !== null && v !== undefined && v !== "")
            .slice(0, 8)
            .map(([k, v]) => (
              <div key={k} style={{ fontSize: "0.8rem", marginBottom: 4 }}>
                <span style={{ color: "#aaa" }}>{k}: </span>
                <span>{String(v)}</span>
              </div>
            ))}
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem" }}>
        <p
          style={{
            fontSize: "0.75rem",
            color: "#aaa",
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Synlige objekter ({visibleFeatures.length})
        </p>
        {visibleFeatures.slice(0, 50).map((f, i) => (
          <button
            key={i}
            onClick={() => onFeatureSelect(f)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              background:
                selectedFeature === f ? "#0f3460" : "rgba(255,255,255,0.03)",
              border: "1px solid #0f3460",
              borderRadius: 4,
              padding: "0.4rem 0.6rem",
              marginBottom: 4,
              color: "#eee",
              cursor: "pointer",
              fontSize: "0.78rem",
            }}
          >
            <span style={{ color: "#e94560", marginRight: 6 }}>
              {layerIcon(f.layerName)}
            </span>
            {featureLabel(f)}
          </button>
        ))}
        {visibleFeatures.length === 0 && (
          <p style={{ color: "#555", fontSize: "0.78rem" }}>
            Ingen objekter i gjeldende kartutsnitt.
          </p>
        )}
      </div>
    </aside>
  );
}

function layerIcon(layerName: string): string {
  const icons: Record<string, string> = {
    Tilfluktsrom: "🛡️",
    Sykehus: "🏥",
    Brannstasjon: "🚒",
    AED: "❤️",
    Politistasjon: "🚔",
    Kommune: "🗺️",
    Fylke: "🗺️",
  };
  return icons[layerName] ?? "📍";
}

function featureLabel(f: SelectedFeature): string {
  const p = f.properties;
  return (
    String(p.navn ?? p.name ?? p.adresse ?? p.kommunenavn ?? p.fylkesnavn ?? p.romnr ?? "—")
      .slice(0, 40)
  );
}
