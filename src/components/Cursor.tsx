import { useEffect, useRef } from "react";

/**
 * Exactly ONE solid circular cursor + one soft, diffused background aura.
 *
 * There is no outer ring, no second dot, no trailing circle and no outline
 * shape. The aura is a large, very low-opacity radial wash behind the content;
 * it eases toward the pointer and is never brighter than the cursor itself.
 *
 * Performance: one requestAnimationFrame loop, transform-only writes, no
 * layout reads and no React state per pointer move. The loop parks itself as
 * soon as everything has settled. Disabled on coarse pointers and whenever
 * reduced motion is requested.
 */
const INTERACTIVE =
  "a, button, input, textarea, select, label, [role='button'], [data-cursor-hover]";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const dot = dotRef.current;
    const aura = auraRef.current;
    if (!dot || !aura) return;

    const fineQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(hover: hover) and (pointer: fine)")
        : null;
    const motionQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    let enabled = false;
    let running = false;
    let visible = false;
    let raf = 0;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let ax = mx;
    let ay = my;
    let scale = 1;
    let target = 1;

    const write = () => {
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) scale(${scale.toFixed(3)})`;
      aura.style.transform = `translate3d(${ax}px, ${ay}px, 0)`;
    };

    const frame = () => {
      // The aura follows smoothly but stays behind the solid dot.
      ax += (mx - ax) * 0.16;
      ay += (my - ay) * 0.16;
      scale += (target - scale) * 0.2;
      write();
      const moving =
        Math.abs(mx - ax) > 0.2 || Math.abs(my - ay) > 0.2 ||
        Math.abs(target - scale) > 0.002;
      if (moving) raf = requestAnimationFrame(frame);
      else running = false;
    };

    const kick = () => {
      if (!enabled || running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent | MouseEvent) => {
      if (!enabled) return;
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        ax = mx;
        ay = my;
        visible = true;
        root.classList.add("cursor-active");
      }
      kick();
    };

    const onOver = (e: PointerEvent) => {
      if (!enabled) return;
      const t = e.target;
      const hot = t instanceof Element && Boolean(t.closest(INTERACTIVE));
      root.classList.toggle("cursor-hover", hot);
      target = hot ? 0.82 : 1;
      kick();
    };

    const onEnter = () => { if (enabled && visible) root.classList.add("cursor-active"); };
    const onLeave = () => { visible = false; root.classList.remove("cursor-active"); };
    const onBlur = () => onLeave();

    const syncEnabled = () => {
      const allow = Boolean(fineQuery?.matches) && !motionQuery?.matches;
      if (allow === enabled) return;
      enabled = allow;
      if (enabled) {
        root.classList.add("has-custom-cursor");
      } else {
        root.classList.remove("has-custom-cursor", "cursor-active", "cursor-hover");
        visible = false;
        if (running) { cancelAnimationFrame(raf); running = false; }
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseenter", onEnter);
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onBlur);
    fineQuery?.addEventListener("change", syncEnabled);
    motionQuery?.addEventListener("change", syncEnabled);
    syncEnabled();

    return () => {
      if (running) cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onBlur);
      fineQuery?.removeEventListener("change", syncEnabled);
      motionQuery?.removeEventListener("change", syncEnabled);
      root.classList.remove("has-custom-cursor", "cursor-active", "cursor-hover");
    };
  }, []);

  return (
    <>
      <div ref={auraRef} className="cursor-aura" aria-hidden="true" data-cursor-part="aura" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" data-cursor-part="dot" />
    </>
  );
}
