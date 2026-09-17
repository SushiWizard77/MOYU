import { Camera, Flame, Link2, Plus, Save, Trash2, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import LoadingState from "../components/ui/LoadingState";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import StatCard from "../components/ui/StatCard";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/auth.service";

const inputClass =
  "w-full rounded-xl border border-var(--card-border) bg-var(--card-bg) px-4 py-2.5 text-sm text-var(--text-primary) outline-none placeholder:text-var(--text-muted) focus:border-brand-400/60";

const labelClass = "mb-1.5 block text-xs font-medium text-var(--text-muted)";

const sectionClass = "rounded-2xl border border-var(--card-border) bg-var(--card-bg) p-6";

function TagInput({ items, onAdd, onRemove, placeholder }) {
  const [value, setValue] = useState("");

  const submit = () => {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          className={inputClass}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button variant="secondary" onClick={submit}>
          <Plus size={16} />
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length === 0 && <p className="text-sm text-var(--text-muted)">None added yet.</p>}
        {items.map((item) => (
          <span
            key={item}
            className="flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1.5 text-xs text-var(--text-primary)"
          >
            {item}
            <button onClick={() => onRemove(item)} className="text-var(--text-muted) hover:text-red-400">
              <Trash2 size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        setForm({
          name: user.name || "",
          college: user.college || "",
          department: user.department || "",
          year: user.year || "",
          phone: user.phone || "",
          city: user.city || "",
          bio: user.bio || "",
          avatar: user.avatar || "",
          skills: user.skills || [],
          github: user.github || "",
          linkedin: user.linkedin || "",
          targetRoles: user.targetRoles || [],
        });

        setLoading(false);
      }, 0);
    }
  }, [user]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = (skill) => updateField("skills", [...form.skills, skill]);
  const removeSkill = (skill) => updateField("skills", form.skills.filter((s) => s !== skill));
  const addTargetRole = (role) => updateField("targetRoles", [...form.targetRoles, role]);
  const removeTargetRole = (role) => updateField("targetRoles", form.targetRoles.filter((r) => r !== role));

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await authService.updateMe(form);
      if (res.success) {
        updateUser(res.user);
        setMessage("Profile updated successfully.");
      }
    } catch (err) {
      setError(err.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Profile image must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateField("avatar", reader.result);
      setMessage("");
      setError("");
    };
    reader.readAsDataURL(file);
  };

  if (loading || !form) {
    return (
      <DashboardLayout pageTitle="My Profile">
        <LoadingState label="Loading your profile..." />
      </DashboardLayout>
    );
  }

  const avatarLetter = form.name ? form.name.charAt(0).toUpperCase() : "S";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  return (
    <DashboardLayout pageTitle="My Profile">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-var(--text-primary)">My Profile</h1>
          <p className="mt-2 text-sm text-var(--text-muted)">
            Keep your details current — companies and roadmaps are matched against this.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save size={16} />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {message && <p className="mt-3 text-sm text-emerald-400">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <section className="mt-6 flex flex-col items-start gap-6 rounded-2xl border border-var(--card-border) bg-var(--card-bg) p-6 sm:flex-row sm:items-center">
        <div className="group relative shrink-0">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-3xl font-black shadow-lg shadow-brand-800/30">
            {form.avatar ? (
              <img src={form.avatar} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              avatarLetter
            )}
          </div>
          <label
            htmlFor="avatar-upload"
            className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-var(--bg-primary) bg-brand-500 text-white shadow-lg transition hover:bg-brand-400"
          >
            <Camera size={14} />
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-var(--text-primary)">{form.name || "Student"}</h2>
            <Badge tone="brand">{user?.role === "admin" ? "Admin" : "Student"}</Badge>
          </div>
          <p className="mt-1 text-sm text-var(--text-muted)">{user?.email}</p>
          <p className="mt-1 text-xs text-var(--text-muted)">Member since {memberSince}</p>
          <p className="mt-2 text-xs text-var(--text-muted)">
            Tap the camera icon to set your profile photo. It appears in the header and on your dashboard.
          </p>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard title="Current Streak" value={`${user?.streak?.current || 0}d`} description="Consecutive active days" icon={Flame} />
        <StatCard title="Longest Streak" value={`${user?.streak?.longest || 0}d`} description="Personal best" icon={Trophy} />
        <StatCard title="Target Roles" value={form.targetRoles.length} description="Roles you're preparing for" icon={Plus} />
      </div>

      <section className={sectionClass}>
        <h2 className="font-bold text-var(--text-primary)">Personal Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Full Name</label>
            <input className={inputClass} value={form.name} onChange={(e) => updateField("name", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={`${inputClass} cursor-not-allowed opacity-60`} value={user?.email || ""} disabled />
          </div>
          <div>
            <label className={labelClass}>College</label>
            <input className={inputClass} placeholder="Your college name" value={form.college} onChange={(e) => updateField("college", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Department</label>
            <input className={inputClass} placeholder="e.g. Computer Science" value={form.department} onChange={(e) => updateField("department", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} placeholder="+91 98765 43210" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input className={inputClass} placeholder="e.g. Chennai" value={form.city} onChange={(e) => updateField("city", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Year</label>
            <select className={inputClass} value={form.year} onChange={(e) => updateField("year", e.target.value)}>
              <option value="">Select year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="Final Year">Final Year</option>
              <option value="Graduated">Graduated</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Bio</label>
            <textarea
              rows="3"
              className="w-full rounded-xl border border-var(--card-border) bg-var(--card-bg) px-4 py-3 text-sm text-var(--text-primary) outline-none placeholder:text-var(--text-muted) focus:border-brand-400/60 resize-y"
              placeholder="A short intro about yourself — shown on your profile and used for recruiter eyes."
              value={form.bio}
              onChange={(e) => updateField("bio", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="font-bold text-var(--text-primary)">Links</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              <span className="inline-flex items-center gap-1.5">
                <Link2 size={13} /> GitHub URL
              </span>
            </label>
            <input className={inputClass} placeholder="https://github.com/username" value={form.github} onChange={(e) => updateField("github", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>
              <span className="inline-flex items-center gap-1.5">
                <Link2 size={13} /> LinkedIn URL
              </span>
            </label>
            <input className={inputClass} placeholder="https://linkedin.com/in/username" value={form.linkedin} onChange={(e) => updateField("linkedin", e.target.value)} />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="font-bold text-var(--text-primary)">Skills</h2>
        <p className="mt-1 text-xs text-var(--text-muted)">Used to calculate your readiness against company requirements.</p>
        <div className="mt-4">
          <TagInput items={form.skills} onAdd={addSkill} onRemove={removeSkill} placeholder="Add a skill and press Enter" />
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="font-bold text-var(--text-primary)">Target Roles</h2>
        <p className="mt-1 text-xs text-var(--text-muted)">Roles you're aiming for during placements.</p>
        <div className="mt-4">
          <TagInput items={form.targetRoles} onAdd={addTargetRole} onRemove={removeTargetRole} placeholder="e.g. SDE Intern, Data Analyst" />
        </div>
      </section>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save size={16} />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </DashboardLayout>
  );
}

export default Profile;