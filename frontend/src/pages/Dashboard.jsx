import { useEffect, useState } from "react";
import {
  getAllExperiences,
  getGraphOverview,
  getHealthStatus,
  getRoadRisk,
  getRiskClusters,
  sendTelemetry
} from "../api/backendApi";
import { socket } from "../socket/socketClient";
import RiskMap from "../components/RiskMap";

const SCENARIOS = {
  speeding: {
    label: "High Speed Hazard",
    telemetry: {
      speed: 85,
      acceleration: 0.5,
      brakePressure: 0.15,
      steeringAngle: 5,
      laneOffset: 0.15,
      distanceToFrontVehicle: 50,
      weather: "clear"
    }
  },
  braking: {
    label: "Sudden Braking / Tailgating",
    telemetry: {
      speed: 65,
      acceleration: -2.3,
      brakePressure: 0.9,
      steeringAngle: 12,
      laneOffset: 0.25,
      distanceToFrontVehicle: 4,
      weather: "rain"
    }
  },
  near_miss: {
    label: "Low Visibility / Near Miss",
    telemetry: {
      speed: 48,
      acceleration: -1.2,
      brakePressure: 0.75,
      steeringAngle: 25,
      laneOffset: 0.55,
      distanceToFrontVehicle: 6,
      weather: "fog"
    }
  }
};

