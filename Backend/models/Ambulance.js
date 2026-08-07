const mongoose = require("mongoose");

const ambulanceSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },

    driverName: String,

    status: {
      type: String,
      enum: ["available", "busy"],
      default: "available",
    },

    location: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ambulance", ambulanceSchema);