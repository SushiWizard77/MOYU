const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const {
  getOverview,
  listStudents,
  getStudentDetail,
  createCompany,
  updateCompany,
  deleteCompany,
  createResource,
  updateResource,
  deleteResource,
  createPracticeQuestion,
  updatePracticeQuestion,
  deletePracticeQuestion,
  broadcastNotification,
} = require("../controllers/adminController");
const {
  listChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  studentCodingProgress,
} = require("../controllers/codingAdminController");

const router = express.Router();

router.use(authMiddleware, requireRole("admin"));

router.get("/overview", getOverview);

router.get("/students", listStudents);
router.get("/students/:id", getStudentDetail);

router.post("/companies", createCompany);
router.patch("/companies/:id", updateCompany);
router.delete("/companies/:id", deleteCompany);

router.post("/resources", createResource);
router.patch("/resources/:id", updateResource);
router.delete("/resources/:id", deleteResource);

router.post("/practice-questions", createPracticeQuestion);
router.patch("/practice-questions/:id", updatePracticeQuestion);
router.delete("/practice-questions/:id", deletePracticeQuestion);

router.post("/notifications/broadcast", broadcastNotification);

router.get("/coding-challenges", listChallenges);
router.post("/coding-challenges", createChallenge);
router.patch("/coding-challenges/:id", updateChallenge);
router.delete("/coding-challenges/:id", deleteChallenge);
router.get("/students/:id/coding", studentCodingProgress);

module.exports = router;
