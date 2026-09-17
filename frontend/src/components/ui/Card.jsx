function Card({ children, className = "", hover = false }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.05] shadow-[0_18px_45px_-24px_rgba(3,11,30,0.8)] backdrop-blur-xl ${
        hover ? "transition hover:-translate-y-0.5 hover:border-brand-300/40 hover:shadow-[0_24px_60px_-20px_rgba(47,107,255,0.55)]" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
