const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    personalDetails: {
      fullName: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },
      summary: { type: String, default: "" },
    },
    education: [
      {
        institution: String,
        degree: String,
        field: String,
        startYear: String,
        endYear: String,
        gpa: String,
      },
    ],
    skills: { type: [String], default: [] },
    projects: [
      {
        title: String,
        description: String,
        techStack: [String],
        link: String,
      },
    ],
    internships: [
      {
        company: String,
        role: String,
        duration: String,
        description: String,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        year: String,
      },
    ],
    achievements: { type: [String], default: [] },
    experience: [
      {
        company: String,
        role: String,
        duration: String,
        description: String,
      },
    ],
    design: {
      template: { type: String, default: "modern" },
      align: { type: String, enum: ["left", "center", "right"], default: "left" },
      fontSize: { type: String, enum: ["small", "medium", "large"], default: "medium" },
      accentColor: { type: String, default: "#1D4FD7" },
      fontFamily: { type: String, default: "Inter" },
    },
    completionPercent: { type: Number, default: 0 },
    atsScore: { type: Number, default: null },
    atsCheckedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
