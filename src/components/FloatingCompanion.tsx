import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Mood = "happy" | "curious" | "surprised" | "thinking" | "sleepy" | "cheeky" | "excited";
type GuideEntry = { pattern: RegExp; title: string; detail: string; aside: string; mood: Mood };

const STORAGE_KEY = "lakshit-companion-enabled";

/** Only show useful, page-specific guidance. No random filler or invented claims. */
const guide: GuideEntry[] = [
  { pattern: /project|case study|repository|repo/i, title: "Projects", detail: "Browse selected builds, open a project for its details, or visit its source repository.", aside: "The code is more interesting than the commit messages.", mood: "curious" },
  { pattern: /skill|technology|tech stack|tooling/i, title: "Technical skills", detail: "This section groups the languages, frameworks, and tools used across the projects.", aside: "A list is easy. Knowing when not to use a tool is the hard part.", mood: "thinking" },
  { pattern: /about|profile|lakshit|introduction/i, title: "About", detail: "A quick overview of Lakshit's background, interests, and current direction.", aside: "Yes, developers are expected to write prose too.", mood: "cheeky" },
  { pattern: /contact|email|message|hire|connect/i, title: "Contact", detail: "Use these links to reach out about work, collaboration, or a project.", aside: "Unlike a pull request, a message does not need a review.", mood: "happy" },
  { pattern: /education|college|university|degree|study/i, title: "Education", detail: "Academic background and relevant learning milestones are listed here.", aside: "The syllabus was not consulted before adding this section.", mood: "thinking" },
  { pattern: /github|contribution|commit|open source/i, title: "GitHub", detail: "Open the linked profile or repositories to inspect source code and project activity.", aside: "Green squares are not a substitute for readable code.", mood: "curious" },
  { pattern: /achievement|award|winner|certificate/i, title: "Achievements", detail: "A record of competitions, certifications, and other documented milestones.", aside: "Claims are much better when they come with receipts.", mood: "happy" },
  { pattern: /experience|internship|work history/i, title: "Experience", detail: "Review practical experience, responsibilities, and work completed.", aside: "Titles matter less than what actually shipped.", mood: "thinking" },
  { pattern: /faq|question|answer/i, title: "FAQ", detail: "Answers to common questions about the portfolio and its work.", aside: "Because apparently the obvious still needs documentation.", mood: "cheeky" },
];

function describeTarget(target: Element): { line: string; mood: Mood } | null {
  const text = [
    target.getAttribute("aria-label"),
    target.getAttribute("title"),
    target.getAttribute("data-companion-label"),
    target.textContent,
  ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim().slice(0, 180);

  const entry = guide.find((item) => item.pattern.test(text));
  if (entry) return { line: `${entry.title}: ${entry.detail} ${entry.aside}`, mood: entry.mood };

  const label = text.replace(/[“”"]/g, "").trim();
  if (/^(BUTTON|A)$/i.test(target.tagName) && label.length > 2) {
    return { line: `${label.slice(0, 56)} — opens the linked page or performs the labelled action.`, mood: "curious" };
  }
  return null;
}

export default function FloatingCompanion() {
  const [enabled, setEnabled] = useState(true);
  const [comment, setComment] = useState("Move over a section or link for a short guide.");
  const [mood, setMood] = useState<Mood>("happy");
  const [visible, setVisible] = useState(false);
  const lastTarget = useRef<Element | null>(null);
  const showTimer = useRef<number | null>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "false") setEnabled(false);
    } catch { /* Storage may be unavailable. */ }
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, String(enabled)); } catch { /* Preference is optional. */ }
    if (!enabled) {
      setVisible(false);
      if (showTimer.current !== null) window.clearTimeout(showTimer.current);
      return;
    }

    const onPointerOver = (event: PointerEvent) => {
      const raw = event.target;
      if (!(raw instanceof Element)) return;
      const target = raw.closest("a, button, [role='button'], h1, h2, h3, [data-companion-label]");
      if (!target || target.closest(".floating-companion")) return;
      if (target === lastTarget.current) return;
      const next = describeTarget(target);
      if (!next) return;

      lastTarget.current = target;
      setComment(next.line);
      setMood(next.mood);
      setVisible(true);
      if (showTimer.current !== null) window.clearTimeout(showTimer.current);
      showTimer.current = window.setTimeout(() => setVisible(false), 6200);
    };

    document.addEventListener("pointerover", onPointerOver, { passive: true });
    return () => {
      document.removeEventListener("pointerover", onPointerOver);
      if (showTimer.current !== null) window.clearTimeout(showTimer.current);
    };
  }, [enabled]);

  return (
    <div className="floating-companion" data-companion-widget>
      {enabled && (
        <div className="companion-presence" aria-live="polite" aria-atomic="true">
          <div className={`companion-bubble ${visible ? "bubble-visible" : ""}`}>{comment}</div>
          <div className={`buddy-3d mood-${mood}`} aria-label="Animated 3D companion" role="img">
            <span className="buddy-shadow" />
            <span className="buddy-backpack" />
            <span className="buddy-body"><span className="buddy-badge">L</span></span>
            <span className="buddy-neck" />
            <span className="buddy-head">
              <span className="buddy-ear ear-left" /><span className="buddy-ear ear-right" />
              <span className="buddy-hair" />
              <span className="buddy-eye eye-left" /><span className="buddy-eye eye-right" />
              <span className="buddy-brow brow-left" /><span className="buddy-brow brow-right" />
              <span className="buddy-cheek cheek-left" /><span className="buddy-cheek cheek-right" />
              <span className="buddy-mouth" />
            </span>
            <span className="buddy-arm arm-left"><span className="buddy-hand" /></span>
            <span className="buddy-arm arm-right"><span className="buddy-hand" /></span>
            <span className="buddy-foot foot-left" /><span className="buddy-foot foot-right" />
            <span className="buddy-sparkle">✦</span>
          </div>
        </div>
      )}
      <button
        type="button"
        className="companion-toggle"
        aria-pressed={enabled}
        aria-label={enabled ? "Turn companion off" : "Turn companion on"}
        title={enabled ? "Companion on — turn off" : "Companion off — turn on"}
        onClick={() => setEnabled((value) => !value)}
      >
        {enabled ? <Eye size={15} /> : <EyeOff size={15} />}
        <span>Buddy {enabled ? "on" : "off"}</span>
      </button>
    </div>
  );
}
