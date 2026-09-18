const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const themeRoutes = require("./routes/themeRoutes");
const resetRoutes = require("./routes/resetRoutes");
const googleRoutes = require("./routes/googleRoutes");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const practiceRoutes = require("./routes/practiceRoutes");
const companyRoutes = require("./routes/companyRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const projectRoutes = require("./routes/projectRoutes");
const codingRoutes = require("./routes/codingRoutes");
const codingTrackRoutes = require("./routes/codingTrackRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MOYU API is running 🚀",
    version: "2.0.0",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", service: "MOYU Backend" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/theme", themeRoutes);
app.use("/api/v1/auth/password", resetRoutes);
app.use("/api/v1/auth/google", googleRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/assessments", assessmentRoutes);
app.use("/api/v1/roadmaps", roadmapRoutes);
app.use("/api/v1/practice", practiceRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/resources", resourceRoutes);
app.use("/api/v1/resume", resumeRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/coding", codingRoutes);
app.use("/api/v1/coding-track", codingTrackRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

// Connect on cold start (local + Vercel). Cached via config/db.js.
connectDB().catch(() => {
  // Error already logged in connectDB; keep process alive on Vercel.
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 MOYU Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
