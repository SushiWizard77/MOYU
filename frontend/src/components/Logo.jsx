import { Link } from "react-router-dom";

function LogoMark({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="MoYu logo"
      style={{ filter: "drop-shadow(0 4px 14px rgba(47,107,255,0.45))" }}
    >
      <defs>
        <radialGradient id="moyuPlanet" cx="0.32" cy="0.28" r="1">
          <stop offset="0%" stopColor="#C7D9FF" />
          <stop offset="30%" stopColor="#5B8CFF" />
          <stop offset="70%" stopColor="#1D4FD7" />
          <stop offset="100%" stopColor="#081B45" />
        </radialGradient>
        <linearGradient id="moyuRing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF7D6" />
          <stop offset="45%" stopColor="#9CC4FF" />
          <stop offset="100%" stopColor="#2F6BFF" />
        </linearGradient>
        <linearGradient id="moyuText" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#BFD3FF" />
        </linearGradient>
      </defs>

      {/* halo */}
      <circle cx="32" cy="33" r="21" fill="#2F6BFF" opacity="0.14" />
      <circle cx="32" cy="33" r="17.5" fill="#2F6BFF" opacity="0.24" />

      {/* planet */}
      <circle cx="32" cy="33" r="15" fill="url(#moyuPlanet)" />
      <circle cx="26" cy="26.5" r="4" fill="#EAF1FF" opacity="0.8" />
      <circle cx="36.5" cy="39.5" r="2.2" fill="#081B45" opacity="0.25" />
      <circle cx="29.5" cy="37.5" r="1.6" fill="#081B45" opacity="0.18" />

      {/* orbit ring */}
      <ellipse
        cx="32"
        cy="33"
        rx="26"
        ry="10"
        stroke="url(#moyuRing)"
        strokeWidth="2.6"
        transform="rotate(-22 32 33)"
        opacity="0.95"
      />
      <ellipse
        cx="32"
        cy="33"
        rx="24"
        ry="8.6"
        stroke="#9CC4FF"
        strokeWidth="0.8"
        transform="rotate(-22 32 33)"
        opacity="0.5"
      />

      {/* satellite */}
      <circle cx="50.5" cy="22.5" r="2.6" fill="#FFF7D6" />
      <circle cx="50.5" cy="22.5" r="5" fill="#FFF7D6" opacity="0.25" />

      {/* star sparkles */}
      <circle cx="13" cy="14" r="1.6" fill="#FFFFFF" opacity="0.85" />
      <circle cx="14" cy="14" r="3.2" fill="#FFFFFF" opacity="0.15" />
      <circle cx="55" cy="46" r="1.3" fill="#FFFFFF" opacity="0.6" />

      {/* M */}
      <text
        x="31.5"
        y="40.5"
        textAnchor="middle"
        fontFamily="Sora, Inter, Arial, sans-serif"
        fontWeight="800"
        fontSize="18"
        fill="url(#moyuText)"
      >
        M
      </text>
    </svg>
  );
}

function Logo({ to = "/", size = 40, tagline = null, dark = false }) {
  return (
    <Link to={to} className="group flex items-center gap-3">
      <span className="transition duration-300 group-hover:rotate-[8deg] group-hover:scale-105">
        <LogoMark size={size} />
      </span>
      <span className="leading-none">
        <span
          className={`block text-2xl font-black tracking-tight ${
            dark ? "text-brand-800" : "text-white"
          }`}
          style={{ fontFamily: "Sora, Inter, sans-serif" }}
        >
          MOYU
        </span>
        {tagline && (
          <span
            className={`mt-1 block text-[10px] font-semibold uppercase tracking-[0.28em] ${
              dark ? "text-brand-500" : "text-brand-300"
            }`}
          >
            {tagline}
          </span>
        )}
      </span>
    </Link>
  );
}

export default Logo;
export { LogoMark };
