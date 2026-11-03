import { SKILL_CATEGORIES } from "@/data/content";
import { Reveal } from "@/components/anim";
import { useTheme } from "@/hooks/useTheme";
import { colorFor } from "@/data/palette";
import TechIcon, { CATEGORY_LOGOS } from "@/components/TechIcon";
import { cn } from "@/utils/cn";

export default function Skills() {
  const { theme } = useTheme();
  const light = theme === "light";

  return (
    <section id="skills" className="pt-28 md:pt-32 pb-20 md:pb-24 px-6 md:px-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <Reveal className="mb-20">
          <p className="eyebrow mb-4">the stack</p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-8 text-white dark:text-white">Technical Skills</h1>
          <p className="text-white/50 dark:text-white/40 text-lg leading-relaxed max-w-xl">
             The languages, frameworks and tools I reach for, grouped by the kind of work they do.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SKILL_CATEGORIES.map((cat, ci) => {
            const c = colorFor(cat.color, cat.colorLight, light);
            const CategoryLogo = CATEGORY_LOGOS[ci % CATEGORY_LOGOS.length];
            return (
              <Reveal key={cat.title} delay={ci * 50}>
                <div className={cn(
                  "p-7 rounded-[32px] h-full flex flex-col relative transition-all duration-500 tilt-card",
                  "ui-surface",
                )} data-tilt data-skill-card={cat.title}>
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl ui-tech-tile flex items-center justify-center shrink-0">
                         <CategoryLogo className="w-6 h-6" aria-hidden="true" focusable="false" />
                      </div>
                      <div className="min-w-0">
                         <h2 className="text-lg font-bold leading-tight">{cat.title}</h2>
                         <p className="text-[10px] font-mono tracking-widest text-white/30 uppercase mt-1">{cat.sub}</p>
                      </div>
                   </div>

                   <ul className="space-y-2.5 mt-auto">
                      {cat.skills.map((s) => (
                        <li key={s} className="skill-row flex items-center gap-3 px-2 py-1 -mx-2">
                           <span
                             className="skill-logo ui-tech-tile flex items-center justify-center shrink-0"
                             data-tech={s}
                             aria-hidden="true"
                           >
                             <TechIcon name={s} className="w-4 h-4" />
                           </span>
                           <span className="skill-name text-[13px] font-medium text-white/70 transition-colors">{s}</span>
                           <span className="ml-auto w-1 h-1 rounded-full shrink-0" style={{ background: c }} aria-hidden="true" />
                        </li>
                      ))}
                   </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
