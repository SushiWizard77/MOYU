const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema(
  {
    stage: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    title: { type: String, required: true, trim: true },
    index: { type: Number, required: true, min: 0 },
    statement: { type: String, required: true },
    approach: { type: String, default: "" },
    explanation: { type: String, default: "" },
    starterCode: {
      python: { type: String, default: "" },
      java: { type: String, default: "" },
      c: { type: String, default: "" },
      cpp: { type: String, default: "" },
    },
    testCases: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
      },
    ],
    solution: {
      python: { type: String, default: "" },
      java: { type: String, default: "" },
      c: { type: String, default: "" },
      cpp: { type: String, default: "" },
    },
  },
  { _id: false }
);

const codingProblemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },
    category: { type: String, default: "Arrays" },
    description: { type: String, required: true },
    inputFormat: { type: String, default: "" },
    outputFormat: { type: String, default: "" },
    constraints: { type: String, default: "" },
    tags: { type: [String], default: [] },
    levels: {
      type: [levelSchema],
      default: [],
      validate: {
        validator: function (levels) {
          return levels.every((level) => typeof level.index === "number" && level.index >= 0);
        },
        message: "Levels must have a non-negative numeric index.",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CodingProblem", codingProblemSchema);