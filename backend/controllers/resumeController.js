const Resume = require("../models/Resume");
const User = require("../models/User");
const ReadinessScore = require("../models/ReadinessScore");
const { logActivity } = require("../utils/activity");

const computeCompletion = (resume) => {
  let filled = 0;
  const total = 7;

  if (resume.personalDetails?.fullName && resume.personalDetails?.summary) filled += 1;
  if (resume.education?.length > 0) filled += 1;
  if (resume.skills?.length > 0) filled += 1;
  if (resume.projects?.length > 0) filled += 1;
  if (resume.internships?.length > 0) filled += 1;
  if (resume.certifications?.length > 0) filled += 1;
  if (resume.achievements?.length > 0) filled += 1;

  return Math.round((filled / total) * 100);
};

const getResume = async (req, res) => {
  try {
    let resume = await Resume.findOne({ user: req.user.userId });
    if (!resume) {
      resume = await Resume.create({ user: req.user.userId });
    }
    return res.status(200).json({ success: true, data: resume });
  } catch (error) {
    console.error("GET RESUME ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load resume" });
  }
};

const updateResume = async (req, res) => {
  try {
    const allowedFields = [
      "personalDetails", "education", "skills", "projects",
      "internships", "certifications", "achievements", "experience",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    let resume = await Resume.findOne({ user: req.user.userId });
    if (!resume) {
      resume = new Resume({ user: req.user.userId });
    }

    Object.assign(resume, updates);
    resume.completionPercent = computeCompletion(resume);
    await resume.save();

    let readiness = await ReadinessScore.findOne({ user: req.user.userId });
    if (!readiness) {
      readiness = await ReadinessScore.create({ user: req.user.userId });
    }
    readiness.categories.resume = resume.completionPercent;
    const values = Object.values(readiness.categories.toObject());
    readiness.overall = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
    await readiness.save();

    await logActivity(req.user.userId, "resume", "Updated resume information");

    return res.status(200).json({ success: true, message: "Resume updated successfully", data: resume });
  } catch (error) {
    console.error("UPDATE RESUME ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to update resume" });
  }
};

/* ================= ATS CHECKER ================= */

