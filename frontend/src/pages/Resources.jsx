import { ExternalLink, Library, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import { resourceService } from "../services/resource.service";

const TYPES = ["Article", "Video", "Course", "Documentation", "Practice", "PDF"];

function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function Resources() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const debouncedSearch = useDebounced(search);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (type) params.type = type;

    resourceService
      .list(params)
      .then((res) => {
        if (res.success) setResources(res.data);
      })
      .catch((err) => setError(err.message || "Unable to load resources."))
      .finally(() => setLoading(false));
  }, [debouncedSearch, type]);

  useEffect(() => {
    setTimeout(() => {
      load();
    }, 0);
  }, [load]);

  return (
    <DashboardLayout pageTitle="Resource Library">
      <h1 className="text-2xl font-black text-var(--text-primary)">Resource Library</h1>
      <p className="mt-2 text-sm text-var(--text-muted)">Curated articles, courses, and practice material for every skill.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-var(--text-muted)" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search resources..."
            className="w-full rounded-xl border border-var(--card-border) bg-var(--card-bg) py-3 pl-11 pr-4 text-sm text-var(--text-primary) outline-none placeholder:text-var(--text-muted) focus:border-brand-400/60"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setType("")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              type === "" ? "bg-brand-500/20 text-var(--text-primary)" : "border border-var(--card-border) text-var(--text-muted) hover:bg-var(--bg-tertiary)"
            }`}
          >
            All Types
          </button>
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                type === t ? "bg-brand-500/20 text-var(--text-primary)" : "border border-var(--card-border) text-var(--text-muted) hover:bg-var(--bg-tertiary)"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-8">
          <LoadingState label="Loading resources..." />
        </div>
      ) : error ? (
        <div className="mt-8">
          <ErrorState message={error} onRetry={load} />
        </div>
      ) : resources.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={Library} title="No resources found" description="Try a different search term or filter." />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => (
            <a
              key={resource._id}
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-var(--card-border) bg-var(--card-bg) p-5 transition hover:-translate-y-0.5 hover:border-brand-400/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  {resource.providerLogo ? (
                    <img
                      src={resource.providerLogo}
                      alt={resource.provider || "provider"}
                      className="mt-0.5 h-8 w-8 shrink-0 rounded-lg bg-var(--bg-tertiary) object-contain p-1"
                      loading="lazy"
                    />
                  ) : (
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-xs font-bold text-brand-200">
                      {(resource.provider || resource.title || "R").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-var(--text-primary)">{resource.title}</p>
                    {resource.provider && (
                      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-300">
                        {resource.provider}
                      </p>
                    )}
                  </div>
                </div>
                <ExternalLink size={16} className="shrink-0 text-var(--text-muted) transition group-hover:text-brand-300" />
              </div>
              <p className="mt-3 text-xs text-var(--text-muted)">{resource.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="brand">{resource.type}</Badge>
                <Badge tone="neutral">{resource.category}</Badge>
              </div>
            </a>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Resources;