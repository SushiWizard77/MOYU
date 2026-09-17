const mongoose = require("mongoose");

const practiceAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "PracticeQuestion", required: true },
    category: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    selectedOptionIndex: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PracticeAttempt", practiceAttemptSchema);
