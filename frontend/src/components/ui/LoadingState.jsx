function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex min-h-[240px] w-full flex-col items-center justify-center gap-4 py-16">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-brand-400/20 border-t-brand-300" />
        <div className="absolute inset-2 animate-pulse rounded-full bg-brand-500/20 blur-sm" />
        <div className="absolute inset-0 flex items-center justify-center text-sm">✦</div>
      </div>
      <p className="text-sm text-brand-200">{label}</p>
    </div>
  );
}

export default LoadingState;
