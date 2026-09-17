const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { listResources } = require("../controllers/resourceController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", listResources);

module.exports = router;
