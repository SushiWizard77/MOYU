import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  CheckCircle2,
  Download,
  FileText,
  Palette,
  Plus,
  Ruler,
  Save,
  ScanSearch,
  Sparkles,
  Trash2,
  Type,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import Button from "../components/ui/Button";
import ProgressBar from "../components/ui/ProgressBar";
import Badge from "../components/ui/Badge";
import { resumeService } from "../services/resume.service";

const inputClass =
  "w-full rounded-xl border border-lavender-200/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none placeholder:text-lavender-500 focus:border-brand-400/60";

const FONT_SIZE_OPTIONS = [
  { value: "small", label: "Compact" },
  { value: "medium", label: "Regular" },
  { value: "large", label: "Large" },
];

const FONT_FAMILIES = [
  { value: "Inter", label: "Inter (Modern)" },
  { value: "Georgia", label: "Georgia (Serif)" },
  { value: "Courier New", label: "Courier (Mono)" },
  { value: "Verdana", label: "Verdana (Sans)" },
];

const ACCENT_COLORS = ["#1D4FD7", "#0EA5E9", "#059669", "#D97706", "#DC2626", "#7C3AED"];

const DEFAULT_DESIGN = {
  template: "modern",
  align: "left",
  fontSize: "medium",
  accentColor: "#1D4FD7",
  fontFamily: "Inter",
};

const ALIGN_OPTIONS = [
  { value: "left", icon: AlignLeft, label: "Align Left" },
  { value: "center", icon: AlignCenter, label: "Align Center" },
  { value: "right", icon: AlignRight, label: "Align Right" },
];

