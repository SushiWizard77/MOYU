const variants = {
  primary:
    "shine-button bg-gradient-to-r from-brand-400 via-brand-500 to-brand-700 text-white shadow-[0_16px_40px_-12px_rgba(47,107,255,0.75)] hover:shadow-[0_20px_50px_-10px_rgba(47,107,255,0.85)] hover:scale-[1.01]",
  secondary:
    "border border-brand-300/30 bg-white text-brand-800 shadow-sm hover:border-brand-400 hover:shadow-[0_14px_35px_-14px_rgba(47,107,255,0.55)] hover:scale-[1.01]",
  ghost: "text-brand-700 hover:bg-brand-50",
  danger: "text-red-300 hover:bg-red-500/10 hover:text-red-400",
};

function Button({ children, variant = "primary", className = "", disabled = false, type = "button", onClick, ...rest }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
