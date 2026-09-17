function Logo({ size = 40, className = "" }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-black text-white shadow-lg shadow-brand-700/30 ${className}`} style={{ width: size, height: size, fontSize: size * 0.42 }}>
      M
    </span>
  );
}

export default Logo;
