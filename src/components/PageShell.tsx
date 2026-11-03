import type { ReactNode } from "react";
import { Reveal } from "@/components/anim";
import PageMascot from "@/components/PageMascot";

/**
 * Shared page chrome: consistent top offset for the fixed nav, eyebrow,
 * page title, optional intro, and ambient colour washes. Every standalone
 * page uses this so hierarchy, spacing and atmosphere stay identical.
 */

export default function PageShell({
  id,
  eyebrow,
  title,
  accentTitle,
  intro,
  icon,
  children,
  mascotPose,
}: {
  id: string;
  eyebrow: string;
  title: string;
  accentTitle?: string;
  intro?: string;
  icon?: ReactNode;
  children: ReactNode;
  mascotPose?: "trophy" | "learning" | "work";
}) {
  return (
    <section
      id={id}
      className="pt-28 md:pt-32 pb-20 md:pb-24 px-6 md:px-10 relative min-h-screen"
    >
      {/* page-specific spatial depth */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[35%] h-[40%] rounded-full blur-[140px] opacity-40 ambient-wash" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <Reveal className="mb-14 md:mb-18 page-shell-heading">
          <div className="flex items-center gap-3 mb-4">
            {icon}
            <p className="eyebrow">{eyebrow}</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.08]">
            {title} {accentTitle && <span className="shimmer-text">{accentTitle}</span>}
          </h1>
          {mascotPose && <div className="page-shell-mascot"><PageMascot pose={mascotPose} embedded /></div>}
          {intro && (
            <p className="mt-5 text-sm md:text-base text-white/60 leading-relaxed max-w-2xl">{intro}</p>
          )}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
