const Project = require("../models/Project");
const { logActivity } = require("../utils/activity");

const listProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error("LIST PROJECTS ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load projects" });
  }
};

const createProject = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Project title is required" });
    }
    const project = await Project.create({ user: req.user.userId, ...req.body });
    await logActivity(req.user.userId, "profile", `Added project "${project.title}"`);
    return res.status(201).json({ success: true, message: "Project added", data: project });
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to add project" });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    await logActivity(req.user.userId, "profile", `Updated project "${project.title}"`);
    return res.status(200).json({ success: true, message: "Project updated", data: project });
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to update project" });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    await logActivity(req.user.userId, "profile", `Removed project "${project.title}"`);
    return res.status(200).json({ success: true, message: "Project deleted" });
  } catch (error) {
    console.error("DELETE PROJECT ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to delete project" });
  }
};

module.exports = { listProjects, createProject, updateProject, deleteProject };