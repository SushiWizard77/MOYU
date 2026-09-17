const Activity = require("../models/Activity");
const Notification = require("../models/Notification");

const logActivity = async (userId, type, description) => {
  try {
    await Activity.create({ user: userId, type, description });
  } catch (error) {
    console.error("ACTIVITY LOG ERROR:", error.message);
  }
};

const createNotification = async (userId, title, message, type = "reminder", link = "") => {
  try {
    await Notification.create({ user: userId, title, message, type, link });
  } catch (error) {
    console.error("NOTIFICATION CREATE ERROR:", error.message);
  }
};

module.exports = { logActivity, createNotification };
