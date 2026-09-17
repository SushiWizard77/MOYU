const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, required: true },
    skill: { type: String, default: "" },
    difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    url: { type: String, required: true },
    type: { type: String, enum: ["Article", "Video", "Course", "Documentation", "Practice", "PDF"], required: true },
    tags: { type: [String], default: [] },
    provider: { type: String, default: "" },
    providerLogo: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
