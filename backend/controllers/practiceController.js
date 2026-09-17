const PracticeQuestion = require("../models/PracticeQuestion");
const PracticeAttempt = require("../models/PracticeAttempt");
const User = require("../models/User");
const { logActivity } = require("../utils/activity");

const listQuestions = async (req, res) => {
  try {
    const { category, difficulty, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const skip = (Number(page) - 1) * Number(limit);

    const [questions, total] = await Promise.all([
      PracticeQuestion.find(filter).select("-correctOptionIndex").skip(skip).limit(Number(limit)),
      PracticeQuestion.countDocuments(filter),
    ]);

    const attempts = await PracticeAttempt.find({ user: req.user.userId }).select("question isCorrect");
    const attemptMap = {};
    attempts.forEach((a) => {
      attemptMap[a.question.toString()] = a.isCorrect;
    });

    const data = questions.map((q) => ({
      ...q.toObject(),
      attempted: attemptMap[q._id.toString()] !== undefined,
      lastCorrect: attemptMap[q._id.toString()] ?? null,
    }));

    return res.status(200).json({
      success: true,
      data,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error("LIST QUESTIONS ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load practice questions" });
  }
};

const attemptQuestion = async (req, res) => {
  try {
    const question = await PracticeQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    const { selectedOptionIndex } = req.body;
    const isCorrect = selectedOptionIndex === question.correctOptionIndex;

    await PracticeAttempt.create({
      user: req.user.userId,
      question: question._id,
      category: question.category,
      isCorrect,
      selectedOptionIndex,
    });

    await logActivity(
      req.user.userId,
      "practice",
      `${isCorrect ? "Solved" : "Attempted"} "${question.title}"`
    );

    return res.status(200).json({
      success: true,
      data: { isCorrect, correctOptionIndex: question.correctOptionIndex },
    });
  } catch (error) {
    console.error("ATTEMPT QUESTION ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to submit attempt" });
  }
};

const getStats = async (req, res) => {
  try {
    const attempts = await PracticeAttempt.find({ user: req.user.userId });
    const totalAttempted = attempts.length;
    const totalCorrect = attempts.filter((a) => a.isCorrect).length;
    const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

    const byCategory = {};
    attempts.forEach((a) => {
      if (!byCategory[a.category]) byCategory[a.category] = { attempted: 0, correct: 0 };
      byCategory[a.category].attempted += 1;
      if (a.isCorrect) byCategory[a.category].correct += 1;
    });

    const userDoc = await User.findById(req.user.userId).select("streak").lean();

    return res.status(200).json({
      success: true,
      data: {
        totalAttempted,
        totalAttempts: totalAttempted, // alias for older clients
        totalCorrect,
        correctAttempts: totalCorrect, // alias for older clients
        accuracy,
        streak: userDoc?.streak || { current: 0, longest: 0 },
        byCategory,
      },
    });
  } catch (error) {
    console.error("GET PRACTICE STATS ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load practice statistics" });
  }
};

// ---------- Guided session: N questions, answers revealed only at the end ----------

// GET /api/practice/session/start?category=&difficulty=&count=10
const startSession = async (req, res) => {
  try {
    const { category, difficulty, count } = req.query;
    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (difficulty && difficulty !== "All") filter.difficulty = difficulty;

    const limit = Math.max(5, Math.min(parseInt(count, 10) || 10, 10));
    const questions = await PracticeQuestion.aggregate([
      { $match: filter },
      { $sample: { size: limit } },
      { $project: { title: 1, prompt: 1, options: 1, difficulty: 1, category: 1, tags: 1 } },
    ]);

    res.json({ success: true, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/practice/session/submit  { answers: [{ questionId, selectedIndex }] }
const submitSession = async (req, res) => {
  try {
    const { answers } = req.body || {};
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: "answers array required" });
    }

    const ids = answers.map((a) => a.questionId).filter(Boolean);
    const docs = await PracticeQuestion.find({ _id: { $in: ids } }).lean();
    const byId = new Map(docs.map((d) => [d._id.toString(), d]));

    const results = [];
    const wrongTopics = new Map(); // tag -> { wrong, total }
    const categoryStats = new Map(); // category -> { correct, total }

    for (const a of answers) {
      const q = byId.get(String(a.questionId));
      if (!q) continue;
      const correct = a.selectedIndex === q.correctOptionIndex;
      results.push({
        questionId: q._id,
        title: q.title,
        prompt: q.prompt,
        category: q.category,
        difficulty: q.difficulty,
        options: q.options,
        selectedIndex: a.selectedIndex,
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation || "",
        isCorrect: correct,
      });

      // tag-level error analysis
      for (const tag of q.tags && q.tags.length ? q.tags : ["general"]) {
        const t = wrongTopics.get(tag) || { tag, correct: 0, total: 0 };
        t.total += 1;
        if (correct) t.correct += 1;
        wrongTopics.set(tag, t);
      }
      const c = categoryStats.get(q.category) || { category: q.category, correct: 0, total: 0 };
      c.total += 1;
      if (correct) c.correct += 1;
      categoryStats.set(q.category, c);
    }

    const attempted = results.length;
    const correctCount = results.filter((r) => r.isCorrect).length;
    const wrong = results.filter((r) => !r.isCorrect && r.selectedIndex >= 0).length;
    const skipped = results.filter((r) => r.selectedIndex < 0).length;

    // Weakest tags first -> improvement areas
    const tagRows = [...wrongTopics.values()].map((t) => ({
      ...t,
      accuracy: t.total ? Math.round((t.correct / t.total) * 100) : 0,
    }));
    const improveTags = tagRows.filter((t) => t.accuracy < 100).sort((a, b) => a.accuracy - b.accuracy);
    const strongTags = tagRows.filter((t) => t.accuracy === 100).map((t) => t.tag);

    const score = attempted ? Math.round((correctCount / attempted) * 100) : 0;
    let message;
    if (score >= 80) message = "Excellent work! You have mastered most of these concepts. 🌟";
    else if (score >= 60) message = "Good effort! Review the improvement areas below and try again. 👍";
    else if (score >= 40) message = "You are getting there. Focus on the weak topics listed below. 💪";
    else message = "Do not worry — review the explanations below and retake the session. 🚀";

    res.json({
      success: true,
      data: {
        results,
        score,
        attempted,
        correctCount,
        wrongCount: wrong,
        skippedCount: skipped,
        categoryBreakdown: [...categoryStats.values()],
        improveAreas: improveTags.map((t) => ({
          topic: t.tag,
          accuracy: t.accuracy,
          correct: t.correct,
          total: t.total,
          suggestion: t.accuracy < 50
            ? `Revisit the "${t.tag}" concept from scratch — read a tutorial, then retry these questions.`
            : `Close! Revise "${t.tag}" edge cases and practice a few more questions.`,
        })),
        strongAreas: strongTags,
        message,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { listQuestions, attemptQuestion, getStats, startSession, submitSession };
