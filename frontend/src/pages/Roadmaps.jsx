import { BookOpen, CheckCircle2, Circle, Clock, GraduationCap, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import ProgressBar from "../components/ui/ProgressBar";
import Badge from "../components/ui/Badge";
import { roadmapService } from "../services/roadmap.service";

const DIFFICULTY_TONE = { Beginner: "success", Intermediate: "warning", Advanced: "danger" };

function Roadmaps() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const detailRequestId = useRef(0);

  const selectRoadmap = (slug) => {
    setSelectedSlug(slug);
    setDetailLoading(true);
    const requestId = ++detailRequestId.current;
    roadmapService
      .get(slug)
      .then((res) => {
        if (requestId === detailRequestId.current) {
          if (res.success) setDetail(res.data);
        }
      })
      .catch(() => {
        if (requestId === detailRequestId.current) setDetail(null);
      })
      .finally(() => {
        if (requestId === detailRequestId.current) setDetailLoading(false);
      });
  };

  const loadList = () => {
    setLoading(true);
    setError("");
    roadmapService
      .list()
      .then((res) => {
        if (res.success) {
          setRoadmaps(res.data);
          if (res.data.length > 0) selectRoadmap(res.data[0].slug);
        }
      })
      .catch((err) => setError(err.message || "Unable to load roadmaps."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    roadmapService
      .list()
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          setRoadmaps(res.data);
          if (res.data.length > 0) selectRoadmap(res.data[0].slug);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Unable to load roadmaps.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleTopic = async (topicId) => {
    if (!selectedSlug) return;
    try {
      const res = await roadmapService.toggleTopic(selectedSlug, topicId);
      if (res.success) {
        setDetail((prev) => ({ ...prev, completedTopicIds: res.data.completedTopicIds, percentComplete: res.data.percentComplete }));
        setRoadmaps((prev) =>
          prev.map((r) => (r.slug === selectedSlug ? { ...r, percentComplete: res.data.percentComplete } : r))
        );
      }
    } catch (err) {
      setError(err.message || "Unable to update progress.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Roadmaps">
        <LoadingState label="Loading learning roadmaps..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout pageTitle="Roadmaps">
        <ErrorState message={error} onRetry={loadList} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Roadmaps">
      <h1 className="text-2xl font-black text-var(--text-primary)">Learning Roadmaps</h1>
      <p className="mt-2 text-sm text-var(--text-muted)">Structured learning journeys toward your target role.</p>

      {roadmaps.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={BookOpen} title="No roadmaps available yet" description="Check back soon for structured learning journeys." />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
          <div className="space-y-3">
            {roadmaps.map((roadmap) => (
              <button
                key={roadmap.slug}
                onClick={() => selectRoadmap(roadmap.slug)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedSlug === roadmap.slug
                    ? "border-brand-400/50 bg-brand-500/10"
                    : "border-var(--card-border) bg-var(--card-bg) hover:border-brand-400/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-var(--text-primary)">{roadmap.title}</p>
                  <Badge tone={DIFFICULTY_TONE[roadmap.difficulty] || "neutral"}>{roadmap.difficulty}</Badge>
                </div>
                <p className="mt-1 text-xs text-var(--text-muted)">{roadmap.category} • {roadmap.estimatedWeeks} weeks</p>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-var(--text-muted)">
                    <span>Progress</span>
                    <span>{roadmap.percentComplete}%</span>
                  </div>
                  <ProgressBar value={roadmap.percentComplete} />
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-var(--card-border) bg-var(--card-bg) p-6">
            {detailLoading || !detail ? (
              <LoadingState label="Loading roadmap details..." />
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-var(--text-primary)">{detail.roadmap.title}</h2>
                    <p className="mt-1 text-sm text-var(--text-muted)">{detail.roadmap.description}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg border border-var(--card-border) px-3 py-1.5 text-xs text-var(--text-muted)">
                    <Clock size={14} />
                    {detail.roadmap.estimatedWeeks}w
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-var(--text-muted)">
                    <span>Overall completion</span>
                    <span>{detail.percentComplete}%</span>
                  </div>
                  <ProgressBar value={detail.percentComplete} />
                </div>

                <div className="mt-6 space-y-6">
                  {detail.roadmap.modules.map((module) => (
                    <div key={module._id}>
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-var(--text-muted)">{module.title}</h3>
                      <div className="space-y-2">
                        {module.topics.map((topic) => {
                          const isCompleted = detail.completedTopicIds.includes(topic._id);
                          const links = topic.links || {};
                          const hasLinks = links.read || links.free || links.paid;
                          return (
                            <div key={topic._id} className="rounded-xl transition hover:bg-var(--bg-tertiary)">
                              <button
                                onClick={() => handleToggleTopic(topic._id)}
                                className="flex w-full items-center gap-3 p-3 text-left"
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="shrink-0 text-emerald-400" size={20} />
                                ) : (
                                  <Circle className="shrink-0 text-var(--text-muted)" size={20} />
                                )}
                                <span className={`flex-1 text-sm ${isCompleted ? "text-var(--text-muted) line-through" : "text-var(--text-primary)"}`}>
                                  {topic.title}
                                </span>
                                <span className="text-xs text-var(--text-muted)">{topic.estimatedHours}h</span>
                              </button>
                              {hasLinks && (
                                <div className="flex flex-wrap gap-2 px-3 pb-3 pl-12">
                                  {links.read && (
                                    <a
                                      href={links.read}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(event) => event.stopPropagation()}
                                      className="flex items-center gap-1.5 rounded-lg border border-var(--card-border) bg-brand-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-var(--text-secondary) transition hover:border-brand-400/40 hover:text-var(--text-primary)"
                                      title="Read & learn (documentation / tutorial)"
                                    >
                                      <BookOpen size={12} />
                                      Read & Learn
                                    </a>
                                  )}
                                  {links.free && (
                                    <a
                                      href={links.free}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(event) => event.stopPropagation()}
                                      className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-200 transition hover:border-emerald-400/40 hover:text-white"
                                      title="Free course"
                                    >
                                      <GraduationCap size={12} />
                                      Free Course
                                    </a>
                                  )}
                                  {links.paid && (
                                    <a
                                      href={links.paid}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(event) => event.stopPropagation()}
                                      className="flex items-center gap-1.5 rounded-lg border border-starlight/20 bg-starlight/10 px-2.5 py-1.5 text-[11px] font-semibold text-starlight transition hover:border-starlight/40"
                                      title="Paid course (premium)"
                                    >
                                      <Sparkles size={12} />
                                      Paid Course
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Roadmaps;