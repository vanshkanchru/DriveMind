import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Welcome from "./pages/Welcome";

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("drivemind_token");
    const storedUser = localStorage.getItem("drivemind_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("drivemind_token");
    localStorage.removeItem("drivemind_user");
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <Welcome onAuthSuccess={handleAuthSuccess} />;
  }

  return <Dashboard onLogout={handleLogout} user={user} />;
}

export default App;