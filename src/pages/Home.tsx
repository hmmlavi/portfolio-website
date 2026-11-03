import { ArrowRight, ArrowUpRight, Boxes, Cpu, Globe, Medal, Smartphone } from "lucide-react";
import Hero from "@/components/Hero";
import { Magnetic, Reveal } from "@/components/anim";
import {
  ACHIEVEMENTS_PREVIEW, AVAILABILITY, CAPABILITIES, LINKS, SPOTLIGHT_PROJECTS,
} from "@/data/content";
import { accent, alpha, colorFor, type AccentName } from "@/data/palette";
import ProjectCard from "@/components/ProjectCard";
import SectionDivider from "@/components/SectionDivider";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/utils/cn";

/** Section head for the gateway sections on Home — now with per-section hue. */
function SectionHead({
  index,
  eyebrow,
  title,
  href,
  hrefLabel,
  light,
  hue = "ice",
  note,
}: {
  index: string;
  eyebrow: string;
  title: string;
  href?: string;
  hrefLabel?: string;
  light: boolean;
  hue?: AccentName;
  note?: string;
}) {
  const c = accent(hue, light);
  return (
    <Reveal revealOnScroll className="flex flex-wrap items-end justify-between gap-6 mb-10">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-[10px] tracking-[0.3em]" style={{ color: c }}>{index}</span>
          <span className="h-px w-10" style={{ background: alpha(c, 0.45) }} />
          <p className="eyebrow" style={{ color: c }}>{eyebrow}</p>
        </div>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.1]">{title}</h2>
        {note && (
          <p className="mt-4 font-mono text-[10px] tracking-[0.12em] text-white/40">{note}</p>
        )}
      </div>
      {href && (
        <a
          href={href}
          className="group inline-flex items-center gap-2 text-sm font-medium transition-colors link-sweep"
          style={{ color: c }}
        >
          {hrefLabel}
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </a>
      )}
    </Reveal>
  );
}

const CAPABILITY_ICONS = [Cpu, Boxes, Smartphone, Globe];

