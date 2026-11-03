import { Box, Code2, Globe2, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { FUN_FACTS, type FunFact } from "@/data/journey";
import { accent, type AccentName } from "@/data/palette";

const ICONS: Record<FunFact["icon"], typeof Sparkles> = {
  spark: Sparkles,
  code: Code2,
  globe: Globe2,
  box: Box,
  layers: Layers,
  shield: ShieldCheck,
};
const HUES: AccentName[] = ["ice", "violet", "mint", "rose", "amber", "teal"];

/** A compact companion card to the timeline: short, genuine facts only. */
export default function FunFacts({ light }: { light: boolean }) {
  return (
    <div className="funfacts-card relative ui-surface rounded-[32px] p-6 md:p-8 h-full tilt-card" data-tilt data-fun-facts>
      <p className="eyebrow mb-2">off the keyboard</p>
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-1">Fun facts</h2>
      <p className="text-xs text-white/45 mb-6">A few true things, in small print.</p>

      <ul className="funfacts-grid">
        {FUN_FACTS.map((fact, i) => {
          const Icon = ICONS[fact.icon];
          const c = accent(HUES[i % HUES.length], light);
          return (
            <li key={fact.label} className="funfact" data-fun-fact={fact.label}>
              <span className="funfact-icon" style={{ color: c, borderColor: c }}>
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
              <span className="funfact-label">{fact.label}</span>
              <span className="funfact-value">{fact.value}</span>
            </li>
          );
        })}
      </ul>
      <p className="funfacts-foot">No invented statistics — just the work and the interests.</p>
    </div>
  );
}
