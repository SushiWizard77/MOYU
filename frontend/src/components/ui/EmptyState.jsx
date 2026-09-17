function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-lavender-200/15 py-14 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
          <Icon size={22} />
        </div>
      )}
      <p className="text-sm font-semibold text-white">{title}</p>
      {description && <p className="max-w-sm text-xs text-lavender-400">{description}</p>}
      {action}
    </div>
  );
}

export default EmptyState;