export default function Home() {
  const { theme } = useTheme();
  const light = theme === "light";
  const contact = accent("rose", light);


  return (
    <div className="relative">
      <Hero />

      {/* NASA's original interactive solar system — embedded, not recreated. */}
      <section className="px-6 md:px-10 pt-8 pb-14 md:pb-16">
        <div className="max-w-7xl mx-auto">
          <Reveal revealOnScroll>
            <div className="flex flex-wrap items-end justify-between gap-5 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-[10px] tracking-[0.3em]" style={{ color: accent("ice", light) }}>01</span>
                  <span className="h-px w-10" style={{ background: alpha(accent("ice", light), 0.45) }} />
                  <p className="eyebrow" style={{ color: accent("ice", light) }}>explore the cosmos</p>
                </div>
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.1]">The Solar System</h2>
                <p className="mt-3 text-sm md:text-base text-white/55 max-w-2xl">
                  Explore planets, moons, asteroids and real NASA missions in an interactive 3D experience, powered by NASA/JPL.
                </p>
              </div>
              <a
                href="https://eyes.nasa.gov/apps/solar-system/#/home"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm font-medium transition-colors link-sweep"
                style={{ color: accent("ice", light) }}
              >
                Open NASA Eyes <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </a>
            </div>
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/15 bg-[#030711] shadow-2xl">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="font-mono text-[10px] sm:text-xs tracking-[0.16em] text-white/65 truncate">NASA / JPL · EYES ON THE SOLAR SYSTEM</span>
                </div>
                <span className="font-mono text-[9px] tracking-wider text-white/35 shrink-0">INTERACTIVE 3D</span>
              </div>
              <iframe
                title="NASA Eyes on the Solar System — interactive 3D explorer"
                src="https://eyes.nasa.gov/apps/solar-system/#/home?embed=true"
                className="block w-full h-[480px] sm:h-[560px] lg:h-[680px] border-0"
                allow="accelerometer; autoplay; fullscreen; gyroscope"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <p className="mt-3 text-[10px] font-mono tracking-wide text-white/35">
              Experience and mission data are provided by NASA/JPL. Requires an internet connection.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Selected work preview — the three flagship builds */}
      <section className="py-14 md:py-16 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <SectionHead
            index="01"
            eyebrow="curated work"
            title="Featured projects"
            href="#/projects"
            hrefLabel="Explore all projects"
            hue="violet"
            note="// three flagship builds from seven selected public projects"
            light={light}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPOTLIGHT_PROJECTS.map((p, i) => (
              <ProjectCard key={p.repo} project={p} ordinal={i} delay={i * 90} variant="spotlight" light={light} />
            ))}
          </div>
        </div>
      </section>

      <SectionDivider label="the stack behind the work" hue="teal" light={light} />

      {/* Capabilities — what I actually work on, not a duplicate skills list */}
      <section className="py-14 md:py-16 px-6 md:px-10 bg-white/5 dark:bg-black/5">
        <div className="max-w-7xl mx-auto">
          <SectionHead
            index="02"
            eyebrow="technical focus"
            title="What I build"
            href="#/skills"
            hrefLabel="Complete skill map"
            hue="teal"
            light={light}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAPABILITIES.map((cap, i) => {
              const c = colorFor(cap.color, cap.colorLight, light);
              const Icon = CAPABILITY_ICONS[i % CAPABILITY_ICONS.length];
              return (
                <Reveal key={cap.title} revealOnScroll delay={i * 80}>
                  <div
                    className={cn(
                      "p-6 h-full rounded-2xl relative transition-all duration-300 tilt-card",
                      "ui-surface spotlight-card home-skill-card",
                    )}
                    data-tilt
                    style={{ "--card-accent": c } as React.CSSProperties}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-9 h-9 rounded-xl ui-tech-tile flex items-center justify-center shrink-0" style={{ color: c }}>
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-mono text-[9px] tracking-[0.24em] text-white/40">{cap.index}</p>
                        <h3 className="text-[15px] font-semibold leading-tight">{cap.title}</h3>
                      </div>
                    </div>
                    <p className="text-[13px] text-white/55 leading-relaxed">{cap.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <SectionDivider label="the person behind the stack" hue="mint" light={light} />

      {/* About snippet */}
      <section className="py-14 md:py-16 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <SectionHead index="03" eyebrow="brief introduction" title="A little about me" hue="mint" light={light} />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            <Reveal revealOnScroll className="md:col-span-7">
              <p className="text-xl md:text-2xl text-white/60 leading-relaxed mb-8">
                I started experimenting with technology in 2020, and I never stopped. These days, I learn by building things, breaking them, and fixing them.
              </p>
              <a href="#/about" className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all link-sweep" style={{ color: accent("mint", light) }}>
                Read the story <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </a>
            </Reveal>
            <Reveal revealOnScroll delay={200} className="md:col-span-5">
              <div className={cn("p-7 rounded-3xl relative overflow-hidden transition-all duration-500", "ui-surface")}>
                <div aria-hidden="true" className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-50 ambient-wash" />
                <p className="font-mono text-[10px] tracking-widest text-white/40 uppercase mb-6">Focus areas</p>
                <ul className="space-y-4">
                  {["Android & Kotlin", "Web applications", "Desktop utilities", "Local-first storage"].map((f, i) => (
                    <li key={f} className="flex items-center gap-3 text-sm font-medium text-white/80">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: accent((["ice", "teal", "violet", "amber"] as AccentName[])[i], light) }}
                        aria-hidden="true"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Achievements preview */}
      <section className="py-14 md:py-16 px-6 md:px-10 bg-white/5 dark:bg-black/5">
        <div className="max-w-7xl mx-auto">
          <SectionHead
            index="04"
            eyebrow="recognition"
            title="Milestones"
            href="#/achievements"
            hrefLabel="All achievements"
            hue="amber"
            light={light}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ACHIEVEMENTS_PREVIEW.slice(0, 4).map((a, i) => {
              const c = accent(a.accent, light);
              return (
                <Reveal key={a.title} revealOnScroll delay={i * 80}>
                  <div className={cn("p-6 h-full rounded-2xl relative transition-all duration-300 tilt-card flex flex-col", "ui-surface spotlight-card")} data-tilt>
                    <Medal className="w-5 h-5 mb-4" style={{ color: c }} aria-hidden="true" />
                    <h3 className="text-sm font-semibold mb-2 leading-snug">{a.title}</h3>
                    <div className="mt-auto">
                      <p className="text-[11px] font-mono uppercase tracking-widest text-white/40">{a.org}</p>
                      <p className="text-[10px] font-mono text-white/30 mt-1">{a.date}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <SectionDivider label="from milestones to conversations" hue="rose" light={light} />

      {/* Contact CTA */}
      <section className="py-14 md:py-16 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <Reveal revealOnScroll>
            <div className={cn("p-8 sm:p-10 md:p-12 rounded-[32px] text-center relative overflow-hidden transition-all duration-500", "ui-surface")}>
              <div aria-hidden="true" className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-45 ambient-wash" />
              <div aria-hidden="true" className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[100px] opacity-30 ambient-wash" />

              <div className="relative">
                <p className="inline-flex items-center gap-2 font-mono text-[9px] tracking-[0.28em] uppercase mb-5" style={{ color: contact }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: contact }} aria-hidden="true" />
                  open to conversations
                </p>
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-5">
                  Let&#39;s build something <span className="shimmer-text">meaningful</span>.
                </h2>
                <p className="text-base md:text-lg text-white/50 mb-9 max-w-xl mx-auto">
                  {AVAILABILITY.detail} If you have an idea, I&#39;d like to hear about it.
                </p>
                <div data-cta-row className="flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
                  <Magnetic className="shrink-0">
                    <a
                      href="#/contact"
                      className="pressable cta-btn inline-flex items-center justify-center h-14 px-8 sm:px-10 rounded-2xl text-[15px] sm:text-base font-bold whitespace-nowrap ui-btn-contact"
                      data-feedback="ripple"
                    >
                      Contact me
                    </a>
                  </Magnetic>
                  <Magnetic className="shrink-0">
                    <a
                      href={LINKS.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pressable cta-btn inline-flex items-center justify-center h-14 px-8 sm:px-10 rounded-2xl text-[15px] sm:text-base font-semibold whitespace-nowrap ui-btn-quiet"
                      data-feedback="press"
                    >
                      {LINKS.resumeLabel}
                    </a>
                  </Magnetic>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
