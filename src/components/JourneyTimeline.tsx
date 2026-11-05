import { useState } from "react";
import { ChevronDown, Route } from "lucide-react";
import { JOURNEY } from "@/data/journey";
import { accent, type AccentName } from "@/data/palette";
import { cn } from "@/utils/cn";

const HUES: AccentName[] = ["ice", "teal", "violet", "amber", "mint"];

/**
 * A large, integrated About Me card (not a separate section): chronological
 * milestones with year indicators, a connecting rail, and smooth expansion.
 * Clicking a milestone reveals genuine detail from the site's own data.
 */
export default function JourneyTimeline({ light }: { light: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="journey-card relative ui-surface rounded-[32px] p-6 md:p-9" data-journey-timeline>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="eyebrow mb-2">the path so far</p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">A builder's timeline</h2>
        </div>
        <span className="journey-badge" aria-hidden="true"><Route className="w-4 h-4" /></span>
      </div>

      <ol className="journey-list">
        {JOURNEY.map((step, i) => {
          const c = accent(HUES[i % HUES.length], light);
          const open = openId === step.id;
          return (
            <li key={step.id} className={cn("journey-item", open && "is-open")} data-journey-step={step.id}>
              <span className="journey-node" style={{ borderColor: c, background: c }} aria-hidden="true" />
              <button
                type="button"
                className="journey-trigger w-full text-left"
                aria-expanded={open}
                aria-controls={`journey-panel-${step.id}`}
                onClick={() => setOpenId(open ? null : step.id)}
                data-journey-trigger
              >
                <span className="journey-era" style={{ color: c }}>{step.era}</span>
                <span className="journey-title">{step.title}</span>
                <span className="journey-org">{step.org}</span>
                <ChevronDown className={cn("journey-chevron", open && "is-open")} aria-hidden="true" />
              </button>
              <div
                id={`journey-panel-${step.id}`}
                className={cn("journey-detail", open && "is-open")}
                role="region"
                aria-label={`${step.title} details`}
                hidden={!open}
              >
                <p className="journey-summary">{step.summary}</p>
                <ul>
                  {step.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="journey-foot">Select a milestone to read a little more.</p>
    </div>
  );
}
