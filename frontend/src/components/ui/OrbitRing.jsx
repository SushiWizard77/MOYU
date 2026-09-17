function OrbitRing({ progress = 0, size = 80, strokeColor = "#2f6bff", bgStroke = "rgba(47,107,255,0.18)", className = "", style = {} }) {
  const clamped = Math.min(100, Math.max(0, progress));
  const radius = (size - 8) / 2;
  const circumference = Math.PI * 2 * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <svg className={className} width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={style} aria-hidden="true">
      <circle cx={center} cy={center} r={radius} fill="none" stroke={bgStroke} strokeWidth="5" />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
      />
    </svg>
  );
}

export default OrbitRing;
