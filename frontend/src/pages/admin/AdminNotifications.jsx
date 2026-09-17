import { Send } from "lucide-react";
import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { adminService } from "../../services/admin.service";

const inputClass =
  "w-full rounded-xl border border-lavender-200/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none placeholder:text-lavender-500 focus:border-brand-400/60";
const labelClass = "mb-1.5 block text-xs font-medium text-lavender-400";

const TYPES = ["announcement", "opportunity", "reminder", "milestone", "result"];

function AdminNotifications() {
  const [form, setForm] = useState({ title: "", message: "", type: "announcement", link: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      setError("Title and message are required.");
      return;
    }
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const res = await adminService.broadcastNotification({ ...form, audience: "all" });
      setSuccess(res.message || "Notification sent.");
      setForm({ title: "", message: "", type: "announcement", link: "" });
    } catch (err) {
      setError(err.message || "Unable to send notification.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout pageTitle="Notifications">
      <h1 className="text-2xl font-black">Broadcast Notification</h1>
      <p className="mt-2 text-sm text-lavender-400">
        Send an announcement to every student on the platform — placement drives, deadlines, or general updates.
      </p>

      <Card className="mt-6 max-w-2xl p-6">
        <div className="space-y-4">
          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-emerald-400">{success}</p>}

          <div>
            <label className={labelClass}>Title *</label>
            <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. TCS Placement Drive — Registrations Open" />
          </div>

          <div>
            <label className={labelClass}>Message *</label>
            <textarea
              className={`${inputClass} min-h-28`}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Details students need to know..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Type</label>
              <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Link (optional)</label>
              <input className={inputClass} value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/companies" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSend} disabled={sending}>
              <Send size={16} />
              {sending ? "Sending..." : "Send to All Students"}
            </Button>
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
}

export default AdminNotifications;
