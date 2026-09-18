// Admin: manage CodingChallenge docs (daily LeetCode problems).
const mongoose = require("mongoose");
const CodingChallenge = require("../models/CodingChallenge");
const CodingCompletion = require("../models/CodingCompletion");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const slugFromInput = (input) => {
  const s = String(input || "").trim();
  const m = s.match(/leetcode\.com\/problems\/([^/\s?#]+)/i);
  if (m) return m[1].replace(/\/+$/, "").toLowerCase();
  return s.toLowerCase();
};

// A challenge may only point at LeetCode. If the admin pasted a URL it must be
// a leetcode.com/problems URL — otherwise we would silently invent a LeetCode
// link from an unrelated host.
const looksLikeUrl = (s) => /^[a-z][a-z0-9+.-]*:\/\//i.test(String(s || "").trim());
const isLeetCodeProblemUrl = (s) =>
  /^https?:\/\/(www\.)?leetcode\.com\/problems\//i.test(String(s || "").trim());

// Route params reach findById/findByIdAndDelete directly, so guard them to
// keep a malformed id a 400 instead of a Mongoose CastError 500.
const isValidId = (value) => !!value && mongoose.isValidObjectId(String(value));
const BAD_ID = { success: false, message: "Invalid challenge id." };

const listChallenges = asyncHandler(async (req, res) => {
  const challenges = await CodingChallenge.find().sort({ dayNumber: 1 });
  res.json({ success: true, data: challenges });
});

const createChallenge = asyncHandler(async (req, res) => {
  const { title, slugOrUrl, difficulty, url, dayNumber, category, roadmap } = req.body || {};
  if (!title || !slugOrUrl || !difficulty || !dayNumber) {
    throw new ApiError(400, "title, slugOrUrl, difficulty and dayNumber are required.");
  }
  if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
    throw new ApiError(400, "difficulty must be Easy, Medium or Hard.");
  }
  const slug = slugFromInput(slugOrUrl);
  if (!slug) throw new ApiError(400, "Provide a valid LeetCode slug or problem URL.");
  if (looksLikeUrl(slugOrUrl) && !isLeetCodeProblemUrl(slugOrUrl)) {
    throw new ApiError(400, "Only leetcode.com/problems/ URLs are accepted.");
  }
  const finalUrl = url || "https://leetcode.com/problems/" + slug + "/";
  if (!/^https:\/\/(www\.)?leetcode\.com\/problems\//.test(finalUrl)) {
    throw new ApiError(400, "url must be a leetcode.com/problems/ URL.");
  }
  let challenge;
  try {
    challenge = await CodingChallenge.create({
      title: String(title).trim(),
      slug,
      difficulty,
      url: finalUrl,
      dayNumber: Number(dayNumber),
      category: category || "Arrays",
      roadmap: roadmap || "",
      createdBy: req.user.userId,
    });
  } catch (err) {
    // slug and dayNumber are unique — surface a friendly 409 instead of a 500
    if (err && err.code === 11000) {
      throw new ApiError(409, "A challenge with this slug or day number already exists.");
    }
    throw err;
  }
  res.status(201).json({ success: true, message: "Challenge created.", data: challenge });
});

const updateChallenge = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json(BAD_ID);
  const allowed = ["title", "difficulty", "url", "dayNumber", "category", "roadmap", "isActive"];
  const updates = {};
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });
  if (updates.difficulty && !["Easy", "Medium", "Hard"].includes(updates.difficulty)) {
    throw new ApiError(400, "difficulty must be Easy, Medium or Hard.");
  }
  if (updates.url && !/^https:\/\/(www\.)?leetcode\.com\/problems\//.test(String(updates.url))) {
    throw new ApiError(400, "url must be a leetcode.com/problems/ URL.");
  }
  const challenge = await CodingChallenge.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!challenge) throw new ApiError(404, "Challenge not found.");
  res.json({ success: true, message: "Challenge updated.", data: challenge });
});

const deleteChallenge = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json(BAD_ID);
  const challenge = await CodingChallenge.findByIdAndDelete(req.params.id);
  if (!challenge) throw new ApiError(404, "Challenge not found.");
  res.json({ success: true, message: "Challenge deleted." });
});

// Admin: per-student coding progress (read-only; students own their data)
const studentCodingProgress = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid student id." });
  }
  const completions = await CodingCompletion.find({ user: req.params.id })
    .populate("challenge", "title dayNumber difficulty")
    .sort({ completedAt: -1 })
    .lean();
  const byDiff = { Easy: 0, Medium: 0, Hard: 0 };
  completions.forEach((c) => {
    if (byDiff[c.difficulty] !== undefined) byDiff[c.difficulty] += 1;
  });
  res.json({ success: true, data: { total: completions.length, byDifficulty: byDiff, completions } });
});

module.exports = { listChallenges, createChallenge, updateChallenge, deleteChallenge, studentCodingProgress };
