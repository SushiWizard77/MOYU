import { useCallback, useEffect, useState } from "react";
import { Bell, Camera, CheckCircle2, KeyRound, Loader2, Moon, Sun, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { themeService } from "../services/theme.service";
import { notificationService } from "../services/notification.service";
import DashboardLayout from "../layouts/DashboardLayout";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";

const AVATAR_GRADIENTS = [
  "from-brand-400 to-brand-700",
  "from-violet-500 to-brand-700",
  "from-emerald-500 to-brand-700",
  "from-amber-500 to-rose-600",
  "from-sky-500 to-brand-700",
];

function initialsOf(name) {
  if (!name || !name.trim()) return "S";
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join("");
}

function Settings() {
  const navigate = useNavigate();
  const { user, updateUser, changePassword, deleteAccount, logout } = useAuth();

  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("moyuTheme") || user?.theme || "dark";
    }
    return user?.theme || "dark";
  });
  const [loadingTheme, setLoadingTheme] = useState(true);

  const [form, setForm] = useState({
    name: user?.name || "",
    college: user?.college || "",
    department: user?.department || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  const [notifEmail, setNotifEmail] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("moyuNotifEmail") !== "off";
  });
  const [notifInApp, setNotifInApp] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("moyuNotifInApp") !== "off";
  });
  const [markingRead, setMarkingRead] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState(0);

  const applyTheme = useCallback((next) => {
    setTheme(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("moyuTheme", next);
      document.documentElement.setAttribute("data-theme", next);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    themeService
      .getTheme()
      .then((res) => {
        if (mounted && res.success) applyTheme(res.data.theme);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoadingTheme(false);
      });
    return () => {
      mounted = false;
    };
  }, [applyTheme]);

  const handleThemeSwitch = async (next) => {
    applyTheme(next);
    setLoadingTheme(true);
    setError("");
    try {
      const res = await themeService.setTheme(next);
      if (res.success && res.data?.theme) applyTheme(res.data.theme);
      await updateUser({ theme: next }).catch(() => {});
    } catch {
      // already applied locally; server sync catches up next visit
    } finally {
      setLoadingTheme(false);
    }
  };

  const handleSave = async () => {
    setError("");
    setSaved(false);
    if (!form.name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const res = await updateUser({
        name: form.name.trim(),
        college: form.college.trim(),
        department: form.department.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        avatar: form.avatar.trim(),
      });
      if (res && res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(res?.message || "Unable to save profile changes.");
      }
    } catch (err) {
      setError(err.message || "Unable to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPwError("");
    setPwSaved(false);
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters long.");
      return;
    }
    setPwSaving(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res && res.success) {
        setPwSaved(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPwSaved(false), 3000);
      } else {
        setPwError(res?.message || "Unable to change password.");
      }
    } catch (err) {
      setPwError(err.message || "Unable to change password.");
    } finally {
      setPwSaving(false);
    }
  };

  const toggleNotif = (kind) => {
    if (kind === "email") {
      const next = !notifEmail;
      setNotifEmail(next);
      localStorage.setItem("moyuNotifEmail", next ? "on" : "off");
    } else {
      const next = !notifInApp;
      setNotifInApp(next);
      localStorage.setItem("moyuNotifInApp", next ? "on" : "off");
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingRead(true);
    setNotifMsg("");
    try {
      await notificationService.markAllAsRead();
      setNotifMsg("All notifications marked as read.");
      setTimeout(() => setNotifMsg(""), 2500);
    } catch (err) {
      setNotifMsg(err.message || "Unable to update notifications.");
    } finally {
      setMarkingRead(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText.trim().toUpperCase() !== "DELETE") return;
    setDeleteLoading(true);
    setError("");
    try {
      await deleteAccount();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to delete account right now. Try again later.");
      setDeleteLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-var(--card-border) bg-var(--card-bg) px-4 py-2.5 text-sm text-var(--text-primary) outline-none placeholder:text-var(--text-muted) focus:border-brand-400/60";

  const labelClass = "mb-1.5 block text-xs font-medium text-var(--text-muted)";

  const sectionClass = "rounded-2xl border border-var(--card-border) bg-var(--card-bg) p-5";

  return (
    <DashboardLayout pageTitle="Settings">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-var(--text-primary)">Settings</h1>
            <p className="mt-1 text-sm text-var(--text-muted)">
              Manage your theme, profile, and account preferences.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {saved && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Profile updated.
          </div>
        )}

        {/* Theme */}
        <section className={sectionClass}>
          <h2 className="text-lg font-bold text-var(--text-primary)">Appearance</h2>
          <p className="mt-1 text-sm text-var(--text-muted)">
            Choose between a darker theme for low-light sessions and a lighter theme for daytime use.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              disabled={loadingTheme}
              onClick={() => handleThemeSwitch("dark")}
              className={`flex flex-1 items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                theme === "dark"
                  ? "border-brand-400/60 bg-brand-500/15 text-var(--text-primary)"
                  : "border-var(--card-border) text-var(--text-muted) hover:border-brand-400/40"
              }`}
            >
              <span className="font-semibold">Dark</span>
              {loadingTheme ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Moon size={16} className="text-var(--text-muted)" />
              )}
            </button>
            <button
              type="button"
              disabled={loadingTheme}
              onClick={() => handleThemeSwitch("light")}
              className={`flex flex-1 items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                theme === "light"
                  ? "border-brand-400/60 bg-brand-500/15 text-var(--text-primary)"
                  : "border-var(--card-border) text-var(--text-muted) hover:border-brand-400/40"
              }`}
            >
              <span className="font-semibold">Light</span>
              {loadingTheme ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sun size={16} className="text-var(--text-muted)" />
              )}
            </button>
          </div>
        </section>

        {/* Profile */}
        <section className={sectionClass}>
          <h2 className="flex items-center gap-2 text-lg font-bold text-var(--text-primary)">
            <UserRound size={18} className="text-brand-300" /> Profile
          </h2>
          <p className="mt-1 text-sm text-var(--text-muted)">
            Update the basics people see across the platform.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br text-xl font-black text-white ${AVATAR_GRADIENTS[avatarSeed % AVATAR_GRADIENTS.length]}`}>
              {form.avatar ? (
                <img src={form.avatar} alt="Avatar preview" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              ) : (
                initialsOf(form.name)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <label className="mb-2 block text-sm font-semibold text-var(--text-secondary)">
                <span className="inline-flex items-center gap-1.5"><Camera size={14} /> Avatar image URL</span>
              </label>
              <div className="flex gap-2">
                <input
                  value={form.avatar}
                  onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))}
                  className={inputClass}
                  placeholder="https://... (leave empty for initials)"
                />
                <button
                  type="button"
                  title="Shuffle fallback color"
                  onClick={() => setAvatarSeed((s) => s + 1)}
                  className="shrink-0 rounded-xl border border-var(--card-border) px-3 text-sm text-var(--text-muted) transition hover:border-brand-400/50 hover:text-var(--text-primary)"
                >
                  Shuffle
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className={labelClass}>Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputClass}
                placeholder="Your name"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>College</label>
                <input
                  value={form.college}
                  onChange={(e) => setForm((f) => ({ ...f, college: e.target.value }))}
                  className={inputClass}
                  placeholder="College name"
                />
              </div>
              <div>
                <label className={labelClass}>Department</label>
                <input
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  className={inputClass}
                  placeholder="Department"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={inputClass}
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className={labelClass}>Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                className="w-full rounded-xl border border-var(--card-border) bg-var(--card-bg) px-4 py-3 text-sm text-var(--text-primary) outline-none placeholder:text-var(--text-muted) focus:border-brand-400/60 resize-y"
                rows={3}
                placeholder="A short bio"
              />
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={handleSave} loading={saving}>
                Save changes
              </Button>
            </div>
          </div>
        </section>

        {/* Security — change password */}
        <section className={sectionClass}>
          <h2 className="flex items-center gap-2 text-lg font-bold text-var(--text-primary)">
            <KeyRound size={18} className="text-brand-300" /> Security
          </h2>
          <p className="mt-1 text-sm text-var(--text-muted)">
            Change your password without signing out.
          </p>
          {pwError && (
            <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {pwError}
            </div>
          )}
          {pwSaved && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              <CheckCircle2 size={16} /> Password changed successfully.
            </div>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className={labelClass}>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className={labelClass}>Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder="Repeat new password"
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="button" onClick={handlePasswordChange} loading={pwSaving}>
              Update password
            </Button>
          </div>
        </section>

        {/* Account */}
        <section className={sectionClass}>
          <h2 className="text-lg font-bold text-var(--text-primary)">Account</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-var(--card-border) bg-var(--card-bg) px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-var(--text-primary)">Email</p>
                <p className="text-xs text-var(--text-muted)">{user?.email}</p>
              </div>
              <span className="text-xs rounded-full bg-var(--card-border) px-3 py-1 text-var(--text-muted)">
                {user?.role === "admin" ? "Admin" : "Student"}
              </span>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => { setConfirmText(""); setShowDeleteConfirm(true); }}
                className="text-sm font-semibold text-red-400 transition hover:text-red-300"
              >
                Delete account
              </button>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className={sectionClass}>
          <h2 className="flex items-center gap-2 text-lg font-bold text-var(--text-primary)">
            <Bell size={18} className="text-brand-300" /> Notifications
          </h2>
          <p className="mt-1 text-sm text-var(--text-muted)">
            Control how MOYU reaches you and clear your inbox from here.
          </p>
          {notifMsg && (
            <div className="mt-3 rounded-xl border border-brand-400/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-200">
              {notifMsg}
            </div>
          )}
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => toggleNotif("inApp")}
              className="flex w-full items-center justify-between rounded-xl border border-var(--card-border) bg-var(--card-bg) px-4 py-3 text-left"
            >
              <div>
                <p className="text-sm font-semibold text-var(--text-primary)">In-app alerts</p>
                <p className="text-xs text-var(--text-muted)">Bell badge and notifications drawer</p>
              </div>
              <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${notifInApp ? "bg-brand-500" : "bg-var(--card-border)"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${notifInApp ? "left-[22px]" : "left-0.5"}`} />
              </span>
            </button>
            <button
              type="button"
              onClick={() => toggleNotif("email")}
              className="flex w-full items-center justify-between rounded-xl border border-var(--card-border) bg-var(--card-bg) px-4 py-3 text-left"
            >
              <div>
                <p className="text-sm font-semibold text-var(--text-primary)">Email reminders</p>
                <p className="text-xs text-var(--text-muted)">Streaks, missions, and placement news</p>
              </div>
              <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${notifEmail ? "bg-brand-500" : "bg-var(--card-border)"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${notifEmail ? "left-[22px]" : "left-0.5"}`} />
              </span>
            </button>
            <div className="flex justify-end">
              <Button type="button" variant="secondary" onClick={handleMarkAllRead} loading={markingRead}>
                Mark all as read
              </Button>
            </div>
          </div>
        </section>

        {/* Logout */}
        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            Sign out
          </Button>
        </div>
      </div>

      {showDeleteConfirm && (
        <Modal title="Delete account?" onClose={() => setShowDeleteConfirm(false)}>
        <div className="space-y-4">
          <p className="text-sm text-var(--text-secondary)">
            This action is permanent. Your profile, progress, and data will be removed from MOYU.
          </p>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-var(--text-muted)">Type DELETE to confirm</span>
            <input
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder="DELETE"
              className="w-full rounded-xl border border-var(--card-border) bg-var(--card-bg) px-4 py-3 text-sm text-var(--text-primary) outline-none focus:border-red-400/60"
            />
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" loading={deleteLoading} onClick={handleDeleteAccount}>
              Delete forever
            </Button>
          </div>
        </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}

export default Settings;