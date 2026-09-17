const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getTheme, setTheme } = require("../controllers/themeController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getTheme);
router.patch("/", setTheme);

module.exports = router;