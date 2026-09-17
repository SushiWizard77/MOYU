const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["practice", "assessment", "roadmap", "resume", "profile", "company"],
      required: true,
    },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
