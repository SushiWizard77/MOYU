const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  listAssessments,
  getAssessment,
  submitAssessment,
  getMyResults,
  getReadiness,
} = require("../controllers/assessmentController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listAssessments);
router.get("/readiness", getReadiness);
router.get("/results", getMyResults);
router.get("/:id", getAssessment);
router.post("/:id/submit", submitAssessment);

module.exports = router;
