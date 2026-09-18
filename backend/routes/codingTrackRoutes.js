const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const track = require("../controllers/codingTrackController");

const router = express.Router();

router.use(authMiddleware);

// LeetCode link + coding progress
router.get("/link", track.getLink);
router.patch("/link", track.updateLink);
router.get("/stats", track.getStats);
router.get("/streak", track.getStreak);
router.get("/daily", track.getDaily);
router.post("/complete", track.completeManual);
router.post("/verify", track.verifyAuto);

// GitHub OAuth (separate portfolio feature, never a completion source)
router.get("/github/auth-url", track.githubAuthUrl);
router.post("/github/callback", track.githubCallback);
router.get("/github", track.githubStatus);
router.patch("/github/repo", track.githubSelectRepo);
router.post("/github/sync", track.githubSyncSolution);

module.exports = router;
