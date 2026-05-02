import { useCallback, useEffect, useState } from "react";
import API from "../services/api";
import socket from "../services/socket";

function Home() {
  const [hospitals, setHospitals] = useState([]);

  const fetchHospitals = useCallback(async () => {
    const res = await API.get("/hospital/nearby?lat=28.6&lng=77.2");
    setHospitals(res.data);
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

    return () => socket.off("resourcesUpdated");
  }, []);

  const [bestHospital, setBestHospital] = useState(null);

  const findBest = async () => {
    try {
      console.log("Button clicked");

      const res = await API.get("/hospital/best?lat=28.6&lng=77.2&type=ICU");

      console.log("Full response:", res);
      console.log("Response data:", res.data);

      if (!res.data) {
        console.log("No data received");
        return;
      }

      setBestHospital(res.data);

      console.log("State should update now");
    } catch (err) {
      console.error("ERROR:", err.response?.data || err.message);
    }
  };

  const requestBed = async (hospitalId) => {
    await API.post("/request/create", {
      userName: "Jitin",
      hospitalId,
      type: "ICU",
    });
  };

  return (
    <div>
      <button onClick={findBest}>🚨 Find Emergency Hospital</button>

      <h1>Nearby Hospitals</h1>

      {hospitals.map((h) => (
        <div
          key={h._id}
          style={{ border: "1px solid", margin: "10px", padding: "10px" }}
        >
          <h3>{h.name}</h3>
          <p>ICU Available: {h.resources.icuBeds.available}</p>
          <p>General Beds: {h.resources.generalBeds.available}</p>
          <p>Last Updated: {new Date(h.lastUpdated).toLocaleTimeString()}</p>
          <button onClick={() => requestBed(h._id)}>Request ICU Bed</button>
        </div>
      ))}

      {bestHospital && (
        <div
          style={{
            border: "2px solid red",
            padding: "10px",
            marginTop: "20px",
          }}
        >
          <h2>🚨 Best Hospital</h2>
          <p>
            <strong>{bestHospital.name}</strong>
          </p>
          <p>ICU Beds: {bestHospital.resources.icuBeds.available}</p>
          <p>General Beds: {bestHospital.resources.generalBeds.available}</p>
        </div>
      )}
    </div>
  );
}

export default Home;
