import { Award, BookOpenCheck, CheckCircle2, ChevronLeft, ChevronRight, Code2, RotateCcw, Target, TrendingUp, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import LoadingState from "../components/ui/LoadingState";
import Badge from "../components/ui/Badge";
import StatCard from "../components/ui/StatCard";
import ProgressBar from "../components/ui/ProgressBar";
import { practiceService } from "../services/practice.service";

const CATEGORIES = ["Coding", "Aptitude", "Communication", "Verbal", "SQL", "DSA", "Technical MCQ", "Interview Question"];

function Practice() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [testCategory, setTestCategory] = useState("");
  const [testCount, setTestCount] = useState(10);

  const [phase, setPhase] = useState("idle");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    practiceService
      .stats()
      .then((res) => res.success && setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const startTest = async () => {
    setError("");
    setSubmitting(true);
    try {
      const params = { count: testCount };
      if (testCategory) params.category = testCategory;
      const res = await practiceService.startSession(params);
      if (res.success && res.data.length) {
        setQuestions(res.data);
        setAnswers({});
        setCurrent(0);
        setResults(null);
        setPhase("running");
      } else {
        setError("No questions available for this selection. Try another category.");
      }
    } catch (err) {
      setError(err.message || "Unable to start the test.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const submitTest = async () => {
    setSubmitting(true);
    try {
      const payload = questions.map((q) => ({ questionId: q._id, selectedIndex: answers[q._id] ?? null }));
      const res = await practiceService.submitSession(payload);
      if (res.success) {
        setResults(res.data);
        setPhase("results");
        practiceService.stats().then((sRes) => sRes.success && setStats(sRes.data));
      }
    } catch (err) {
      setError(err.message || "Unable to submit the test.");
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = questions.filter((q) => answers[q._id] !== undefined && answers[q._id] !== null).length;
  const goPrev = () => setCurrent((prev) => Math.max(0, prev - 1));
  const goNext = () => setCurrent((prev) => Math.min(questions.length - 1, prev + 1));

  if (loading) {
    return (
      <DashboardLayout pageTitle="Practice Hub">
        <LoadingState label="Loading practice hub..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Practice Hub">
      {/*PHASES*/}
      {phase === "idle" && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Target} title="Total Attempts" value={stats?.totalAttempted ?? stats?.totalAttempts ?? 0} description="Questions you have attempted" tone="brand" />
            <StatCard icon={CheckCircle2} title="Correct Answers" value={stats?.totalCorrect ?? stats?.correctAttempts ?? 0} description="Questions answered correctly" tone="success" />
            <StatCard icon={TrendingUp} title="Accuracy" value={`${stats?.accuracy ?? 0}%`} description="Correct / attempted" tone="warning" />
            <StatCard icon={Award} title="Active Streak" value={`${stats?.streak?.current ?? stats?.streak ?? 0} days`} description="Consecutive active days" tone="brand" />
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-3">
              <section className="rounded-2xl border border-var(--card-border) bg-var(--card-bg) p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-brand-500/15 p-2.5"><BookOpenCheck className="text-brand-300" size={20} /></div>
                  <div>
                    <h2 className="text-base font-bold text-var(--text-primary)">Start a Practice Test</h2>
                    <p className="text-xs text-var(--text-muted)">Answers stay hidden until you finish — then you get a full error analysis.</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-var(--text-muted)">Category (optional)</span>
                    <select
                      value={testCategory}
                      onChange={(event) => setTestCategory(event.target.value)}
                      className="w-full rounded-xl border border-var(--card-border) bg-var(--card-bg) px-4 py-2.5 text-sm text-var(--text-primary) outline-none focus:border-brand-400/50"
                    >
                      <option value="">All categories (mixed)</option>
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-var(--text-muted)">Number of questions</span>
                    <select
                      value={testCount}
                      onChange={(event) => setTestCount(Number(event.target.value))}
                      className="w-full rounded-xl border border-var(--card-border) bg-var(--card-bg) px-4 py-2.5 text-sm text-var(--text-primary) outline-none focus:border-brand-400/50"
                    >
                      {[5, 10, 15, 20, 30].map((n) => (
                        <option key={n} value={n}>{n} questions</option>
                      ))}
                    </select>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={startTest}
                  disabled={submitting}
                  className="mt-5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 px-5 py-2.5 text-sm font-bold shadow-lg shadow-brand-700/30 transition hover:shadow-brand-500/40 disabled:opacity-50"
                >
                  {submitting ? "Preparing..." : "Start Test"}
                </button>
                {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
              </section>
            </div>

            <div className="lg:col-span-2">
              <section className="rounded-2xl border border-var(--card-border) bg-var(--card-bg) p-6">
                <h3 className="text-sm font-bold text-var(--text-primary)">How it works</h3>
                <ol className="mt-3 space-y-2 text-xs text-var(--text-muted)">
                  <li>1. Pick a category and test length (5–30 questions).</li>
                  <li>2. Answer each question — you can revisit and change answers while the test is running.</li>
                  <li>3. Press <span className="text-var(--text-secondary)">Submit Test</span> — corrections open only after you finish.</li>
                  <li>4. Get your score, correct/wrong breakdown, weak areas to improve, and per-question explanations.</li>
                </ol>
                <div className="mt-4 rounded-xl border border-brand-400/20 bg-brand-500/10 p-3 text-xs text-var(--text-secondary)">
                  Daily mixed questions (coding, aptitude, communication) also appear on your dashboard every day.
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {phase === "running" && questions.length > 0 && (
        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setPhase("idle")}
              className="rounded-xl border border-var(--card-border) px-3 py-2 text-xs font-semibold text-var(--text-muted) transition hover:text-var(--text-primary)"
            >
              ← Abandon test
            </button>
            <div className="text-sm text-var(--text-secondary)">
              <span className="font-bold text-var(--text-primary)">{answeredCount}</span> / {questions.length} answered
            </div>
          </div>

          <ProgressBar value={(answeredCount / questions.length) * 100} />

          <div className="flex flex-wrap gap-2">
            {questions.map((question, index) => {
              const isAnswered = answers[question._id] !== undefined && answers[question._id] !== null;
              const isActive = index === current;
              return (
                <button
                  key={question._id}
                  type="button"
                  onClick={() => setCurrent(index)}
                  className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                    isActive
                      ? "bg-brand-500 text-white shadow-lg shadow-brand-500/40"
                      : isAnswered
                        ? "bg-brand-500/25 text-brand-200"
                        : "bg-var(--card-bg) text-var(--text-muted) hover:text-var(--text-secondary)"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {(() => {
            const question = questions[current];
            const selectedIndex = answers[question._id];
            return (
              <section key={question._id} className="page-enter rounded-2xl border border-var(--card-border) bg-var(--card-bg) p-6">
                <div className="flex items-start justify-between gap-3">
                  <Badge tone="brand">{question.category}</Badge>
                  <span className="text-xs text-var(--text-muted)">Question {current + 1} of {questions.length}</span>
                </div>
                <h2 className="mt-3 text-lg font-bold leading-snug text-var(--text-primary)">{question.title}</h2>
                <p className="mt-2 text-sm text-var(--text-secondary)">{question.prompt}</p>

                <div className="mt-5 space-y-3">
                  {question.options.map((option, index) => {
                    const isSelected = selectedIndex === index;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectOption(question._id, index)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                          isSelected
                            ? "border-brand-400/60 bg-brand-500/15 text-var(--text-primary)"
                            : "border-var(--card-border) bg-var(--card-bg) text-var(--text-secondary) hover:border-brand-400/30 hover:bg-var(--bg-tertiary)"
                        }`}
                      >
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${isSelected ? "bg-brand-500 text-white" : "bg-var(--card-border) text-var(--text-muted)"}`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={current === 0}
                    className="flex items-center gap-1.5 rounded-xl border border-var(--card-border) px-4 py-2.5 text-sm font-semibold text-var(--text-secondary) transition hover:text-var(--text-primary) disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  {current < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className="flex items-center gap-1.5 rounded-xl bg-brand-500/20 px-4 py-2.5 text-sm font-semibold text-brand-200 transition hover:bg-brand-500/30"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submitTest}
                      disabled={submitting}
                      className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-bold shadow-lg shadow-emerald-600/25 disabled:opacity-50"
                    >
                      {submitting ? "Evaluating..." : "Submit Test"}
                    </button>
                  )}
                </div>
              </section>
            );
          })()}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={submitTest}
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 text-sm font-bold shadow-lg shadow-emerald-600/25 disabled:opacity-50"
            >
              {submitting ? "Evaluating..." : `Submit Test (${answeredCount}/${questions.length} answered)`}
            </button>
          </div>
        </div>
      )}

      {phase === "results" && results && (
        <div className="mt-6 space-y-6">
          <section className="page-enter overflow-hidden rounded-2xl border border-var(--card-border) bg-var(--card-bg) p-6">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-var(--text-muted)">Test Complete</p>
                <h2 className="mt-1 text-2xl font-black text-var(--text-primary)">
                  You scored <span className="bg-gradient-to-r from-brand-300 to-nebula bg-clip-text text-transparent">{results.score}%</span>
                </h2>
                <p className="mt-1 text-sm text-var(--text-muted)">{results.correctCount} of {results.attempted} correct · {results.attempted - results.correctCount} wrong · {results.unanswered} unanswered</p>
              </div>
              <button
                type="button"
                onClick={() => { setPhase("idle"); setResults(null); setQuestions([]); }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 px-5 py-2.5 text-sm font-bold shadow-lg shadow-brand-700/30 transition hover:shadow-brand-500/40"
              >
                <RotateCcw size={15} />
                New Test
              </button>
            </div>
          </section>

          {(results.categoryBreakdown || []).length > 0 && (
            <section className="rounded-2xl border border-var(--card-border) bg-var(--card-bg) p-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-var(--text-primary)"><Code2 className="text-brand-300" size={16} /> Category breakdown</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {results.categoryBreakdown.map((cat) => {
                  const pct = cat.total ? Math.round((cat.correct / cat.total) * 100) : 0;
                  return (
                    <div key={cat.category} className="rounded-xl border border-var(--card-border) bg-var(--card-bg) p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-var(--text-primary)">{cat.category}</span>
                        <span className="text-var(--text-muted)">{cat.correct}/{cat.total}</span>
                      </div>
                      <div className="mt-2"><ProgressBar value={pct} /></div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {(results.improveAreas || []).length > 0 && (
            <section className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-amber-300"><TrendingUp size={16} /> Areas to improve</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {results.improveAreas.map((area) => (
                  <span key={area.topic} className="rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-200">
                    {area.topic}
                    <span className="ml-1.5 text-amber-400/70">({area.wrong} wrong)</span>
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-amber-200/70">Revise these concepts in your Roadmap, then run a focused test on them in this hub.</p>
            </section>
          )}

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-var(--text-primary)">Question-by-question review</h3>
            {results.results.map((result, index) => (
              <article
                key={result.questionId}
                className={`rounded-2xl border p-5 ${result.isCorrect ? "border-emerald-500/25 bg-emerald-500/5" : result.selectedIndex === null ? "border-var(--card-border) bg-var(--card-bg)" : "border-red-500/25 bg-red-500/5"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {result.isCorrect ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400"><CheckCircle2 size={18} /></div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15 text-red-400"><XCircle size={18} /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-var(--text-muted)">Q{index + 1}</span>
                      <Badge tone={result.isCorrect ? "success" : result.selectedIndex === null ? "neutral" : "danger"}>
                        {result.isCorrect ? "Correct" : result.selectedIndex === null ? "Unanswered" : "Wrong"}
                      </Badge>
                      <Badge tone="brand">{result.category}</Badge>
                    </div>
                    <h4 className="mt-1.5 text-sm font-bold text-var(--text-primary)">{result.title}</h4>
                    <p className="mt-1 text-xs text-var(--text-muted)">{result.prompt}</p>

                    <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                      {result.selectedIndex !== null && (
                        <p className="text-var(--text-secondary)">
                          Your answer: <span className={result.isCorrect ? "font-bold text-emerald-400" : "font-bold text-red-400"}>{result.options[result.selectedIndex]}</span>
                        </p>
                      )}
                      {!result.isCorrect && (
                        <p className="text-var(--text-secondary)">
                          Correct answer: <span className="font-bold text-emerald-400">{result.correctOption}</span>
                        </p>
                      )}
                    </div>

                    {result.explanation && (
                      <div className="mt-3 rounded-xl border border-brand-400/20 bg-brand-500/10 p-3">
                        <p className="text-xs font-semibold text-brand-300">Explanation</p>
                        <p className="mt-1 text-xs text-var(--text-secondary)">{result.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Practice;