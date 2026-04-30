const express = require("express");
const router = require.Router();

const {
  registerHospital,
  loginHospital,
} = require("../controllers/hospitalcontroller");

router.post("/register", registerHospital);
router.post("/login", loginHospital);

module.exports = router;
