function StatCard({ title, label, value, description, subtitle, icon: Icon, tone = "brand" }) {
  const displayTitle = title || label || "";
  const displayDescription = description || subtitle || "";
  const TONE_STYLES = {
    brand: "hover:border-brand-300/40 hover:shadow-[0_24px_60px_-20px_rgba(47,107,255,0.55)]",
    success: "hover:border-emerald-300/40 hover:shadow-[0_24px_60px_-20px_rgba(16,185,129,0.45)]",
    warning: "hover:border-amber-300/40 hover:shadow-[0_24px_60px_-20px_rgba(245,158,11,0.45)]",
    danger: "hover:border-red-300/40 hover:shadow-[0_24px_60px_-20px_rgba(239,68,68,0.45)]",
  };
  return (
    <div className={`stat-card group relative overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-[0_18px_45px_-24px_rgba(3,11,30,0.8)] backdrop-blur-xl transition hover:-translate-y-1 ${TONE_STYLES[tone] || TONE_STYLES.brand}`}>
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/20 blur-2xl transition group-hover:bg-brand-400/30" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-lg shadow-brand-500/30">
          {Icon && <Icon size={21} />}
        </div>
        <span className="text-2xl font-black text-[var(--text-primary)]">{value}</span>
      </div>
      {displayTitle && <p className="relative mt-5 text-sm font-semibold text-[var(--text-primary)]">{displayTitle}</p>}
      {displayDescription && <p className="relative mt-1 text-xs text-[var(--text-muted)]">{displayDescription}</p>}
    </div>
  );
}

export default StatCard;
