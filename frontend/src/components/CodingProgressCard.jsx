import { ArrowRight, CheckCircle2, ExternalLink, Flame, GitBranch } from "lucide-react";
import { useState } from "react";
import Badge from "./ui/Badge";
import { codingTrackService } from "../services/codingTrack.service";

const DIFF_TONE = {
  Easy: "success",
  Medium: "warning",
  Hard: "danger",
};

// Coding Progress dashboard card — the exact panel from the spec:
// streak, totals, Easy/Medium/Hard, Today's Challenge with
// [ Solve on LeetCode ] + [ Mark as Completed ] + GitHub status.
function CodingProgressCard({ stats, daily, github, onChanged }) {
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [showManual, setShowManual] = useState(false);

  const challenge = daily && daily.challenge ? daily.challenge : null;
  const completed = !!(daily && daily.completed);

  const verify = async () => {
    setBusy("verify");
    setMsg("");
    try {
      const res = await codingTrackService.verify();
      setMsg(res.message);
      if (onChanged) onChanged();
    } catch (e) {
      setMsg(e.message || "Verification failed. Use Mark as Completed instead.");
    } finally {
      setBusy("");
    }
  };

  const markCompleted = async () => {
    if (!challenge) return;
    setBusy("manual");
    setMsg("");
    try {
      const res = await codingTrackService.complete({
        challengeId: challenge._id,
        submissionUrl: submissionUrl.trim(),
      });
      setMsg(res.message);
      setSubmissionUrl("");
      setShowManual(false);
      if (onChanged) onChanged();
    } catch (e) {
      setMsg(e.message || "Could not record completion.");
    } finally {
      setBusy("");
    }
  };

  return (
    <section className="rounded-2xl border border-var(--card-border) bg-var(--card-bg) p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-base font-bold uppercase tracking-widest text-var(--text-primary)">Coding Progress</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">
          <Flame size={14} /> {stats ? stats.currentStreak || 0 : 0} Day Streak
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Mini label="Total Solved" value={stats ? stats.totalSolved || 0 : 0} />
        <Mini label="Easy" value={stats ? stats.easy || 0 : 0} />
        <Mini label="Medium" value={stats ? stats.medium || 0 : 0} />
        <Mini label="Hard" value={stats ? stats.hard || 0 : 0} />
      </div>
      <div className="mt-5 rounded-2xl border border-brand-400/20 bg-var(--bg-tertiary) p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-var(--text-muted)">Today&apos;s Challenge</p>
        {challenge ? (
          <ChallengeHead challenge={challenge} completed={completed} longest={stats ? stats.longestStreak || 0 : 0} />
        ) : (
          <p className="mt-2 text-sm text-var(--text-muted)">No challenges published yet.</p>
        )}
        {challenge && !completed && (
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={challenge.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/25 transition hover:scale-[1.02]"
            >
              Solve on LeetCode <ExternalLink size={14} />
            </a>
            <button
              onClick={verify}
              disabled={busy === "verify"}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
            >
              <CheckCircle2 size={14} /> {busy === "verify" ? "Checking…" : "Check my LeetCode"}
            </button>
            <button
              onClick={() => setShowManual((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-var(--card-border) px-4 py-2.5 text-xs font-bold text-var(--text-secondary) transition hover:border-brand-400/40"
            >
              Mark as Completed <ArrowRight size={14} />
            </button>
          </div>
        )}
        {challenge && completed && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-400">
            <CheckCircle2 size={16} /> Status: Completed
          </p>
        )}
        {showManual && challenge && !completed && (
          <div className="mt-4 rounded-xl border border-var(--card-border) bg-var(--card-bg) p-4">
            <p className="text-xs text-var(--text-muted)">Optionally paste the problem/submission URL as proof.</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                placeholder="https://leetcode.com/problems/two-sum/ (optional)"
                className="min-w-0 flex-1 rounded-xl border border-var(--card-border) bg-var(--bg-tertiary) px-4 py-2.5 text-sm text-var(--text-primary) outline-none placeholder:text-var(--text-muted)"
              />
              <button
                onClick={markCompleted}
                disabled={busy === "manual"}
                className="shrink-0 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
              >
                {busy === "manual" ? "Saving…" : "Confirm Completed"}
              </button>
            </div>
          </div>
        )}
        {msg && <p className="mt-3 text-xs font-semibold text-var(--text-secondary)">{msg}</p>}
      </div>
      <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-var(--text-muted)">
        <GitBranch size={13} /> GitHub:{" "}
        {github && github.connected ? (
          <span className="text-emerald-400">Connected</span>
        ) : (
          <span>Not connected</span>
        )}
      </p>
    </section>
  );
}

function ChallengeHead({ challenge, completed, longest }) {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className="text-lg font-black text-var(--text-primary)">
          {challenge.dayNumber ? "Day " + challenge.dayNumber + " · " : ""}{challenge.title}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <Badge tone={DIFF_TONE[challenge.difficulty] || "neutral"}>{challenge.difficulty}</Badge>
          {challenge.category && <Badge tone="brand">{challenge.category}</Badge>}
          {completed ? <Badge tone="success">Completed</Badge> : <Badge tone="neutral">Not completed</Badge>}
        </div>
      </div>
      <span className="text-xs text-var(--text-muted)">Longest: {longest} days</span>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-xl border border-var(--card-border) bg-var(--bg-tertiary) px-3 py-2.5 text-center">
      <p className="text-lg font-black text-var(--text-primary)">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-var(--text-muted)">{label}</p>
    </div>
  );
}

export default CodingProgressCard;