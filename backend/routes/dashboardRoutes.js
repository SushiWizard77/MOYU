const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getDashboard } = require("../controllers/dashboardController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getDashboard);

module.exports = router;
