const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    techStack: { type: [String], default: [] },
    liveLink: { type: String, default: "" },
    githubLink: { type: String, default: "" },
    status: { type: String, enum: ["ongoing", "completed", "planned"], default: "completed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);