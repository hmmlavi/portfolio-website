import { useEffect, useRef, useState } from "react";
import { Check, Info, TriangleAlert, X } from "lucide-react";
import type { ToastDetail } from "@/utils/feedback";

/**
 * One transient glass toast at a time. It only appears in response to a real
 * event (`porto:toast`) — never as decorative feedback — and it cleans up its
 * timer, listener and animation on unmount.
 */
export default function Toast() {
  const [current, setCurrent] = useState<(ToastDetail & { key: number }) | null>(null);
  const timerRef = useRef(0);
  const seq = useRef(0);

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      if (!detail?.message) return;
      window.clearTimeout(timerRef.current);
      seq.current += 1;
      setCurrent({ ...detail, key: seq.current });
      timerRef.current = window.setTimeout(() => setCurrent(null), 2600);
    };
    window.addEventListener("porto:toast", onToast);
    return () => {
      window.removeEventListener("porto:toast", onToast);
      window.clearTimeout(timerRef.current);
    };
  }, []);

  if (!current) return null;
  const Icon = current.tone === "success" ? Check : current.tone === "error" ? TriangleAlert : Info;

  return (
    <div className="toast-wrap" role="status" aria-live="polite" data-toast={current.tone ?? "info"}>
      <div className="toast" key={current.key}>
        <span className="toast-icon"><Icon className="w-3.5 h-3.5" aria-hidden="true" /></span>
        <span className="toast-text">{current.message}</span>
        <button
          type="button"
          className="toast-close"
          aria-label="Dismiss notification"
          onClick={() => { window.clearTimeout(timerRef.current); setCurrent(null); }}
        >
          <X className="w-3 h-3" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
