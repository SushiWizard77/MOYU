const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const getTheme = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).select("theme");
  return res.status(200).json({ success: true, data: { theme: user?.theme || "dark" } });
});

const setTheme = asyncHandler(async (req, res) => {
  const { theme } = req.body;
  if (!theme || !["light", "dark"].includes(String(theme).trim().toLowerCase())) {
    throw new ApiError(400, "Theme must be 'light' or 'dark'");
  }
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { theme: String(theme).trim().toLowerCase() },
    { new: true, runValidators: true }
  ).select("theme");
  return res.status(200).json({ success: true, data: { theme: user.theme } });
});

module.exports = { getTheme, setTheme };