const tones = {
  brand: "bg-brand-500/15 text-brand-200 border-brand-400/20",
  success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  danger: "bg-red-500/10 text-red-300 border-red-500/20",
  neutral: "bg-white/5 text-lavender-300 border-white/10",
};

function Badge({ children, tone = "neutral", className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
