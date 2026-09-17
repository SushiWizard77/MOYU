const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getResume, updateResume, atsCheck, downloadResume } = require("../controllers/resumeController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getResume);
router.patch("/", updateResume);
router.get("/ats-check", atsCheck);
router.get("/download", downloadResume);

module.exports = router;
