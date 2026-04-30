const Hospital = require("../models/Hospital");
console.log("Hospital import:", Hospital);
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
    const { icuBeds, generalBeds, oxygen, location } = req.body;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ msg: "Hospital not Found" });

    //update values
    if (icuBeds) hospital.resources.icuBeds = icuBeds;
    if (generalBeds) hospital.resources.generalBeds = generalBeds;
    if (oxygen) hospital.resources.oxygen = oxygen;
    if (location) {
      hospital.location = {
        lat: location.lat,
        lng: location.lng,
      };
    }
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
