import { useRef, type CSSProperties, type ReactNode } from "react";
import { isFinePointer, prefersReducedMotion } from "@/hooks/useInView";

/**
 * Reveal — layout wrapper only. Entrance animations are removed site-wide.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "span" | "li";
  onVisible?: () => void;
  revealOnScroll?: boolean;
}) {
  return (
    <Tag
      className={className}
    >
      {children}
    </Tag>
  );
}

/** Magnetic hover — element gently follows the cursor on desktop. */
export function Magnetic({
  children,
  strength = 0.32,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({ ok: false });

  const init = () => {
    state.current.ok = isFinePointer() && !prefersReducedMotion();
  };

  const onMove = (e: React.MouseEvent) => {
    if (!state.current.ok) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    el.style.transition = "transform 0.12s ease-out";
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.45s cubic-bezier(0.16,1,0.3,1)";
    el.style.transform = "translate(0px, 0px)";
  };

  const style: CSSProperties = { display: "inline-block" };

  return (
    <div
      ref={(el) => {
        ref.current = el;
        init();
      }}
      className={className}
      style={style}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}
