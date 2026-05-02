const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  createRequest,
  getHospitalRequests,
  updateRequestStatus,
} = require("../controllers/requestController");

router.post("/create", createRequest);
router.get("/hospital", auth, getHospitalRequests);
router.patch("/update", auth, updateRequestStatus);

module.exports = router;
