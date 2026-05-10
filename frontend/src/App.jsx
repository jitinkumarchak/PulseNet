import { useState } from "react";
import Home from "./pages/Home";
import HospitalDashboard from "./pages/HospitalDashboard";
import Login from "./pages/Login";

function App() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Login />;
  }

  const [view, setView] = useState("home"); // "home" or "dashboard"

  return (
    <div>
      <nav style={{ padding: "10px", background: "#eee", marginBottom: "20px" }}>
        <button onClick={() => setView("home")} style={{ marginRight: "10px" }}>
          User Home
        </button>
        <button onClick={() => setView("dashboard")} style={{ marginRight: "10px" }}>
          Hospital Dashboard
        </button>
        <button onClick={() => { localStorage.removeItem("token"); window.location.reload(); }}>
          Logout
        </button>
      </nav>

      {view === "home" ? <Home /> : <HospitalDashboard />}
    </div>
  );
}

export default App;
