import { Pencil, Plus, Trash2, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import LoadingState from "../../components/ui/LoadingState";
import { adminService } from "../../services/admin.service";

const inputClass =
  "w-full rounded-xl border border-lavender-200/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none";
const labelClass = "mb-1.5 block text-xs font-medium text-lavender-400";
const emptyForm = { title: "", slugOrUrl: "", difficulty: "Easy", url: "", dayNumber: "", category: "Arrays" };

function AdminCodingChallenges() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminService
      .listCodingChallenges()
      .then((res) => res.success && setItems(res.data || []))
      .catch((e) => setError(e.message || "Unable to load."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const save = async () => {
    if (!form.title.trim() || !form.slugOrUrl.trim() || !form.dayNumber) return;
    setSaving(true);
    try {
      if (editingId) await adminService.updateCodingChallenge(editingId, form);
      else await adminService.createCodingChallenge(form);
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (e) {
      setError(e.message || "Unable to save.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this challenge?")) return;
    await adminService.deleteCodingChallenge(id);
    load();
  };

  if (loading) return <AdminLayout pageTitle="Coding Challenges"><LoadingState label="Loading..." /></AdminLayout>;

  return (
    <AdminLayout pageTitle="Coding Challenges">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <h2 className="flex items-center gap-2 text-lg font-black"><Trophy size={18} /> Challenges ({items.length})</h2>
          <div className="mt-4 space-y-2">
            {items.map((c) => (
              <div key={c._id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-4 py-3">
                <div>
                  <p className="font-bold">Day {c.dayNumber} · {c.title}</p>
                  <p className="text-xs text-lavender-400">{c.difficulty} · {c.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={c.difficulty === "Easy" ? "success" : c.difficulty === "Medium" ? "warning" : "danger"}>{c.difficulty}</Badge>
                  <button onClick={() => { setEditingId(c._id); setForm({ title: c.title, slugOrUrl: c.slug, difficulty: c.difficulty, url: c.url, dayNumber: c.dayNumber, category: c.category }); }} className="rounded-lg border border-white/10 p-2"><Pencil size={14} /></button>
                  <button onClick={() => remove(c._id)} className="rounded-lg border border-white/10 p-2"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
          {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
        </Card>
        <Card>
          <h3 className="font-bold">{editingId ? "Edit" : "New challenge"}</h3>
          <div className="mt-4 space-y-3">
            <div><label className={labelClass}>Title</label><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className={labelClass}>Slug or URL</label><input className={inputClass} value={form.slugOrUrl} onChange={(e) => setForm({ ...form, slugOrUrl: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelClass}>Difficulty</label><select className={inputClass} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
              <div><label className={labelClass}>Day</label><input type="number" min="1" className={inputClass} value={form.dayNumber} onChange={(e) => setForm({ ...form, dayNumber: e.target.value })} /></div>
            </div>
            <Button onClick={save} disabled={saving}><Plus size={14} /> {saving ? "Saving" : "Save"}</Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default AdminCodingChallenges;