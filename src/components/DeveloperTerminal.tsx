import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { EDUCATION, EXPERIENCE, LINKS, PROJECTS, SKILL_CATEGORIES } from "@/data/content";
import { AWARDS } from "@/data/achievements";
import { openExternal } from "@/utils/feedback";

const COMMANDS = [
  "help", "about", "projects", "skills", "education", "experience",
  "achievements", "github", "contact", "resume", "clear",
] as const;

const responses: Record<string, string> = {
  help: `Commands: ${COMMANDS.join(", ")}. Use ↑/↓ for history, Tab for completions.`,
  about: "Lakshit (Lavi) is a Computer Science student and developer who learns by building.",
  projects: PROJECTS.map(p => `${p.spotlightLabel ?? p.name}: ${p.tagline}`).join("\n"),
  skills: SKILL_CATEGORIES.map(c => `${c.title}: ${c.skills.join(", ")}`).join("\n"),
  education: EDUCATION.map(e => `${e.title} — ${e.place}`).join("\n"),
  experience: EXPERIENCE.map(e => `${e.role} — ${e.org} (${e.span})`).join("\n"),
  achievements: AWARDS.map(a => `${a.title} — ${a.org}, ${a.date}`).join("\n"),
  contact: `Email: ${LINKS.email}\nContact page: #/contact`,
  resume:
    "This opens my résumé folder in Google Drive. There is no verified public PDF résumé linked from this site, so the folder is the current source.",
  // Optional Easter egg: discoverable only by trying it, never in the way.
  sudo: "Nice try. Curiosity is a good development tool.",
};

type TerminalLink = { href: string; label: string; external: boolean };
type Entry = { command: string; output: string; links: TerminalLink[] };

const completionsFor = (value: string) => {
  const query = value.trim().toLowerCase();
  if (!query) return [...COMMANDS];
  return COMMANDS.filter(command => command.startsWith(query));
};

export default function DeveloperTerminal() {
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [position, setPosition] = useState(0);
  const [draft, setDraft] = useState("");
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [entries]);

  function run() {
    const command = input.trim();
    if (!command) return;
    const key = command.toLowerCase();
    const nextHistory = [...history.slice(-49), command];
    setHistory(nextHistory);
    setPosition(nextHistory.length);
    setDraft("");
    setInput("");
    setSuggestions(null);

    if (key === "clear") {
      setEntries([]);
      return;
    }

    let output = responses[key] ?? `Unknown command: ${command}. Type help for available commands.`;
    let links: TerminalLink[] = [];

    if (key === "github") {
      // noopener browsers may return null even when a tab opens; offer a link
      // instead of claiming that a popup was blocked.
      openExternal(LINKS.github);
      output = "Requested the GitHub profile. If no tab opened, use the link below.";
      links = [{ href: LINKS.github, label: "GitHub profile ↗", external: true }];
    }
    if (key === "contact") {
      links = [
        { href: `mailto:${LINKS.email}`, label: "Email Lakshit", external: false },
        { href: "#/contact", label: "Open the Contact page", external: false },
      ];
    }
    if (key === "resume") {
      links = [{ href: LINKS.resume, label: `${LINKS.resumeLabel} ↗`, external: true }];
    }

    setEntries(list => [...list.slice(-49), { command, output, links }]);
  }

  function complete(value: string) {
    const matches = completionsFor(value);
    if (matches.length === 1 && matches[0] !== value.trim().toLowerCase()) {
      setInput(matches[0]);
      setSuggestions(null);
      return;
    }
    setInput(matches.length === 1 ? matches[0] : value);
    setSuggestions(matches);
  }

  function onKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      if (position === history.length) setDraft(input);
      const next = Math.max(0, position - 1);
      setPosition(next);
      setInput(history[next]);
      setSuggestions(null);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = Math.min(history.length, position + 1);
      setPosition(next);
      setInput(next === history.length ? draft : history[next]);
      setSuggestions(null);
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      complete(input);
      return;
    }
    if (event.key === "Escape") {
      setSuggestions(null);
    }
  }

  return (
    <details className="ui-surface rounded-2xl overflow-hidden" data-terminal>
      <summary className="cursor-pointer px-5 py-4 font-mono text-sm">
        Developer terminal <span className="text-white/50">— open to explore</span>
      </summary>
      <div className="terminal-body px-5 pb-5 font-mono text-sm">
        <div className="terminal-header" aria-hidden="true">
          <span /> <span /> <span /> <small>lavi@portfolio:~</small>
        </div>

        <div ref={outputRef} className="terminal-output" aria-live="polite">
          <p>Welcome. Type help to get started.</p>
          {entries.map((entry, index) => (
            <div key={index}>
              <p>$ {entry.command}</p>
              <p className="terminal-response">{entry.output}</p>
              {entry.links.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="terminal-link mr-4 inline-block text-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>

        {suggestions && (
          <div className="mt-3" role="status" aria-live="polite">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2">
              {suggestions.length ? `${suggestions.length} matching commands` : "No matching commands"}
            </p>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map(command => (
                  <button
                    key={command}
                    type="button"
                    onClick={() => {
                      setInput(command);
                      setSuggestions(null);
                    }}
                    className="ui-btn-quiet rounded-lg px-2.5 py-1 text-xs font-mono"
                  >
                    {command}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <form
          onSubmit={event => { event.preventDefault(); run(); }}
          className="flex gap-2 items-center mt-3"
        >
          <span aria-hidden="true">$</span>
          <label htmlFor="terminal-input" className="sr-only">Terminal command</label>
          <input
            id="terminal-input"
            className="terminal-input"
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            value={input}
            onChange={event => { setInput(event.target.value); setSuggestions(null); }}
            onKeyDown={onKey}
            aria-describedby="terminal-hint"
          />
          <button type="submit" className="ui-btn-quiet rounded-lg px-3 py-2">Run</button>
        </form>
        <p id="terminal-hint" className="mt-2 font-mono text-[10px] text-white/50">
          Try <code>help</code>, <code>contact</code> or <code>resume</code> — Tab lists completions, ↑/↓ recalls history.
        </p>
      </div>
    </details>
  );
}