function Dashboard({ onLogout, user }) {
  const [health, setHealth] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [roadRisk, setRoadRisk] = useState(null);
  const [graphRelationships, setGraphRelationships] = useState([]);
  const [riskClusters, setRiskClusters] = useState([]);
  const [latestAlert, setLatestAlert] = useState(null);
  const [telemetryResponse, setTelemetryResponse] = useState(null);

  // Simulator configurations
  const [selectedSegment, setSelectedSegment] = useState("curve_42");
  const [selectedScenario, setSelectedScenario] = useState("braking");
  const [simulating, setSimulating] = useState(false);

  const loadDashboardData = async () => {
    try {
      const healthData = await getHealthStatus();
      const experienceData = await getAllExperiences();
      const riskData = await getRoadRisk(selectedSegment);
      const graphData = await getGraphOverview();
      
      let clusterData = { data: [] };
      try {
        clusterData = await getRiskClusters();
      } catch (err) {
        console.warn("Failed to load Neo4j risk clusters (Neo4j might be unpopulated):", err);
      }

      setHealth(healthData);
      setExperiences(experienceData.data || []);
      setRoadRisk(riskData);
      setGraphRelationships(graphData.data || []);
      setRiskClusters(clusterData.data || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  const handleSendTestTelemetry = async () => {
    setSimulating(true);
    setTelemetryResponse(null);

    const scenarioTelemetry = SCENARIOS[selectedScenario].telemetry;
    const payload = {
      vehicleId: `vehicle_sim_${Math.floor(Math.random() * 1000)}`,
      roadSegmentId: selectedSegment,
      ...scenarioTelemetry
    };

    try {
      const response = await sendTelemetry(payload);
      setTelemetryResponse(response);
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to send telemetry:", error);
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    socket.on("risk-alert", (alert) => {
      setLatestAlert(alert);
    });

    return () => {
      socket.off("risk-alert");
    };
  }, [selectedSegment]); // reload details if segment selection updates

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Dashboard Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800/80 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-cyan-400">DriveMind</h1>
            <p className="text-slate-400 text-sm mt-1">
              Collective Memory Graph & Live Driver Intent Prediction Center
            </p>
          </div>
          <div className="flex items-center space-x-4 bg-slate-900 border border-slate-850 rounded-xl px-4 py-2">
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-semibold">Authorized Admin</p>
              <p className="text-sm text-cyan-200 font-bold">{user?.username || "root"}</p>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-900/60 text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Primary Health & Risk Badges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
            <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Cloud Health Status</h2>
            <p className="mt-2 text-md font-semibold text-slate-200">
              {health ? health.message : "Checking connection..."}
            </p>
            {health && (
              <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-900/50">
                Online
              </span>
            )}
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
            <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Active Road Segment</h2>
            <p className="mt-2 text-md font-semibold text-slate-200 capitalize">
              {selectedSegment.replace("_", " ")}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Risk Index:{" "}
              <span className={`font-bold uppercase ${
                roadRisk?.riskLevel === "critical" || roadRisk?.riskLevel === "high" 
                  ? "text-red-400" 
                  : "text-emerald-400"
              }`}>
                {roadRisk?.riskLevel || "Low"}
              </span>{" "}
              ({roadRisk?.riskScore ?? 0})
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Stored Experience Keys</h2>
              <p className="mt-1 text-3xl font-extrabold text-white">{experiences.length}</p>
            </div>
            <span className="text-[10px] text-slate-500">Document records in MongoDB</span>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Graph Relations</h2>
              <p className="mt-1 text-3xl font-extrabold text-white">{graphRelationships.length}</p>
            </div>
            <span className="text-[10px] text-slate-500">RDF Knowledge Nodes in Neo4j</span>
          </div>
        </div>

        {/* Dynamic Threat Risk Map */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-200">Interactive Risk Map</h3>
              <p className="text-xs text-slate-500">Live monitoring of road segments and vehicle threats</p>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs text-slate-400">Viewing Segment:</label>
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
              >
                <option value="curve_42">Gateway Curve (Curve-42)</option>
                <option value="highway_101">Marine Drive (Highway-101)</option>
                <option value="intersection_alpha">Crawford (Intersection-Alpha)</option>
              </select>
            </div>
          </div>
          <RiskMap activeRoadRisk={roadRisk} latestAlert={latestAlert} />
        </div>

        {/* Control Simulator & Live Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
          
          {/* Simulator Panel */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 md:col-span-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-200 mb-1">Vehicle Telemetry Simulator</h3>
              <p className="text-xs text-slate-500 mb-4">Inject simulated driving events to train AI & log memories</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Target Segment
                  </label>
                  <select
                    value={selectedSegment}
                    onChange={(e) => setSelectedSegment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="curve_42">Gateway Curve (Curve-42)</option>
                    <option value="highway_101">Marine Drive (Highway-101)</option>
                    <option value="intersection_alpha">Crawford (Intersection-Alpha)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Hazard Scenario
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(SCENARIOS).map(([key, item]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedScenario(key)}
                        className={`text-left px-3.5 py-2.5 rounded-xl text-xs border font-medium transition-all cursor-pointer ${
                          selectedScenario === key
                            ? "bg-cyan-500/10 border-cyan-500 text-cyan-300"
                            : "bg-slate-950/45 border-slate-850 text-slate-400 hover:border-slate-800"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={handleSendTestTelemetry}
                disabled={simulating}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center cursor-pointer shadow-lg shadow-cyan-500/5"
              >
                {simulating ? "Transmitting..." : "Send Secure Telemetry"}
              </button>

              {telemetryResponse && (
                <div className="mt-4 bg-slate-950/80 rounded-xl p-3.5 border border-slate-850 max-h-[120px] overflow-auto">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">API Response Payload</p>
                  <pre className="text-[11px] text-cyan-300/90 font-mono">
                    {JSON.stringify({
                      intent: telemetryResponse.data?.intentPrediction?.predictedIntent,
                      confidence: telemetryResponse.data?.intentPrediction?.confidence,
                      riskScore: telemetryResponse.data?.risk?.riskScore,
                      riskLevel: telemetryResponse.data?.risk?.riskLevel,
                      experienceCreated: telemetryResponse.data?.experienceCreated
                    }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Real-time Alerts Panel */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 md:col-span-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-200 mb-1">Live Threat Feed</h3>
              <p className="text-xs text-slate-500 mb-4">Socket.IO real-time ADAS alerts pushed to driver nodes</p>
              
              <div className="space-y-3 min-h-[160px] flex flex-col justify-center">
                {latestAlert ? (
                  <div className="bg-red-950/20 border border-red-800/40 rounded-xl p-4 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                    <div className="flex justify-between items-start">
                      <span className="bg-red-500/10 text-red-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-red-900/40">
                        {latestAlert.riskLevel} ALERT
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">now</span>
                    </div>
                    <p className="font-bold text-slate-200 text-sm mt-3">{latestAlert.message}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                      <div>
                        <p className="text-[10px] uppercase text-slate-500">Predicted Intent</p>
                        <p className="font-semibold text-slate-300 capitalize">{latestAlert.predictedIntent}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-slate-500">Action Required</p>
                        <p className="font-semibold text-amber-400 capitalize">{latestAlert.recommendedAction?.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-4xl block mb-2 opacity-40">📡</span>
                    <p className="text-xs text-slate-500 font-medium">Listening for live hazard warning signals...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3 text-center">
              <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping mr-2"></span>
              <span className="text-xs text-slate-400 font-semibold">Socket Client Connected</span>
            </div>
          </div>

        </div>

        {/* Neo4j Risk Clusters & Relationships */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
          
          {/* Neo4j Risk Clusters */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 md:col-span-5">
            <h3 className="text-lg font-bold text-slate-200 mb-1">Neo4j Shared Risk Clusters</h3>
            <p className="text-xs text-slate-500 mb-4">Traversal insights linking segments sharing hazards</p>

            <div className="space-y-2 max-h-[300px] overflow-auto">
              {riskClusters.length > 0 ? (
                riskClusters.map((cluster, index) => (
                  <div
                    key={index}
                    className="bg-slate-950/70 border border-slate-850 rounded-xl p-3 text-xs flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-slate-200">
                        {cluster.segmentA} ↔ {cluster.segmentB}
                      </p>
                      <p className="text-slate-500 text-[10px] mt-0.5 uppercase tracking-wider font-semibold">
                        Shared hazard: {cluster.sharedRiskType?.replace(/_/g, " ")}
                      </p>
                    </div>
                    <span className="bg-cyan-500/10 border border-cyan-900/50 text-cyan-300 text-[10px] font-bold px-2 py-1 rounded">
                      Strength: {cluster.strength}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                  <p className="text-xs text-slate-600 font-medium">No clusters calculated yet.</p>
                  <p className="text-[10px] text-slate-700 mt-1">Populate segments with identical risks to register links.</p>
                </div>
              )}
            </div>
          </div>

          {/* Collective Graph Memory List */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 md:col-span-7">
            <h3 className="text-lg font-bold text-slate-200 mb-1">Knowledge Relationships</h3>
            <p className="text-xs text-slate-500 mb-4">Graph structure parsed directly from Neo4j memory nodes</p>

            <div className="space-y-3 max-h-[300px] overflow-auto">
              {graphRelationships.length > 0 ? (
                graphRelationships.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-950/70 border border-slate-850 rounded-xl p-3 text-xs"
                  >
                    <p className="font-semibold text-cyan-300">
                      {item.start.labels.join(", ")} → {item.relationship.type} →{" "}
                      {item.end.labels.join(", ")}
                    </p>
                    <p className="text-slate-500 text-[10px] mt-1">
                      Properties: {JSON.stringify(item.start.properties)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                  <p className="text-xs text-slate-600 font-medium">No active graph relations mapped.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Experience Memory Table */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-lg font-bold text-slate-200 mb-1">Experience Memory Ledger</h3>
          <p className="text-xs text-slate-500 mb-4">Archived driving experience logs queried from MongoDB</p>

          <div className="space-y-3 max-h-[350px] overflow-auto">
            {experiences.length > 0 ? (
              experiences.map((experience) => (
                <div
                  key={experience._id}
                  className="bg-slate-950/75 border border-slate-850 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between text-xs gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-200">{experience.vehicleId}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-semibold">
                        {experience.eventType?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-2">
                      Location: <span className="text-slate-300 uppercase font-semibold">{experience.roadSegmentId}</span> | 
                      Weather: <span className="text-slate-300 capitalize">{experience.weather}</span>
                    </p>
                    <p className="text-slate-500 text-[10px] mt-1 font-semibold italic">Reason: {experience.reason}</p>
                  </div>
                  
                  <div className="text-left sm:text-right flex flex-col justify-between">
                    <div>
                      <span className="text-slate-500">Risk Score:</span>{" "}
                      <span className="font-bold text-cyan-300">{experience.riskScore}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-[10px] text-slate-500 block">ADAS Recommended Action</span>
                      <span className="text-amber-400 font-bold capitalize">
                        {experience.recommendedAction?.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                <p className="text-xs text-slate-600 font-medium">No experience memory logged in MongoDB.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;