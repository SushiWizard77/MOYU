import { useEffect } from "react";

const PARTICLES = 8;

function CompletionSpark({ active = false, className = "", style = {}, delay = 0, onDone }) {
  useEffect(() => {
    if (!active || typeof onDone !== "function") return undefined;
    const timer = setTimeout(onDone, delay);
    return () => clearTimeout(timer);
  }, [active, delay, onDone]);

  if (!active) return null;

  return (
    <span className={`absolute inset-0 pointer-events-none ${className}`} style={style} aria-hidden="true">
      {Array.from({ length: PARTICLES }).map((_, index) => {
        const angle = (index / PARTICLES) * Math.PI * 2;
        const distance = 16 + (index % 3) * 6;
        return (
          <span
            key={index}
            className="spark-particle"
            style={{
              "--spark-x": `${Math.cos(angle) * distance}px`,
              "--spark-y": `${Math.sin(angle) * distance - 8}px`,
              left: "50%",
              top: "50%",
              backgroundColor: index % 2 === 0 ? "rgba(255,247,214,0.9)" : "rgba(138,171,255,0.9)",
              boxShadow: "0 0 6px currentColor",
              color: "rgba(138,171,255,0.9)",
              animationDelay: `${index * 0.05}s`,
            }}
          />
        );
      })}
    </span>
  );
}

export default CompletionSpark;
