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
    fetchRequests();

    // Real-time new requests
    socket.on("newRequest", (newReq) => {
      setRequests((prev) => [newReq, ...prev]);
    });

    return () => {
      socket.off("newRequest");
    };
  }, []);

  // 🔹 Update request status
  const updateStatus = async (id, status) => {
    console.log("STEP 1: Function called");

    try {
      const token = localStorage.getItem("token");
      console.log("STEP 2: Token =", token);

      const res = await API.patch(
        "/request/update",
        { requestId: id, status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("STEP 3: API success", res.data);

      await fetchRequests();
    } catch (err) {
      console.error("STEP 4: ERROR", err.response?.data || err.message);
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
