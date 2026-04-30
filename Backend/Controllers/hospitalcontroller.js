const hospital = require("../models/Hospital");
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

    res.json({ token, hospital });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
