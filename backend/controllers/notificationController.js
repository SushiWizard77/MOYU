const Notification = require("../models/Notification");

const listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ user: req.user.userId, read: false });
    return res.status(200).json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    console.error("LIST NOTIFICATIONS ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load notifications" });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to update notification" });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.userId, read: false }, { read: true });
    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("MARK ALL READ ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to update notifications" });
  }
};

module.exports = { listNotifications, markAsRead, markAllAsRead };
