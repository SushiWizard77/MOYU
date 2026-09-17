const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    estimatedHours: { type: Number, default: 1 },
    resourceLinks: { type: [String], default: [] },
    links: {
      read: { type: String, default: "" },
      free: { type: String, default: "" },
      paid: { type: String, default: "" },
    },
  },
  { _id: true }
);

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    topics: { type: [topicSchema], default: [] },
  },
  { _id: true }
);

const roadmapSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Software Developer", "Data Analyst", "Data Scientist", "AI/ML", "Full Stack Developer", "Cloud/DevOps"],
      required: true,
    },
    difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    estimatedWeeks: { type: Number, default: 8 },
    modules: { type: [moduleSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Roadmap", roadmapSchema);
