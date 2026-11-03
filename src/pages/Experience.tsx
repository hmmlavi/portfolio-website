import { BriefcaseBusiness, Calendar, CheckCircle2 } from "lucide-react";
import PageShell from "@/components/PageShell";
import { Reveal } from "@/components/anim";
import { EXPERIENCE } from "@/data/content";
import { useTheme } from "@/hooks/useTheme";
import { accent, colorFor } from "@/data/palette";
import { cn } from "@/utils/cn";

export default function Experience() {
  const { theme } = useTheme();
  const light = theme === "light";
  const mint = accent("mint", light);

  return (
    <PageShell
      id="experience"
      eyebrow="professional story"
      title="Practical"
      accentTitle="experience"
      icon={<BriefcaseBusiness className="w-5 h-5" style={{ color: mint }} aria-hidden="true" />}
      intro="The dated internship is listed separately from self-directed projects and selected public repositories."
    >
      <div className="flex flex-col gap-8 relative">
        {/* spatial vertical connector */}
        <div className="absolute left-[39px] top-10 bottom-10 w-px bg-white/5 hidden md:block" />

        {EXPERIENCE.map((e, i) => {
          const c = colorFor(e.color, e.colorLight, light);
          return (
            <Reveal key={e.role} delay={i * 100}>
              <div className="relative md:pl-20">
                {/* node dot */}
                <div className="absolute left-8 top-10 w-3 h-3 rounded-full hidden md:block z-10" style={{ 
                   background: c, 
                   border: '2px solid rgba(255,255,255,0.2)' 
                }} />
                
                <div className={cn(
                  "p-6 sm:p-8 md:p-10 rounded-[32px] transition-all duration-500",
                  "ui-surface"
                )}>
                   <div className="flex flex-wrap items-center justify-between gap-6 mb-10 pb-8 border-b border-white/5">
                      <div className="flex items-start gap-4 sm:items-center sm:gap-6 min-w-0">
                         <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                            <BriefcaseBusiness className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: c }} aria-hidden="true" />
                         </div>
                         <div className="min-w-0">
                            <p className="font-mono text-[9px] tracking-[0.24em] uppercase mb-2" style={{ color: c }}>
                              {e.kind === "formal" ? "Internship · approximately six weeks" : "Independent · self-directed"}
                            </p>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{e.role}</h2>
                            <p className="text-lg font-medium text-white/50">{e.org}</p>
                         </div>
                      </div>
                      <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                         <Calendar className="w-4 h-4 text-white/30 shrink-0" aria-hidden="true" />
                         <span className="text-xs font-mono tracking-widest text-white/60 uppercase">{e.span}</span>
                      </div>
                   </div>

                   <ul className="space-y-6">
                      {e.points.map((p, pi) => (
                        <li key={pi} className="flex items-start gap-4 group">
                           <div className="mt-1.5 w-5 h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                              <CheckCircle2 className="w-3 h-3" style={{ color: c }} />
                           </div>
                           <p className="text-base md:text-lg text-white/60 dark:text-white/40 leading-relaxed">{p}</p>
                        </li>
                      ))}
                   </ul>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </PageShell>
  );
}
