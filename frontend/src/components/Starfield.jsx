import { useEffect, useRef } from "react";

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function Starfield({ density = 140, shootingStars = true, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let stars = [];
    let meteors = [];
    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      width = canvas.width = parent ? parent.clientWidth : window.innerWidth;
      height = canvas.height = parent ? parent.clientHeight : window.innerHeight;
      const count = Math.min(
        320,
        Math.floor((width * height) / 9000) + density * 0.2
      );
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: randomBetween(0.4, 1.9),
        baseAlpha: randomBetween(0.25, 1),
        speed: randomBetween(0.4, 1.6),
        phase: Math.random() * Math.PI * 2,
        warm: Math.random() < 0.12,
      }));
    };

    const spawnMeteor = () => {
      const x = randomBetween(width * 0.2, width);
      meteors.push({
        x,
        y: randomBetween(0, height * 0.35),
        vx: randomBetween(-7, -4),
        vy: randomBetween(2.5, 4.5),
        life: 1,
      });
    };

    let lastMeteor = 0;
    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        const twinkle = 0.55 + 0.45 * Math.sin(time / 1000 * star.speed + star.phase);
        const alpha = star.baseAlpha * twinkle;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = star.warm
          ? `rgba(255, 247, 214, ${alpha})`
          : `rgba(215, 227, 255, ${alpha})`;
        ctx.fill();
        if (star.r > 1.5 && twinkle > 0.85) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(140, 175, 255, ${0.08 * twinkle})`;
          ctx.fill();
        }
      }

      if (shootingStars && time - lastMeteor > randomBetween(2600, 7000)) {
        lastMeteor = time;
        spawnMeteor();
      }

      meteors = meteors.filter((m) => m.life > 0);
      for (const m of meteors) {
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.016;
        const tail = 90;
        const gradient = ctx.createLinearGradient(
          m.x,
          m.y,
          m.x - m.vx * 12,
          m.y - m.vy * 12
        );
        gradient.addColorStop(0, `rgba(255,255,255,${0.9 * m.life})`);
        gradient.addColorStop(1, "rgba(94,133,255,0)");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 12, m.y - m.vy * 12);
        ctx.stroke();
        void tail;
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [density, shootingStars]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}

export default Starfield;
