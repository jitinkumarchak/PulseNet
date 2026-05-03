import { useEffect, useState } from "react";
import API from "../services/api";
import socket from "../services/socket";

function HospitalDashboard() {
  const [requests, setRequests] = useState([]);

  // 🔹 Fetch requests
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/request/hospital", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRequests(res.data);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
    }
  };

  // 🔹 Load + socket
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    const payload = JSON.parse(atob(token.split(".")[1]));
    const hospitalId = payload.id;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("joinHospital", hospitalId);
    });

    fetchRequests();

    // ✅ New request
    socket.on("newRequest", (newReq) => {
      setRequests((prev) => [newReq, ...prev]);
    });

    // 🔥 THIS IS MISSING IN YOUR CODE
    socket.on("requestUpdated", (updatedReq) => {
      console.log("Real-time update:", updatedReq);

      setRequests((prev) =>
        prev.map((r) => (r._id === updatedReq._id ? updatedReq : r)),
      );
    });

    return () => {
      socket.off("connect");
      socket.off("newRequest");
      socket.off("requestUpdated");
    };
  }, []);

  // 🔹 Update request status
  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      await API.patch(
        "/request/update",
        { requestId: id, status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
    }
  };

  return (
    <div>
      <h1>🏥 Hospital Dashboard</h1>

      {requests.length === 0 && <p>No requests yet</p>}

      {requests.map((r) => (
        <div
          key={r._id}
          style={{
            border: "1px solid",
            margin: "10px",
            padding: "10px",
          }}
        >
          <p>
            <strong>{r.userName}</strong>
          </p>
          <p>Type: {r.type}</p>
          <p>Status: {r.status}</p>

          {r.status === "pending" && (
            <div>
              <button
                onClick={() => {
                  console.log("Approve clicked", r._id);
                  updateStatus(r._id, "approved");
                }}
              >
                Approve
              </button>

              <button onClick={() => updateStatus(r._id, "rejected")}>
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default HospitalDashboard;
