const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: String,

    address: String,

    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    resources: {
      icuBeds: {
        total: { type: Number, default: 0 },
        available: { type: Number, default: 0 },
      },

      generalBeds: {
        total: { type: Number, default: 0 },
        available: { type: Number, default: 0 },
      },

      oxygen: {
        total: { type: Number, default: 0 },
        available: { type: Number, default: 0 },
      },
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },

    reliabilityScore: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Hospital", hospitalSchema);
