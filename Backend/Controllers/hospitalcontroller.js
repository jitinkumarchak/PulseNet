const Hospital = require("../models/Hospital");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Register
exports.registerHospital = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Hospital.findOne({ email });
    if (existing)
      return res.status(400).json({ msg: "Hospital already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const hospital = new Hospital({
      name,
      email,
      password: hashedPassword,
    });

    await hospital.save();

    res.json({
      msg: " Hospital registerd Successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Login

exports.loginHospital = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hospital = await Hospital.findOne({ email });
    if (!hospital) return res.status(400).json({ msg: " invalid credentails" });

    const isMatch = await bcrypt.compare(password, hospital.password);
    if (!isMatch) return res.status(400).json({ msg: " INvalid  credentials" });

    const token = jwt.sign({ id: hospital._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      hospital: {
        _id: hospital._id,
        name: hospital.name,
        email: hospital.email,
        resources: hospital.resources,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Update Resources
exports.updateResources = async (req, res) => {
  try {
    const hospitalId = req.user.id; //from token
    const { icuBeds, generalBeds, oxygen } = req.body;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ msg: "Hospital not Found" });

    //update values
    if (icuBeds) hospital.resources.icuBeds = icuBeds;
    if (generalBeds) hospital.resources.generalBeds = generalBeds;
    if (oxygen) hospital.resources.oxygen = oxygen;

    hospital.lastUpdated = Date.now();

    await hospital.save();

    //real-time emit update to clients
    const io = req.app.get("io");
    io.emit("resourcesUpdated", hospital);

    res.json({ msg: "Resources updated", hospital });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//update location — save as GeoJSON Point to match schema index
exports.updateLocation = async (req, res) => {
  try {
    const hospitalId = req.user.id;
    const { lat, lng } = req.body;

    if (lat == null || lng == null) {
      return res.status(400).json({ msg: "Latitude and longitude required" });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ msg: "Hospital not found" });
    }

    // GeoJSON format: coordinates = [longitude, latitude]
    hospital.location = {
      type: "Point",
      coordinates: [parseFloat(lng), parseFloat(lat)],
    };

    await hospital.save();

    res.json({
      msg: "Location updated",
      location: hospital.location,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//near-by hospitals based on location
exports.getNearbyHospitals = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (lat == null || lng == null) {
      return res.status(400).json({ msg: "Location required" });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const hospitals = await Hospital.find();

    // Calculate distance using GeoJSON coordinates [lng, lat]
    const result = hospitals
      .filter(
        (h) =>
          h.location &&
          Array.isArray(h.location.coordinates) &&
          h.location.coordinates.length === 2,
      )
      .map((h) => {
        const hLng = h.location.coordinates[0];
        const hLat = h.location.coordinates[1];
        const distance = Math.sqrt(
          Math.pow(hLat - userLat, 2) + Math.pow(hLng - userLng, 2),
        );

        return {
          _id: h._id,
          name: h.name,
          location: h.location,
          resources: h.resources,
          lastUpdated: h.lastUpdated,
          distance,
        };
      });

    // Sort by nearest
    result.sort((a, b) => a.distance - b.distance);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//get best hospital based on resources
exports.getBestHospital = async (req, res) => {
  try {
    let { lat, lng, type } = req.query;

    // 🔥 Convert to numbers (CRITICAL)
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const hospitals = await Hospital.find();

    let best = null;
    let bestScore = Infinity;

    hospitals.forEach((h) => {
      // Skip if no valid GeoJSON location
      if (
        !h.location ||
        !Array.isArray(h.location.coordinates) ||
        h.location.coordinates.length !== 2
      ) {
        return;
      }

      // GeoJSON: coordinates = [longitude, latitude]
      const hLng = h.location.coordinates[0];
      const hLat = h.location.coordinates[1];

      // ✅ Distance
      const distance = Math.sqrt(
        Math.pow(hLat - userLat, 2) + Math.pow(hLng - userLng, 2),
      );

      // ✅ Availability
      let availability = 0;

      if (type === "ICU") {
        availability = h.resources.icuBeds.available;
      } else {
        availability = h.resources.generalBeds.available;
      }

      // ❌ Skip if no beds
      if (availability <= 0) return;

      // ✅ Freshness
      const lastUpdatedMinutes = (Date.now() - new Date(h.lastUpdated)) / 60000;

      // ✅ Score
      const score =
        distance * 0.5 + (1 / availability) * 0.3 + lastUpdatedMinutes * 0.2;

      // ✅ Pick best
      if (score < bestScore) {
        bestScore = score;
        best = h;
      }
    });

    if (!best) {
      return res
        .status(404)
        .json({ msg: "No hospital with available beds found" });
    }

    res.json(best);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
