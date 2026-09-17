const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { listRoadmaps, getRoadmap, toggleTopic } = require("../controllers/roadmapController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listRoadmaps);
router.get("/:slug", getRoadmap);
router.post("/:slug/toggle-topic", toggleTopic);

module.exports = router;
