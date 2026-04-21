import { useState } from "react";
import MapView from "./MapView";
import Sidebar from "./Sidebar";
import type { SelectedFeature } from "./types";

export default function App() {
  const [selectedFeature, setSelectedFeature] =
    useState<SelectedFeature | null>(null);
  const [visibleFeatures, setVisibleFeatures] = useState<SelectedFeature[]>(
    [],
  );

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <div style={{ flex: 1, position: "relative" }}>
        <MapView
          onFeatureSelect={setSelectedFeature}
          onVisibleFeaturesChange={setVisibleFeatures}
          selectedFeature={selectedFeature}
        />
      </div>
      <Sidebar
        selectedFeature={selectedFeature}
        visibleFeatures={visibleFeatures}
        onFeatureSelect={setSelectedFeature}
        onClear={() => setSelectedFeature(null)}
      />
    </div>
  );
}
