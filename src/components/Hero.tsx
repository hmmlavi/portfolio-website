import { useEffect, useRef, useState } from "react";
import { Cpu } from "lucide-react";
import { AVAILABILITY, HERO_STATS } from "@/data/content";
import { Magnetic, Reveal } from "@/components/anim";
import { prefersReducedMotion } from "@/hooks/useInView";
import { useTheme } from "@/hooks/useTheme";
import { accent } from "@/data/palette";
import { cn } from "@/utils/cn";

const INTERESTS = [
  { label: "AI & ideas", tab: "AI", detail: "Exploring how thoughtful AI can make everyday tools more useful.", code: "01" },
  { label: "Space", tab: "Space", detail: "Curious about distant worlds, ambitious missions and what we have yet to discover.", code: "02" },
  { label: "Music", tab: "Music", detail: "Finding inspiration in sounds, moods and the little details between notes.", code: "03" },
  { label: "Games & worlds", tab: "Games", detail: "Enjoying imaginative worlds, clever mechanics and experiences worth getting lost in.", code: "04" },
] as const;

/** Interactive interests panel — deliberately personal, not a project promotion. */
function InterestPanel() {
  const [active, setActive] = useState(0);
  const { theme } = useTheme();
  const tint = accent("violet", theme === "light");
  const interest = INTERESTS[active];

  return (
    <div
      className="idea-panel ui-surface w-full max-w-[440px] mx-auto lg:ml-auto lg:mr-0 rounded-[32px] overflow-hidden"
      data-hero-interest-panel
      style={{ borderTop: `2px solid ${tint}` }}
    >
      <div className="p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3 mb-8">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: tint }}>
            Beyond the screen
          </p>
          <span className="font-mono text-[10px] tabular-nums" style={{ color: "var(--ink-3)" }}>
            {interest.code} / 04
          </span>
        </div>

        <div className="idea-visual relative flex items-center justify-center mx-auto mb-7" aria-hidden="true">
          <span className="idea-orbit idea-orbit-one" />
          <span className="idea-orbit idea-orbit-two" />
          <span className="idea-core">{interest.code}</span>
          <span className="idea-spark idea-spark-one" />
          <span className="idea-spark idea-spark-two" />
        </div>

        <div className="min-h-[112px]">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: "var(--ink-3)" }}>
            A few things I enjoy
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2" data-interest-title>
            {interest.label}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink-2)" }} aria-live="polite" data-interest-detail>
            {interest.detail}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-6 pt-5 border-t" style={{ borderColor: "var(--line)" }}>
          {INTERESTS.map((item, index) => (
            <button
              key={item.code}
              type="button"
              className="idea-tab rounded-xl px-2 py-2.5 text-[10px] sm:text-[11px] font-semibold transition-colors"
              style={{
                color: active === index ? tint : "var(--ink-3)",
                background: active === index ? `color-mix(in srgb, ${tint} 12%, var(--glass-bg))` : "transparent",
                border: `1px solid ${active === index ? tint : "var(--line)"}`,
              }}
              aria-pressed={active === index}
              aria-label={`Explore ${item.label}`}
              onClick={() => setActive(index)}
              data-interest-tab={item.code}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-4 font-mono text-[9px] tracking-[0.12em]" style={{ color: "var(--ink-3)" }}>
          PICK A TOPIC · SEE WHAT CATCHES MY ATTENTION
        </p>
      </div>
    </div>
  );
}

export default function Hero() {
  const { theme } = useTheme();
  const light = theme === "light";
  const ice = accent("ice", light);
  const mint = accent("mint", light);

  const containerRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  /* interactive depth effect — unchanged, still skips reduced motion */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = containerRef.current;
    const visual = visualRef.current;
    if (!el || !visual) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      visual.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateZ(12px)`;
    };

    const onLeave = () => {
      visual.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)`;
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative flex items-center px-6 md:px-10 overflow-hidden pt-28 md:pt-32 pb-10 md:pb-14"
    >
      {/* Background glow patches (Spatial ambient lighting) */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-40 ambient-wash" />
        <div className="absolute bottom-[10%] right-[15%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-30 ambient-wash" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
        <div className="lg:col-span-7">
          <Reveal>
            <div className={cn(
              "inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-7 border",
              "ui-tag text-accent"
            )}>
              <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Computer Science Student</span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] mb-4">
              Lakshit Singh <br />
              <span className="shimmer-text">Saini</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-lg md:text-xl text-white/60 font-medium mb-7 max-w-xl leading-relaxed">
              Developer building <span className="text-white">intentional</span>, privacy-focused
              software for Android, the web and desktop.
            </p>
          </Reveal>

          <Reveal delay={250}>
            <p
              className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase mb-8"
              style={{ color: mint }}
              data-availability
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: mint }} aria-hidden="true" />
              {AVAILABILITY.label}
            </p>
          </Reveal>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-9">
            <Reveal delay={300}>
              <Magnetic>
                <a
                  href="#/projects"
                  className={cn(
                    "pressable px-9 py-4 rounded-2xl text-base font-bold transition-all duration-500 shadow-2xl",
                    "ui-btn-primary"
                  )}
                  data-feedback="ripple"
                >
                  View Projects
                </a>
              </Magnetic>
            </Reveal>
            <Reveal delay={350}>
              <Magnetic>
                <a
                  href="#/contact"
                  className={cn(
                    "pressable px-9 py-4 rounded-2xl text-base font-medium border border-white/10 transition-all duration-300",
                    "ui-btn-quiet"
                  )}
                  data-feedback="press"
                >
                  Get in Touch
                </a>
              </Magnetic>
            </Reveal>
            <a href="#/quick-view" className="hero-quick-link text-sm font-semibold px-1 py-3">
              Recruiter quick view →
            </a>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 border-t border-white/5">
            {HERO_STATS.map((s, i) => (
              <Reveal key={s.label} delay={400 + i * 100}>
                <div className="flex flex-col gap-1">
                  <span className="text-2xl md:text-3xl font-bold tracking-tight tabular-nums" style={{ color: ice }}>{s.value}</span>
                  <span className="text-[10px] uppercase tracking-widest text-white/30 leading-tight">{s.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Personal interactive panel — replaces the old project showcase. */}
        <div className="lg:col-span-5 w-full">
          <Reveal delay={350} className="w-full">
            <div ref={visualRef}>
              <InterestPanel />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
