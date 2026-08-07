const express = require("express");
const router = express.Router();

const Ambulance = require("../models/Ambulance");

router.get("/", async (req, res) => {
    try {

        const ambulances = await Ambulance.find();

        res.json(ambulances);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;