const atsCheck = async (req, res) => {
  try {
    let resume = await Resume.findOne({ user: req.user.userId });
    if (!resume) {
      resume = await Resume.create({ user: req.user.userId });
    }

    const suggestions = [];
    let score = 0;

    const hasFullName = Boolean(resume.personalDetails?.fullName && resume.personalDetails?.fullName.trim());
    const hasPhone = Boolean(resume.personalDetails?.phone && resume.personalDetails?.phone.trim());
    const profile = await User.findById(req.user.userId).select("email");
    const hasEmail = Boolean(
      (resume.personalDetails?.email && resume.personalDetails?.email.trim()) ||
      (profile?.email && profile.email.trim())
    );
    const hasLocation = Boolean(resume.personalDetails?.location && resume.personalDetails?.location.trim());
    const hasSummary = Boolean(resume.personalDetails?.summary && resume.personalDetails?.summary.trim().length >= 20);

    score += hasFullName ? 5 : 0;
    if (!hasFullName) suggestions.push("Your full name is missing — ATS systems need it to identify you.");

    score += hasPhone ? 5 : 0;
    if (!hasPhone) suggestions.push("Add a contact phone number so recruiters can reach you.");

    score += hasEmail ? 5 : 0;
    if (!hasEmail) suggestions.push("Add an email address (use a professional one like name@email.com).");

    score += hasLocation ? 5 : 0;
    if (!hasLocation) suggestions.push("Add your location (city, state) — many filters require it.");

    score += hasSummary ? 12 : 0;
    if (!hasSummary) suggestions.push("Add a 2–3 sentence professional summary with your goal and top strengths.");

    const educationCount = resume.education?.length || 0;
    score += educationCount > 0 ? 13 : 0;
    if (educationCount === 0) suggestions.push("Add your education details (degree, institution, years, CGPA).");

    const skillCount = resume.skills?.length || 0;
    if (skillCount >= 10) score += 13;
    else if (skillCount >= 5) score += 9;
    else if (skillCount > 0) score += 4;
    if (skillCount === 0) suggestions.push("Add at least 5–10 relevant skills with keywords.");

    const projectCount = resume.projects?.length || 0;
    if (projectCount >= 2) score += 12;
    else if (projectCount === 1) score += 6;
    if (projectCount === 0) suggestions.push("Add at least 1–2 projects that show your practical skills.");

    const expCount = (resume.internships?.length || 0) + (resume.experience?.length || 0);
    if (expCount >= 2) score += 12;
    else if (expCount === 1) score += 6;
    if (expCount === 0) suggestions.push("Add internships or work experience — even small ones help ATS ranking.");

    const certCount = resume.certifications?.length || 0;
    score += certCount > 0 ? 5 : 0;
    if (certCount === 0) suggestions.push("Add certifications to strengthen your profile (e.g. NPTEL, Coursera, AWS).");

    const achievementCount = resume.achievements?.length || 0;
    score += achievementCount > 0 ? 5 : 0;
    if (achievementCount === 0) suggestions.push("Add achievements (ranks, awards, hackathons) to stand out.");

    const allText = JSON.stringify(resume.toObject()).toLowerCase();
    const keywordGroups = {
      "programming language (Java/Python/C++)": ["java", "python", "c++"],
      "database skills (SQL/MongoDB)": ["sql", "database", "mongodb", "dbms"],
      "web skills (JavaScript/React/Node)": ["javascript", "react", "node", "html", "css"],
      "DSA fundamentals": ["data structure", "algorithm", "leetcode", "dsa"],
      "soft skills (communication/teamwork)": ["communication", "team", "leadership", "collaborat"],
      "tools (Git/GitHub/API)": ["git", "github", "api"],
      "cloud/devops (AWS/Docker)": ["aws", "azure", "docker", "cloud"],
    };

    const matchedKeywords = [];
    const missingKeywords = [];
    for (const [label, keywords] of Object.entries(keywordGroups)) {
      if (keywords.some((k) => allText.includes(k))) {
        matchedKeywords.push(label);
        score += 2;
      } else {
        missingKeywords.push(label);
      }
    }

    score = Math.round(Math.min(score, 100));

    const grade = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Average" : "Needs Work";
    const passed = score >= 70;

    resume.atsScore = score;
    resume.atsCheckedAt = new Date();
    await resume.save();

    await logActivity(req.user.userId, "resume", `Ran ATS check — scored ${score}%`);

    const improvementTips = [
      "Use action verbs like built, designed, led, improved, optimized.",
      "Quantify your achievements with numbers (e.g. improved load time by 40%).",
      "Keep your resume to a single A4 page whenever possible.",
      "Mirror the exact keywords from job descriptions you are applying to.",
      "Use a clean, single-column layout with standard section headings.",
    ];

    return res.status(200).json({
      success: true,
      data: {
        score,
        grade,
        passed,
        matchedKeywords,
        missingKeywords,
        suggestions: suggestions.slice(0, 6),
        improvementTips,
        checkedAt: resume.atsCheckedAt,
      },
    });
  } catch (error) {
    console.error("ATS CHECK ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to run ATS check" });
  }
};

/* ================= DOWNLOAD (Word / PDF) ================= */

const escapeHtml = (text) =>
  String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const skillChips = (skills) =>
  (skills || []).map((s) => `<span class="chip">${escapeHtml(s)}</span>`).join("");

