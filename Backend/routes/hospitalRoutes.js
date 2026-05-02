const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  registerHospital,
  loginHospital,
  updateResources,
  updateLocation,
  getNearbyHospitals,
  getBestHospital,
} = require("../controllers/hospitalcontroller");

router.post("/register", registerHospital);
router.post("/login", loginHospital);
router.patch("/update-resources", auth, updateResources);
router.patch("/update-location", auth, updateLocation);
router.get("/nearby", getNearbyHospitals);
router.get("/best", getBestHospital);

module.exports = router;
