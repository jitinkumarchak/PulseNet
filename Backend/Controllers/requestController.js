const Request = require("../models/Request");

// Create request
exports.createRequest = async (req, res) => {
  try {
    const { userName, hospitalId, type } = req.body;

    const request = new Request({
      userName,
      hospitalId,
      type,
    });

    await request.save();

    // 🔥 notify hospital dashboard
    const io = req.app.get("io");
    io.emit("newRequest", request);

    res.json({ msg: "Request sent", request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get hospital requests
exports.getHospitalRequests = async (req, res) => {
  try {
    const hospitalId = req.user.id;

    const requests = await Request.find({ hospitalId });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update request status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId, status } = req.body;

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    request.status = status;

    await request.save();

    res.json({ msg: "Request updated", request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
