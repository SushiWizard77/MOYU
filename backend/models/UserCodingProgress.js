const mongoose = require("mongoose");

const userCodingProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: "CodingProblem", required: true, index: true },
    completedLevels: { type: [Number], default: [] },
    unlockedLevelIndex: { type: Number, default: 0 },
    lastAttemptedLevel: { type: Number, default: 0 },
    totalAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userCodingProgressSchema.index({ user: 1, problem: 1 }, { unique: true });

module.exports = mongoose.model("UserCodingProgress", userCodingProgressSchema);