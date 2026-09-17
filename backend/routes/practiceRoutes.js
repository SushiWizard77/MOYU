const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { listQuestions, attemptQuestion, getStats, startSession, submitSession } = require("../controllers/practiceController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listQuestions);
router.get("/stats", getStats);
router.get("/session/start", startSession);
router.post("/session/submit", submitSession);
router.post("/:id/attempt", attemptQuestion);

module.exports = router;
