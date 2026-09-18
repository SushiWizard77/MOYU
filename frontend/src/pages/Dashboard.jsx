import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Code2,
  FileText,
  Flame,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import StatCard from "../components/ui/StatCard";
import ProgressBar from "../components/ui/ProgressBar";
import Badge from "../components/ui/Badge";
import CodingProgressCard from "../components/CodingProgressCard";
import { LogoMark } from "../components/Logo";
import { useAuth } from "../hooks/useAuth";
import { dashboardService } from "../services/dashboard.service";
import { practiceService } from "../services/practice.service";
import { codingTrackService } from "../services/codingTrack.service";

const CATEGORY_ICONS = {
  coding: Code2,
  aptitude: BriefcaseBusiness,
  resume: FileText,
  technical: Code2,
};

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trackStats, setTrackStats] = useState(null);
  const [trackDaily, setTrackDaily] = useState(null);
  const [trackGithub, setTrackGithub] = useState(null);

  const loadTrack = () => {
    codingTrackService
      .getStats()
      .then((res) => res.success && setTrackStats(res.data))
      .catch(() => {});
    codingTrackService
      .getDaily()
      .then((res) => res.success && setTrackDaily(res.data))
      .catch(() => setTrackDaily(null));
    codingTrackService
      .githubStatus()
      .then((res) => res.success && setTrackGithub(res.data))
      .catch(() => {});
  };

  const loadDashboard = () => {
    setLoading(true);
    setError("");
    dashboardService
      .getDashboard()
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .catch((err) => setError(err.message || "Unable to load your dashboard right now."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setTimeout(() => {
      loadDashboard();
      loadTrack();
    }, 0);
  }, []);

  if (loading) {
    return (
      <DashboardLayout pageTitle="Student Dashboard">
        <LoadingState label="Loading your dashboard..." />
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout pageTitle="Student Dashboard">
        <ErrorState message={error || "No dashboard data available yet."} onRetry={loadDashboard} />
      </DashboardLayout>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const stats = [
    { title: "Coding Readiness", value: `${data.readiness.categories.coding ?? 0}%`, icon: Code2, description: "DSA & programming" },
    { title: "Aptitude Readiness", value: `${data.readiness.categories.aptitude ?? 0}%`, icon: BriefcaseBusiness, description: "Quant & logical reasoning" },
    { title: "Practice Accuracy", value: `${data.practice.accuracy}%`, icon: Code2, description: `${data.practice.totalAttempted} questions attempted` },
    { title: "Resume Score", value: `${data.resume.completionPercent}%`, icon: FileText, description: "Profile completeness" },
  ];

  return (
    <DashboardLayout pageTitle="Student Dashboard">
      <section className="pb-4">
        <div className="relative overflow-hidden rounded-3xl border border-var(--card-border) bg-gradient-to-br from-var(--bg-tertiary) via-var(--bg-secondary) to-var(--bg-primary) p-6 sm:p-8">
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-10 h-72 w-72 rounded-full bg-brand-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-var(--card-bg) ring-1 ring-var(--card-border) sm:flex">
                <LogoMark size={52} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                <h1 className="mt-1.5 text-3xl font-black tracking-tight sm:text-4xl text-var(--text-primary)">
                  {greeting}, {user?.name?.split(" ")[0] || "Student"} 👋
                </h1>
                <p className="mt-2 text-sm text-var(--text-muted)">
                  Keep charging toward placement-ready.{" "}
                  <span className="font-semibold text-brand-300">{data.dailyQuestions.length}</span>{" "}
                  questions await you today.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-2xl border border-var(--card-border) bg-var(--card-bg) px-6 py-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-var(--text-muted)">Readiness</p>
                <p className="mt-1 text-3xl font-black text-var(--text-primary)">{data.readiness.overall}%</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-[10px] font-medium text-emerald-400">
                  <TrendingUp size={11} /> Live score
                </p>
              </div>

              <div className="rounded-2xl border border-var(--card-border) bg-var(--card-bg) p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-lg font-black ring-2 ring-var(--card-border)">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      (user?.name || "S").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-sm font-bold text-var(--text-primary)">
                      <Flame size={15} className="text-orange-400" />
                      {data.user.streak?.current || 0} Day Streak
                    </p>
                    <p className="mt-0.5 text-xs text-var(--text-muted)">{user?.department || "MOYU Student"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {data.recommendations.length > 0 && (
            <p className="relative mt-5 rounded-xl border border-var(--card-border) bg-var(--card-bg) px-4 py-3 text-sm text-var(--text-secondary)">
              💡 <span className="font-semibold text-var(--text-primary)">{data.recommendations[0].label}:</span>{" "}
              {data.recommendations[0].message}
            </p>
          )}
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      {data.dailyQuestions?.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-bold text-var(--text-primary)"><Sparkles size={18} className="text-brand-300" /> Today&apos;s Practice</h2>
              <p className="mt-1 text-xs text-var(--text-muted)">Coding, aptitude & communication questions picked for you today. Solve them right here.</p>
            </div>
            <Link to="/practice" className="shrink-0 text-xs font-semibold text-brand-300 hover:text-brand-200">
              Open practice hub <ArrowRight size={13} className="inline" />
            </Link>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {data.dailyQuestions.map((q) => <DailyQuestionCard key={q._id} question={q} />)}
          </div>
          <div className="mt-4">
            <CodingProgressCard
              stats={trackStats}
              daily={trackDaily}
              github={trackGithub}
              onChanged={() => {
                loadTrack();
                loadDashboard();
              }}
            />
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-var(--text-primary)"><Target size={18} className="text-brand-300" /> Practice What You Learned Today</h2>
            <p className="mt-1 text-xs text-var(--text-muted)">
              {data.dailyTasks.completedToday > 0
                ? `${data.dailyTasks.completedToday} topic${data.dailyTasks.completedToday > 1 ? "s" : ""} completed today — lock in the basics with quick questions.`
                : "Master a topic on a roadmap today and instant practice questions appear here."}
            </p>
          </div>
        </div>

        {data.dailyTasks.learnedTopics.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-var(--card-border) bg-var(--card-bg) p-10 text-center">
            <Target className="mx-auto text-var(--text-muted)" size={28} />
            <p className="mt-3 text-sm font-semibold text-var(--text-secondary)">No topics completed yet today</p>
            <p className="mx-auto mt-1 max-w-md text-xs text-var(--text-muted)">
              Finish a topic in any roadmap and MOYU instantly serves you questions on that exact concept, so what you learn today sticks.
            </p>
            <Link to="/roadmaps" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 px-5 py-2.5 text-sm font-bold">
              Go to Roadmaps <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {data.dailyTasks.learnedTopics.map((task) => (
              <div key={task.topic} className="rounded-2xl border border-var(--card-border) bg-var(--card-bg) p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <p className="text-sm font-bold text-var(--text-primary)">{task.topic}</p>
                  <Badge tone="neutral">{task.roadmap}</Badge>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {task.questions.map((q) => <DailyQuestionCard key={q._id} question={q} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl border border-var(--card-border) bg-var(--card-bg)">
          <div className="flex items-center justify-between border-b border-var(--card-border) p-6">
            <div>
              <h2 className="font-bold text-var(--text-primary)">Roadmap Progress</h2>
              <p className="mt-1 text-xs text-var(--text-muted)">
                {data.roadmaps.inProgress} in progress, {data.roadmaps.completed} completed
              </p>
            </div>
            <CalendarDays className="text-var(--text-muted)" size={20} />
          </div>

          <div className="p-4">
            {data.roadmaps.items.length === 0 ? (
              <div className="p-6 text-center text-sm text-var(--text-muted)">
                You haven't started a roadmap yet.{" "}
                <Link to="/roadmaps" className="font-semibold text-brand-300 hover:text-brand-200">
                  Explore roadmaps
                </Link>
              </div>
            ) : (
              data.roadmaps.items.map((item) => (
                <div key={item.title} className="flex items-center gap-4 rounded-xl p-4 transition hover:bg-var(--bg-tertiary)">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-var(--text-primary)">{item.title}</p>
                    <p className="mt-1 text-xs text-var(--text-muted)">{item.category}</p>
                    <div className="mt-2">
                      <ProgressBar value={item.percentComplete} />
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-brand-300">{item.percentComplete}%</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-var(--card-border) bg-var(--card-bg)">
          <div className="border-b border-var(--card-border) p-6">
            <h2 className="font-bold text-var(--text-primary)">Recommended For You</h2>
            <p className="mt-1 text-xs text-var(--text-muted)">Based on your current readiness.</p>
          </div>

          <div className="space-y-2 p-4">
            {data.recommendations.length === 0 ? (
              <p className="p-4 text-center text-sm text-var(--text-muted)">
                Take an assessment to unlock personalized recommendations.
              </p>
            ) : (
              data.recommendations.map((rec) => {
                const Icon = CATEGORY_ICONS[rec.category] || BookOpen;
                return (
                  <div key={rec.category} className="group flex cursor-pointer items-center gap-4 rounded-xl p-4 transition hover:bg-var(--bg-tertiary)">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-200">
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-var(--text-primary)">{rec.label}</p>
                      <p className="mt-1 text-xs text-var(--text-muted)">{rec.score}% ready</p>
                    </div>
                    <ChevronRight size={17} className="text-var(--text-muted) transition group-hover:translate-x-1 group-hover:text-brand-300" />
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 pt-0">
            <Link
              to="/resources"
              className="flex items-center justify-center gap-2 rounded-xl border border-var(--card-border) py-3 text-xs font-semibold text-var(--text-secondary) transition hover:bg-var(--bg-tertiary) hover:text-var(--text-primary)"
            >
              Explore all resources
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {data.bestCompanyMatch && (
        <section className="mt-6">
          <div className="rounded-2xl border border-var(--card-border) bg-var(--card-bg) p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-var(--text-primary)">Best Company Match</h2>
                <p className="mt-1 text-xs text-var(--text-muted)">Based on your skills and readiness scores.</p>
              </div>
              <Link to="/companies" className="text-xs font-semibold text-brand-300 hover:text-brand-200">
                View all companies
              </Link>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-var(--bg-tertiary) p-4">
              <p className="font-semibold text-var(--text-primary)">{data.bestCompanyMatch.name}</p>
              <span className="text-lg font-black text-brand-300">{data.bestCompanyMatch.readinessScore}%</span>
            </div>
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-4 font-bold text-var(--text-primary)">Quick Access</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction to="/practice" icon={Code2} title="Practice DSA" description="Improve your coding skills" />
          <QuickAction to="/roadmaps" icon={BookOpen} title="Explore Roadmaps" description="Find your learning path" />
          <QuickAction to="/companies" icon={BriefcaseBusiness} title="Company Prep" description="Prepare for your target company" />
          <QuickAction to="/resume" icon={FileText} title="Update Resume" description="Keep your profile placement-ready" />
        </div>
      </section>

      {data.recentActivity.length > 0 && (
        <section className="mt-6">
          <div className="rounded-2xl border border-var(--card-border) bg-var(--card-bg) p-6">
            <h2 className="mb-4 font-bold text-var(--text-primary)">Recent Activity</h2>
            <div className="space-y-3">
              {data.recentActivity.map((activity) => (
                <div key={activity._id} className="flex items-center justify-between text-sm">
                  <span className="text-var(--text-secondary)">{activity.description}</span>
                  <span className="text-xs text-var(--text-muted)">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </DashboardLayout>
  );
}

function DailyQuestionCard({ question }) {
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const answer = async () => {
    if (selected === null || submitting) return;
    setSubmitting(true);
    try {
      const res = await practiceService.attempt(question._id, selected);
      if (res.success) setFeedback(res.data);
    } catch {
      setFeedback({ isCorrect: false, correctOptionIndex: null });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-var(--card-border) bg-var(--card-bg) p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">{question.category}</Badge>
        <Badge tone="neutral">{question.difficulty}</Badge>
        {question.attempted &&
          (question.lastCorrect ? (
            <Badge tone="success">Solved ✓</Badge>
          ) : (
            <Badge tone="danger">Attempted ✗</Badge>
          ))}
      </div>
      <p className="mt-3 text-sm font-semibold leading-6 text-var(--text-primary)">{question.prompt}</p>
      <div className="mt-3 flex-1 space-y-2">
        {question.options.map((option, index) => {
          const isCorrectAnswer = feedback && index === feedback.correctOptionIndex;
          const isWrongSelected = feedback && selected === index && !feedback.isCorrect;
          return (
            <button
              key={option}
              disabled={!!feedback || submitting}
              onClick={() => setSelected(index)}
              className={`w-full rounded-xl border p-3 text-left text-sm transition ${
                isCorrectAnswer
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                  : isWrongSelected
                  ? "border-red-500/50 bg-red-500/10 text-red-200"
                  : selected === index
                  ? "border-brand-400/50 bg-brand-500/10 text-var(--text-primary)"
                  : "border-var(--card-border) text-var(--text-secondary) hover:bg-var(--bg-tertiary)"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        {feedback ? (
          <p className={`text-sm font-bold ${feedback.isCorrect ? "text-emerald-400" : "text-red-400"}`}>
            {feedback.isCorrect ? "Correct! 🎉" : "Not quite — review the concept and try again."}
          </p>
        ) : (
          <span className="text-xs text-var(--text-muted)">Pick an answer to submit</span>
        )}
        {!feedback && (
          <button
            onClick={answer}
            disabled={selected === null || submitting}
            className="shrink-0 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 px-4 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
}

function QuickAction({ to, icon: Icon, title, description }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-var(--card-border) bg-var(--card-bg) p-5 transition hover:-translate-y-1 hover:border-brand-400/40 hover:bg-var(--bg-tertiary)"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-200">
          <Icon size={21} />
        </div>
        <ChevronRight size={18} className="text-var(--text-muted) transition group-hover:translate-x-1 group-hover:text-brand-300" />
      </div>
      <h3 className="mt-5 text-sm font-semibold text-var(--text-primary)">{title}</h3>
      <p className="mt-1 text-xs text-var(--text-muted)">{description}</p>
    </Link>
  );
}

export default Dashboard;