import { useEffect, useRef } from "react";

const TRAIL = Array.from({ length: 5 }, (_, index) => ({
  id: index,
  size: 2 + (index % 2),
  delay: (index * 0.06) % 0.4,
}));

function SpaceSparkTrail({ className = "", style = {}, enabled = true }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled || !ref.current) return undefined;
    const element = ref.current;
    const emit = () => {
      for (const trail of TRAIL) {
        const dot = document.createElement("span");
        dot.className = "absolute rounded-full bg-brand-400 pointer-events-none";
        dot.style.width = `${trail.size}px`;
        dot.style.height = `${trail.size}px`;
        dot.style.bottom = "6px";
        dot.style.right = "8px";
        dot.style.opacity = "0";
        dot.style.transform = "translateX(6px)";
        dot.style.animation = `trail-fade 0.7s ease-out ${trail.delay}s 1 both`;
        element.appendChild(dot);
        setTimeout(() => dot.remove(), 900);
      }
    };

    element.addEventListener("mouseenter", emit, { passive: true });
    return () => element.removeEventListener("mouseenter", emit);
  }, [enabled]);

  if (!enabled) return null;

  return <span ref={ref} className={`relative inline-block overflow-hidden ${className}`} style={style} aria-hidden="true" />;
}

export default SpaceSparkTrail;
