const User = require("../models/User");
const ReadinessScore = require("../models/ReadinessScore");
const RoadmapProgress = require("../models/RoadmapProgress");
const Roadmap = require("../models/Roadmap");
const PracticeAttempt = require("../models/PracticeAttempt");
const PracticeQuestion = require("../models/PracticeQuestion");
const Company = require("../models/Company");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");
const Resume = require("../models/Resume");

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const stripAnswer = (q) => {
  const obj = q.toObject ? q.toObject() : { ...q };
  delete obj.correctOptionIndex;
  return obj;
};

const pickDailyQuestions = async (userId) => {
  const candidates = await PracticeQuestion.find({
    "options.0": { $exists: true },
    correctOptionIndex: { $ne: null },
    category: { $in: ["Coding", "Aptitude", "Communication", "Verbal", "SQL", "DSA", "Technical MCQ", "Interview Question"] },
  });

  const byCat = (cats) => candidates.filter((q) => cats.includes(q.category));

  const codingPool = shuffle(byCat(["Coding", "DSA", "SQL", "Technical MCQ"]));
  const aptitudePool = shuffle(byCat(["Aptitude"]));
  const commPool = shuffle(byCat(["Communication", "Verbal"]));

  const selected = [];
  if (commPool[0]) selected.push(commPool[0]);
  if (aptitudePool[0]) selected.push(aptitudePool[0]);
  if (codingPool[0]) selected.push(codingPool[0]);
  if (aptitudePool[1]) selected.push(aptitudePool[1]);
  if (codingPool[1]) selected.push(codingPool[1]);

  const pool = candidates.filter((q) => !selected.includes(q));
  while (selected.length < 5 && pool.length > 0) {
    const pick = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    if (!selected.some((s) => String(s._id) === String(pick._id))) selected.push(pick);
  }

  const attempts = await PracticeAttempt.find({ user: userId, question: { $in: selected.map((q) => q._id) } });
  const attemptMap = {};
  attempts.forEach((a) => {
    attemptMap[a.question.toString()] = a.isCorrect;
  });

  return selected.slice(0, 5).map((q) => ({
    ...stripAnswer(q),
    attempted: attemptMap[q._id.toString()] !== undefined,
    lastCorrect: attemptMap[q._id.toString()] ?? null,
  }));
};