function Resume() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const [ats, setAts] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [downloading, setDownloading] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    resumeService
      .get()
      .then((res) => {
        if (res.success) setResume(res.data);
      })
      .catch((err) => setError(err.message || "Unable to load resume."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const getDesign = () => ({ ...DEFAULT_DESIGN, ...(resume?.design || {}) });

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await resumeService.update({
        personalDetails: resume.personalDetails,
        education: resume.education,
        skills: resume.skills,
        projects: resume.projects,
        internships: resume.internships,
        certifications: resume.certifications,
        achievements: resume.achievements,
        experience: resume.experience,
        design: getDesign(),
      });
      if (res.success) {
        setResume(res.data);
        setMessage("Resume saved successfully.");
      }
    } catch (err) {
      setError(err.message || "Unable to save resume.");
    } finally {
      setSaving(false);
    }
  };

  const runAtsCheck = async () => {
    setAtsLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await resumeService.atsCheck();
      if (res.success) setAts(res.data);
    } catch (err) {
      setError(err.message || "Unable to run ATS check.");
    } finally {
      setAtsLoading(false);
    }
  };

  const handleDownload = async (format) => {
    setDownloading(format);
    setError("");
    try {
      const { blob } = await resumeService.download(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const name = (resume.personalDetails?.fullName || "MyResume").replace(/\s+/g, "_");
      a.download = format === "pdf" ? `${name}.pdf` : `${name}.doc`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage(format === "pdf" ? "Resume downloaded as PDF." : "Resume downloaded as Word document.");
    } catch (err) {
      setError(err.message || "Unable to download the resume.");
    } finally {
      setDownloading("");
    }
  };

  const updateDesign = (key, value) => {
    setResume((prev) => ({ ...prev, design: { ...(prev.design || DEFAULT_DESIGN), [key]: value } }));
  };

  const updatePersonal = (field, value) => {
    setResume((prev) => ({ ...prev, personalDetails: { ...prev.personalDetails, [field]: value } }));
  };

  const addListItem = (field, template) => {
    setResume((prev) => ({ ...prev, [field]: [...(prev[field] || []), template] }));
  };

  const updateListItem = (field, index, key, value) => {
    setResume((prev) => {
      const items = [...(prev[field] || [])];
      items[index] = { ...items[index], [key]: value };
      return { ...prev, [field]: items };
    });
  };

  const removeListItem = (field, index) => {
    setResume((prev) => ({ ...prev, [field]: (prev[field] || []).filter((_, i) => i !== index) }));
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setResume((prev) => ({ ...prev, skills: [...(prev.skills || []), skillInput.trim()] }));
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setResume((prev) => ({ ...prev, skills: (prev.skills || []).filter((s) => s !== skill) }));
  };

  const addAchievement = (value) => {
    if (!value.trim()) return;
    setResume((prev) => ({ ...prev, achievements: [...(prev.achievements || []), value.trim()] }));
  };

  const removeAchievement = (index) => {
    setResume((prev) => ({ ...prev, achievements: (prev.achievements || []).filter((_, i) => i !== index) }));
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Resume">
        <LoadingState label="Loading your resume..." />
      </DashboardLayout>
    );
  }

  if (error && !resume) {
    return (
      <DashboardLayout pageTitle="Resume">
        <ErrorState message={error} onRetry={load} />
      </DashboardLayout>
    );
  }

  const design = getDesign();

  return (
    <DashboardLayout pageTitle="Resume Builder">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-black">Resume Builder</h1>
          <p className="mt-2 text-sm text-lavender-400">Build, style, ATS-check, and download your placement resume.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => handleDownload("docx")} disabled={downloading !== ""}>
            <Download size={16} />
            {downloading === "docx" ? "Preparing..." : "Word"}
          </Button>
          <Button variant="secondary" onClick={() => handleDownload("pdf")} disabled={downloading !== ""}>
            <Download size={16} />
            {downloading === "pdf" ? "Preparing..." : "PDF"}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save size={16} />
            {saving ? "Saving..." : "Save Resume"}
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="max-w-xs flex-1">
          <div className="mb-1 flex justify-between text-xs text-lavender-400">
            <span>Resume completeness</span>
            <span>{resume.completionPercent}%</span>
          </div>
          <ProgressBar value={resume.completionPercent} />
        </div>
        <Button variant="secondary" onClick={runAtsCheck} disabled={atsLoading}>
          <ScanSearch size={16} />
          {atsLoading ? "Checking..." : "Run ATS Check"}
        </Button>
        {ats && (
          <div className="flex items-center gap-2 text-sm">
            <Badge tone={ats.passed ? "success" : "danger"}>{ats.grade}</Badge>
            <span className="font-black text-brand-200">{ats.score}% ATS score</span>
          </div>
        )}
      </div>

      {message && <p className="mt-3 text-sm text-emerald-400">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {ats && (
        <section className="mt-5 rounded-2xl border border-lavender-200/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold">ATS Check — {ats.grade}</h2>
              <p className="mt-1 text-xs text-lavender-500">
                Score: <span className="font-bold text-brand-200">{ats.score}%</span> — {ats.passed ? "Looks recruiter-ready!" : "Improve these points and re-check."}
              </p>
            </div>
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${ats.passed ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
              {ats.score}%
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {ats.matchedKeywords.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold text-emerald-300">✓ Keywords found</p>
                <div className="space-y-1.5">
                  {ats.matchedKeywords.map((k) => (
                    <p key={k} className="flex items-start gap-2 text-xs text-lavender-300"><CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-400" />{k}</p>
                  ))}
                </div>
              </div>
            )}
            {ats.missingKeywords.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold text-amber-300">Keywords to add</p>
                <div className="space-y-1.5">
                  {ats.missingKeywords.slice(0, 5).map((k) => (
                    <p key={k} className="flex items-start gap-2 text-xs text-lavender-300"><XCircle size={13} className="mt-0.5 shrink-0 text-amber-400" />{k}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
          {ats.suggestions.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold text-lavender-200">What to fix</p>
              <ul className="list-inside list-disc space-y-1 text-xs text-lavender-300">
                {ats.suggestions.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          )}
        </section>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_400px]">
        <div>
          <section className="rounded-2xl border border-lavender-200/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-bold"><Ruler size={16} className="text-brand-300" /> Design & Alignment</h2>
              {JSON.stringify(design) !== JSON.stringify(DEFAULT_DESIGN) && (
                <button onClick={() => setResume((prev) => ({ ...prev, design: { ...DEFAULT_DESIGN } }))} className="text-xs font-semibold text-lavender-400 hover:text-white">Reset</button>
              )}
            </div>
            <p className="mt-1 text-xs text-lavender-500">These choices apply to the live preview AND your Word/PDF downloads.</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-lavender-400">Template</label>
                <div className="flex flex-wrap gap-2">
                  {["modern", "classic", "minimal"].map((tpl) => (
                    <button
                      key={tpl}
                      onClick={() => updateDesign("template", tpl)}
                      className={`rounded-xl px-3.5 py-2 text-xs font-semibold capitalize transition ${
                        design.template === tpl ? "bg-brand-500/25 text-lavender-100" : "border border-lavender-200/10 text-lavender-400 hover:bg-white/5"
                      }`}
                    >
                      <Sparkles size={12} className="mr-1 inline" />
                      {tpl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-lavender-400">Text Alignment</label>
                <div className="flex gap-2">
                  {ALIGN_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        title={opt.label}
                        onClick={() => updateDesign("align", opt.value)}
                        className={`flex h-9 flex-1 items-center justify-center rounded-xl transition ${
                          design.align === opt.value ? "bg-brand-500/25 text-lavender-100" : "border border-lavender-200/10 text-lavender-400 hover:bg-white/5"
                        }`}
                      >
                        <Icon size={16} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-lavender-400">Font Size</label>
                <div className="flex gap-2">
                  {FONT_SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateDesign("fontSize", opt.value)}
                      className={`flex-1 rounded-xl px-2.5 py-2 text-xs font-semibold transition ${
                        design.fontSize === opt.value ? "bg-brand-500/25 text-lavender-100" : "border border-lavender-200/10 text-lavender-400 hover:bg-white/5"
                      }`}
                    >
                      <Type size={12} className="mr-1 inline" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-lavender-400">Font Family</label>
                <select
                  className={inputClass}
                  value={design.fontFamily}
                  onChange={(e) => updateDesign("fontFamily", e.target.value)}
                >
                  {FONT_FAMILIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-lavender-400">Accent Color</label>
                <div className="flex flex-wrap items-center gap-3">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateDesign("accentColor", color)}
                      className={`h-8 w-8 rounded-full transition ${design.accentColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-brand-950" : "hover:scale-110"}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <label className="flex items-center gap-2 text-xs text-lavender-400">
                    <Palette size={14} />
                    Custom
                    <input type="color" value={design.accentColor} onChange={(e) => updateDesign("accentColor", e.target.value)} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent" />
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-lavender-200/10 bg-white/[0.03] p-6">
        <h2 className="font-bold">Personal Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <input
            className={inputClass}
            placeholder="Full Name"
            value={resume.personalDetails.fullName || ""}
            onChange={(e) => updatePersonal("fullName", e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Email"
            value={resume.personalDetails.email || ""}
            onChange={(e) => updatePersonal("email", e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Phone"
            value={resume.personalDetails.phone || ""}
            onChange={(e) => updatePersonal("phone", e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Location"
            value={resume.personalDetails.location || ""}
            onChange={(e) => updatePersonal("location", e.target.value)}
          />
        </div>
        <textarea
          className={`${inputClass} mt-4`}
          rows={3}
          placeholder="Professional summary"
          value={resume.personalDetails.summary || ""}
          onChange={(e) => updatePersonal("summary", e.target.value)}
        />
      </section>

      <section className="mt-6 rounded-2xl border border-lavender-200/10 bg-white/[0.03] p-6">
        <h2 className="font-bold">Skills</h2>
        <div className="mt-4 flex gap-2">
          <input
            className={inputClass}
            placeholder="Add a skill and press Enter"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
          />
          <Button variant="secondary" onClick={addSkill}>
            <Plus size={16} />
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(resume.skills || []).map((skill) => (
            <span key={skill} className="flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1.5 text-xs text-lavender-100">
              {skill}
              <button onClick={() => removeSkill(skill)} className="text-lavender-400 hover:text-red-400">
                <Trash2 size={12} />
              </button>
            </span>
          ))}
        </div>
      </section>

      <RepeatingSection
        title="Education"
        items={resume.education || []}
        onAdd={() => addListItem("education", { institution: "", degree: "", field: "", startYear: "", endYear: "", gpa: "" })}
        onRemove={(i) => removeListItem("education", i)}
        renderItem={(item, index) => (
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inputClass} placeholder="Institution" value={item.institution || ""} onChange={(e) => updateListItem("education", index, "institution", e.target.value)} />
            <input className={inputClass} placeholder="Degree" value={item.degree || ""} onChange={(e) => updateListItem("education", index, "degree", e.target.value)} />
            <input className={inputClass} placeholder="Field of Study" value={item.field || ""} onChange={(e) => updateListItem("education", index, "field", e.target.value)} />
            <input className={inputClass} placeholder="GPA / Percentage" value={item.gpa || ""} onChange={(e) => updateListItem("education", index, "gpa", e.target.value)} />
            <input className={inputClass} placeholder="Start Year" value={item.startYear || ""} onChange={(e) => updateListItem("education", index, "startYear", e.target.value)} />
            <input className={inputClass} placeholder="End Year" value={item.endYear || ""} onChange={(e) => updateListItem("education", index, "endYear", e.target.value)} />
          </div>
        )}
      />

      <RepeatingSection
        title="Projects"
        items={resume.projects || []}
        onAdd={() => addListItem("projects", { title: "", description: "", techStack: [], link: "" })}
        onRemove={(i) => removeListItem("projects", i)}
        renderItem={(item, index) => (
          <div className="grid gap-3">
            <input className={inputClass} placeholder="Project Title" value={item.title || ""} onChange={(e) => updateListItem("projects", index, "title", e.target.value)} />
            <textarea className={`${inputClass} min-h-20`} placeholder="Description — what you built, your role, impact" value={item.description || ""} onChange={(e) => updateListItem("projects", index, "description", e.target.value)} />
            <input className={inputClass} placeholder="Tech stack (comma separated)" value={(item.techStack || []).join(", ")} onChange={(e) => updateListItem("projects", index, "techStack", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            <input className={inputClass} placeholder="Link (GitHub / live demo)" value={item.link || ""} onChange={(e) => updateListItem("projects", index, "link", e.target.value)} />
          </div>
        )}
      />

      <RepeatingSection
        title="Internships"
        items={resume.internships || []}
        onAdd={() => addListItem("internships", { company: "", role: "", duration: "", description: "" })}
        onRemove={(i) => removeListItem("internships", i)}
        renderItem={(item, index) => (
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inputClass} placeholder="Company" value={item.company || ""} onChange={(e) => updateListItem("internships", index, "company", e.target.value)} />
            <input className={inputClass} placeholder="Role" value={item.role || ""} onChange={(e) => updateListItem("internships", index, "role", e.target.value)} />
            <input className={inputClass} placeholder="Duration (e.g. Jun 2025 – Aug 2025)" value={item.duration || ""} onChange={(e) => updateListItem("internships", index, "duration", e.target.value)} />
            <textarea className={`${inputClass} sm:col-span-2`} placeholder="What you did and the impact" value={item.description || ""} onChange={(e) => updateListItem("internships", index, "description", e.target.value)} />
          </div>
        )}
      />

      <RepeatingSection
        title="Certifications"
        items={resume.certifications || []}
        onAdd={() => addListItem("certifications", { name: "", issuer: "", year: "" })}
        onRemove={(i) => removeListItem("certifications", i)}
        renderItem={(item, index) => (
          <div className="grid gap-3 sm:grid-cols-3">
            <input className={inputClass} placeholder="Certification Name" value={item.name || ""} onChange={(e) => updateListItem("certifications", index, "name", e.target.value)} />
            <input className={inputClass} placeholder="Issuer" value={item.issuer || ""} onChange={(e) => updateListItem("certifications", index, "issuer", e.target.value)} />
            <input className={inputClass} placeholder="Year" value={item.year || ""} onChange={(e) => updateListItem("certifications", index, "year", e.target.value)} />
          </div>
        )}
      />

      <section className="mt-6 rounded-2xl border border-lavender-200/10 bg-white/[0.03] p-6">
        <h2 className="font-bold">Achievements</h2>
        <div className="mt-4 space-y-2">
          {(resume.achievements || []).map((achievement, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex-1 rounded-xl border border-lavender-200/10 bg-white/[0.02] px-4 py-2.5 text-sm text-lavender-100">
                {achievement}
              </span>
              <button onClick={() => removeAchievement(index)} className="text-lavender-500 hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <AchievementInput onAdd={addAchievement} />
      </section>
        </div>

        <div className="space-y-4 self-start xl:sticky xl:top-24">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold"><FileText size={16} className="text-brand-300" /> Live Preview</h2>
            <span className="text-xs text-lavender-500">Auto-updates as you type</span>
          </div>
          <ResumePreview resume={resume} />

          <div className="rounded-2xl border border-lavender-200/10 bg-white/[0.03] p-5">
            <h3 className="text-sm font-bold">Need it perfect?</h3>
            <p className="mt-1 text-xs text-lavender-500">
              Run the ATS check above, then download your resume as a Word document or PDF — the download uses your current design and alignment.
            </p>
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
}

function ResumePreview({ resume }) {
  const pd = resume.personalDetails || {};
  const des = resume.design || {};
  const align = des.align || "left";
  const fontSizeMap = { small: "11px", medium: "13px", large: "15px" };
  const fontSize = fontSizeMap[des.fontSize] || "13px";
  const accent = des.accentColor || "#1D4FD7";
  const fontFamily = des.fontFamily || "Inter";
  const template = des.template || "modern";

  const textAlign = align;
  const contactItems = [pd.email, pd.phone, pd.location].filter(Boolean).join("  •  ");

  const titleFont = template === "classic" ? { fontFamily: "Georgia, serif" } : template === "minimal" ? { fontWeight: 500 } : { letterSpacing: "2px" };

  const sectionTitle = (tx) => {
    if (template === "minimal") {
      return <div style={{ color: "#111827", fontWeight: 600, textTransform: "uppercase", fontSize: "11px", letterSpacing: "1.5px", marginBottom: 6 }}>{tx}</div>;
    }
    return (
      <div style={{ color: accent, fontWeight: 700, textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", borderBottom: template === "modern" ? `2px solid ${accent}` : "1px solid #e5e7eb", paddingBottom: 4, marginBottom: 8 }}>
        {tx}
      </div>
    );
  };

  const entryTitle = { color: "#111827", fontWeight: 600 };
  const entrySub = { color: "#4b5563", fontSize: `calc(${fontSize} - 1px)`, lineHeight: 1.5 };

  const expItems = [...(resume.internships || []), ...(resume.experience || [])];

  return (
    <div
      className="max-h-[640px] overflow-y-auto rounded-2xl bg-white p-7 text-slate-900 shadow-2xl shadow-brand-900/40"
      style={{ fontFamily, fontSize, textAlign }}
    >
      <div style={{ borderBottom: template === "modern" ? `3px solid ${accent}` : "2px solid #e5e7eb", paddingBottom: 10 }}>
        <h2 style={{ ...titleFont, margin: 0, fontSize: "22px", textTransform: "uppercase", color: "#0f172a" }}>
          {pd.fullName || "Your Name"}
        </h2>
        {contactItems && <p style={{ margin: "4px 0 0", color: "#4b5563", fontSize: "11px" }}>{contactItems}</p>}
      </div>

      {pd.summary && <p style={{ margin: "14px 0 0", lineHeight: 1.6, color: "#334155" }}>{pd.summary}</p>}

      {(resume.education || []).length > 0 && (
        <div style={{ marginTop: 18 }}>
          {sectionTitle("Education")}
          {(resume.education || []).map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={entryTitle}>{e.degree || "Degree"}{e.field ? ` — ${e.field}` : ""}</div>
              <div style={entrySub}>
                {[e.institution, e.gpa ? `CGPA: ${e.gpa}` : "", e.startYear || e.endYear ? `${e.startYear || ""}–${e.endYear || ""}` : ""].filter(Boolean).join("  •  ")}
              </div>
            </div>
          ))}
        </div>
      )}

      {(resume.skills || []).length > 0 && (
        <div style={{ marginTop: 18 }}>
          {sectionTitle("Skills")}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(resume.skills || []).map((s, i) => (
              <span key={i} style={{ border: `1px solid ${accent}33`, background: `${accent}11`, color: "#1e293b", borderRadius: 999, padding: "3px 10px", fontSize: `calc(${fontSize} - 2px)` }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {(resume.projects || []).length > 0 && (
        <div style={{ marginTop: 18 }}>
          {sectionTitle("Projects")}
          {(resume.projects || []).map((p, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={entryTitle}>{p.title || "Project"}</div>
              <div style={entrySub}>
                {p.description}
                {p.techStack && p.techStack.length > 0 && <div style={{ marginTop: 2 }}><strong>Tech:</strong> {p.techStack.join(", ")}</div>}
                {p.link && <div style={{ color: accent }}>{p.link}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {expItems.length > 0 && (
        <div style={{ marginTop: 18 }}>
          {sectionTitle("Experience")}
          {expItems.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={entryTitle}>{e.role || "Role"}{e.company ? ` @ ${e.company}` : ""}</div>
              <div style={entrySub}>
                {e.duration}
                {e.description && <div>{e.description}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {(resume.certifications || []).length > 0 && (
        <div style={{ marginTop: 18 }}>
          {sectionTitle("Certifications")}
          {(resume.certifications || []).map((c, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <span style={entryTitle}>{c.name || "Certification"}</span>
              <span style={entrySub}> — {[c.issuer, c.year].filter(Boolean).join(", ")}</span>
            </div>
          ))}
        </div>
      )}

      {(resume.achievements || []).length > 0 && (
        <div style={{ marginTop: 18 }}>
          {sectionTitle("Achievements")}
          <ul style={{ margin: 0, paddingLeft: 18, color: "#334155" }}>
            {(resume.achievements || []).map((a, i) => <li key={i} style={{ marginBottom: 4 }}>{a}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function RepeatingSection({ title, items, onAdd, onRemove, renderItem }) {
  return (
    <section className="mt-6 rounded-2xl border border-lavender-200/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">{title}</h2>
        <Button variant="secondary" onClick={onAdd}>
          <Plus size={14} />
          Add
        </Button>
      </div>
      <div className="mt-4 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-lavender-500">No entries yet. Click "Add" to get started.</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="rounded-xl border border-lavender-200/10 bg-white/[0.02] p-4">
              <div className="mb-3 flex justify-end">
                <button onClick={() => onRemove(index)} className="text-lavender-500 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
              {renderItem(item, index)}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function AchievementInput({ onAdd }) {
  const [value, setValue] = useState("");
  return (
    <div className="mt-3 flex gap-2">
      <input
        className={inputClass}
        placeholder="Add an achievement and press Enter"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAdd(value);
            setValue("");
          }
        }}
      />
      <Button
        variant="secondary"
        onClick={() => {
          onAdd(value);
          setValue("");
        }}
      >
        <Plus size={16} />
      </Button>
    </div>
  );
}

export default Resume;