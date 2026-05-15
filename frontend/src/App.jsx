import { useState } from "react";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import HospitalDashboard from "./pages/HospitalDashboard";
import Login from "./pages/Login";

function App() {
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <>
        <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
        <Login />
      </>
    );
  }

  const [view, setView] = useState("home"); // "home" or "dashboard"

  return (
    <div>
      <nav className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-lg border-b border-white/10 px-6 py-4 flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="text-white text-xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">PulseNet</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView("home")} 
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${view === 'home' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            User Home
          </button>
          <button 
            onClick={() => setView("dashboard")} 
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${view === 'dashboard' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            Hospital Dashboard
          </button>
          <button 
            onClick={() => { localStorage.removeItem("token"); window.location.reload(); }}
            className="ml-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-sm font-semibold transition-colors border border-red-500/20"
          >
            Logout
          </button>
        </div>
      </nav>

      {view === "home" ? <Home /> : <HospitalDashboard />}
    </div>
  );
}

export default App;