const pickLearningTasks = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const progressList = await RoadmapProgress.find({ user: userId, updatedAt: { $gte: today } }).populate("roadmap", "title category modules");

  const topicTitles = [];
  progressList.forEach((progress) => {
    if (!progress.roadmap) return;
    progress.roadmap.modules.forEach((mod) => {
      (mod.topics || []).forEach((topic) => {
        if (progress.completedTopicIds.includes(String(topic._id))) {
          topicTitles.push({ title: topic.title, roadmap: progress.roadmap.title });
        }
      });
    });
  });

  const questionPool = await PracticeQuestion.find({
    "options.0": { $exists: true },
    correctOptionIndex: { $ne: null },
  });

  const normalize = (s) => String(s || "").toLowerCase();
  const topicKeywords = (title) => {
    const t = normalize(title);
    const tokens = t
      .replace(/[^a-z0-9+#& ]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !["and", "the", "for", "with", "basics", "fundamentals", "essentials"].includes(w));
    return tokens;
  };

  const dailyTasks = topicTitles.map(({ title, roadmap }) => {
    const keywords = topicKeywords(title);
    const matching = [];
    for (const q of shuffle(questionPool)) {
      if (matching.length >= 2) break;
      const qTags = (q.tags || []).map(normalize);
      const qText = normalize(`${q.title} ${q.prompt} ${qTags.join(" ")}`);
      const match = keywords.some((k) => qTags.includes(k) || qText.includes(k));
      if (match && !matching.includes(q)) matching.push(q);
    }
    return {
      topic: title,
      roadmap,
      questions: matching.map(stripAnswer),
    };
  });

  const flattened = dailyTasks.flatMap((t) => t.questions.map((q) => q._id));
  const attempts = await PracticeAttempt.find({ user: userId, question: { $in: flattened } });
  const attemptMap = {};
  attempts.forEach((a) => {
    attemptMap[a.question.toString()] = a.isCorrect;
  });

  return {
    date: new Date().toISOString(),
    learnedTopics: dailyTasks.filter((t) => t.questions.length > 0),
    completedToday: topicTitles.length,
    attemptMap,
  };
};

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [user, readiness, roadmapProgress, practiceAttempts, companies, recentActivity, unreadNotifications, resume] =
      await Promise.all([
        User.findById(userId),
        ReadinessScore.findOne({ user: userId }),
        RoadmapProgress.find({ user: userId }).populate("roadmap", "title category"),
        PracticeAttempt.find({ user: userId }),
        Company.find(),
        Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(8),
        Notification.countDocuments({ user: userId, read: false }),
        Resume.findOne({ user: userId }),
      ]);

    const totalAttempted = practiceAttempts.length;
    const totalCorrect = practiceAttempts.filter((a) => a.isCorrect).length;
    const practiceAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

    const roadmapsInProgress = roadmapProgress.filter((p) => p.percentComplete > 0 && p.percentComplete < 100).length;
    const roadmapsCompleted = roadmapProgress.filter((p) => p.percentComplete === 100).length;

    let bestCompanyMatch = null;
    if (companies.length > 0) {
      const scored = companies.map((company) => {
        const required = company.skillsRequired.map((s) => s.toLowerCase());
        const owned = (user.skills || []).map((s) => s.toLowerCase());
        const missing = required.filter((s) => !owned.includes(s));
        const skillScore = required.length > 0 ? ((required.length - missing.length) / required.length) * 100 : 100;
        const codingScore = readiness?.categories?.coding ?? 0;
        const aptitudeScore = readiness?.categories?.aptitude ?? 0;
        const score = Math.round(skillScore * 0.4 + codingScore * 0.3 + aptitudeScore * 0.3);
        return { name: company.name, id: company._id, readinessScore: score };
      });
      scored.sort((a, b) => b.readinessScore - a.readinessScore);
      bestCompanyMatch = scored[0];
    }

    const recommendations = [];
    if (readiness) {
      const categoryLabels = {
        coding: "Coding", aptitude: "Aptitude", dbms: "DBMS", os: "Operating Systems",
        cn: "Computer Networks", oop: "OOP", technical: "Technical Interview",
        hrInterview: "HR Interview", communication: "Communication", resume: "Resume",
      };
      const entries = Object.entries(readiness.categories.toObject())
        .sort((a, b) => a[1] - b[1])
        .slice(0, 3);
      entries.forEach(([key, value]) => {
        recommendations.push({
          category: key,
          label: categoryLabels[key] || key,
          score: value,
          message: `Your ${categoryLabels[key] || key} readiness is ${value}%. Focus here next.`,
        });
      });
    }

    const [dailyQuestions, dailyTasks] = await Promise.all([pickDailyQuestions(userId), pickLearningTasks(userId)]);
    dailyTasks.learnedTopics.forEach((task) => {
      task.questions.forEach((q) => {
        q.attempted = dailyTasks.attemptMap[String(q._id)] !== undefined;
        q.lastCorrect = dailyTasks.attemptMap[String(q._id)] ?? null;
      });
    });
    delete dailyTasks.attemptMap;

    return res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          department: user.department,
          streak: user.streak,
        },
        readiness: readiness || { overall: 0, categories: {} },
        roadmaps: {
          total: roadmapProgress.length,
          inProgress: roadmapsInProgress,
          completed: roadmapsCompleted,
          items: roadmapProgress.map((p) => ({
            title: p.roadmap?.title,
            category: p.roadmap?.category,
            percentComplete: p.percentComplete,
          })),
        },
        practice: {
          totalAttempted,
          totalCorrect,
          accuracy: practiceAccuracy,
        },
        resume: {
          completionPercent: resume?.completionPercent || 0,
        },
        dailyQuestions,
        dailyTasks,
        bestCompanyMatch,
        recommendations,
        recentActivity,
        unreadNotifications,
      },
    });
  } catch (error) {
    console.error("GET DASHBOARD ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load dashboard data" });
  }
};

module.exports = { getDashboard };
