const Request = require("../models/Request");

// Create request
exports.createRequest = async (req, res) => {
  try {
    const { userName, hospitalId, type } = req.body;

    const request = new Request({
      UserName: userName,
      hospitalId,
      type,
      userId,
    });

    await request.save();

    // 🔥 notify hospital dashboard
    const io = req.app.get("io");
    io.to(request.hospitalId.toString()).emit("newRequest", request);

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

    // ✅ Validation
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    // ✅ Secure update (VERY IMPORTANT)
    const request = await Request.findOne({
      _id: requestId,
      hospitalId: req.user.id,
    });

    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    request.status = status;
    await request.save();

    const io = req.app.get("io");

    // 🔥 Notify hospital (already in room)
    io.to(request.hospitalId.toString()).emit("requestUpdated", request);

    // 🔥 Notify USER (NEW)
    io.to(request.userId.toString()).emit("userRequestUpdated", request);

    res.json({ msg: "Request updated", request });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};