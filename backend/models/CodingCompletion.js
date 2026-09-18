// One doc per (user, slug). Canonical record of a LeetCode solve tracked
// inside MOYU. Links to a CodingChallenge when the solve completes a daily
// challenge; standalone solves (sync / ad-hoc mark) have challenge = null.
// This is the single source of truth for coding progress — dashboard, streak,
// Easy/Medium/Hard counts and the admin view all read from here.
const mongoose = require("mongoose");

const codingCompletionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: "CodingChallenge", default: null, index: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    title: { type: String, default: "" },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    source: { type: String, enum: ["auto", "manual", "verified"], default: "manual" },
    submissionUrl: { type: String, default: "", trim: true },
    completedDay: { type: String, required: true, index: true },
    timezone: { type: String, default: "UTC" },
    completedAt: { type: Date, default: Date.now },
    // Set when the accepted solution was pushed to the student's GitHub repo
    // (path inside the repo), so the UI can show "committed" without guessing.
    githubPath: { type: String, default: "", trim: true },
    githubSyncedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

codingCompletionSchema.index({ user: 1, slug: 1 }, { unique: true });
// One completion per (user, challenge). NOTE: `sparse` cannot be used here —
// MongoDB sparse unique indexes still index documents whose field is an
// explicit null, and `challenge` defaults to null for standalone solves. That
// would allow only ONE non-challenge solve per user. A partial index scoped to
// real ObjectIds is the correct guard.
codingCompletionSchema.index(
  { user: 1, challenge: 1 },
  { unique: true, partialFilterExpression: { challenge: { $type: "objectId" } } }
);

module.exports = mongoose.model("CodingCompletion", codingCompletionSchema);
