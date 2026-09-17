const mongoose = require("mongoose");

const passwordResetTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    token: { type: String, required: true, trim: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Mongo TTL index — the document (and thus the token) disappears once expiresAt passes
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
passwordResetTokenSchema.index({ token: 1 }, { unique: true });

module.exports = mongoose.model("PasswordResetToken", passwordResetTokenSchema);