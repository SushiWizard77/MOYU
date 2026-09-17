import { BriefcaseBusiness, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import { companyService } from "../../services/company.service";
import { adminService } from "../../services/admin.service";

const inputClass =
  "w-full rounded-xl border border-lavender-200/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none placeholder:text-lavender-500 focus:border-brand-400/60";
const labelClass = "mb-1.5 block text-xs font-medium text-lavender-400";

const emptyForm = {
  name: "",
  industry: "",
  eligibility: "",
  difficulty: "Medium",
  codingExpectations: "",
  aptitudeExpectations: "",
  roles: "",
  skillsRequired: "",
  interviewRounds: "",
  commonTopics: "",
  resources: "",
};

function toFormState(company) {
  return {
    name: company.name || "",
    industry: company.industry || "",
    eligibility: company.eligibility || "",
    difficulty: company.difficulty || "Medium",
    codingExpectations: company.codingExpectations || "",
    aptitudeExpectations: company.aptitudeExpectations || "",
    roles: (company.roles || []).join(", "),
    skillsRequired: (company.skillsRequired || []).join(", "),
    interviewRounds: (company.interviewRounds || []).join(", "),
    commonTopics: (company.commonTopics || []).join(", "),
    resources: (company.resources || []).join(", "),
  };
}

function toPayload(form) {
  const listify = (val) => val.split(",").map((v) => v.trim()).filter(Boolean);
  return {
    name: form.name,
    industry: form.industry,
    eligibility: form.eligibility,
    difficulty: form.difficulty,
    codingExpectations: form.codingExpectations,
    aptitudeExpectations: form.aptitudeExpectations,
    roles: listify(form.roles),
    skillsRequired: listify(form.skillsRequired),
    interviewRounds: listify(form.interviewRounds),
    commonTopics: listify(form.commonTopics),
    resources: listify(form.resources),
  };
}

function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    companyService
      .list()
      .then((res) => {
        if (res.success) setCompanies(res.data);
      })
      .catch((err) => setError(err.message || "Unable to load companies."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (company) => {
    setEditingId(company._id);
    setForm(toFormState(company));
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError("Company name is required.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = toPayload(form);
      if (editingId) {
        await adminService.updateCompany(editingId, payload);
      } else {
        await adminService.createCompany(payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err.message || "Unable to save company.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company? This cannot be undone.")) return;
    try {
      await adminService.deleteCompany(id);
      load();
    } catch (err) {
      setError(err.message || "Unable to delete company.");
    }
  };

  return (
    <AdminLayout pageTitle="Companies">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black">Companies</h1>
          <p className="mt-2 text-sm text-lavender-400">Manage company preparation profiles students match against.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Company
        </Button>
      </div>

      <div className="mt-6">
        {loading && <LoadingState label="Loading companies..." />}
        {!loading && error && <ErrorState message={error} onRetry={load} />}
        {!loading && !error && companies.length === 0 && (
          <EmptyState icon={BriefcaseBusiness} title="No companies yet" description="Add your first company to get students matching against it." />
        )}

        {!loading && !error && companies.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {companies.map((c) => (
              <Card key={c._id} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-white">{c.name}</p>
                    <p className="text-xs text-lavender-400">{c.industry || "—"}</p>
                  </div>
                  <Badge tone="brand">{c.difficulty}</Badge>
                </div>
                <p className="mt-3 text-xs text-lavender-500">
                  {(c.skillsRequired || []).slice(0, 4).join(", ") || "No skills listed"}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" onClick={() => openEdit(c)}>
                    <Pencil size={14} /> Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(c._id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal title={editingId ? "Edit Company" : "Add Company"} onClose={() => setModalOpen(false)} wide>
          <div className="space-y-4">
            {formError && <p className="text-sm text-red-400">{formError}</p>}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Company Name *</label>
                <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Industry</label>
                <input className={inputClass} value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Eligibility</label>
                <input className={inputClass} value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Difficulty</label>
                <select className={inputClass} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Roles (comma separated)</label>
              <input className={inputClass} placeholder="SDE-1, SDE Intern" value={form.roles} onChange={(e) => setForm({ ...form, roles: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Skills Required (comma separated)</label>
              <input className={inputClass} placeholder="Java, SQL, DSA" value={form.skillsRequired} onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Interview Rounds (comma separated)</label>
              <input className={inputClass} placeholder="Online Assessment, Technical, HR" value={form.interviewRounds} onChange={(e) => setForm({ ...form, interviewRounds: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Common Topics (comma separated)</label>
              <input className={inputClass} placeholder="Graphs, DBMS, OS" value={form.commonTopics} onChange={(e) => setForm({ ...form, commonTopics: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Coding Expectations</label>
                <textarea className={`${inputClass} min-h-20`} value={form.codingExpectations} onChange={(e) => setForm({ ...form, codingExpectations: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Aptitude Expectations</label>
                <textarea className={`${inputClass} min-h-20`} value={form.aptitudeExpectations} onChange={(e) => setForm({ ...form, aptitudeExpectations: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Resource Links (comma separated)</label>
              <input className={inputClass} value={form.resources} onChange={(e) => setForm({ ...form, resources: e.target.value })} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Company"}</Button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}

export default AdminCompanies;
