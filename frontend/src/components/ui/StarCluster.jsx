const STARS = Array.from({ length: 32 }, (_, index) => ({
  id: index,
  size: 2 + (index % 3),
  left: (index * 7.3) % 100,
  top: (index * 11.1) % 100,
  delay: (index * 0.17) % 6,
  opacity: 0.25 + (index % 4) * 0.18,
}));

function StarCluster({ className = "", style = {}, count = 32 }) {
  return (
    <span className={`relative inline-block overflow-hidden star-cluster ${className}`} style={style} aria-hidden="true">
      {STARS.slice(0, count).map((star) => (
        <span
          key={star.id}
          className="sc-star absolute rounded-full bg-brand-400"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            boxShadow: `0 0 ${star.size * 1.2}px rgba(138,171,255,0.5)`,
            animation: `star-cluster-drift ${5 + (star.delay % 3)}s ease-in-out infinite ${star.delay}s`,
          }}
        />
      ))}
    </span>
  );
}

export default StarCluster;
