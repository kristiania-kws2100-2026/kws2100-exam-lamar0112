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
      {/* Topptekst */}
      <div style={{ padding: "1rem", borderBottom: "1px solid #0f3460" }}>
        <h1 style={{ fontSize: "1.1rem", color: "#52b788" }}>
          🌿 Norsk Natur- og Friluftskart
        </h1>
        <p style={{ fontSize: "0.8rem", color: "#aaa", marginTop: 6 }}>
          Utforsk norske nasjonalparker, turstier, DNT-hytter og mye mer.
          Klikk på et objekt i kartet for å se detaljer.
        </p>
      </div>

      {/* Valgt objekt */}
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
            <strong style={{ color: "#52b788", fontSize: "0.85rem" }}>
              {layerIcon(selectedFeature.layerName)}{" "}
              {selectedFeature.layerName}
            </strong>
            <button
              onClick={onClear}
              title="Lukk"
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
                <span style={{ color: "#aaa" }}>{norskNøkkel(k)}: </span>
                <span style={{ color: "#eee" }}>{String(v)}</span>
              </div>
            ))}
        </div>
      )}

      {/* Liste over synlige objekter */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem" }}>
        <p
          style={{
            fontSize: "0.72rem",
            color: "#aaa",
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          I kartutsnitt ({visibleFeatures.length})
        </p>

        {visibleFeatures.length === 0 && (
          <p style={{ color: "#555", fontSize: "0.82rem", lineHeight: 1.5 }}>
            Ingen objekter vises her ennå. Zoom inn på et område i Norge for å
            se hytter, turstier og naturområder.
          </p>
        )}

        {visibleFeatures.slice(0, 50).map((f, i) => (
          <button
            key={i}
            onClick={() => onFeatureSelect(f)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              background:
                selectedFeature === f
                  ? "#0f3460"
                  : "rgba(255,255,255,0.03)",
              border: "1px solid #0f3460",
              borderRadius: 4,
              padding: "0.4rem 0.6rem",
              marginBottom: 4,
              color: "#eee",
              cursor: "pointer",
              fontSize: "0.78rem",
            }}
          >
            <span style={{ marginRight: 6 }}>{layerIcon(f.layerName)}</span>
            {featureLabel(f)}
          </button>
        ))}
      </div>

      {/* Bunntekst */}
      <div
        style={{
          padding: "0.6rem 1rem",
          borderTop: "1px solid #0f3460",
          fontSize: "0.7rem",
          color: "#444",
        }}
      >
        Data: Kartverket · Artsdatabanken · Geonorge
      </div>
    </aside>
  );
}

function layerIcon(layerName: string): string {
  const icons: Record<string, string> = {
    Nasjonalparker: "🏔️",
    Verneområder: "🌿",
    Turstier: "🥾",
    "DNT-hytter": "🏠",
    Fjelltopper: "⛰️",
    Badestrander: "🏖️",
    Campingplasser: "⛺",
    Dyreobservasjoner: "🐾",
  };
  return icons[layerName] ?? "📍";
}

function featureLabel(f: SelectedFeature): string {
  const p = f.properties;
  return String(
    p.navn ?? p.name ?? p.navn_no ?? p.stedsnavn ?? p.adresse ?? "—",
  ).slice(0, 40);
}

function norskNøkkel(key: string): string {
  const oversettelser: Record<string, string> = {
    navn: "Navn",
    name: "Navn",
    areal: "Areal",
    type: "Type",
    kategori: "Kategori",
    kommune: "Kommune",
    fylke: "Fylke",
    høyde: "Høyde (m)",
    height: "Høyde (m)",
    url: "Nettside",
    beskrivelse: "Beskrivelse",
  };
  return oversettelser[key] ?? key;
}
