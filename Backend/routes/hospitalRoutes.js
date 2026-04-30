const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  registerHospital,
  loginHospital,
  updateResources,
} = require("../controllers/hospitalcontroller");

router.post("/register", registerHospital);
router.post("/login", loginHospital);
router.patch("/update-resources", auth, updateResources);

module.exports = router;