const buildDocBody = (resume) => {
  const pd = resume.personalDetails || {};
  const d = resume.design || {};
  const align = d.align || "left";
  const fontSize = d.fontSize === "large" ? "13.5px" : d.fontSize === "small" ? "11px" : "12.3px";
  const accent = d.accentColor || "#1D4FD7";
  const fontFamily = d.fontFamily || "Inter";

  const edu = (resume.education || [])
    .map((e) => `<div class="entry"><span class="entry-title">${escapeHtml(e.degree || "")}${e.field ? ` — ${escapeHtml(e.field)}` : ""}</span><span class="entry-sub">${escapeHtml(e.institution || "")}${e.gpa ? ` • CGPA: ${escapeHtml(e.gpa)}` : ""}${e.startYear || e.endYear ? ` • ${escapeHtml(e.startYear || "")}–${escapeHtml(e.endYear || "")}` : ""}</span></div>`)
    .join("");

  const proj = (resume.projects || [])
    .map((p) => `<div class="entry"><span class="entry-title">${escapeHtml(p.title || "")}</span><span class="entry-sub">${escapeHtml(p.description || "")}${p.techStack?.length ? `<br/>${skillChips(p.techStack)}` : ""}${p.link ? `<br/><span class="link">${escapeHtml(p.link)}</span>` : ""}</span></div>`)
    .join("");

  const allExp = [...(resume.internships || []), ...(resume.experience || [])];
  const exp = allExp
    .map((e) => `<div class="entry"><span class="entry-title">${escapeHtml(e.role || "")}${e.company ? ` @ ${escapeHtml(e.company)}` : ""}</span><span class="entry-sub">${escapeHtml(e.duration || "")}${e.description ? `<br/>${escapeHtml(e.description)}` : ""}</span></div>`)
    .join("");

  const certs = (resume.certifications || [])
    .map((c) => `<div class="entry"><span class="entry-title">${escapeHtml(c.name || "")}</span><span class="entry-sub">${escapeHtml(c.issuer || "")}${c.year ? ` • ${escapeHtml(c.year)}` : ""}</span></div>`)
    .join("");

  const ach = (resume.achievements || [])
    .map((a) => `<div class="entry-sub">• ${escapeHtml(a)}</div>`)
    .join("");

  return { pd, align, fontSize, accent, fontFamily, edu, proj, exp, certs, ach, skills: skillChips(resume.skills || []) };
};

const buildDocHtml = (resume) => {
  const { pd, align, fontSize, accent, fontFamily, edu, proj, exp, certs, ach, skills } = buildDocBody(resume);

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escapeHtml(pd.fullName || "Resume")}</title></head>
<body style="font-family:${escapeHtml(fontFamily)},'Segoe UI',Arial,sans-serif;background:#ffffff;color:#111827;max-width:760px;margin:24px auto;font-size:${fontSize};">
  <div style="border-bottom:3px solid ${escapeHtml(accent)};padding-bottom:10px;text-align:${escapeHtml(align)};">
    <h1 style="margin:0;font-size:22px;letter-spacing:1px;text-transform:uppercase;">${escapeHtml(pd.fullName || "Your Name")}</h1>
    <p style="margin:4px 0 0;font-size:11px;color:#4b5563;">${[pd.phone, pd.email, pd.location].filter(Boolean).map(escapeHtml).join(" &nbsp;•&nbsp; ")}</p>
  </div>
  ${pd.summary ? `<p style="text-align:${escapeHtml(align)};line-height:1.5;">${escapeHtml(pd.summary)}</p>` : ""}
  ${edu ? `<div><div style="font-weight:700;color:${escapeHtml(accent)};text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e5e7eb;padding-bottom:2px;margin:16px 0 6px;">Education</div>${edu}</div>` : ""}
  ${skills ? `<div><div style="font-weight:700;color:${escapeHtml(accent)};text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e5e7eb;padding-bottom:2px;margin:16px 0 6px;">Skills</div><div>${skills}</div></div>` : ""}
  ${proj ? `<div><div style="font-weight:700;color:${escapeHtml(accent)};text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e5e7eb;padding-bottom:2px;margin:16px 0 6px;">Projects</div>${proj}</div>` : ""}
  ${exp ? `<div><div style="font-weight:700;color:${escapeHtml(accent)};text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e5e7eb;padding-bottom:2px;margin:16px 0 6px;">Experience</div>${exp}</div>` : ""}
  ${certs ? `<div><div style="font-weight:700;color:${escapeHtml(accent)};text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e5e7eb;padding-bottom:2px;margin:16px 0 6px;">Certifications</div>${certs}</div>` : ""}
  ${ach ? `<div><div style="font-weight:700;color:${escapeHtml(accent)};text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e5e7eb;padding-bottom:2px;margin:16px 0 6px;">Achievements</div>${ach}</div>` : ""}
