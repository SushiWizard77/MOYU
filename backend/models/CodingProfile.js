// Per-student coding profile. Single source of truth for the Coding
// Progress dashboard (totals, difficulty counts, streaks). Updated only
// through the coding-track controller so counts can never drift.
const mongoose = require("mongoose");

const codingProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    leetcodeUsername: { type: String, default: "", trim: true },
    timezone: { type: String, default: "UTC", trim: true },
    totalSolved: { type: Number, default: 0, min: 0 },
    easySolved: { type: Number, default: 0, min: 0 },
    mediumSolved: { type: Number, default: 0, min: 0 },
    hardSolved: { type: Number, default: 0, min: 0 },
    currentStreak: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 },
    lastCompletedDay: { type: String, default: "" },
    lastSyncedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CodingProfile", codingProfileSchema);
