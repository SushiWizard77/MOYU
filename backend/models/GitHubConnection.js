// GitHub connection per student (OAuth-based). Access tokens are NEVER
// stored in plain text — only AES-256-GCM fields (see utils/tokenCrypto).
// This is intentionally separate from LeetCode progress: GitHub is a
// portfolio/code-sync feature, never the source of truth for completion.
const mongoose = require("mongoose");

const gitHubConnectionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    githubUserId: { type: String, default: "" },
    githubUsername: { type: String, default: "", trim: true },
    repoFullName: { type: String, default: "", trim: true },
    scopes: { type: [String], default: [] },
    tokenIv: { type: String, default: "", select: false },
    tokenTag: { type: String, default: "", select: false },
    tokenData: { type: String, default: "", select: false },
    connectedAt: { type: Date, default: null },
    lastSyncAt: { type: Date, default: null },
    lastPushSha: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GitHubConnection", gitHubConnectionSchema);
