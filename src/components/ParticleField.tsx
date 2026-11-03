import { useEffect, useRef } from "react";
import { readTheme } from "@/hooks/useTheme";

/**
 * A restrained interactive background particle field.
 *
 *  - 20 particles on desktop, 8 on small fine-pointer screens, none on
 *    coarse/touch pointers or when reduced motion is requested.
 *  - Canvas 2D, transform-free drawing, one requestAnimationFrame loop,
 *    paused while the tab is hidden. No React state per frame.
 *  - Particles drift slowly; nearby ones are gently displaced by the pointer
 *    (attraction, not a shockwave) and ease back to their baseline drift.
 *  - Very low opacity, fixed behind all content, pointer-events: none.
 */
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  phase: number;
};

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const fine =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(hover: hover) and (pointer: fine)")
        : null;
    const motion =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    let raf = 0;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let running = false;
    let theme = readTheme();
    let color = "rgba(143,179,209,0.2)";
    let px = -1000;
    let py = -1000;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const readColor = () => {
      theme = readTheme();
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      color = /^#[0-9a-f]{6}$/i.test(raw)
        ? raw
        : theme === "light" ? "#2d5f88" : "#8fb3d1";
    };

    const seed = () => {
      const count = window.innerWidth < 900 ? 8 : 20;
      particles = Array.from({ length: count }, (_, i) => ({
        // Thoughtful distribution: a loose diagonal band, never a starfield.
        x: ((i * 0.6180339887) % 1) * width,
        y: ((i * 0.3819660113 + 0.12) % 1) * height,
        vx: 0.055 + (i % 4) * 0.022,
        vy: -0.035 - (i % 3) * 0.018,
        r: 1.1 + (i % 3) * 0.75,
        alpha: 0.09 + (i % 4) * 0.035,
        phase: i * 1.7,
      }));
    };

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const frame = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;
        if (p.y > height + 20) p.y = -20;
        if (p.y < -20) p.y = height + 20;

        // Gentle displacement away from the pointer within a small radius.
        const dx = p.x - px;
        const dy = p.y - py;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 150 * 150 && dist2 > 1) {
          const force = (1 - Math.sqrt(dist2) / 150) * 0.32;
          const inv = 1 / Math.sqrt(dist2);
          p.x += dx * inv * force;
          p.y += dy * inv * force;
        }

        const shimmer = 0.82 + 0.18 * Math.sin(now / 1700 + p.phase);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, p.alpha * shimmer);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, width, height);
    };

    const onMove = (e: PointerEvent | MouseEvent) => { px = e.clientX; py = e.clientY; };
    const onLeave = () => { px = -1000; py = -1000; };
    const onVisibility = () => (document.hidden ? stop() : sync());
    const sync = () => {
      if (!fine?.matches || motion?.matches || document.hidden) { stop(); return; }
      readColor();
      start();
    };

    resize();
    sync();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    fine?.addEventListener("change", sync);
    motion?.addEventListener("change", sync);

    // Theme changes rewrite --accent; observe the root attribute rather than
    // polling, and stop the observer on unmount.
    const observer = new MutationObserver(readColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      fine?.removeEventListener("change", sync);
      motion?.removeEventListener("change", sync);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" data-particle-field />;
}
