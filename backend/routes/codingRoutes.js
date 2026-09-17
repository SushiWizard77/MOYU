const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { listProblems, getProblem, runCode } = require("../controllers/codingController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listProblems);
router.get("/:id", getProblem);
router.post("/run", runCode);

module.exports = router;