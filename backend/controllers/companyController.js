const Company = require("../models/Company");
const ReadinessScore = require("../models/ReadinessScore");
const User = require("../models/User");

const computeCompanyReadiness = (company, readiness, userSkills) => {
  const required = company.skillsRequired.map((s) => s.toLowerCase());
  const owned = (userSkills || []).map((s) => s.toLowerCase());
  const missing = required.filter((s) => !owned.includes(s));

  const skillScore = required.length > 0 ? ((required.length - missing.length) / required.length) * 100 : 100;
  const codingScore = readiness?.categories?.coding ?? 0;
  const aptitudeScore = readiness?.categories?.aptitude ?? 0;

  const readinessScore = Math.round(skillScore * 0.4 + codingScore * 0.3 + aptitudeScore * 0.3);

  return {
    readinessScore,
    missingSkills: company.skillsRequired.filter((s) => missing.includes(s.toLowerCase())),
  };
};

const listCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    const readiness = await ReadinessScore.findOne({ user: req.user.userId });
    const user = await User.findById(req.user.userId);

    const data = companies.map((company) => {
      const { readinessScore, missingSkills } = computeCompanyReadiness(company, readiness, user.skills);
      return { ...company.toObject(), readinessScore, missingSkills };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("LIST COMPANIES ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load companies" });
  }
};

const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    const readiness = await ReadinessScore.findOne({ user: req.user.userId });
    const user = await User.findById(req.user.userId);
    const { readinessScore, missingSkills } = computeCompanyReadiness(company, readiness, user.skills);

    return res.status(200).json({
      success: true,
      data: { ...company.toObject(), readinessScore, missingSkills },
    });
  } catch (error) {
    console.error("GET COMPANY ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load company" });
  }
};

module.exports = { listCompanies, getCompany };
