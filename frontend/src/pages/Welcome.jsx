import { useState } from "react";
import { loginUser, registerUser } from "../api/backendApi";

function Welcome({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        const data = await registerUser(username, password);
        if (data.success) {
          localStorage.setItem("drivemind_token", data.token);
          localStorage.setItem("drivemind_user", JSON.stringify(data.user));
          onAuthSuccess(data.token, data.user);
        } else {
          setError(data.message || "Registration failed");
        }
      } else {
        const data = await loginUser(username, password);
        if (data.success) {
          localStorage.setItem("drivemind_token", data.token);
          localStorage.setItem("drivemind_user", JSON.stringify(data.user));
          onAuthSuccess(data.token, data.user);
        } else {
          setError(data.message || "Invalid credentials");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-900/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-950/35 blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-10">
        
        {/* Pitch / Information Section */}
        <div className="md:col-span-7 flex flex-col justify-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-cyan-950/60 border border-cyan-800/40 rounded-full px-3 py-1 text-cyan-400 text-sm font-semibold self-start shadow-sm">
            <span>✨</span>
            <span>Tata Smart Mobility Pitch</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-200 to-white bg-clip-text text-transparent">
            DriveMind
          </h1>
          <p className="text-2xl font-light text-slate-300">
            Collective Memory and Intent Prediction for Intelligent Vehicles
          </p>

          <p className="text-slate-400 leading-relaxed max-w-lg">
            Standard connected vehicles only share raw telemetry and video streams. 
            <strong> DriveMind</strong> is a paradigm shift—it converts raw driving parameters into structured experiences, building a shared, crowdsourced graph database for traffic hazard awareness and proactive ADAS intent safety.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 max-w-lg">
            <div className="flex items-start space-x-3 bg-slate-900/40 border border-slate-800 rounded-xl p-3 shadow-inner">
              <span className="text-2xl text-cyan-400">🧠</span>
              <div>
                <h4 className="font-semibold text-slate-200 text-sm">Experience vs Data</h4>
                <p className="text-xs text-slate-400 mt-0.5">Saves experiences in bytes, saving bandwidth compared to camera streams.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-slate-900/40 border border-slate-800 rounded-xl p-3 shadow-inner">
              <span className="text-2xl text-indigo-400">🔮</span>
              <div>
                <h4 className="font-semibold text-slate-200 text-sm">Intent Prediction</h4>
                <p className="text-xs text-slate-400 mt-0.5">Scikit-Learn AI predicts lane shifts and braking before they happen.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-slate-900/40 border border-slate-800 rounded-xl p-3 shadow-inner">
              <span className="text-2xl text-violet-400">🕸️</span>
              <div>
                <h4 className="font-semibold text-slate-200 text-sm">Collective Graph</h4>
                <p className="text-xs text-slate-400 mt-0.5">Neo4j aggregates risk nodes to map segment similarities and hazards.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-slate-900/40 border border-slate-800 rounded-xl p-3 shadow-inner">
              <span className="text-2xl text-emerald-400">🗺️</span>
              <div>
                <h4 className="font-semibold text-slate-200 text-sm">Leaflet Integration</h4>
                <p className="text-xs text-slate-400 mt-0.5">Interactive live map visualizes active threats and segment statuses.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth / Login Panel */}
        <div className="md:col-span-5 w-full">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
            <h3 className="text-2xl font-bold text-slate-100 mb-2">
              {isRegister ? "Create Admin Account" : "Admin Login Portal"}
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              {isRegister ? "Sign up to view memory maps and telemetry." : "Authenticate to access the DriveMind Control Center."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin_operator"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg p-2.5">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition-all duration-200 transform hover:scale-[1.01] flex items-center justify-center cursor-pointer shadow-lg shadow-cyan-500/10"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : isRegister ? (
                  "Register Admin"
                ) : (
                  "Access Dashboard"
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                  setUsername("");
                  setPassword("");
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
              >
                {isRegister
                  ? "Already have an account? Log In"
                  : "Need an account? Register Here"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Welcome;
