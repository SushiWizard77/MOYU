const SPARK_COUNT = 8;
const SPARKS = Array.from({ length: SPARK_COUNT }, (_, index) => {
  const angle = (index / SPARK_COUNT) * Math.PI * 2;
  const distance = 18 + (index % 4) * 7;
  return {
    id: index,
    dx: Math.round(Math.cos(angle) * distance),
    dy: Math.round(Math.sin(angle) * distance),
    delay: (index % SPARK_COUNT) * 0.025,
  };
});

function SparkTrail({ style, active }) {
  if (!active) return null;

  return (
    <div className="completion-spark" style={style}>
      {SPARKS.map((item) => (
        <span
          key={item.id}
          style={{
            "--dx": `${item.dx}px`,
            "--dy": `${item.dy}px`,
            animationDelay: `${item.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default SparkTrail;
