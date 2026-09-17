const mongoose = require("mongoose");

const assessmentQuestionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    options: { type: [String], required: true },
    correctOptionIndex: { type: Number, required: true },
  },
  { _id: true }
);

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "coding", "aptitude", "dbms", "os", "cn", "oop",
        "technical", "hrInterview", "communication", "resume",
      ],
    },
    description: { type: String, default: "" },
    durationMinutes: { type: Number, default: 15 },
    questions: [assessmentQuestionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assessment", assessmentSchema);
