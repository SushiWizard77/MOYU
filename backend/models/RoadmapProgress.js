const mongoose = require("mongoose");

const roadmapProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roadmap: { type: mongoose.Schema.Types.ObjectId, ref: "Roadmap", required: true },
    completedTopicIds: { type: [String], default: [] },
    percentComplete: { type: Number, default: 0, min: 0, max: 100 },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

roadmapProgressSchema.index({ user: 1, roadmap: 1 }, { unique: true });

module.exports = mongoose.model("RoadmapProgress", roadmapProgressSchema);
