import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type GuideEntry = { pattern: RegExp; title: string; detail: string; aside: string };

const STORAGE_KEY = "lakshit-companion-enabled";
const guide: GuideEntry[] = [
  { pattern: /project|case study|repository|repo/i, title: "Projects", detail: "Browse selected builds, open a project for its details, or visit its source repository.", aside: "The code is more interesting than the commit messages." },
  { pattern: /skill|technology|tech stack|tooling/i, title: "Technical skills", detail: "This section groups the languages, frameworks, and tools used across the projects.", aside: "Knowing when not to use a tool is the hard part." },
  { pattern: /about|profile|lakshit|introduction/i, title: "About", detail: "A quick overview of Lakshit's background, interests, and current direction.", aside: "Yes, developers are expected to write prose too." },
  { pattern: /contact|email|message|hire|connect/i, title: "Contact", detail: "Use these links to reach out about work, collaboration, or a project.", aside: "Unlike a pull request, a message does not need a review." },
  { pattern: /education|college|university|degree|study/i, title: "Education", detail: "Academic background and relevant learning milestones are listed here.", aside: "The syllabus was not consulted before adding this section." },
  { pattern: /github|contribution|commit|open source/i, title: "GitHub", detail: "Open the linked profile or repositories to inspect source code and project activity.", aside: "Green squares are not a substitute for readable code." },
  { pattern: /achievement|award|winner|certificate/i, title: "Achievements", detail: "A record of competitions, certifications, and other documented milestones.", aside: "Claims are much better when they come with receipts." },
  { pattern: /experience|internship|work history/i, title: "Experience", detail: "Review practical experience, responsibilities, and work completed.", aside: "Titles matter less than what actually shipped." },
  { pattern: /faq|question|answer/i, title: "FAQ", detail: "Answers to common questions about the portfolio and its work.", aside: "Because apparently the obvious still needs documentation." },
];

function describeTarget(target: Element) {
  const text = [
    target.getAttribute("aria-label"),
    target.getAttribute("title"),
    target.getAttribute("data-companion-label"),
    target.textContent,
  ].filter(Boolean).join(" ").replace(/\\s+/g, " ").trim().slice(0, 180);
  const entry = guide.find((item) => item.pattern.test(text));
  if (entry) return `${entry.title}: ${entry.detail} ${entry.aside}`;
  const label = text.replace(/[“”"]/g, "").trim();
  if (/^(BUTTON|A)$/i.test(target.tagName) && label.length > 2) {
    return `${label.slice(0, 56)} — opens the linked page or performs the labelled action.`;
  }
  return null;
}

export default function FloatingCompanion() {
  const [enabled, setEnabled] = useState(true);
  const [comment, setComment] = useState("Move your cursor around — I'm keeping an eye on things.");
  const [visible, setVisible] = useState(false);
  const lastTarget = useRef<Element | null>(null);
  const showTimer = useRef<number | null>(null);
  const mascotRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });

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

    const onPointerMove = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        const node = mascotRef.current;
        if (!node) return;
        const bounds = node.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        const dx = Math.max(-1, Math.min(1, (pointerRef.current.x - centerX) / 360));
        const dy = Math.max(-1, Math.min(1, (pointerRef.current.y - centerY) / 360));
        node.style.setProperty("--look-x", `${(dx * 13).toFixed(2)}deg`);
        node.style.setProperty("--look-y", `${(-dy * 11).toFixed(2)}deg`);
        node.style.setProperty("--lean-x", `${(dx * 5).toFixed(2)}px`);
        node.style.setProperty("--lean-y", `${(dy * 4).toFixed(2)}px`);
      });
    };

    const onPointerOver = (event: PointerEvent) => {
      const raw = event.target;
      if (!(raw instanceof Element)) return;
      const target = raw.closest("a, button, [role='button'], h1, h2, h3, [data-companion-label]");
      if (!target || target.closest(".floating-companion") || target === lastTarget.current) return;
      const next = describeTarget(target);
      if (!next) return;
      lastTarget.current = target;
      setComment(next);
      setVisible(true);
      if (showTimer.current !== null) window.clearTimeout(showTimer.current);
      showTimer.current = window.setTimeout(() => setVisible(false), 6200);
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onPointerOver);
      if (showTimer.current !== null) window.clearTimeout(showTimer.current);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [enabled]);

  return (
    <div className="floating-companion" data-companion-widget>
      {enabled && (
        <div className="companion-presence" aria-live="polite" aria-atomic="true">
          <div className={`companion-bubble ${visible ? "bubble-visible" : ""}`}>{comment}</div>
          <div className="element-mascot" ref={mascotRef} role="img" aria-label="Floating 3D crystal mascot">
            <span className="element-shadow" />
            <span className="element-orbit element-orbit-one" />
            <span className="element-orbit element-orbit-two" />
            <span className="element-satellite satellite-one" />
            <span className="element-satellite satellite-two" />
            <span className="element-core">
              <span className="element-facet facet-one" />
              <span className="element-facet facet-two" />
              <span className="element-eye eye-one" />
              <span className="element-eye eye-two" />
              <span className="element-smile" />
              <span className="element-glint" />
            </span>
            <span className="element-spark spark-one">✦</span>
            <span className="element-spark spark-two">✧</span>
          </div>
        </div>
      )}
      <button
        type="button"
        className="companion-toggle"
        aria-pressed={enabled}
        aria-label={enabled ? "Turn mascot off" : "Turn mascot on"}
        title={enabled ? "Mascot on — turn off" : "Mascot off — turn on"}
        onClick={() => setEnabled((value) => !value)}
      >
        {enabled ? <Eye size={15} /> : <EyeOff size={15} />}
        <span>Mascot {enabled ? "on" : "off"}</span>
      </button>
    </div>
  );
}
