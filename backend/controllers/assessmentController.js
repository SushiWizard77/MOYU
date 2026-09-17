const Assessment = require("../models/Assessment");
const AssessmentResult = require("../models/AssessmentResult");
const ReadinessScore = require("../models/ReadinessScore");
const { logActivity, createNotification } = require("../utils/activity");

const listAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find().select("-questions.correctOptionIndex");
    return res.status(200).json({ success: true, data: assessments });
  } catch (error) {
    console.error("LIST ASSESSMENTS ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load assessments" });
  }
};

const getAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).select("-questions.correctOptionIndex");
    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }
    return res.status(200).json({ success: true, data: assessment });
  } catch (error) {
    console.error("GET ASSESSMENT ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load assessment" });
  }
};

const submitAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    const { answers } = req.body;
    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "Answers must be an array of option indices" });
    }

    let correctAnswers = 0;
    assessment.questions.forEach((question, index) => {
      if (answers[index] === question.correctOptionIndex) {
        correctAnswers += 1;
      }
    });

    const totalQuestions = assessment.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    const result = await AssessmentResult.create({
      user: req.user.userId,
      assessment: assessment._id,
      category: assessment.category,
      score: correctAnswers,
      totalQuestions,
      correctAnswers,
      percentage,
    });

    let readiness = await ReadinessScore.findOne({ user: req.user.userId });
    if (!readiness) {
      readiness = await ReadinessScore.create({ user: req.user.userId });
    }

    readiness.categories[assessment.category] = percentage;
    const values = Object.values(readiness.categories.toObject());
    readiness.overall = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
    readiness.history.push({ overall: readiness.overall });
    await readiness.save();

    await logActivity(req.user.userId, "assessment", `Scored ${percentage}% on ${assessment.title}`);
    await createNotification(
      req.user.userId,
      "Assessment result ready",
      `You scored ${percentage}% on ${assessment.title}.`,
      "assessment"
    );

    return res.status(201).json({
      success: true,
      message: "Assessment submitted successfully",
      data: { result, readiness },
    });
  } catch (error) {
    console.error("SUBMIT ASSESSMENT ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to submit assessment" });
  }
};

const getMyResults = async (req, res) => {
  try {
    const results = await AssessmentResult.find({ user: req.user.userId })
      .populate("assessment", "title category")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("GET RESULTS ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load assessment history" });
  }
};

const getReadiness = async (req, res) => {
  try {
    let readiness = await ReadinessScore.findOne({ user: req.user.userId });
    if (!readiness) {
      readiness = await ReadinessScore.create({ user: req.user.userId });
    }
    return res.status(200).json({ success: true, data: readiness });
  } catch (error) {
    console.error("GET READINESS ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load readiness score" });
  }
};

module.exports = {
  listAssessments,
  getAssessment,
  submitAssessment,
  getMyResults,
  getReadiness,
};
