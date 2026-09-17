const User = require("../models/User");
const Company = require("../models/Company");
const Resource = require("../models/Resource");
const PracticeQuestion = require("../models/PracticeQuestion");
const Roadmap = require("../models/Roadmap");
const RoadmapProgress = require("../models/RoadmapProgress");
const PracticeAttempt = require("../models/PracticeAttempt");
const ReadinessScore = require("../models/ReadinessScore");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const getOverview = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalStudents, studentsToday, studentsThisWeek, studentsThisMonth, totalCompanies, totalResources, totalQuestions, totalRoadmaps, readinessAgg, recentSignups, activeUsersToday, activeUsersThisWeek] =
    await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "student", createdAt: { $gte: startOfToday } }),
      User.countDocuments({ role: "student", createdAt: { $gte: startOfWeek } }),
      User.countDocuments({ role: "student", createdAt: { $gte: startOfMonth } }),
      Company.countDocuments(),
      Resource.countDocuments(),
      PracticeQuestion.countDocuments(),
      Roadmap.countDocuments(),
      ReadinessScore.aggregate([{ $group: { _id: null, avgOverall: { $avg: "$overall" } } }]),
      // Live feed: newest student accounts (admin only)
      User.find({ role: "student" }).select("name email college department createdAt").sort({ createdAt: -1 }).limit(10),
      // Active users (streak updated today)
      User.countDocuments({ role: "student", "streak.lastActiveDate": { $gte: startOfToday } }),
      // Active users this week
      User.countDocuments({ role: "student", "streak.lastActiveDate": { $gte: startOfWeek } }),
    ]);

  res.status(200).json({
    success: true,
    data: {
      totalStudents,
      studentsToday,
      studentsThisWeek,
      studentsThisMonth,
      totalCompanies,
      totalResources,
      totalQuestions,
      totalRoadmaps,
      averageReadiness: Math.round(readinessAgg[0]?.avgOverall || 0),
      recentSignups,
      activeUsersToday,
      activeUsersThisWeek,
    },
  });
});

const listStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = "" } = req.query;
  const filter = { role: "student" };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [students, total] = await Promise.all([
    User.find(filter).select("name email college department year streak createdAt").skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: students,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

const getStudentDetail = asyncHandler(async (req, res) => {
  const student = await User.findOne({ _id: req.params.id, role: "student" }).select("-password");
  if (!student) throw new ApiError(404, "Student not found");

  const [readiness, roadmapProgress, practiceAttempts] = await Promise.all([
    ReadinessScore.findOne({ user: student._id }),
    RoadmapProgress.find({ user: student._id }).populate("roadmap", "title category"),
    PracticeAttempt.find({ user: student._id }),
  ]);

  const totalAttempted = practiceAttempts.length;
  const totalCorrect = practiceAttempts.filter((a) => a.isCorrect).length;

  res.status(200).json({
    success: true,
    data: {
      student,
      readiness: readiness || { overall: 0, categories: {} },
      roadmaps: roadmapProgress.map((p) => ({ title: p.roadmap?.title, percentComplete: p.percentComplete })),
      practice: {
        totalAttempted,
        totalCorrect,
        accuracy: totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0,
      },
    },
  });
});

const createCompany = asyncHandler(async (req, res) => {
  const company = await Company.create(req.body);
  res.status(201).json({ success: true, message: "Company created", data: company });
});

const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!company) throw new ApiError(404, "Company not found");
  res.status(200).json({ success: true, message: "Company updated", data: company });
});

const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndDelete(req.params.id);
  if (!company) throw new ApiError(404, "Company not found");
  res.status(200).json({ success: true, message: "Company deleted" });
});

const createResource = asyncHandler(async (req, res) => {
  const resource = await Resource.create(req.body);
  res.status(201).json({ success: true, message: "Resource created", data: resource });
});

const updateResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!resource) throw new ApiError(404, "Resource not found");
  res.status(200).json({ success: true, message: "Resource updated", data: resource });
});

const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findByIdAndDelete(req.params.id);
  if (!resource) throw new ApiError(404, "Resource not found");
  res.status(200).json({ success: true, message: "Resource deleted" });
});

const createPracticeQuestion = asyncHandler(async (req, res) => {
  const question = await PracticeQuestion.create(req.body);
  res.status(201).json({ success: true, message: "Practice question created", data: question });
});

const updatePracticeQuestion = asyncHandler(async (req, res) => {
  const question = await PracticeQuestion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!question) throw new ApiError(404, "Practice question not found");
  res.status(200).json({ success: true, message: "Practice question updated", data: question });
});

const deletePracticeQuestion = asyncHandler(async (req, res) => {
  const question = await PracticeQuestion.findByIdAndDelete(req.params.id);
  if (!question) throw new ApiError(404, "Practice question not found");
  res.status(200).json({ success: true, message: "Practice question deleted" });
});

const broadcastNotification = asyncHandler(async (req, res) => {
  const { title, message, type = "announcement", link = "", audience = "all" } = req.body;
  if (!title || !message) throw new ApiError(400, "Title and message are required");

  const filter = audience === "all" ? { role: "student" } : { _id: { $in: audience } };
  const students = await User.find(filter).select("_id");

  if (students.length === 0) throw new ApiError(404, "No matching students found for this audience");

  const docs = students.map((s) => ({ user: s._id, title, message, type, link }));
  await Notification.insertMany(docs);

  res.status(201).json({ success: true, message: `Notification sent to ${docs.length} student(s)` });
});

module.exports = {
  getOverview,
  listStudents,
  getStudentDetail,
  createCompany,
  updateCompany,
  deleteCompany,
  createResource,
  updateResource,
  deleteResource,
  createPracticeQuestion,
  updatePracticeQuestion,
  deletePracticeQuestion,
  broadcastNotification,
};
