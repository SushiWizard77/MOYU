import { ExternalLink, FolderGit2, GitBranch, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import { projectService } from "../services/project.service";

const STATUS_TONE = { completed: "success", ongoing: "warning", planned: "neutral" };
const EMPTY_FORM = { title: "", description: "", techStack: "", githubLink: "", liveLink: "", status: "completed" };

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    projectService
      .list()
      .then((res) => {
        if (res.success) setProjects(res.data);
      })
      .catch((err) => setError(err.message || "Unable to load projects."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    projectService
      .list()
      .then((res) => {
        if (!cancelled && res.success) setProjects(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Unable to load projects.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (project) => {
    setEditing(project);
    setForm({
      title: project.title || "",
      description: project.description || "",
      techStack: (project.techStack || []).join(", "),
      githubLink: project.githubLink || "",
      liveLink: project.liveLink || "",
      status: project.status || "completed",
    });
    setModalOpen(true);
  };

  const saveProject = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        techStack: form.techStack.split(",").map((tech) => tech.trim()).filter(Boolean),
        githubLink: form.githubLink.trim(),
        liveLink: form.liveLink.trim(),
        status: form.status,
      };
      const res = editing ? await projectService.update(editing._id, payload) : await projectService.create(payload);
      if (res.success) {
        setModalOpen(false);
        load();
      }
    } catch (err) {
      setError(err.message || "Unable to save the project.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (project) => {
    if (!window.confirm(`Delete project "${project.title}"?`)) return;
    try {
      const res = await projectService.remove(project._id);
      if (res.success) setProjects((prev) => prev.filter((item) => item._id !== project._id));
    } catch (err) {
      setError(err.message || "Unable to delete the project.");
    }
  };

  if (loading && projects.length === 0) {
    return <DashboardLayout pageTitle="Projects"><LoadingState label="Loading your projects..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout pageTitle="Projects">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">My Projects</h1>
          <p className="mt-2 text-sm text-lavender-400">Showcase your work — add links, tech stack, and descriptions.</p>
        </div>
        <button type="button" onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 px-4 py-2.5 text-sm font-bold shadow-lg shadow-brand-700/30 transition hover:shadow-brand-500/40">
          <Plus size={16} />
          Add Project
        </button>
      </div>

      {error && <div className="mt-4"><ErrorState message={error} onRetry={load} /></div>}

      {!error && projects.length === 0 && !loading && (
        <div className="mt-8">
          <EmptyState icon={FolderGit2} title="No projects yet" description="Add your first project with a link, description, and tech stack to showcase your work." />
        </div>
      )}

      {projects.length > 0 && (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article key={project._id} className="group flex flex-col rounded-2xl border border-lavender-200/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-brand-400/30 hover:shadow-xl hover:shadow-brand-700/10">
              <div className="flex items-start justify-between gap-3">
                <h2 className="flex-1 text-base font-bold leading-snug">{project.title}</h2>
                <Badge tone={STATUS_TONE[project.status] || "neutral"}>{project.status}</Badge>
              </div>
              {project.description && <p className="mt-2 line-clamp-3 text-sm text-lavender-400">{project.description}</p>}
              {(project.techStack || []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => <span key={tech} className="rounded-md border border-lavender-200/10 bg-brand-500/10 px-2 py-0.5 text-[11px] text-lavender-200">{tech}</span>)}
                </div>
              )}
              <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                <div className="flex items-center gap-2">
                  {project.githubLink && (
                    <a href={project.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-lavender-200/10 px-2.5 py-1.5 text-xs text-lavender-300 transition hover:border-brand-400/40 hover:text-white">
                      <GitBranch size={13} />
                      Code
                    </a>
                  )}
                  {project.liveLink && (
                    <a href={project.liveLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-lavender-200/10 px-2.5 py-1.5 text-xs text-lavender-300 transition hover:border-brand-400/40 hover:text-white">
                      <ExternalLink size={13} />
                      Live
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
                  <button type="button" onClick={() => openEdit(project)} className="rounded-lg p-2 text-lavender-400 transition hover:bg-white/5 hover:text-white" title="Edit project"><Pencil size={15} /></button>
                  <button type="button" onClick={() => deleteProject(project)} className="rounded-lg p-2 text-lavender-400 transition hover:bg-red-500/10 hover:text-red-400" title="Delete project"><Trash2 size={15} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4" onClick={() => setModalOpen(false)}>
          <form onSubmit={saveProject} onClick={(event) => event.stopPropagation()} className="w-full max-w-lg space-y-4 rounded-2xl border border-lavender-200/10 bg-brand-900 p-6 shadow-2xl">
            <h2 className="text-lg font-bold">{editing ? "Edit Project" : "Add Project"}</h2>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-lavender-400">Title *</span>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Placement Predictor Web App" required className="w-full rounded-xl border border-lavender-200/10 bg-brand-950/60 px-4 py-2.5 text-sm text-white outline-none transition focus:border-brand-400/50" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-lavender-400">Description</span>
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} placeholder="What does it do? What did you build/learn?" className="w-full resize-none rounded-xl border border-lavender-200/10 bg-brand-950/60 px-4 py-2.5 text-sm text-white outline-none transition focus:border-brand-400/50" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-lavender-400">Tech Stack (comma separated)</span>
              <input value={form.techStack} onChange={(event) => setForm({ ...form, techStack: event.target.value })} placeholder="React, Node.js, MongoDB" className="w-full rounded-xl border border-lavender-200/10 bg-brand-950/60 px-4 py-2.5 text-sm text-white outline-none transition focus:border-brand-400/50" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-lavender-400">GitHub Link</span>
                <input value={form.githubLink} onChange={(event) => setForm({ ...form, githubLink: event.target.value })} placeholder="https://github.com/..." type="url" className="w-full rounded-xl border border-lavender-200/10 bg-brand-950/60 px-4 py-2.5 text-sm text-white outline-none transition focus:border-brand-400/50" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-lavender-400">Live Demo Link</span>
                <input value={form.liveLink} onChange={(event) => setForm({ ...form, liveLink: event.target.value })} placeholder="https://yourapp.dev" type="url" className="w-full rounded-xl border border-lavender-200/10 bg-brand-950/60 px-4 py-2.5 text-sm text-white outline-none transition focus:border-brand-400/50" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-lavender-400">Status</span>
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="w-full rounded-xl border border-lavender-200/10 bg-brand-950/60 px-4 py-2.5 text-sm text-white outline-none transition focus:border-brand-400/50">
                <option value="planned">Planned</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-lavender-400 transition hover:text-white">Cancel</button>
              <button type="submit" disabled={saving || !form.title.trim()} className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 px-5 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving..." : editing ? "Save Changes" : "Add Project"}</button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Projects;
