import { useEffect, useState } from "react";
import API from "../services/api";
import socket from "../services/socket";
import MainLayout from "../components/layout/MainLayout";
import Navbar from "../components/layout/Navbar";
import { motion } from "framer-motion";

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
    <MainLayout>

      {/* Header */}
      <Navbar />
      <h1 className="text-4xl font-bold">
        Hospital Dashboard
      </h1>

      <p className="text-slate-400 mt-2">
        Real-time emergency request management
      </p>


      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-slate-400">Total Requests</h3>

          <p className="text-4xl font-bold mt-3">
            {requests.length}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-slate-400">Approved</h3>

          <p className="text-4xl font-bold mt-3 text-green-400">
            {requests.filter((r) => r.status === "approved").length}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-slate-400">Pending</h3>

          <p className="text-4xl font-bold mt-3 text-yellow-400">
            {requests.filter((r) => r.status === "pending").length}
          </p>
        </div>

      </div>



      {/* Request List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}>
        <div className="space-y-4">

          {requests.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
              <h2 className="text-2xl font-semibold mb-2">
                No Active Requests
              </h2>

              <p className="text-slate-400">
                Incoming emergency requests will appear here in real-time.
              </p>
            </div>
          )}

          {requests.map((r) => (

            <div
              key={r._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >

              <div className="flex justify-between items-center">

                <div>
                  <h2 className="text-xl font-semibold">
                    {r.userName}
                  </h2>

                  <p className="text-slate-400">
                    {r.type} Request
                  </p>
                </div>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium
              ${r.status === "approved"
                      ? "bg-green-500/20 text-green-400"
                      : r.status === "rejected"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                >
                  {r.status}
                </span>

              </div>

              {r.status === "pending" && (
                <div className="flex gap-3 mt-5">

                  <button
                    onClick={() => updateStatus(r._id, "approved")}
                    className="bg-green-500 hover:bg-green-600 transition px-4 py-2 rounded-xl"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => updateStatus(r._id, "rejected")}
                    className="bg-red-500 hover:bg-red-600 transition px-4 py-2 rounded-xl"
                  >
                    Reject
                  </button>

                </div>
              )}

            </div>

          ))}

        </div>
      </motion.div>

    </MainLayout >
  );
}

export default HospitalDashboard;
