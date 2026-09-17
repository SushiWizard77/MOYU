import { BookOpen, ChevronLeft, ChevronRight, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import { resourceService } from "../../services/resource.service";
import { adminService } from "../../services/admin.service";

const inputClass =
  "w-full rounded-xl border border-lavender-200/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none placeholder:text-lavender-500 focus:border-brand-400/60";
const labelClass = "mb-1.5 block text-xs font-medium text-lavender-400";

const emptyForm = {
  title: "",
  description: "",
  category: "",
  skill: "",
  difficulty: "Beginner",
  url: "",
  type: "Article",
  tags: "",
};

function toFormState(resource) {
  return {
    title: resource.title || "",
    description: resource.description || "",
    category: resource.category || "",
    skill: resource.skill || "",
    difficulty: resource.difficulty || "Beginner",
    url: resource.url || "",
    type: resource.type || "Article",
    tags: (resource.tags || []).join(", "),
  };
}

function toPayload(form) {
  return {
    ...form,
    tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
  };
}

function AdminResources() {
  const [resources, setResources] = useState([]);
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
    resourceService
      .list({ page, limit: 12 })
      .then((res) => {
        if (res.success) {
          setResources(res.data);
          setPagination(res.pagination);
        }
      })
      .catch((err) => setError(err.message || "Unable to load resources."))
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

  const openEdit = (resource) => {
    setEditingId(resource._id);
    setForm(toFormState(resource));
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.category.trim() || !form.url.trim()) {
      setFormError("Title, category, and URL are required.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = toPayload(form);
      if (editingId) {
        await adminService.updateResource(editingId, payload);
      } else {
        await adminService.createResource(payload);
      }
      setModalOpen(false);
      load(pagination.page);
    } catch (err) {
      setFormError(err.message || "Unable to save resource.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await adminService.deleteResource(id);
      load(pagination.page);
    } catch (err) {
      setError(err.message || "Unable to delete resource.");
    }
  };

  return (
    <AdminLayout pageTitle="Resources">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black">Resources</h1>
          <p className="mt-2 text-sm text-lavender-400">{pagination.total} resources in the library.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Resource
        </Button>
      </div>

      <div className="mt-6">
        {loading && <LoadingState label="Loading resources..." />}
        {!loading && error && <ErrorState message={error} onRetry={() => load(pagination.page)} />}
        {!loading && !error && resources.length === 0 && (
          <EmptyState icon={BookOpen} title="No resources yet" description="Add your first learning resource." />
        )}

        {!loading && !error && resources.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {resources.map((r) => (
              <Card key={r._id} className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-white">{r.title}</p>
                  <Badge tone="brand">{r.type}</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-lavender-400">{r.description || "No description."}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge tone="neutral">{r.category}</Badge>
                  <Badge tone="neutral">{r.difficulty}</Badge>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button variant="secondary" onClick={() => openEdit(r)}>
                    <Pencil size={14} /> Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(r._id)}>
                    <Trash2 size={14} />
                  </Button>
                  <a href={r.url} target="_blank" rel="noreferrer" className="ml-auto text-lavender-400 hover:text-white">
                    <ExternalLink size={16} />
                  </a>
                </div>
              </Card>
            ))}
          </div>
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
        <Modal title={editingId ? "Edit Resource" : "Add Resource"} onClose={() => setModalOpen(false)} wide>
          <div className="space-y-4">
            {formError && <p className="text-sm text-red-400">{formError}</p>}

            <div>
              <label className={labelClass}>Title *</label>
              <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea className={`${inputClass} min-h-20`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Category *</label>
                <input className={inputClass} placeholder="DSA, Aptitude, SQL..." value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Skill</label>
                <input className={inputClass} value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {["Article", "Video", "Course", "Documentation", "Practice", "PDF"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Difficulty</label>
                <select className={inputClass} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                  {["Beginner", "Intermediate", "Advanced"].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>URL *</label>
              <input className={inputClass} placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Tags (comma separated)</label>
              <input className={inputClass} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Resource"}</Button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}

export default AdminResources;
