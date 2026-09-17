const mongoose = require("mongoose");

const practiceQuestionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Coding", "Aptitude", "Communication", "Verbal", "SQL", "DSA", "Technical MCQ", "Interview Question"],
    },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },
    prompt: { type: String, required: true },
    options: { type: [String], default: [] },
    correctOptionIndex: { type: Number, default: null },
    tags: { type: [String], default: [] },
    explanation: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PracticeQuestion", practiceQuestionSchema);
