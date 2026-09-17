function ProgressBar({ value = 0, className = "", trackClassName = "" }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={`h-2.5 overflow-hidden rounded-full bg-white/10 ${trackClassName}`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r from-starlight via-brand-300 to-brand-500 shadow-[0_0_12px_rgba(138,171,255,0.8)] transition-all duration-500 ${className}`}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

export default ProgressBar;
