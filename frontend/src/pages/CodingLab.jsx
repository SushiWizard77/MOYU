import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpenCheck,
  CheckCircle2,
  Lock,
  Play,
  Rocket,
  Terminal,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import Badge from "../components/ui/Badge";
import { codingService } from "../services/coding.service";

const LANGS = [
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "c", label: "C" },
  { id: "cpp", label: "C++" },
];

const STAGE_TONE = { Easy: "success", Medium: "warning", Hard: "danger" };

function CodingLab() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [problem, setProblem] = useState(null);
  const [levels, setLevels] = useState([]);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [levelIndex, setLevelIndex] = useState(0);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [unlockedLevelIndex, setUnlockedLevelIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const editorElRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const monacoRef = useRef(null);
  const codeRef = useRef("");
  const [monacoReady, setMonacoReady] = useState(false);

  useEffect(() => {
    codingService
      .list()
      .then((res) => {
        if (res.success && res.data.length) {
          setProblems(res.data);
          setSelectedId(res.data[0]._id);
        } else {
          setError("No coding problems available yet.");
        }
      })
      .catch((err) => setError(err.message || "Unable to load problems."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    codingService
      .get(selectedId, { expandLevels: true })
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          setProblem(res.data);
          const lvls = res.data.levels || [];
          setLevels(lvls);
          setCompletedLevels(res.data.userProgress?.completedLevels || []);
          setUnlockedLevelIndex(res.data.userProgress?.unlockedLevelIndex ?? 0);
          setLevelIndex(0);
          setResult(null);
          setShowAnswer(false);
          const starter = lvls[0]?.starterCode?.[language] || res.data.starterCode?.[language];
          setCode(starter || "// Write your solution here\n");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Unable to load the problem.");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    let disposed = false;
    if (window.monaco) {
      monacoRef.current = window.monaco;
      setTimeout(() => setMonacoReady(true), 0);
      return undefined;
    }
    if (!document.getElementById("monaco-editor-css")) {
      const link = document.createElement("link");
      link.id = "monaco-editor-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/editor/editor.main.min.css";
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js";
    script.onload = () => {
      window.require.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs" } });
      window.require(["vs/editor/editor.main"], () => {
        if (!disposed) {
          monacoRef.current = window.monaco;
          setMonacoReady(true);
        }
      });
    };
    document.head.appendChild(script);
    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (!monacoReady || !editorElRef.current) return;
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const editor = monacoRef.current.editor.create(editorElRef.current, {
      value: codeRef.current,
      language: language,
      theme: isLight ? "vs" : "vs-dark",
      minimap: { enabled: false },
      automaticLayout: true,
      fontSize: 14,
      lineNumbers: "on",
      tabSize: 2,
      bracketPairColorization: { enabled: true },
      wordWrap: "on",
    });
    editorInstanceRef.current = editor;
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      codeRef.current = value;
      setCode(value);
    });
    return () => {
      editorInstanceRef.current = null;
      editor.dispose();
    };
  }, [monacoReady, language]);

  useEffect(() => {
    if (!monacoReady || !editorInstanceRef.current || !levels[levelIndex]) return;
    const level = levels[levelIndex];
    const starter = level.starterCode?.[language] || level.starterCode?.python || "";
    codeRef.current = starter || "// Write your solution here\n";
    editorInstanceRef.current.setValue(codeRef.current);
    const model = editorInstanceRef.current.getModel();
    if (model) monacoRef.current.editor.setModelLanguage(model, language);
  }, [levelIndex, language, monacoReady, levels]);

  const resetAttempt = () => {
    setResult(null);
    setShowAnswer(false);
  };

  const changeLevel = (nextIndex) => {
    if (!levels[nextIndex]) return;
    const level = levels[nextIndex];
    const starter = level.starterCode?.[language] || level.starterCode?.python || "";
    codeRef.current = starter || "// Write your solution here\n";
    setCode(codeRef.current);
    setLevelIndex(nextIndex);
    resetAttempt();
    if (editorInstanceRef.current) editorInstanceRef.current.setValue(codeRef.current);
  };

  const changeLanguage = (nextLanguage) => {
    if (!levels[levelIndex]) return;
    const level = levels[levelIndex];
    const starter = level.starterCode?.[nextLanguage] || level.starterCode?.python || "";
    codeRef.current = starter || "// Write your solution here\n";
    setCode(codeRef.current);
    setLanguage(nextLanguage);
    resetAttempt();
    if (editorInstanceRef.current) {
      editorInstanceRef.current.setValue(codeRef.current);
      const model = editorInstanceRef.current.getModel();
      if (model) monacoRef.current.editor.setModelLanguage(model, nextLanguage);
    }
  };

  const prevLevel = () => changeLevel(Math.max(0, levelIndex - 1));
  const goToNextLevel = () => {
    if (levelIndex < levels.length - 1 && levelIndex + 1 <= unlockedLevelIndex) changeLevel(levelIndex + 1);
  };

  const handleRun = async () => {
    setRunning(true);
    try {
      const res = await codingService.run(problem._id, language, code, levelIndex);
      if (res.success) {
        setResult(res.data);
        if (res.data.allPassed) {
          setCompletedLevels(res.data.completedLevels);
          setUnlockedLevelIndex(Math.max(unlockedLevelIndex, levelIndex + 1));
          setShowAnswer(false);
        } else {
          setShowAnswer(true);
        }
      } else {
        setError(res.message || "Unable to run the code.");
      }
    } catch (err) {
      setError(err.message || "The coding judge is unavailable right now.");
    } finally {
      setRunning(false);
    }
  };

  const toggleAnswer = () => setShowAnswer((prev) => !prev);
  const isCurrentCompleted = completedLevels.includes(levelIndex);
  const currentLevel = levels[levelIndex];
  const isCurrentUnlocked = currentLevel?.isUnlocked !== false && levelIndex <= unlockedLevelIndex;
  const canGoToPrev = levelIndex > 0;
  const canGoToNext = levelIndex < levels.length - 1;
  const nextUnlocked = isCurrentCompleted && canGoToNext && levelIndex + 1 <= unlockedLevelIndex;

  if (loading) {
    return (
      <DashboardLayout pageTitle="Coding Lab">
        <LoadingState label="Loading coding lab..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout pageTitle="Coding Lab">
        <ErrorState message={error} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Coding Lab">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="lab-muted rounded-lg p-2 hover:bg-white/5 hover:text-white"
            title="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="lab-strong text-2xl font-black">Coding Lab</h1>
        </div>
        <select
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          className="w-full max-w-xs rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-brand-400/50 md:max-w-xs"
        >
          <option value="">Select a problem</option>
          {problems.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title} ({p.difficulty})
            </option>
          ))}
        </select>
      </div>

      {problem && currentLevel ? (
        <main className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <article className="lab-card rounded-2xl border border-lavender-200/10 bg-white/[0.03] p-6">
              <header className="flex items-center justify-between gap-3">
                <h2 className="lab-strong text-xl font-black">{problem.title}</h2>
                <div className="flex items-center gap-2">
                  <Badge tone={STAGE_TONE[currentLevel.stage] || "neutral"}>{currentLevel.stage}</Badge>
                  <Badge tone="neutral">Level {levelIndex + 1} of {levels.length}</Badge>
                </div>
              </header>

              <div className="lab-strong mt-4 text-sm">
                <p className="mb-3">{currentLevel.statement}</p>
                {problem.inputFormat && (
                  <>
                    <strong className="lab-strong">Input Format:</strong>
                    <p className="mt-1">{problem.inputFormat}</p>
                  </>
                )}
                {problem.outputFormat && (
                  <>
                    <strong className="lab-strong mt-3 block">Output Format:</strong>
                    <p className="mt-1">{problem.outputFormat}</p>
                  </>
                )}
                {problem.constraints && (
                  <>
                    <strong className="lab-strong mt-3 block">Constraints:</strong>
                    <p className="mt-1">{problem.constraints}</p>
                  </>
                )}
                <div className="lab-subtle-bg mt-3 flex items-center gap-2 rounded-lg border border-lavender-200/10 bg-brand-950/40 p-2.5 text-xs lab-muted">
                  <Terminal size={14} />
                  <span>Write your solution, choose a language, and click <strong>Run Code</strong>. All visible test cases must pass to complete the level.</span>
                </div>
              </div>
            </article>

            <article className="lab-card rounded-2xl border border-lavender-200/10 bg-white/[0.03] p-6">
              <h3 className="lab-strong flex items-center gap-2 text-lg font-bold">
                <BookOpenCheck size={18} className="text-brand-400" />
                How to Approach & Study
              </h3>
              <p className="lab-strong mt-2 text-sm">{currentLevel.approach}</p>
            </article>

            <article className="lab-card rounded-2xl border border-lavender-200/10 bg-white/[0.03] p-6">
              <h3 className="lab-strong flex items-center gap-2 text-lg font-bold">
                <Award size={18} className="text-starlight" />
                Way to the Correct Answer
              </h3>
              <p className="lab-strong mt-2 text-sm">{currentLevel.explanation}</p>
            </article>

            <article className="lab-card rounded-2xl border border-lavender-200/10 bg-white/[0.03] p-6">
              <div className="flex items-center justify-between gap-2">
                <h3 className="lab-strong flex items-center gap-2 text-lg font-bold">
                  <Zap size={18} className="text-amber-400" />
                  Reference Solution
                </h3>
                <button
                  type="button"
                  onClick={toggleAnswer}
                  className="lab-muted rounded-lg border border-lavender-200/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/5"
                >
                  {showAnswer ? "Hide" : isCurrentCompleted ? "Show" : "Reveal"}
                </button>
              </div>
              <p className="lab-muted mt-2 text-xs">
                {isCurrentCompleted
                  ? "Your level is complete — the solution is available for review."
                  : showAnswer
                  ? "Study the reference solution below before your next attempt."
                  : "Complete the level (or reveal) to study the solution."}
              </p>
              {(showAnswer || isCurrentCompleted) && currentLevel.solution && (
                <pre className="lab-code mt-3 overflow-x-auto rounded-lg border border-lavender-200/10 bg-brand-950/60 p-4 text-xs text-lavender-200">
                  {(currentLevel.solution[language] || currentLevel.solution.python || "")}
                </pre>
              )}
            </article>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {LANGS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => changeLanguage(l.id)}
                    className={
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition " +
                      (language === l.id
                        ? "bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-700/30"
                        : "lab-muted border border-lavender-200/10 hover:bg-white/5 hover:text-white")
                    }
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={prevLevel}
                  disabled={!canGoToPrev}
                  className="lab-muted rounded-lg border border-lavender-200/10 px-2.5 py-1.5 text-xs font-semibold disabled:opacity-40"
                  title="Previous level"
                >
                  <ArrowLeft size={14} />
                </button>
                <span className="lab-muted text-xs">
                  {levelIndex + 1} / {levels.length}
                </span>
                <button
                  type="button"
                  onClick={goToNextLevel}
                  disabled={!nextUnlocked}
                  className="lab-muted rounded-lg border border-lavender-200/10 px-2.5 py-1.5 text-xs font-semibold disabled:opacity-40"
                  title="Next level (unlocked on completion)"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div
              ref={editorElRef}
              className="lab-code h-[360px] w-full rounded-xl border border-lavender-200/10 bg-brand-950/40"
            />

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleRun}
                disabled={running || !code.trim() || !isCurrentUnlocked}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 px-4 py-2.5 text-sm font-bold shadow-lg shadow-brand-700/30 transition hover:shadow-brand-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {running ? <ArrowRight size={16} /> : <Play size={16} />}
                {running ? "Running..." : "Run Code"}
              </button>
              {isCurrentCompleted && nextUnlocked && (
                <button
                  type="button"
                  onClick={goToNextLevel}
                  disabled={!canGoToNext}
                  className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-bold text-emerald-200 transition hover:border-emerald-400/40 hover:bg-emerald-500/20 disabled:opacity-40"
                >
                  <Rocket size={16} />
                  Next Level
                </button>
              )}
            </div>

            {result && (
              <div className="lab-card rounded-xl border border-lavender-200/10 bg-brand-950/60 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h4 className="lab-strong flex items-center gap-1.5 text-sm font-bold">
                    {result.allPassed ? (
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 size={16} />
                        All test cases passed — level complete!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-400">
                        <XCircle size={16} />
                        Some test cases failed
                      </span>
                    )}
                  </h4>
                  <Badge tone={result.allPassed ? "success" : "danger"}>{result.summary}</Badge>
                </div>

                <div className="lab-muted mb-2 text-xs">{result.passed}/{result.total} test cases passed</div>

                <div className="space-y-3">
                  {result.results.map((r) => (
                    <div key={r.index} className="lab-subtle-bg rounded-lg border border-lavender-200/10 bg-brand-950/80 p-3 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="lab-muted font-bold">Test Case {r.index}</span>
                        {r.passed ? (
                          <span className="flex items-center gap-1 font-bold text-emerald-400">
                            <CheckCircle2 size={13} /> Passed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-bold text-red-400">
                            <XCircle size={13} /> Failed
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex gap-2">
                        <span className="lab-muted w-16 shrink-0 font-bold">Input:</span>
                        <code className="lab-strong whitespace-pre-line break-all">{r.input || "(none)"}</code>
                      </div>
                      <div className="mt-1 flex gap-2">
                        <span className="lab-muted w-16 shrink-0 font-bold">Expected:</span>
                        <code className="lab-strong whitespace-pre-line">{r.expected}</code>
                      </div>
                      <div className="mt-1 flex gap-2">
                        <span className="lab-muted w-16 shrink-0 font-bold">Got:</span>
                        <code className="lab-strong whitespace-pre-line">{r.actual || "(no output)"}</code>
                      </div>
                      {r.stderr && (
                        <div className="mt-1 flex gap-2">
                          <span className="w-16 shrink-0 font-bold text-red-400">Error:</span>
                          <code className="whitespace-pre-line break-all text-red-300">{r.stderr}</code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!result.allPassed && (
                  <div className="lab-subtle-bg lab-strong mt-3 rounded-lg border border-starlight/20 bg-starlight/5 p-3 text-xs">
                    <strong>Learning tip:</strong> Compare your <span className="text-red-400">Got</span> against{" "}
                    <span className="text-emerald-500">Expected</span>. The "How to Approach" and "Way to the Correct Answer" panels above show the optimal logic. Fix the failing edge case, then run again.
                  </div>
                )}
              </div>
            )}

            {/* Level progress sidebar */}
            <div className="lab-card rounded-2xl border border-lavender-200/10 bg-white/[0.03] p-4">
              <h3 className="lab-strong font-bold mb-1">Problem Levels</h3>
              <p className="lab-muted mb-3 text-xs">
                {completedLevels.length}/{levels.length} complete
                {levels.length > 0 && (unlockedLevelIndex < levels.length - 1
                  ? ` • finish Level ${unlockedLevelIndex + 1} to unlock Level ${unlockedLevelIndex + 2}`
                  : " • all levels unlocked")}
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {levels.map((lvl, idx) => {
                  const isComplete = completedLevels.includes(idx);
                  const isUnlocked = lvl.isUnlocked !== false && idx <= unlockedLevelIndex;
                  const isActive = idx === levelIndex;
                  return (
                    <button
                      key={lvl._id || idx}
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => isUnlocked && changeLevel(idx)}
                      title={isUnlocked ? `Open Level ${idx + 1}: ${lvl.title}` : `Complete Level ${unlockedLevelIndex + 1} to unlock`}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                        isActive
                          ? "bg-brand-500/15 border border-brand-400/30"
                          : isUnlocked
                          ? "border border-transparent hover:bg-white/5"
                          : "cursor-not-allowed border border-transparent opacity-70"
                      }`}
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                        {isComplete ? (
                          <CheckCircle2 size={14} className="text-emerald-400" />
                        ) : isUnlocked ? (
                          <span className="lab-strong">{idx + 1}</span>
                        ) : (
                          <Lock size={14} className="lab-muted" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isComplete ? "text-emerald-400" : isUnlocked ? "lab-strong text-white" : "lab-muted"
                        }`}>
                          {lvl.title}
                        </p>
                        <p className="lab-muted text-xs">{lvl.stage} • Level {idx + 1}{isComplete ? " • done" : ""}</p>
                      </div>
                      {!isUnlocked && <Lock size={16} className="lab-muted" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      ) : (
        <div className="lab-muted mt-8 text-center text-sm">
          Select a problem from the dropdown above to start coding.
        </div>
      )}
    </DashboardLayout>
  );
}

export default CodingLab;