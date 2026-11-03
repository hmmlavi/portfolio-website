import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "dark" | "light";
type ThemePreference = Theme | "system";

type ThemeValue = { theme: Theme; toggle: () => void };

const ThemeCtx = createContext<ThemeValue>({ theme: "dark", toggle: () => {} });

const KEY = "lavi-theme";
const THEME_COLOURS: Record<Theme, string> = { light: "#f2f5f9", dark: "#0b0f17" };

const savedTheme = (): Theme | null => {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
};

const systemTheme = (): Theme => {
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark";
};

/** Keep browser chrome on the same theme as every theme-color meta element. */
export const syncThemeColour = (theme: Theme) => {
  if (typeof document === "undefined") return;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.setAttribute("content", THEME_COLOURS[theme]);
    // A media-qualified tag can conflict with an explicit in-app choice.
    meta.removeAttribute("media");
  });
};

/**
 * Light/dark theme with system fallback. An explicit choice is remembered in
 * localStorage; until then, the resolved theme follows OS preference changes.
 * The preference contains no identifier and is never sent to any server.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(() => savedTheme() ?? "system");
  const [osTheme, setOsTheme] = useState<Theme>(systemTheme);
  const theme = preference === "system" ? osTheme : preference;

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setOsTheme(media.matches ? "dark" : "light");
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    syncThemeColour(theme);
  }, [theme]);

  const toggle = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Storage can be unavailable; the in-memory toggle still works.
    }
    setPreference(next);
  }, [theme]);

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);

/** Reads the live theme without subscribing (for canvas render loops). */
export const readTheme = (): Theme =>
  (typeof document !== "undefined" && document.documentElement.dataset.theme) === "light" ? "light" : "dark";
