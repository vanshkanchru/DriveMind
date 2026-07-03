import { useEffect } from "react";
import { MapContainer, TileLayer, Circle, Popup, Marker } from "react-leaflet";
import L from "leaflet";

// Fix for default Leaflet marker icon asset URLs in React builds
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom vehicle alert marker icon
const VehicleIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", // fallback or car icon
  iconSize: [30, 45],
  className: "hue-rotate-[240deg] filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" // cyan glow filter
});

// Predefined road segments for DriveMind
const ROAD_SEGMENTS = {
  curve_42: {
    name: "Gateway Curve (Curve-42)",
    center: [18.9220, 72.8340],
    curvature: 0.75,
    speedLimit: 40,
    roadType: "curve"
  },
  highway_101: {
    name: "Marine Drive Express (Highway-101)",
    center: [18.9340, 72.8250],
    curvature: 0.15,
    speedLimit: 80,
    roadType: "highway"
  },
  intersection_alpha: {
    name: "Crawford Intersection (Intersection-Alpha)",
    center: [18.9480, 72.8360],
    curvature: 0.45,
    speedLimit: 50,
    roadType: "intersection"
  }
};

function RiskMap({ activeRoadRisk, latestAlert }) {
  // Inject Leaflet CSS dynamically into document head
  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  // Determine circle color based on segment risk level
  const getRiskColor = (segmentId) => {
    // If the active segment is being monitored and risk is computed
    if (activeRoadRisk && activeRoadRisk.roadSegmentId === segmentId) {
      const level = activeRoadRisk.riskLevel || "low";
      if (level === "critical") return "#ef4444"; // Red
      if (level === "high") return "#f97316";     // Orange
      if (level === "medium") return "#f59e0b";   // Yellow
      return "#10b981";                            // Green
    }

    // Default safe level
    return "#10b981";
  };

  // Find active vehicle position
  let alertCoords = null;
  let alertMsg = "";

  if (latestAlert && ROAD_SEGMENTS[latestAlert.roadSegmentId]) {
    alertCoords = ROAD_SEGMENTS[latestAlert.roadSegmentId].center;
    alertMsg = `Alert: ${latestAlert.message} (${latestAlert.riskLevel} Risk)`;
  }

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-slate-800 shadow-inner relative z-0">
      <MapContainer
        center={[18.9320, 72.8310]} // Mumbai Gateway district center
        zoom={13}
        style={{ width: "100%", height: "100%", background: "#0b1329" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Premium Dark map theme
        />

        {/* Plot Road Segments */}
        {Object.entries(ROAD_SEGMENTS).map(([id, segment]) => (
          <Circle
            key={id}
            center={segment.center}
            pathOptions={{
              color: getRiskColor(id),
              fillColor: getRiskColor(id),
              fillOpacity: 0.25,
              weight: 2
            }}
            radius={250} // 250 meters
          >
            <Popup className="custom-popup">
              <div className="bg-slate-900 text-slate-100 p-2 rounded-md font-sans text-xs min-w-[150px]">
                <h4 className="font-bold text-cyan-400 border-b border-slate-700 pb-1 mb-1.5">{segment.name}</h4>
                <p><strong>Type:</strong> {segment.roadType}</p>
                <p><strong>Speed Limit:</strong> {segment.speedLimit} km/h</p>
                <p><strong>Curvature:</strong> {(segment.curvature * 100).toFixed(0)}%</p>
                {activeRoadRisk && activeRoadRisk.roadSegmentId === id && (
                  <div className="mt-1.5 pt-1 border-t border-slate-700/60 text-slate-200">
                    <p><strong>Avg Risk Score:</strong> {activeRoadRisk.riskScore}</p>
                    <p className="capitalize"><strong>Risk Level:</strong> 
                      <span className={`font-bold ml-1 ${
                        activeRoadRisk.riskLevel === "critical" || activeRoadRisk.riskLevel === "high" 
                          ? "text-red-400" 
                          : "text-emerald-400"
                      }`}>{activeRoadRisk.riskLevel}</span>
                    </p>
                  </div>
                )}
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Live Vehicle Alert Marker */}
        {alertCoords && (
          <Marker position={alertCoords} icon={VehicleIcon}>
            <Popup>
              <div className="text-slate-900 p-1 text-xs">
                <p className="font-bold text-red-600">⚠️ Live Incident Warning</p>
                <p className="mt-1">{alertMsg}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default RiskMap;
