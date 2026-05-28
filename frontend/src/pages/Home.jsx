import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertCircle, FiActivity, FiClock, FiMapPin, FiHeart, FiTrendingUp, FiUsers, FiZap } from "react-icons/fi";
import toast from "react-hot-toast";
import API from "../services/api";
import socket from "../services/socket";
import HospitalMap from "../components/maps/HospitalMap";

/* ─── Stat Card ─────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, accent = "#22d3ee", sub }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          opacity: 0.6,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
          {label}
        </span>
        <Icon style={{ color: accent, opacity: 0.7 }} size={16} />
      </div>
      <div style={{ fontSize: "32px", fontWeight: 700, color: "#f1f5f9", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: "12px", color: "#475569" }}>{sub}</div>
      )}
    </div>
  );
}

/* ─── Hospital Card ─────────────────────────────────────────────────────── */
function HospitalCard({ h, index, onRequest }) {
  const icuPct = h.resources.icuBeds.available / (h.resources.icuBeds.total || 10);
  const genPct = h.resources.generalBeds.available / (h.resources.generalBeds.total || 50);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "16px",
        padding: "20px",
        cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s",
      }}
      whileHover={{ borderColor: "rgba(34,211,238,0.25)", backgroundColor: "rgba(34,211,238,0.03)" }}
    >
      {/* Hospital name + status dot */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px", gap: "8px" }}>
        <h3 style={{
          fontSize: "15px", fontWeight: 700, color: "#e2e8f0", margin: 0,
          fontFamily: "'Syne', sans-serif", lineHeight: 1.3,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {h.name}
        </h3>
        <span style={{
          flexShrink: 0, width: "8px", height: "8px", borderRadius: "50%",
          background: h.resources.icuBeds.available > 0 ? "#22c55e" : "#ef4444",
          boxShadow: `0 0 8px ${h.resources.icuBeds.available > 0 ? "#22c55e" : "#ef4444"}`,
          marginTop: "5px",
        }} />
      </div>

      {/* Bed stats with inline bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
        <BedBar label="ICU" available={h.resources.icuBeds.available} pct={icuPct} color="#22d3ee" />
        <BedBar label="General" available={h.resources.generalBeds.available} pct={genPct} color="#818cf8" />
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "11px", color: "#475569", display: "flex", alignItems: "center", gap: "4px", fontFamily: "'DM Mono', monospace" }}>
          <FiClock size={10} />
          {new Date(h.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
        <button
          onClick={() => onRequest(h._id)}
          style={{
            fontSize: "12px", fontWeight: 600, color: "#22d3ee",
            background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)",
            borderRadius: "8px", padding: "6px 14px", cursor: "pointer",
            transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={e => { e.target.style.background = "rgba(34,211,238,0.15)"; e.target.style.borderColor = "rgba(34,211,238,0.4)"; }}
          onMouseLeave={e => { e.target.style.background = "rgba(34,211,238,0.08)"; e.target.style.borderColor = "rgba(34,211,238,0.2)"; }}
        >
          Request Bed
        </button>
      </div>
    </motion.div>
  );
}

function BedBar({ label, available, pct, color }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>{label}</span>
        <span style={{ fontSize: "12px", color: color, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{available}</span>
      </div>
      <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct * 100, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ height: "100%", background: color, borderRadius: "2px", opacity: 0.8 }}
        />
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
function Home() {
  const [hospitals, setHospitals] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
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

  const fetchAmbulances = useCallback(async () => {
    try {
      const res = await API.get("/ambulance");
      setAmbulances(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch ambulances");
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => void fetchHospitals(), void fetchAmbulances(), 0);
    return () => clearTimeout(id);
  }, [fetchHospitals, fetchAmbulances]);

  useEffect(() => {
    socket.on("resourcesUpdated", (updatedHospital) => {
      setHospitals((prev) =>
        prev.map((h) => (h._id === updatedHospital._id ? updatedHospital : h))
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
        icon: updatedReq.status === "Approved" ? "✅" : "🔔",
        style: { borderRadius: "12px", background: "#0f172a", color: "#f1f5f9", border: "1px solid rgba(255,255,255,0.1)" },
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
      toast.success("Best hospital found for ICU!");
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
      await API.post("/request/create", { userName: "Jitin", hospitalId, type: "ICU" });
      toast.success("Request sent successfully!", { id: loadingToast });
    } catch (err) {
      toast.error("Failed to send request", { id: loadingToast });
    }
  };

  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position.coords.latitude);
    console.log(position.coords.longitude);
  });

  // Derived stats (dummy values for unconnected data)
  const totalICU = hospitals.reduce((s, h) => s + (h.resources?.icuBeds?.available || 0), 0);
  const totalGeneral = hospitals.reduce((s, h) => s + (h.resources?.generalBeds?.available || 0), 0);
  const activeAmbulances = ambulances.filter(a => a.status === "active").length || ambulances.length || 4;

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');

        * { box-sizing: border-box; }

        .pn-root {
          min-height: 100vh;
          background: #020b18;
          color: #e2e8f0;
          font-family: 'DM Sans', sans-serif;
          padding: 0;
          position: relative;
          overflow-x: hidden;
        }

        /* Ambient background glows */
        .pn-root::before {
          content: '';
          position: fixed;
          top: -200px; left: -200px;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .pn-root::after {
          content: '';
          position: fixed;
          bottom: -200px; right: -100px;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .pn-inner {
          position: relative;
          z-index: 1;
          max-width: 1360px;
          margin: 0 auto;
          padding: 32px 24px 64px;
        }

        /* Scrollbar */
        .pn-scroll::-webkit-scrollbar { width: 4px; }
        .pn-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        .pn-scroll::-webkit-scrollbar-track { background: transparent; }

        /* Pulse animation */
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .pulse-ring::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid #ef4444;
          animation: pulse-ring 1.6s ease-out infinite;
        }
      `}</style>

      <div className="pn-root">
        <div className="pn-inner">

          {/* ── Top Nav Bar ── */}
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "40px", paddingBottom: "24px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "linear-gradient(135deg, #0e7490, #1d4ed8)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FiActivity size={18} color="#fff" />
              </div>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "20px", letterSpacing: "-0.02em", color: "#f1f5f9" }}>
                PulseNet
              </span>
              <span style={{
                fontSize: "11px", fontWeight: 600, color: "#22d3ee", letterSpacing: "0.1em",
                background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)",
                borderRadius: "6px", padding: "2px 8px", fontFamily: "'DM Mono', monospace",
              }}>
                LIVE
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <span style={{ fontSize: "13px", color: "#475569", fontFamily: "'DM Mono', monospace" }}>
                New Delhi · 28.6°N 77.2°E
              </span>
              <div style={{
                width: "34px", height: "34px", borderRadius: "50%",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FiUsers size={15} color="#64748b" />
              </div>
            </div>
          </motion.nav>

          {/* ── Hero Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            style={{ marginBottom: "36px", display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 800, letterSpacing: "-0.03em", margin: 0,
              color: "#f8fafc", lineHeight: 1.1,
            }}>
              Emergency Resource
              <span style={{
                background: "linear-gradient(90deg, #22d3ee, #3b82f6)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}> Dashboard</span>
            </h1>
            <p style={{ margin: 0, color: "#475569", fontSize: "15px", maxWidth: "480px" }}>
              Real-time ICU, bed, and ambulance availability across hospitals near your location.
            </p>
          </motion.div>

          {/* ── Stat Cards Row ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <StatCard icon={FiHeart} label="ICU Beds Available" value={totalICU} accent="#22d3ee" sub="Across all nearby hospitals" />
            <StatCard icon={FiActivity} label="General Beds" value={totalGeneral} accent="#818cf8" sub="Live count" />
            <StatCard icon={FiZap} label="Active Ambulances" value={activeAmbulances} accent="#f59e0b" sub="On standby" />
            <StatCard icon={FiTrendingUp} label="Hospitals Tracked" value={hospitals.length || "—"} accent="#34d399" sub="Within 10 km radius" />
          </motion.div>

          {/* ── CTA Row ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "20px",
              padding: "24px 28px",
              marginBottom: "32px",
            }}
          >
            <div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 700, margin: "0 0 4px", color: "#f1f5f9" }}>
                Need emergency care?
              </h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
                We'll instantly find the best-equipped hospital with ICU availability near you.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={findBest}
              disabled={isFinding}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "14px 28px",
                background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                border: "none",
                borderRadius: "14px",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                cursor: isFinding ? "not-allowed" : "pointer",
                opacity: isFinding ? 0.7 : 1,
                boxShadow: "0 4px 24px rgba(239,68,68,0.25)",
                position: "relative",
              }}
            >
              {isFinding ? (
                <div style={{
                  width: "18px", height: "18px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid #fff",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }} />
              ) : (
                <span style={{ position: "relative" }} className="pulse-ring">
                  <FiAlertCircle size={18} />
                </span>
              )}
              {isFinding ? "Searching..." : "Find Emergency Hospital"}
            </motion.button>
          </motion.div>

          {/* ── Best Hospital Banner ── */}
          <AnimatePresence>
            {bestHospital && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, scale: 0.97, height: 0 }}
                style={{ overflow: "hidden", marginBottom: "32px" }}
              >
                <div style={{
                  background: "rgba(220,38,38,0.06)",
                  border: "1px solid rgba(220,38,38,0.25)",
                  borderRadius: "20px",
                  padding: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "20px",
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px #ef4444", display: "inline-block", animation: "none" }} />
                      <span style={{ fontSize: "11px", color: "#f87171", fontWeight: 700, letterSpacing: "0.1em", fontFamily: "'DM Mono', monospace" }}>
                        BEST MATCH · RECOMMENDED
                      </span>
                    </div>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800, color: "#f1f5f9", margin: "0 0 14px" }}>
                      {bestHospital.name}
                    </h2>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: "13px", fontWeight: 700, color: "#22d3ee",
                        background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)",
                        borderRadius: "8px", padding: "6px 14px",
                        fontFamily: "'DM Mono', monospace",
                      }}>
                        {bestHospital.resources.icuBeds.available} ICU
                      </span>
                      <span style={{
                        fontSize: "13px", fontWeight: 600, color: "#818cf8",
                        background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.2)",
                        borderRadius: "8px", padding: "6px 14px",
                        fontFamily: "'DM Mono', monospace",
                      }}>
                        {bestHospital.resources.generalBeds.available} General
                      </span>
                      <span style={{
                        fontSize: "13px", fontWeight: 600, color: "#94a3b8",
                        background: "rgba(148,163,184,0.07)", border: "1px solid rgba(148,163,184,0.15)",
                        borderRadius: "8px", padding: "6px 14px",
                      }}>
                        ~12 min away
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => requestBed(bestHospital._id)}
                    style={{
                      padding: "14px 28px", background: "#dc2626",
                      border: "none", borderRadius: "12px",
                      color: "#fff", fontSize: "15px", fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif",
                      cursor: "pointer",
                      boxShadow: "0 0 20px rgba(220,38,38,0.3)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Request ICU Bed →
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main Grid: Hospital List + Map ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: "24px",
            alignItems: "start",
          }}>

            {/* Hospital List */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h2 style={{
                  fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: 700,
                  color: "#94a3b8", margin: 0, display: "flex", alignItems: "center", gap: "8px",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  <FiMapPin size={14} /> Nearby
                </h2>
                <span style={{
                  fontSize: "11px", color: "#475569", fontFamily: "'DM Mono', monospace",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "6px", padding: "3px 8px",
                }}>
                  {hospitals.length} found
                </span>
              </div>

              <div
                className="pn-scroll"
                style={{ maxHeight: "680px", overflowY: "auto", paddingRight: "6px", display: "flex", flexDirection: "column", gap: "12px" }}
              >
                {hospitals.map((h, i) => (
                  <HospitalCard key={h._id} h={h} index={i} onRequest={requestBed} />
                ))}
                {hospitals.length === 0 && (
                  <div style={{
                    border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "16px",
                    padding: "48px 24px", textAlign: "center",
                    color: "#334155", fontSize: "14px",
                  }}>
                    No hospitals found nearby.
                  </div>
                )}
              </div>
            </motion.div>

            {/* Map Section */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h2 style={{
                  fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: 700,
                  color: "#94a3b8", margin: 0,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  Live Map
                </h2>
                <div style={{ display: "flex", gap: "16px" }}>
                  {[
                    { color: "#22c55e", label: "Beds available" },
                    { color: "#ef4444", label: "Full capacity" },
                    { color: "#f59e0b", label: "Ambulance" },
                  ].map(({ color, label }) => (
                    <span key={label} style={{ fontSize: "11px", color: "#475569", display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: color, display: "inline-block" }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{
                borderRadius: "20px", overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
              }}>
                <HospitalMap hospitals={hospitals} requestBed={requestBed} />
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

export default Home;