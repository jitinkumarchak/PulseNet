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
    console.log("FULL BODY:", req.body);

    const { requestId, status } = req.body;

    console.log("Extracted status:", status);

    const request = await Request.findById(requestId);

    console.log("Before update:", request.status);

    request.status = status;

    await request.save();

    const io = req.app.get("io");

    io.to(request.hospitalId.toString()).emit("requestUpdated", request);
    io.emit("userRequestUpdated", request);

    console.log("After update:", request.status);

    res.json({ msg: "Request updated", request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
