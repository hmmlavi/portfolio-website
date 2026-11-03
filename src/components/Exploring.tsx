import { Zap } from "lucide-react";
import { EXPLORING } from "@/data/content";
import { Reveal } from "@/components/anim";
import { useTheme } from "@/hooks/useTheme";
import { alpha, colorFor } from "@/data/palette";

/** Currently exploring — a compact strip of what I'm learning right now.
 *  Edit EXPLORING in src/data/content.ts to change it; no markup needed. */
export default function Exploring() {
  const light = useTheme().theme === "light";

  return (
    <section
      id="exploring"
      className="py-20 px-6 md:px-10 bg-black border-t border-white/5 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative">
        <Reveal className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-accent ui-tile"
            >
              <Zap className="w-4 h-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Currently exploring</h2>
              <p className="eyebrow mt-1">What I&#39;m learning and trying next</p>
            </div>
          </div>
        </Reveal>

        <div className="flex flex-wrap gap-2.5">
          {EXPLORING.map((item, i) => {
            const c = colorFor(item.color, item.colorLight, light);
            return (
              <Reveal key={item.label} delay={i * 60}>
                <span
                  className="group inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 ui-tag transition-all duration-300 hover:-translate-y-1 cursor-default"
                  style={{ borderColor: alpha(c, 0.18) }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full transition-transform duration-300 group-hover:scale-150"
                    style={{ background: c }}
                    aria-hidden="true"
                  />
                  <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                  <span
                    className="font-mono text-[8px] tracking-[0.22em] uppercase px-2 py-0.5 rounded-full border"
                    style={{ color: c, borderColor: alpha(c, 0.22), background: alpha(c, 0.06) }}
                  >
                    {item.tag}
                  </span>
                </span>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
