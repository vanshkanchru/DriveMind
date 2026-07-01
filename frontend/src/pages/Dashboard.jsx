import { useEffect, useState } from "react";
import {
  getAllExperiences,
  getHealthStatus,
  getRoadRisk,
  sendTelemetry
} from "../api/backendApi";
import { socket } from "../socket/socketClient";

const sampleTelemetry = {
  vehicleId: "vehicle_dashboard_test",
  roadSegmentId: "curve_42",
  speed: 75,
  acceleration: -1.8,
  brakePressure: 0.85,
  steeringAngle: 24,
  laneOffset: 0.45,
  distanceToFrontVehicle: 6,
  weather: "rain"
};

function Dashboard() {
  const [health, setHealth] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [roadRisk, setRoadRisk] = useState(null);
  const [latestAlert, setLatestAlert] = useState(null);
  const [telemetryResponse, setTelemetryResponse] = useState(null);

  const loadDashboardData = async () => {
    try {
      const healthData = await getHealthStatus();
      const experienceData = await getAllExperiences();
      const riskData = await getRoadRisk("curve_42");

      setHealth(healthData);
      setExperiences(experienceData.data || []);
      setRoadRisk(riskData);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  const handleSendTestTelemetry = async () => {
    try {
      const response = await sendTelemetry(sampleTelemetry);
      setTelemetryResponse(response);
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to send telemetry:", error);
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
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">DriveMind</h1>
          <p className="text-slate-300 mt-2">
            Collective vehicle memory, intent prediction, and realtime risk alerts.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-cyan-300">Backend Health</h2>
            <p className="mt-2 text-slate-300">
              {health ? health.message : "Loading..."}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-cyan-300">Road Risk</h2>
            <p className="mt-2 text-slate-300">
              Segment: {roadRisk?.roadSegmentId || "curve_42"}
            </p>
            <p className="text-slate-300">
              Level:{" "}
              <span className="font-bold text-red-400">
                {roadRisk?.riskLevel || "Loading..."}
              </span>
            </p>
            <p className="text-slate-300">
              Score: {roadRisk?.riskScore ?? "Loading..."}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-cyan-300">Experience Count</h2>
            <p className="mt-2 text-3xl font-bold">{experiences.length}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-6">
          <h2 className="text-xl font-semibold text-cyan-300 mb-3">
            Send Test Telemetry
          </h2>
          <button
            onClick={handleSendTestTelemetry}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-lg"
          >
            Send Risky Vehicle Telemetry
          </button>

          {telemetryResponse && (
            <div className="mt-4 bg-slate-950 rounded-lg p-4 overflow-auto">
              <pre className="text-sm text-slate-300">
                {JSON.stringify(telemetryResponse.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-6">
          <h2 className="text-xl font-semibold text-cyan-300 mb-3">
            Latest Realtime Risk Alert
          </h2>

          {latestAlert ? (
            <div className="bg-red-950 border border-red-700 rounded-lg p-4">
              <p className="font-bold text-red-300">{latestAlert.message}</p>
              <p className="text-slate-300 mt-2">
                Predicted Intent: {latestAlert.predictedIntent}
              </p>
              <p className="text-slate-300">
                Risk Level: {latestAlert.riskLevel}
              </p>
            </div>
          ) : (
            <p className="text-slate-400">No realtime alert received yet.</p>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
          <h2 className="text-xl font-semibold text-cyan-300 mb-3">
            Experience Memory
          </h2>

          <div className="space-y-3">
            {experiences.map((experience) => (
              <div
                key={experience._id}
                className="bg-slate-950 border border-slate-800 rounded-lg p-3"
              >
                <p className="font-semibold">
                  {experience.vehicleId} → {experience.eventType}
                </p>
                <p className="text-slate-400">
                  Road: {experience.roadSegmentId} | Weather: {experience.weather}
                </p>
                <p className="text-slate-400">
                  Risk Score: {experience.riskScore} | Confidence:{" "}
                  {experience.confidence}
                </p>
                <p className="text-slate-400">
                  Action: {experience.recommendedAction}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;