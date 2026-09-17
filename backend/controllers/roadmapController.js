const Roadmap = require("../models/Roadmap");
const RoadmapProgress = require("../models/RoadmapProgress");
const { logActivity, createNotification } = require("../utils/activity");

const listRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find();
    const progressList = await RoadmapProgress.find({ user: req.user.userId });

    const progressMap = {};
    progressList.forEach((p) => {
      progressMap[p.roadmap.toString()] = p.percentComplete;
    });

    const data = roadmaps.map((roadmap) => ({
      ...roadmap.toObject(),
      percentComplete: progressMap[roadmap._id.toString()] || 0,
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("LIST ROADMAPS ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load roadmaps" });
  }
};

const getRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ slug: req.params.slug });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found" });
    }

    let progress = await RoadmapProgress.findOne({ user: req.user.userId, roadmap: roadmap._id });
    if (!progress) {
      progress = { completedTopicIds: [], percentComplete: 0 };
    }

    return res.status(200).json({
      success: true,
      data: { roadmap, completedTopicIds: progress.completedTopicIds, percentComplete: progress.percentComplete },
    });
  } catch (error) {
    console.error("GET ROADMAP ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load roadmap" });
  }
};

const toggleTopic = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ slug: req.params.slug });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found" });
    }

    const { topicId } = req.body;
    if (!topicId) {
      return res.status(400).json({ success: false, message: "topicId is required" });
    }

    const totalTopics = roadmap.modules.reduce((sum, m) => sum + m.topics.length, 0);
    if (totalTopics === 0) {
      return res.status(400).json({ success: false, message: "This roadmap has no topics yet" });
    }

    let progress = await RoadmapProgress.findOne({ user: req.user.userId, roadmap: roadmap._id });
    if (!progress) {
      progress = new RoadmapProgress({ user: req.user.userId, roadmap: roadmap._id, completedTopicIds: [] });
    }

    const alreadyCompleted = progress.completedTopicIds.includes(topicId);
    if (alreadyCompleted) {
      progress.completedTopicIds = progress.completedTopicIds.filter((id) => id !== topicId);
    } else {
      progress.completedTopicIds.push(topicId);
    }

    progress.percentComplete = Math.round((progress.completedTopicIds.length / totalTopics) * 100);
    progress.lastActivityAt = new Date();
    await progress.save();

    if (!alreadyCompleted) {
      await logActivity(req.user.userId, "roadmap", `Completed a topic in ${roadmap.title}`);
      if (progress.percentComplete === 100) {
        await createNotification(
          req.user.userId,
          "Roadmap completed!",
          `You finished the ${roadmap.title} roadmap. Great work!`,
          "milestone"
        );
      } else if (progress.percentComplete >= 50 && progress.percentComplete - Math.round(100 / totalTopics) < 50) {
        await createNotification(
          req.user.userId,
          "Halfway there",
          `You're 50% through the ${roadmap.title} roadmap.`,
          "milestone"
        );
      }
    }

    return res.status(200).json({
      success: true,
      data: { completedTopicIds: progress.completedTopicIds, percentComplete: progress.percentComplete },
    });
  } catch (error) {
    console.error("TOGGLE TOPIC ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to update progress" });
  }
};

module.exports = { listRoadmaps, getRoadmap, toggleTopic };
