import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { FAQS } from "@/data/content";
import { Reveal } from "@/components/anim";
import { cn } from "@/utils/cn";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-6 md:px-10 relative overflow-hidden">
      <div className="max-w-3xl mx-auto relative">
        <Reveal className="mb-14">
          <p className="eyebrow mb-4">common questions</p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white dark:text-white">Quick answers</h2>
          <p className="text-white/50 dark:text-white/40 text-base md:text-lg leading-relaxed max-w-lg">
            About who I am, what I build and how to reach me.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-4">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            const triggerId = `faq-trigger-${i}`;
            const panelId = `faq-panel-${i}`;
            return (
              <Reveal key={f.q} delay={i * 50}>
                <div
                  className={cn(
                    "rounded-[24px] overflow-hidden transition-all duration-500 ui-surface",
                    isOpen && "ui-pill-active",
                  )}
                >
                  <button
                    id={triggerId}
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="w-full flex items-center gap-5 px-6 md:px-8 py-6 text-left"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-300 bg-ice"
                      aria-hidden="true"
                    />
                    <span className={cn(
                      "flex-1 text-base md:text-lg font-medium tracking-tight transition-colors duration-300",
                      isOpen ? "text-white" : "text-white/70 group-hover:text-white",
                    )}>
                      {f.q}
                    </span>
                    <span className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border border-white/5",
                      isOpen ? "rotate-180 bg-white/5" : "bg-white/[0.02] group-hover:scale-110",
                    )}>
                      {isOpen ? <Minus className="w-5 h-5 text-white" aria-hidden="true" /> : <Plus className="w-5 h-5 text-white/50" aria-hidden="true" />}
                    </span>
                  </button>
                  <div
                    id={panelId}
                    className="faq-answer"
                    data-open={isOpen}
                    role="region"
                    aria-labelledby={triggerId}
                    aria-hidden={!isOpen}
                  >
                    <div className="px-6 md:px-8 pl-[52px] md:pl-[68px] pb-8">
                      <p className="text-base text-white/60 dark:text-white/40 leading-relaxed max-w-2xl">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
