import { BookOpen, GraduationCap, Calendar } from "lucide-react";
import PageShell from "@/components/PageShell";
import { Reveal } from "@/components/anim";
import { COURSEWORK, EDUCATION, EXPLORING } from "@/data/content";
import { useTheme } from "@/hooks/useTheme";
import { accent, colorFor } from "@/data/palette";
import { cn } from "@/utils/cn";

export default function Education() {
  const { theme } = useTheme();
  const light = theme === "light";
  const ice = accent("ice", light);

  return (
    <PageShell
      id="education"
      eyebrow="academic journey"
      title="The"
      accentTitle="education"
      icon={<GraduationCap className="w-5 h-5" style={{ color: ice }} aria-hidden="true" />}
      intro="Foundational systems thinking and technical discipline from my degree, reinforced by independent builds."
      mascotPose="learning"
    >
      <div className="flex flex-col gap-10">
        {EDUCATION.map((e, i) => {
          const c = colorFor(e.color, e.colorLight, light);
          return (
            <Reveal key={e.title} delay={i * 100}>
              <div className={cn(
                "p-6 sm:p-8 md:p-10 rounded-[32px] transition-all duration-500",
                "ui-surface"
              )}>
                <div className="flex flex-wrap items-center justify-between gap-6 mb-8 pb-8 border-b border-white/5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6" style={{ color: c }} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{e.title}</h2>
                      <p className="text-sm text-white/50">{e.place}</p>
                    </div>
                  </div>
                  {e.status === "current" && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                      <Calendar className="w-4 h-4 text-white/30" aria-hidden="true" />
                      <span className="text-xs font-mono tracking-widest text-white/60 uppercase">Current study</span>
                    </div>
                  )}
                </div>

                <p className="text-base md:text-lg text-white/60 dark:text-white/40 leading-relaxed max-w-3xl">{e.detail}</p>
              </div>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-16">
        <Reveal>
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-white/30" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Computer Science in practice</h2>
          </div>
          <p className="text-sm text-white/50 leading-relaxed max-w-2xl mb-8">
            Topics connected to my current B.Tech Computer Science &amp; Engineering studies and
            independent practice. These are areas I study and apply, not a list of completed courses.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COURSEWORK.map((c, i) => {
            const a = accent("ice", light);
            return (
              <Reveal key={c.subject} delay={i * 50}>
                <div className={cn(
                  "p-6 rounded-3xl transition-all duration-300",
                  "ui-surface"
                )}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: a }} aria-hidden="true" />
                    <h3 className="text-base font-semibold">{c.subject}</h3>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed">{c.applied}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <div className="mt-10 p-6 md:p-8 rounded-3xl ui-surface">
            <h3 className="text-base font-semibold mb-1">Currently exploring beyond coursework</h3>
            <p className="text-sm text-white/50 mb-4">Self-directed topics I am learning or building with right now.</p>
            <ul className="flex flex-wrap gap-2">
              {EXPLORING.filter(item => item.tag === "learning").map(item => (
                <li key={item.label} className="ui-tag rounded-full px-3.5 py-2 text-sm text-white/80">
                  {item.label}
                </li>
              ))}
            </ul>
            <a href="#/about" className="inline-block mt-4 text-sm underline underline-offset-4">
              See everything I&#39;m exploring →
            </a>
          </div>
        </Reveal>
      </div>
    </PageShell>
  );
}
