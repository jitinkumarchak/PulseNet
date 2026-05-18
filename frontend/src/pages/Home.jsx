import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertCircle, FiActivity, FiClock, FiMapPin } from "react-icons/fi";
import toast from "react-hot-toast";
import API from "../services/api";
import socket from "../services/socket";
import HospitalMap from "../components/maps/HospitalMap";

function Home() {

  const [hospitals, setHospitals] = useState([]);
  const [bestHospital, setBestHospital] = useState(null);
  const [isFinding, setIsFinding] = useState(false);

  const fetchHospitals = useCallback(async () => {
    try {
      const res = await API.get("/hospital/nearby?lat=28.6&lng=77.2");
      setHospitals(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch nearby hospitals");
    }
  }, []);

  useEffect(() => {
    // avoid calling setState synchronously within the effect
    const id = setTimeout(() => void fetchHospitals(), 0);
    return () => clearTimeout(id);
  }, [fetchHospitals]);

  useEffect(() => {
    // 🔥 REAL-TIME LISTENER
    socket.on("resourcesUpdated", (updatedHospital) => {
      setHospitals((prev) =>
        prev.map((h) => (h._id === updatedHospital._id ? updatedHospital : h)),
      );
    });

    const token = localStorage.getItem("token");

    if (!token) return;

    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.id;

    socket.on("connect", () => {
      socket.emit("joinUser", userId);
    });

    socket.on("userRequestUpdated", (updatedReq) => {
      console.log("User received update:", updatedReq);
      toast(`Your request is ${updatedReq.status}`, {
        icon: updatedReq.status === 'Approved' ? '✅' : '🔔',
        style: {
          borderRadius: '12px',
          background: '#1e293b',
          color: '#fff',
        },
      });
    });

    return () => {
      socket.off("connect");
      socket.off("userRequestUpdated");
    };
  }, []);

  const findBest = async () => {
    setIsFinding(true);
    try {
      const res = await API.get("/hospital/best?lat=28.6&lng=77.2&type=ICU");
      if (!res.data) {
        toast.error("No suitable hospital found nearby");
        return;
      }
      setBestHospital(res.data);
      toast.success("Found the best hospital for ICU!");
    } catch (err) {
      console.error("ERROR:", err.response?.data || err.message);
      toast.error("Failed to find best hospital");
    } finally {
      setIsFinding(false);
    }
  };

  const requestBed = async (hospitalId) => {
    const loadingToast = toast.loading("Requesting ICU bed...");
    try {
      await API.post("/request/create", {
        userName: "Jitin",
        hospitalId,
        type: "ICU",
      });
      toast.success("Request sent successfully!", { id: loadingToast });
    } catch (err) {
      toast.error("Failed to send request", { id: loadingToast });
    }
  };

  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position.coords.latitude);
    console.log(position.coords.longitude);
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/[0.02] border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
              <FiActivity className="text-cyan-400" />
              Emergency Dashboard
            </h1>
            <p className="text-slate-400 mt-2 font-medium text-sm sm:text-base">Real-time ICU & Bed availability monitoring near your location.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={findBest}
            disabled={isFinding}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white rounded-2xl font-bold shadow-[0_0_30px_rgba(239,68,68,0.3)] flex items-center justify-center gap-3 transition-all disabled:opacity-70 group"
          >
            {isFinding ? (
              <div className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"></div>
            ) : (
              <FiAlertCircle className="text-2xl group-hover:animate-pulse" />
            )}
            <span className="text-lg tracking-wide">{isFinding ? 'Searching...' : 'Find Emergency Hospital'}</span>
          </motion.button>
        </motion.div>

        {/* Featured Best Hospital */}
        <AnimatePresence>
          {bestHospital && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, scale: 0.95, height: 0 }}
              className="bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-red-400 font-bold mb-3 text-sm tracking-widest">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    RECOMMENDED FOR EMERGENCY
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">{bestHospital.name}</h2>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="bg-red-500/20 text-red-300 px-4 py-2 rounded-xl border border-red-500/20 font-bold flex items-center gap-2">
                      <FiActivity /> {bestHospital.resources.icuBeds.available} ICU Beds
                    </span>
                    <span className="bg-white/5 text-slate-300 px-4 py-2 rounded-xl border border-white/10 font-medium">
                      {bestHospital.resources.generalBeds.available} General Beds
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => requestBed(bestHospital._id)}
                  className="w-full md:w-auto px-8 py-4 bg-red-500 hover:bg-red-400 text-white rounded-xl font-bold shadow-lg transition-colors whitespace-nowrap"
                >
                  Request ICU Bed
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Hospitals List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-4"
          >
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-slate-200">
              <FiMapPin className="text-cyan-400" /> Nearby Hospitals
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {hospitals.map((h, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={h._id}
                  className="bg-white/[0.03] border border-white/5 hover:border-cyan-500/30 p-5 rounded-2xl backdrop-blur-sm transition-all group"
                >
                  <h3 className="text-lg font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors line-clamp-1">{h.name}</h3>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-[#020617]/50 border border-white/5 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-cyan-400">{h.resources.icuBeds.available}</div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-1">ICU Beds</div>
                    </div>
                    <div className="bg-[#020617]/50 border border-white/5 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-blue-400">{h.resources.generalBeds.available}</div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-1">General</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                      <FiClock /> {new Date(h.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <button
                      onClick={() => requestBed(h._id)}
                      className="text-sm font-semibold bg-white/5 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-cyan-500/30"
                    >
                      Request Bed
                    </button>
                  </div>
                </motion.div>
              ))}
              {hospitals.length === 0 && (
                <div className="text-center p-8 border border-dashed border-white/10 rounded-2xl text-slate-500 font-medium">
                  No hospitals found nearby.
                </div>
              )}
            </div>
          </motion.div>

          {/* Map Section */}

          <div className="mb-6">

            <h1 className="text-4xl font-bold">
              Nearby Hospitals
            </h1>

            <p className="text-slate-400 mt-2">
              Real-time hospital availability and emergency response.
            </p>

          </div>
          <HospitalMap
            hospitals={hospitals}
            requestBed={requestBed}
          />
        </div>

      </div>
    </div>
  );
}

export default Home;
