const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    UserName: String,
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },
    type: {
      type: String,
      enum: ["ICU", "General"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Request", requestSchema);
