const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      required: function () {
        // Accounts created via Google sign-in have no local password
        return !this.googleId;
      },
      minlength: 6,
      select: false,
    },
    googleId: { type: String, default: "", index: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    college: { type: String, trim: true, default: "" },
    department: { type: String, trim: true, default: "" },
    year: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
    avatar: { type: String, default: "" },
    skills: { type: [String], default: [] },
    github: { type: String, trim: true, default: "" },
    linkedin: { type: String, trim: true, default: "" },
    leetcodeUsername: { type: String, trim: true, default: "", index: true },
    timezone: { type: String, trim: true, default: "UTC" },
    githubUsername: { type: String, trim: true, default: "" },
    githubToken: { type: String, default: "", select: false },
    githubRepo: { type: String, trim: true, default: "moyu-leetcode-solutions" },
    leetcodeStats: {
      totalSolved: { type: Number, default: 0 },
      easySolved: { type: Number, default: 0 },
      mediumSolved: { type: Number, default: 0 },
      hardSolved: { type: Number, default: 0 },
      streakDays: { type: Number, default: 0 },
      lastSyncedAt: { type: Date, default: null },
    },
    targetRoles: { type: [String], default: [] },
    theme: { type: String, enum: ["light", "dark"], default: "dark" },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: null },
    },
    onboarded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
