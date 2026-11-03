import { useEffect } from "react";

/**
 * Two site-wide, delegated interaction enhancements. Everything is attached
 * exactly once in App and fully removed on unmount — no per-button React
 * handlers, no duplicate listeners and no artificial navigation delay.
 *
 *  1. Button press feedback — a short scale press plus a controlled ripple on
 *     buttons marked `.pressable[data-feedback="ripple"]`; quiet/icon buttons
 *     get the press only. Different actions get different weight.
 *  2. Compact-card tilt — a very small (±2.5deg) perspective response on
 *     `[data-tilt]` cards, throttled with one requestAnimationFrame.
 *
 * Both are skipped for reduced motion; tilt is also skipped on touch/coarse
 * pointers, where CSS :active provides the equivalent tactile response.
 */
export function useInteractionEnhancements() {
  useEffect(() => {
    const media = (q: string) =>
      typeof window.matchMedia === "function" ? window.matchMedia(q) : null;
    const fine = media("(hover: hover) and (pointer: fine)");
    const reduced = media("(prefers-reduced-motion: reduce)");

    let tiltAllowed = Boolean(fine?.matches) && !reduced?.matches;
    const timers = new Set<number>();
    let raf = 0;
    let lastTilt: HTMLElement | null = null;
    let pending: { el: HTMLElement; x: number; y: number } | null = null;

    const onDown = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const el = target.closest<HTMLElement>(".pressable");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--press-x", `${e.clientX - rect.left}px`);
      el.style.setProperty("--press-y", `${e.clientY - rect.top}px`);
      el.classList.add("is-pressed");
      const t = window.setTimeout(() => {
        el.classList.remove("is-pressed");
        timers.delete(t);
      }, 480);
      timers.add(t);
    };

    const applyTilt = () => {
      raf = 0;
      if (!pending) return;
      const { el, x, y } = pending;
      pending = null;
      if (lastTilt && lastTilt !== el) resetTilt(lastTilt);
      lastTilt = el;
      const rect = el.getBoundingClientRect();
      const nx = (x - rect.left) / rect.width - 0.5;
      const ny = (y - rect.top) / rect.height - 0.5;
      el.style.setProperty("--tilt-x", `${(-ny * 4.5).toFixed(2)}deg`);
      el.style.setProperty("--tilt-y", `${(nx * 4.5).toFixed(2)}deg`);
      el.style.setProperty("--sheen-x", `${((nx + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty("--sheen-y", `${((ny + 0.5) * 100).toFixed(1)}%`);
    };

    const resetTilt = (el: HTMLElement) => {
      el.style.removeProperty("--tilt-x");
      el.style.removeProperty("--tilt-y");
      el.style.removeProperty("--sheen-x");
      el.style.removeProperty("--sheen-y");
    };

    const onMove = (e: PointerEvent) => {
      if (!tiltAllowed) return;
      const target = e.target;
      const el = target instanceof Element ? target.closest<HTMLElement>("[data-tilt]") : null;
      if (!el) {
        if (lastTilt) { resetTilt(lastTilt); lastTilt = null; }
        return;
      }
      pending = { el, x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(applyTilt);
    };

    const onLeave = () => {
      if (lastTilt) { resetTilt(lastTilt); lastTilt = null; }
    };

    const sync = () => {
      tiltAllowed = Boolean(fine?.matches) && !reduced?.matches;
      if (!tiltAllowed) onLeave();
    };

    document.addEventListener("pointerdown", onDown, { passive: true, capture: true });
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    fine?.addEventListener("change", sync);
    reduced?.addEventListener("change", sync);

    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      fine?.removeEventListener("change", sync);
      reduced?.removeEventListener("change", sync);
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
      if (raf) cancelAnimationFrame(raf);
      onLeave();
    };
  }, []);
}
