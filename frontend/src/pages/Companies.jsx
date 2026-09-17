import { AlertCircle, BriefcaseBusiness, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import ProgressBar from "../components/ui/ProgressBar";

import { companyService } from "../services/company.service";

const DIFFICULTY_TONE = { Easy: "success", Medium: "warning", Hard: "danger" };

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    companyService
      .list()
      .then((res) => {
        if (res.success) {
          const sorted = [...res.data].sort((a, b) => b.readinessScore - a.readinessScore);
          setCompanies(sorted);
          if (sorted.length > 0) setSelected(sorted[0]);
        }
      })
      .catch((err) => setError(err.message || "Unable to load companies."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setTimeout(() => {
      load();
    }, 0);
  }, []);

  if (loading) {
    return (
      <DashboardLayout pageTitle="Company Preparation">
        <LoadingState label="Loading company preparation data..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout pageTitle="Company Preparation">
        <ErrorState message={error} onRetry={load} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Company Preparation">
      <h1 className="text-2xl font-black text-var(--text-primary)">Company Preparation</h1>
      <p className="mt-2 text-sm text-var(--text-muted)">See how ready you are for each company and what to work on next.</p>

      {companies.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={BriefcaseBusiness} title="No companies added yet" description="Check back once placement drives are announced." />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.4fr]">
          <div className="space-y-3">
            {companies.map((company) => (
              <button
                key={company._id}
                onClick={() => setSelected(company)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selected?._id === company._id
                    ? "border-brand-400/50 bg-brand-500/10"
                    : "border-var(--card-border) bg-var(--card-bg) hover:border-brand-400/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={company.name}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-var(--bg-tertiary) object-contain p-1.5 ring-1 ring-var(--card-border)"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 font-bold">
                        {company.logoLetter}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-var(--text-primary)">{company.name}</p>
                      <p className="text-xs text-var(--text-muted)">{company.industry}</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-brand-200">{company.readinessScore}%</span>
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <div className="rounded-2xl border border-var(--card-border) bg-var(--card-bg) p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-var(--text-primary)">{selected.name}</h2>
                  <p className="mt-1 text-sm text-var(--text-muted)">{selected.roles.join(", ")}</p>
                </div>
                <Badge tone={DIFFICULTY_TONE[selected.difficulty] || "neutral"}>{selected.difficulty}</Badge>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-var(--text-muted)">
                  <span>Am I ready?</span>
                  <span>{selected.readinessScore}%</span>
                </div>
                <ProgressBar value={selected.readinessScore} />
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-bold text-var(--text-secondary)">Eligibility</h3>
                  <p className="text-sm text-var(--text-muted)">{selected.eligibility}</p>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-bold text-var(--text-secondary)">Interview Rounds</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.interviewRounds.map((round) => (
                      <Badge key={round} tone="neutral">{round}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="mb-2 text-sm font-bold text-var(--text-secondary)">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selected.skillsRequired.map((skill) => {
                    const missing = selected.missingSkills.includes(skill);
                    return (
                      <span
                        key={skill}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                          missing ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                        }`}
                      >
                        {missing ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />}
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>

              {selected.missingSkills.length > 0 && (
                <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <h3 className="mb-2 text-sm font-bold text-amber-300">Recommended Preparation</h3>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-var(--text-muted)">
                    {selected.missingSkills.map((skill) => (
                      <li key={skill}>Strengthen your {skill} fundamentals</li>
                    ))}
                    <li>Attempt a related practice assessment</li>
                  </ol>
                </div>
              )}

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-bold text-var(--text-secondary)">Coding Expectations</h3>
                  <p className="text-sm text-var(--text-muted)">{selected.codingExpectations}</p>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-bold text-var(--text-secondary)">Aptitude Expectations</h3>
                  <p className="text-sm text-var(--text-muted)">{selected.aptitudeExpectations}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Companies;