import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Moon, Search, Sun, Terminal } from "lucide-react";
import { LINKS, NAV_ITEMS, PILL_ITEMS } from "@/data/content";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { useTheme } from "@/hooks/useTheme";
import { accent } from "@/data/palette";
import { cn } from "@/utils/cn";
import Magnetic from "@/components/MobileSafeMagnetic";
import { openCommandPalette } from "@/utils/feedback";

export default function Navbar({
  current,
  onNavigate,
}: {
  current: string | null;
  onNavigate: (hash: string) => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { theme, toggle } = useTheme();
  const light = theme === "light";
  const ice = accent("ice", light);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        setScrolled(window.scrollY > 32);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const closeMenu = () => setOpen(false);
    window.addEventListener("porto:palette-open", closeMenu);
    return () => window.removeEventListener("porto:palette-open", closeMenu);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const focusable = () => [menuButtonRef.current, ...Array.from(menuRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])].filter((el): el is HTMLElement => Boolean(el));
    focusable()[1]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); setOpen(false); menuButtonRef.current?.focus(); return; }
      if (e.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const index = items.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && index <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && (index === items.length - 1 || index < 0)) { e.preventDefault(); items[0].focus(); }
    };
    const onResize = () => { if (window.innerWidth >= 1280) setOpen(false); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    setOpen(false);
    onNavigate(path ? `#/${path}` : "/");
  };

  const linkHref = (path: string) => (path ? `#/${path}` : "#/");

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-3 xl:gap-4 px-5 md:px-8 transition-all duration-500",
          scrolled ? "py-3 ui-nav-shell" : "py-6 bg-transparent border-b border-transparent",
        )}
        aria-label="Primary"
      >
        {/* brand */}
        <a
          href="#/"
          onClick={(e) => go(e, "")}
          className="flex items-center gap-3 group shrink-0"
        >
          <span className="sr-only">Lakshit Singh — home</span>
          <span
            aria-hidden="true"
            className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ui-tile"
          >
            <Terminal className="w-[21px] h-[21px]" strokeWidth={2.1} style={{ color: ice }} />
          </span>
          <span className="hidden sm:flex flex-col leading-none" aria-hidden="true">
            <span className="font-semibold tracking-[0.14em] text-sm uppercase text-white dark:text-white transition-colors">
              Lakshit
            </span>
            <span className="font-mono text-[9px] tracking-[0.28em] uppercase text-white/40 dark:text-white/40 mt-[3px]">
              developer
            </span>
          </span>
        </a>

        {/* desktop nav — every section, compact enough for a 1280px laptop */}
        <div className="hidden xl:flex items-center gap-0.5 p-1 rounded-2xl ui-nav">
          {PILL_ITEMS.map((item) => {
            const on = current === item.id;
            return (
              <a
                key={item.id}
                href={linkHref(item.path)}
                onClick={(e) => go(e, item.path)}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "relative px-2.5 2xl:px-3.5 py-2 rounded-xl text-[11.5px] 2xl:text-[13px] font-medium whitespace-nowrap transition-all duration-300",
                  on
                    ? "ui-pill-active text-accent"
                    : "text-white/55 hover:text-white dark:hover:text-white hover:bg-white/5",
                )}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        {/* right actions */}
        <div className="flex items-center gap-2 xl:gap-3 shrink-0">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Open command palette (Ctrl or Command + K)"
            data-open-command
            className="hidden sm:flex items-center gap-2 h-10 px-3 rounded-xl transition-all duration-300 ui-icon-button pressable"
            data-feedback="press"
          >
            <Search className="w-4 h-4" />
            <kbd className="hidden 2xl:inline font-mono text-[9px] tracking-widest opacity-60">⌘K</kbd>
          </button>
          <button
            type="button"
            onClick={toggle}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ui-icon-button"
            aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
          >
            {light ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          <div className="hidden 2xl:flex items-center gap-3">
            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ui-icon-button"
            >
              <GithubIcon className="w-5 h-5" />
            </a>
            <a
              href={LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ui-icon-button"
            >
              <LinkedinIcon className="w-5 h-5" />
            </a>
          </div>

          <Magnetic>
            <a
              href={LINKS.resume}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={LINKS.resumeLabel}
              className="hidden md:flex items-center justify-center gap-2 w-10 h-10 2xl:w-auto 2xl:h-10 2xl:px-5 rounded-xl text-sm font-semibold transition-all duration-300 ui-btn-primary"
            >
              <span className="hidden 2xl:inline">{LINKS.resumeLabel}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </Magnetic>

          <button
            ref={menuButtonRef}
            type="button"
            aria-controls="mobile-menu"
            className="xl:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ui-icon-button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between items-end">
              <span className={cn("h-0.5 bg-current transition-all duration-300", open ? "w-5 rotate-45 translate-y-[7px]" : "w-5")} />
              <span className={cn("h-0.5 bg-current transition-all duration-300", open ? "opacity-0" : "w-3")} />
              <span className={cn("h-0.5 bg-current transition-all duration-300", open ? "w-5 -rotate-45 -translate-y-[7px]" : "w-4")} />
            </div>
          </button>
        </div>
      </nav>

      {/* mobile / tablet menu — also the home of the full nine-item list */}
      <div id="mobile-menu" ref={menuRef} inert={!open} aria-hidden={!open} className={cn(
        "fixed inset-0 z-40 xl:hidden overflow-y-auto transition-all duration-500",
        open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none",
      )}>
        <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md" onClick={() => setOpen(false)} />
        <div className="relative pt-24 px-6 pb-10 shadow-2xl ui-menu-panel">
          <nav className="grid grid-cols-1 gap-1.5 mb-8" aria-label="Mobile">
            {NAV_ITEMS.map((item) => {
              const on = current === item.id;
              return (
                <a
                  key={item.id}
                  href={linkHref(item.path)}
                  onClick={(e) => go(e, item.path)}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-4 px-6 py-3 sm:py-3.5 rounded-2xl text-[15px] sm:text-base font-medium transition-all duration-300",
                    on
                      ? "ui-pill-active text-accent"
                      : "text-white/60 hover:bg-white/5",
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-ice" aria-hidden="true" />
                  {item.label}
                </a>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => { setOpen(false); openCommandPalette(); }}
            className="w-full mb-5 flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-medium ui-icon-button pressable"
            data-feedback="press"
          >
            <span className="flex items-center gap-3"><Search className="w-4 h-4" /> Search pages &amp; actions</span>
            <kbd className="font-mono text-[10px] tracking-widest opacity-60">Ctrl / ⌘ K</kbd>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-14 rounded-2xl transition-all duration-300 font-medium ui-icon-button"
            >
              <GithubIcon className="w-5 h-5" /> GitHub
            </a>
            <a
              href={LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-14 rounded-2xl transition-all duration-300 font-medium ui-icon-button"
            >
              <LinkedinIcon className="w-5 h-5" /> LinkedIn
            </a>
            <a
              href={LINKS.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 flex items-center justify-center gap-2 h-12 rounded-2xl transition-all duration-300 font-medium ui-btn-quiet"
            >
              {LINKS.resumeLabel} <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
