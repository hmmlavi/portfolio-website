import { accent, type AccentName } from "@/data/palette";

/**
 * A quiet, purposeful divider: hairline rules, one small typographic label
 * and a single geometric mark. Used between a few Home sections only — never
 * added everywhere, and it adds almost no vertical space.
 */
export default function SectionDivider({
  label,
  hue = "ice",
  light,
}: {
  label: string;
  hue?: AccentName;
  light: boolean;
}) {
  const c = accent(hue, light);
  return (
    <div className="section-divider" data-section-divider={label} aria-hidden="true">
      <span className="section-divider-line" />
      <span className="section-divider-mark" style={{ borderColor: c }} />
      <span className="section-divider-label" style={{ color: c }}>{label}</span>
      <span className="section-divider-mark" style={{ borderColor: c }} />
      <span className="section-divider-line" />
    </div>
  );
}
