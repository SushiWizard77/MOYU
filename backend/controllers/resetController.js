const User = require("../models/User");
const Token = require("../models/PasswordResetToken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const FRONTEND_URL = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const RESET_TTL_MINUTES = 15;

// POST /api/v1/auth/password/forgot  (public)
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email || !email.trim()) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    // Always respond 200 to avoid email enumeration
    return res.status(200).json({
      success: true,
      message: "If that email exists, a reset link has been sent.",
    });
  }

  // Only one active reset token per user
  const existing = await Token.findOne({ user: user._id });
  if (existing) await existing.deleteOne();

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);
  await Token.create({ user: user._id, token, expiresAt });

  const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

  // NOTE: In production this link is emailed via SMTP/Nodemailer. This project has
  // no mail server configured, so the link is logged and (outside production)
  // returned so the recovery flow can actually be completed end to end.
  console.log(`[MOYU] Password reset requested for ${user.email}`);
  console.log(`[MOYU] Reset link: ${resetLink}`);

  return res.status(200).json({
    success: true,
    message: "If that email exists, a reset link has been sent.",
    ...(process.env.NODE_ENV === "production" ? {} : { devResetLink: resetLink }),
  });
});

// POST /api/v1/auth/password/reset  (public — the token itself proves identity)
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) throw new ApiError(400, "Token and new password are required");
  if (String(newPassword).length < 6) throw new ApiError(400, "Password must be at least 6 characters");

  const record = await Token.findOne({ token: String(token) });
  if (!record) throw new ApiError(400, "Invalid or expired reset token");

  if (record.expiresAt && record.expiresAt.getTime() < Date.now()) {
    await record.deleteOne();
    throw new ApiError(400, "Reset token has expired. Please request a new one.");
  }

  const hashedPassword = await bcrypt.hash(String(newPassword), 10);
  await User.findByIdAndUpdate(record.user, { password: hashedPassword });
  await record.deleteOne(); // single-use tokens

  return res.status(200).json({
    success: true,
    message: "Password updated successfully. You can now log in with your new password.",
  });
});

module.exports = { forgotPassword, resetPassword };