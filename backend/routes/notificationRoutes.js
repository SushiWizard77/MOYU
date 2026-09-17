const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { listNotifications, markAsRead, markAllAsRead } = require("../controllers/notificationController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", listNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

module.exports = router;
