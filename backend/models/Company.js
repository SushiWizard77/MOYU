const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    industry: { type: String, default: "" },
    roles: { type: [String], default: [] },
    eligibility: { type: String, default: "" },
    skillsRequired: { type: [String], default: [] },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    interviewRounds: { type: [String], default: [] },
    commonTopics: { type: [String], default: [] },
    codingExpectations: { type: String, default: "" },
    aptitudeExpectations: { type: String, default: "" },
    resources: { type: [String], default: [] },
    logoLetter: { type: String, default: "C" },
    logoUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
