const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ReadinessScore = require("../models/ReadinessScore");
const Resume = require("../models/Resume");
const PasswordResetToken = require("../models/PasswordResetToken");
const Notification = require("../models/Notification");

const signToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  college: user.college,
  department: user.department,
  year: user.year,
  phone: user.phone,
  city: user.city,
  bio: user.bio,
  avatar: user.avatar,
  skills: user.skills,
  github: user.github,
  linkedin: user.linkedin,
  leetcodeUsername: user.leetcodeUsername,
  timezone: user.timezone,
  githubUsername: user.githubUsername,
  githubRepo: user.githubRepo,
  leetcodeStats: user.leetcodeStats,
  targetRoles: user.targetRoles,
  streak: user.streak,
  onboarded: user.onboarded,
  theme: user.theme,
  createdAt: user.createdAt,
});

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    await ReadinessScore.create({ user: user._id });
    await Resume.create({ user: user._id, personalDetails: { fullName: user.name } });

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Accounts created via Google have no local password set
    if (!user.password && user.googleId) {
      return res.status(401).json({
        success: false,
        message: "This account was created with Google. Please use 'Continue with Google' to sign in.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const today = new Date();
    const lastActive = user.streak.lastActiveDate;
    if (lastActive) {
      const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        user.streak.current += 1;
      } else if (diffDays > 1) {
        user.streak.current = 1;
      }
    } else {
      user.streak.current = 1;
    }
    user.streak.longest = Math.max(user.streak.longest, user.streak.current);
    user.streak.lastActiveDate = today;
    await user.save();

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to get user information",
    });
  }
};

const updateMe = async (req, res) => {
  try {
    const allowedFields = [
      "name", "college", "department", "year", "phone", "city", "bio", "avatar",
      "skills", "github", "linkedin", "targetRoles", "onboarded",
      "leetcodeUsername", "timezone", "githubUsername", "githubRepo",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("UPDATE ME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
};

// PATCH /auth/password  — change password (Settings > Security)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(req.user.userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.password) {
      // Local account: require the current password
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Please enter your current password",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Your current password is incorrect",
        });
      }
    } else if (!user.googleId) {
      return res.status(400).json({
        success: false,
        message: "This account has no password set. Use 'Forgot password' on the login page.",
      });
    }
    // Google-only accounts: no current password to verify — this sets a first password

    user.password = await bcrypt.hash(String(newPassword), 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change password. Please try again.",
    });
  }
};

// DELETE /auth/me  — permanently delete the account and its data (Settings > Danger zone)
const deleteMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Promise.all([
      User.findByIdAndDelete(userId),
      ReadinessScore.deleteMany({ user: userId }),
      Resume.deleteMany({ user: userId }),
      PasswordResetToken.deleteMany({ user: userId }),
      Notification.deleteMany({ user: userId }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Your account and all associated data have been deleted.",
    });
  } catch (error) {
    console.error("DELETE ME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete account. Please try again.",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  deleteMe,
};