</body></html>`;
};

const buildPdf = (resume) => {
  const PDFDocument = require("pdfkit");
  const doc = new PDFDocument({ size: "A4", margin: 54 });
  const buffers = [];
  doc.on("data", (chunk) => buffers.push(chunk));

  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const { pd, align, accent } = buildDocBody(resume);
    const fontSize = resume.design?.fontSize === "large" ? 12 : resume.design?.fontSize === "small" ? 9.5 : 11;

    const textAlign = align === "center" ? "center" : align === "right" ? "right" : "left";

    doc.font("Helvetica-Bold").fontSize(20).fillColor("#111827").text(pd.fullName || "Your Name", { align: textAlign });
    doc.moveDown(0.2);
    doc.font("Helvetica").fontSize(9).fillColor("#4b5563");
    const contact = [pd.phone, pd.email, pd.location].filter(Boolean).join("  •  ");
    if (contact) doc.text(contact, { align: textAlign });
    doc.moveDown(0.5);
    doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).strokeColor(accent).lineWidth(2).stroke();

    const sectionTitle = (title) => {
      doc.moveDown(0.6);
      doc.font("Helvetica-Bold").fontSize(11).fillColor(accent).text(title.toUpperCase());
      doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).strokeColor("#E5E7EB").lineWidth(0.6).stroke();
      doc.moveDown(0.15);
    };

    const renderEntry = (title, sub) => {
      doc.font("Helvetica-Bold").fontSize(fontSize).fillColor("#111827").text(title);
      if (sub) {
        doc.font("Helvetica").fontSize(fontSize - 1).fillColor("#4b5563").text(sub);
      }
      doc.moveDown(0.25);
    };

    doc.font("Helvetica").fontSize(fontSize).fillColor("#111827");
    if (pd.summary) doc.text(pd.summary, { lineGap: 2 });

    if (resume.education?.length) {
      sectionTitle("Education");
      (resume.education || []).forEach((e) =>
        renderEntry(`${e.degree || ""}${e.field ? ` — ${e.field}` : ""}`, `${e.institution || ""}${e.gpa ? `  •  CGPA: ${e.gpa}` : ""}${e.startYear || e.endYear ? `  •  ${e.startYear || ""}–${e.endYear || ""}` : ""}`)
      );
    }

    if (resume.skills?.length) {
      sectionTitle("Skills");
      doc.font("Helvetica").fontSize(fontSize).fillColor("#111827").text((resume.skills || []).join(",  "));
    }

    if (resume.projects?.length) {
      sectionTitle("Projects");
      (resume.projects || []).forEach((p) => {
        renderEntry(
          p.title || "",
          `${p.description || ""}${p.techStack?.length ? `\nTech: ${p.techStack.join(", ")}` : ""}${p.link ? `\n${p.link}` : ""}`
        );
      });
    }

    const allExp = [...(resume.internships || []), ...(resume.experience || [])];
    if (allExp.length) {
      sectionTitle("Experience");
      allExp.forEach((e) => renderEntry(`${e.role || ""}${e.company ? ` @ ${e.company}` : ""}`, `${e.duration || ""}${e.description ? `\n${e.description}` : ""}`));
    }

    if (resume.certifications?.length) {
      sectionTitle("Certifications");
      (resume.certifications || []).forEach((c) => renderEntry(c.name || "", `${c.issuer || ""}${c.year ? `  •  ${c.year}` : ""}`));
    }

    if (resume.achievements?.length) {
      sectionTitle("Achievements");
      (resume.achievements || []).forEach((a) => doc.font("Helvetica").fontSize(fontSize).fillColor("#111827").text(`•  ${a}`));
    }

    doc.end();
  });
};

const downloadResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user.userId });
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found — save your details first" });
    }

    const format = String(req.query.format || "pdf").toLowerCase();
    const safeName = (resume.personalDetails?.fullName || "MyResume").replace(/[^a-zA-Z0-9-_ ]/g, "").trim().replace(/\s+/g, "_");

    if (format === "docx" || format === "doc" || format === "word") {
      const html = buildDocHtml(resume);
      res.setHeader("Content-Type", "application/msword");
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}.doc"`);
      await logActivity(req.user.userId, "resume", "Downloaded resume (Word)");
      return res.send(Buffer.from(html, "utf-8"));
    }

    const pdf = await buildPdf(resume);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}.pdf"`);
    await logActivity(req.user.userId, "resume", "Downloaded resume (PDF)");
    return res.send(pdf);
  } catch (error) {
    console.error("DOWNLOAD RESUME ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to generate the resume file" });
  }
};

module.exports = { getResume, updateResume, atsCheck, downloadResume };
