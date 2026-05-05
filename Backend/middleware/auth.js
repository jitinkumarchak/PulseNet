const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ msg: "No token" });
  }

  try {
    // 🔥 Extract token after "Bearer "
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const request = await Request.findOne({
     _id: requestId,
      hospitalId: req.user.id
     });

    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};
