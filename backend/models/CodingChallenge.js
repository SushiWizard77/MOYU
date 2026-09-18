// MOYU daily coding challenges (admin-curated LeetCode problems).
// One doc per dayNumber. Students complete them via Solve on LeetCode
// + auto-verify (recent Accepted) or manual "Mark as Completed" fallback.
const mongoose = require("mongoose");

const codingChallengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    url: { type: String, required: true, trim: true },
    dayNumber: { type: Number, required: true, unique: true, min: 1 },
    category: { type: String, default: "Arrays", trim: true },
    roadmap: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CodingChallenge", codingChallengeSchema);
