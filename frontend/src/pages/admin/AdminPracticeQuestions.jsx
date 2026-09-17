import { ChevronLeft, ChevronRight, FileQuestion, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import { practiceService } from "../../services/practice.service";
import { adminService } from "../../services/admin.service";

const CATEGORIES = ["Coding", "Aptitude", "Communication", "Verbal", "SQL", "DSA", "Technical MCQ", "Interview Question"];

const inputClass =
  "w-full rounded-xl border border-lavender-200/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none placeholder:text-lavender-500 focus:border-brand-400/60";
const labelClass = "mb-1.5 block text-xs font-medium text-lavender-400";

const emptyForm = {
  title: "",
  category: "Coding",
  difficulty: "Easy",
  prompt: "",
  options: "",
  correctOptionIndex: "",
  tags: "",
};

function toFormState(q) {
  return {
    title: q.title || "",
    category: q.category || "Coding",
    difficulty: q.difficulty || "Easy",
    prompt: q.prompt || "",
    options: (q.options || []).join(", "),
    correctOptionIndex: q.correctOptionIndex ?? "",
    tags: (q.tags || []).join(", "),
  };
}

function toPayload(form) {
  const options = form.options.split(",").map((o) => o.trim()).filter(Boolean);
  return {
    title: form.title,
    category: form.category,
    difficulty: form.difficulty,
    prompt: form.prompt,
    options,
    correctOptionIndex: form.correctOptionIndex === "" ? null : Number(form.correctOptionIndex),
    tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
  };
}

function AdminPracticeQuestions() {
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = (page = 1) => {
    setLoading(true);
    setError("");
    practiceService
      .list({ page, limit: 12 })
      .then((res) => {
        if (res.success) {
          setQuestions(res.data);
          setPagination(res.pagination);
        }
      })
      .catch((err) => setError(err.message || "Unable to load practice questions."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(1);
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (q) => {
    setEditingId(q._id);
    setForm(toFormState(q));
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.prompt.trim()) {
      setFormError("Title and prompt are required.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = toPayload(form);
      if (editingId) {
        await adminService.updatePracticeQuestion(editingId, payload);
      } else {
        await adminService.createPracticeQuestion(payload);
      }
      setModalOpen(false);
      load(pagination.page);
    } catch (err) {
      setFormError(err.message || "Unable to save question.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await adminService.deletePracticeQuestion(id);
      load(pagination.page);
    } catch (err) {
      setError(err.message || "Unable to delete question.");
    }
  };

  return (
    <AdminLayout pageTitle="Practice Questions">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black">Practice Questions</h1>
          <p className="mt-2 text-sm text-lavender-400">{pagination.total} questions across all categories.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Question
        </Button>
      </div>

      <div className="mt-6">
        {loading && <LoadingState label="Loading questions..." />}
        {!loading && error && <ErrorState message={error} onRetry={() => load(pagination.page)} />}
        {!loading && !error && questions.length === 0 && (
          <EmptyState icon={FileQuestion} title="No questions yet" description="Add your first practice question." />
        )}

        {!loading && !error && questions.length > 0 && (
          <Card className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-lavender-200/10 text-xs uppercase tracking-wide text-lavender-500">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Difficulty</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q._id} className="border-b border-lavender-200/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-3 font-semibold text-white">{q.title}</td>
                    <td className="px-5 py-3 text-lavender-400">{q.category}</td>
                    <td className="px-5 py-3">
                      <Badge tone={q.difficulty === "Hard" ? "danger" : q.difficulty === "Medium" ? "warning" : "success"}>
                        {q.difficulty}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => openEdit(q)}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="danger" onClick={() => handleDelete(q._id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {!loading && !error && pagination.pages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-lavender-400">
            <span>Page {pagination.page} of {pagination.pages}</span>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>
                <ChevronLeft size={16} /> Prev
              </Button>
              <Button variant="secondary" disabled={pagination.page >= pagination.pages} onClick={() => load(pagination.page + 1)}>
                Next <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal title={editingId ? "Edit Question" : "Add Question"} onClose={() => setModalOpen(false)} wide>
          <div className="space-y-4">
            {formError && <p className="text-sm text-red-400">{formError}</p>}

            <div>
              <label className={labelClass}>Title *</label>
              <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Category</label>
                <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Difficulty</label>
                <select className={inputClass} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                  {["Easy", "Medium", "Hard"].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Prompt *</label>
              <textarea className={`${inputClass} min-h-24`} value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} />
            </div>

            <div>
              <label className={labelClass}>Options (comma separated, for MCQs — leave blank for open coding questions)</label>
              <input className={inputClass} value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Correct Option Index (0-based, leave blank if not MCQ)</label>
              <input type="number" min="0" className={inputClass} value={form.correctOptionIndex} onChange={(e) => setForm({ ...form, correctOptionIndex: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Tags (comma separated)</label>
              <input className={inputClass} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Question"}</Button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}

export default AdminPracticeQuestions;
