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

  return (
    <div>
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
        </div>
      ))}
    </div>
  );
}

export default Home;
