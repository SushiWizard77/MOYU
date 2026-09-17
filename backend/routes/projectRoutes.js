const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { listProjects, createProject, updateProject, deleteProject } = require("../controllers/projectController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listProjects);
router.post("/", createProject);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);

module.exports = router;