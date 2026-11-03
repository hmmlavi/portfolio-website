/** Small shared helpers for honest action feedback. */

export type ToastTone = "success" | "info" | "error";
export type ToastDetail = { message: string; tone?: ToastTone; id?: string };

/** Fire a transient, glass-styled toast. Callers decide the wording, so a
 *  success message is only ever emitted after the action really succeeded. */
export const toast = (message: string, tone: ToastTone = "info") => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ToastDetail>("porto:toast", { detail: { message, tone } }));
};

/** Copy text with a legacy fallback. Returns true ONLY on a real copy. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const el = document.createElement("textarea");
  el.value = text;
  el.setAttribute("readonly", "");
  el.style.position = "fixed";
  el.style.opacity = "0";
  try {
    document.body.appendChild(el);
    el.select();
    return typeof document.execCommand === "function" && document.execCommand("copy");
  } catch {
    return false;
  } finally {
    el.remove();
    if (previous?.isConnected) previous.focus({ preventScroll: true });
  }
}

/** Request a new tab with opener isolation. With noopener browsers may return
 *  null even when a tab opens, so the return value cannot prove success. */
export const openExternal = (href: string): void => {
  window.open(href, "_blank", "noopener,noreferrer");
};

/** Ask the command palette to open (used by the navbar button). */
export const openCommandPalette = () => {
  window.dispatchEvent(new CustomEvent("porto:command"));
};
