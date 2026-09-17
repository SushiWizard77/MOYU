import { BookOpen, BriefcaseBusiness, FileQuestion, Gauge, Route, Users, TrendingUp, Activity, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import StatCard from "../../components/ui/StatCard";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import { adminService } from "../../services/admin.service";
import Badge from "../../components/ui/Badge";

function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const load = () => {
    adminService
      .getOverview()
      .then((res) => {
        if (res.success) {
          setData(res.data);
          setLastUpdated(new Date());
        }
      })
      .catch((err) => setError(err.message || "Unable to load admin overview."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // Auto-refresh every 30 seconds for live tracking
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <AdminLayout pageTitle="Overview">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Platform Overview</h1>
          <p className="mt-2 text-sm text-lavender-400">
            A snapshot of MOYU's content and student engagement. Updates automatically every 30s.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-lavender-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
          <span>Last updated: {formatTime(lastUpdated)}</span>
        </div>
      </div>

      {loading && <div className="mt-8"><LoadingState label="Loading overview..." /></div>}
      {!loading && error && <div className="mt-8"><ErrorState message={error} onRetry={load} /></div>}

      {!loading && !error && data && (
        <>
          {/* Key Metrics Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Students" value={data.totalStudents} description="Registered student accounts" icon={Users} />
            <StatCard title="Active Today" value={data.activeUsersToday} description="Students with activity today" icon={Activity} tone="success" />
            <StatCard title="Active This Week" value={data.activeUsersThisWeek} description="Students active in last 7 days" icon={TrendingUp} tone="brand" />
            <StatCard title="New Today" value={data.studentsToday} description="New registrations today" icon={UserPlus} tone="warning" />
          </div>

          {/* Growth Metrics */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="This Week" value={data.studentsThisWeek} description="New registrations this week" icon={UserPlus} />
            <StatCard title="This Month" value={data.studentsThisMonth} description="New registrations this month" icon={Users} />
            <StatCard title="Avg. Readiness" value={`${data.averageReadiness}%`} description="Across all assessed students" icon={Gauge} />
            <StatCard title="Total Companies" value={data.totalCompanies} description="Company prep profiles live" icon={BriefcaseBusiness} />
          </div>

          {/* Content Metrics */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard title="Resources" value={data.totalResources} description="Articles, videos, and courses" icon={BookOpen} />
            <StatCard title="Practice Questions" value={data.totalQuestions} description="Across all categories" icon={FileQuestion} />
            <StatCard title="Roadmaps" value={data.totalRoadmaps} description="Structured learning journeys" icon={Route} />
          </div>

          {/* Live Student Feed */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Live Student Signups</h2>
              <Badge tone="success" className="text-xs">Real-time</Badge>
            </div>
            <p className="mt-1 text-xs text-lavender-500">Most recent student registrations (updates live)</p>
            
            <div className="mt-4 rounded-2xl border border-lavender-200/10 bg-white/[0.03] overflow-hidden">
              {data.recentSignups && data.recentSignups.length > 0 ? (
                <div className="divide-y divide-lavender-200/10">
                  {data.recentSignups.map((student) => (
                    <div key={student._id} className="flex items-center justify-between p-4 hover:bg-white/5 transition">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-sm font-bold">
                          {student.name?.charAt(0).toUpperCase() || "S"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{student.name}</p>
                          <p className="text-xs text-lavender-400">{student.email}</p>
                          <p className="text-[10px] text-lavender-500">{student.college || "No college"} • {student.department || "No department"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-lavender-500">
                          {new Date(student.createdAt).toLocaleString()}
                        </p>
                        <Badge tone="brand" className="mt-1 text-[10px]">New</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-lavender-500">
                  <Users className="mx-auto mb-2 text-lavender-500/50" size={24} />
                  <p className="text-sm">No students registered yet</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export default AdminOverview;
