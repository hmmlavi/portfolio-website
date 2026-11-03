import { useEffect } from "react";
import { prefersReducedMotion } from "@/hooks/useInView";

/**
 * One IntersectionObserver for every <Reveal revealOnScroll> element.
 *
 * Content is visible by default — the observer only plays a gentle entrance
 * animation when an element scrolls into view. If the observer is missing,
 * reduced motion is requested, or nothing ever fires, every element stays
 * fully readable. No scroll listeners, no layout reads while scrolling.
 */
export function useScrollReveals() {
  useEffect(() => {
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-scroll-reveal="pending"]'),
    );
    if (nodes.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.dataset.scrollReveal = "visible";
          io.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, []);
}
