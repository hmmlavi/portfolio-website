import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import {
  ArrowUp,
  Award,
  Briefcase,
  Command,
  Copy,
  CornerDownLeft,
  FileText,
  FolderGit2,
  GraduationCap,
  Home,
  Mail,
  Moon,
  Scale,
  Search,
  Sun,
  User,
  Wrench,
} from "lucide-react";
import { LINKS, NAV_ITEMS } from "@/data/content";
import { LEGAL_DOCS } from "@/data/legal";
import { useTheme } from "@/hooks/useTheme";
import { copyText, openExternal, toast } from "@/utils/feedback";
import { cn } from "@/utils/cn";

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
type CommandItem = {
  id: string;
  label: string;
  group: string;
  keywords: string;
  Icon: IconType;
  run: () => void;
};

const NAV_ICONS: Record<string, IconType> = {
  home: Home, about: User, skills: Wrench, projects: FolderGit2,
  education: GraduationCap, experience: Briefcase, achievements: Award,
  github: Search, contact: Mail,
};

/**
 * Ctrl/Cmd+K command palette. One global keydown listener (never duplicated),
 * instant filtering, full arrow/Enter/Escape keyboard control, focus restore,
 * click-outside dismissal and real actions. The navbar is untouched.
 */
export default function CommandPalette({ onNavigate }: { onNavigate: (hash: string) => void }) {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const commands = useMemo<CommandItem[]>(() => {
    const pages: CommandItem[] = NAV_ITEMS.map((item) => ({
      id: `nav-${item.id}`,
      label: item.label,
      group: "Go to",
      keywords: `${item.id} page section navigate ${item.label.toLowerCase()}`,
      Icon: NAV_ICONS[item.id] ?? Home,
      run: () => onNavigate(item.path ? `#/${item.path}` : "#/"),
    }));
    const legal: CommandItem[] = LEGAL_DOCS.map((doc) => ({
      id: `legal-${doc.slug}`,
      label: doc.title,
      group: "Legal",
      keywords: `legal ${doc.slug} policy privacy terms cookies refunds`,
      Icon: Scale,
      run: () => onNavigate(`#/${doc.slug}`),
    }));
    const actions: CommandItem[] = [
      {
        id: "action-theme",
        label: `Switch to ${theme === "dark" ? "light" : "dark"} theme`,
        group: "Actions",
        keywords: "theme dark light appearance toggle mode",
        Icon: theme === "dark" ? Sun : Moon,
        run: () => { toggle(); toast(`${theme === "dark" ? "Light" : "Dark"} theme on`, "info"); },
      },
      {
        id: "action-copy-email",
        label: "Copy email address",
        group: "Actions",
        keywords: `email copy clipboard ${LINKS.email}`,
        Icon: Copy,
        run: () => {
          void copyText(LINKS.email).then((ok) =>
            toast(ok ? `Copied ${LINKS.email}` : "Could not access the clipboard", ok ? "success" : "error"));
        },
      },
      {
        id: "action-resume",
        label: LINKS.resumeLabel,
        group: "Actions",
        keywords: "resume cv drive folder",
        Icon: FileText,
        run: () => {
          openExternal(LINKS.resume);
          toast("Requested résumé folder — if no tab opened, use the Contact link", "info");
        },
      },
      {
        id: "action-github",
        label: "Open GitHub profile",
        group: "Actions",
        keywords: "github profile public repositories hmmlavi",
        Icon: FolderGit2,
        run: () => {
          openExternal(LINKS.github);
          toast("Requested GitHub — if no tab opened, use the GitHub link", "info");
        },
      },
      {
        id: "action-top",
        label: "Scroll to top",
        group: "Actions",
        keywords: "top scroll up back to top",
        Icon: ArrowUp,
        run: () => window.scrollTo({ top: 0, behavior: "smooth" }),
      },
    ];
    return [...pages, ...actions, ...legal];
  }, [onNavigate, theme, toggle]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.group} ${c.keywords}`.toLowerCase().includes(q));
  }, [commands, query]);

  // Refs keep the single keydown listener stable — no re-attachment, no dupes.
  const stateRef = useRef({ open, filtered, active });
  stateRef.current = { open, filtered, active };

  const setOpened = (next: boolean) => {
    if (next) {
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      restoreRef.current = active?.closest("#mobile-menu")
        ? document.querySelector<HTMLButtonElement>('[aria-controls="mobile-menu"]')
        : active;
      window.dispatchEvent(new Event("porto:palette-open"));
      setQuery("");
      setActive(0);
    }
    setOpen(next);
  };

  const close = () => {
    setOpen(false);
    const target = restoreRef.current;
    restoreRef.current = null;
    if (target?.isConnected) window.setTimeout(() => target.focus(), 0);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isShortcut = (e.ctrlKey || e.metaKey) && !e.altKey && (e.key === "k" || e.key === "K");
      if (isShortcut) {
        e.preventDefault();
        if (!stateRef.current.open) setOpened(true);
        else close();
        return;
      }
      if (!stateRef.current.open) return;
      const { filtered: list, active: index } = stateRef.current;
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      // The combobox is the dialog's only tab stop; options use arrows/Enter.
      if (e.key === "Tab") { e.preventDefault(); inputRef.current?.focus(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive(list.length ? (index + 1) % list.length : 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive(list.length ? (index - 1 + list.length) % list.length : 0);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = list[index];
        if (item) { close(); item.run(); }
      }
    };
    window.addEventListener("keydown", onKey);
    const onOpenRequest = () => setOpened(true);
    window.addEventListener("porto:command", onOpenRequest);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("porto:command", onOpenRequest);
    };
    // Registered exactly once for the lifetime of the app.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  if (!open) return null;

  const groups = [...new Set(filtered.map((c) => c.group))];

  return (
    <div
      className="command-overlay"
      data-command-palette="open"
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="command-panel" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="command-search">
          <Search className="w-4.5 h-4.5 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages and actions…"
            aria-label="Search commands"
            aria-controls="command-list"
            aria-activedescendant={filtered[active] ? `command-${filtered[active].id}` : undefined}
            role="combobox"
            aria-expanded="true"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="command-kbd">esc</kbd>
        </div>

        <div id="command-list" role="listbox" aria-label="Commands" className="command-list">
          {filtered.length === 0 && (
            <p className="command-empty">No commands match “{query}”.</p>
          )}
          {groups.map((group) => (
            <div key={group} className="command-group">
              <p className="command-group-label">{group}</p>
              {filtered.filter((c) => c.group === group).map((c) => {
                const index = filtered.indexOf(c);
                const Icon = c.Icon;
                return (
                  <button
                    key={c.id}
                    id={`command-${c.id}`}
                    type="button"
                    role="option"
                    tabIndex={-1}
                    aria-selected={index === active}
                    data-command-id={c.id}
                    className={cn("command-item", index === active && "is-active")}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => { close(); c.run(); }}
                  >
                    <span className="command-item-icon"><Icon className="w-4 h-4" aria-hidden="true" /></span>
                    <span className="command-item-label">{c.label}</span>
                    <span className="command-item-group">{c.group}</span>
                    {index === active && <CornerDownLeft className="w-3.5 h-3.5 command-enter" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="command-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>esc</kbd> close</span>
          <span className="command-brand"><Command className="w-3 h-3" aria-hidden="true" /> Ctrl / ⌘ + K</span>
        </div>
      </div>
    </div>
  );
}
