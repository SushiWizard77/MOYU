import { ChevronLeft, ChevronRight, Search, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import ProgressBar from "../../components/ui/ProgressBar";
import { adminService } from "../../services/admin.service";

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = (page = 1, searchTerm = search) => {
    setLoading(true);
    setError("");
    adminService
      .listStudents({ page, limit: 10, search: searchTerm })
      .then((res) => {
        if (res.success) {
          setStudents(res.data);
          setPagination(res.pagination);
        }
      })
      .catch((err) => setError(err.message || "Unable to load students."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetail = (id) => {
    setSelectedId(id);
    setDetailLoading(true);
    setDetail(null);
    adminService
      .getStudentDetail(id)
      .then((res) => {
        if (res.success) setDetail(res.data);
      })
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  };

  return (
    <AdminLayout pageTitle="Students">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black">Students</h1>
          <p className="mt-2 text-sm text-lavender-400">{pagination.total} registered students.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(1, search);
          }}
          className="flex gap-2"
        >
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email"
              className="w-64 rounded-xl border border-lavender-200/10 bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-lavender-500 focus:border-brand-400/60"
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      <div className="mt-6">
        {loading && <LoadingState label="Loading students..." />}
        {!loading && error && <ErrorState message={error} onRetry={() => load(pagination.page)} />}
        {!loading && !error && students.length === 0 && (
          <EmptyState icon={Users} title="No students found" description="Try a different search term." />
        )}

        {!loading && !error && students.length > 0 && (
          <Card className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-lavender-200/10 text-xs uppercase tracking-wide text-lavender-500">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">College</th>
                  <th className="px-5 py-3 font-medium">Streak</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id} className="border-b border-lavender-200/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-3 font-semibold text-white">{s.name}</td>
                    <td className="px-5 py-3 text-lavender-400">{s.email}</td>
                    <td className="px-5 py-3 text-lavender-400">{s.college || "—"}</td>
                    <td className="px-5 py-3">
                      <Badge tone={s.streak?.current > 0 ? "success" : "neutral"}>{s.streak?.current || 0}d</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost" onClick={() => openDetail(s._id)}>View</Button>
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
              <Button
                variant="secondary"
                disabled={pagination.page <= 1}
                onClick={() => load(pagination.page - 1)}
              >
                <ChevronLeft size={16} /> Prev
              </Button>
              <Button
                variant="secondary"
                disabled={pagination.page >= pagination.pages}
                onClick={() => load(pagination.page + 1)}
              >
                Next <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={() => setSelectedId(null)}>
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-lavender-200/10 bg-brand-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-bold">Student Detail</h2>
              <button onClick={() => setSelectedId(null)} className="text-lavender-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {detailLoading && <div className="mt-6"><LoadingState label="Loading student..." /></div>}

            {!detailLoading && detail && (
              <div className="mt-4 space-y-5">
                <div>
                  <p className="font-semibold text-white">{detail.student.name}</p>
                  <p className="text-sm text-lavender-400">{detail.student.email}</p>
                  <p className="mt-1 text-xs text-lavender-500">
                    {detail.student.college || "No college set"} · {detail.student.department || "No department"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-lavender-300">Overall Readiness</span>
                    <span className="font-bold text-white">{detail.readiness.overall || 0}%</span>
                  </div>
                  <div className="mt-2"><ProgressBar value={detail.readiness.overall || 0} /></div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">Practice Performance</p>
                  <p className="mt-1 text-xs text-lavender-400">
                    {detail.practice.totalAttempted} attempted · {detail.practice.accuracy}% accuracy
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">Roadmap Progress</p>
                  {detail.roadmaps.length === 0 && <p className="mt-1 text-xs text-lavender-500">No roadmaps started yet.</p>}
                  <div className="mt-2 space-y-2">
                    {detail.roadmaps.map((r, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs text-lavender-400">
                          <span>{r.title}</span>
                          <span>{r.percentComplete}%</span>
                        </div>
                        <div className="mt-1"><ProgressBar value={r.percentComplete} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminStudents;
