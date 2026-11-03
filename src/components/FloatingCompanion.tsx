import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Mood = "happy" | "curious" | "surprised" | "thinking" | "sleepy" | "cheeky" | "excited";

const STORAGE_KEY = "lakshit-companion-enabled";

const reactions: Array<{ test: RegExp; lines: string[]; mood: Mood }> = [
  { test: /project|case study|build|repo/i, mood: "excited", lines: ["A project gallery. My natural habitat is full of unfinished side quests.", "Built with code, coffee, and at least seventeen browser tabs.", "Go ahead, explore. I promise the bugs are mostly house-trained."] },
  { test: /skill|technology|stack|tool/i, mood: "cheeky", lines: ["The tech stack. A carefully curated collection of things to learn next.", "So many tools, so little RAM. Relatable.", "Every developer has a favourite framework. This one has several."] },
  { test: /about|who|lakshit|intro|profile/i, mood: "happy", lines: ["That's my human. Big ideas, bigger plans, too many open tabs.", "The About section: proof that even developers have to write about themselves.", "I know all the lore. I'm contractually allowed to share the highlights."] },
  { test: /contact|email|message|hire|connect/i, mood: "surprised", lines: ["A potential collaboration? Let me put on my tiny professional hat.", "This button could start a very productive conversation. No pressure.", "Incoming opportunity detected. My excitement levels are unreasonable."] },
  { test: /education|college|university|degree|study/i, mood: "thinking", lines: ["Education: the original long-running side quest.", "Loading knowledge... please do not unplug the student.", "A degree, deadlines, and the occasional existential debugging session."] },
  { test: /github|contribution|commit|open source/i, mood: "excited", lines: ["GitHub! Where tiny green squares create disproportionate happiness.", "Remember: commit early, test often, blame the cache last.", "Open source: strangers politely arguing over semicolons. Beautiful."] },
  { test: /achievement|award|winner|certificate/i, mood: "happy", lines: ["Achievement unlocked. I would do a victory dance, but I have tiny feet.", "Receipts for all that hard work. Respect.", "Look at that progress. Someone should add a celebratory sound effect."] },
  { test: /faq|question|answer/i, mood: "curious", lines: ["Frequently asked questions. Finally, my kind of small talk.", "Ask away. I provide commentary; the human provides actual expertise."] },
];

const genericLines = [
  "Interesting choice. Your cursor has excellent taste.",
  "Giving this element attention? I see how it is.",
  "I'm the unofficial tour guide. Tips are accepted in virtual snacks.",
  "Plot twist: not everything on this page is clickable.",
  "Cursor spotted. Activating my best angle.",
];

function getComment(target: Element): { line: string; mood: Mood } {
  const label = [
    target.getAttribute("aria-label"),
    target.getAttribute("title"),
    target.getAttribute("data-companion-label"),
    target.textContent,
  ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim().slice(0, 180);
  const match = reactions.find((item) => item.test.test(label));
  if (match) return { line: match.lines[Math.floor(Math.random() * match.lines.length)], mood: match.mood };
  if (/^(BUTTON|A)$/i.test(target.tagName) || target.getAttribute("role") === "button") {
    return { line: `“${label.slice(0, 42) || "That button"}” — bold move. I respect it.`, mood: "curious" };
  }
  return { line: genericLines[Math.floor(Math.random() * genericLines.length)], mood: "cheeky" };
}

export default function FloatingCompanion() {
  const [enabled, setEnabled] = useState(true);
  const [comment, setComment] = useState("Hey! I'm your tiny tour guide. Move around and I'll add commentary.");
  const [mood, setMood] = useState<Mood>("happy");
  const [visible, setVisible] = useState(false);
  const lastTarget = useRef<Element | null>(null);
  const lastSpokenAt = useRef(0);
  const showTimer = useRef<number | null>(null);
  const idleTimer = useRef<number | null>(null);

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
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
      return;
    }

    const onPointerOver = (event: PointerEvent) => {
      const raw = event.target;
      if (!(raw instanceof Element)) return;
      const target = raw.closest("a, button, [role='button'], h1, h2, h3, .project-card, .skill-row, .funfact, [data-companion-label]");
      if (!target || target.closest(".floating-companion")) return;
      const now = Date.now();
      if (target === lastTarget.current && now - lastSpokenAt.current < 6500) return;
      if (now - lastSpokenAt.current < 2600) return;

      lastTarget.current = target;
      lastSpokenAt.current = now;
      const next = getComment(target);
      setComment(next.line);
      setMood(next.mood);
      setVisible(true);
      if (showTimer.current !== null) window.clearTimeout(showTimer.current);
      showTimer.current = window.setTimeout(() => setVisible(false), 4800);
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => {
        setMood("sleepy");
        setComment("It's quiet... I'll be over here recharging my pixels.");
        setVisible(true);
        showTimer.current = window.setTimeout(() => setVisible(false), 4000);
      }, 24000);
    };

    document.addEventListener("pointerover", onPointerOver, { passive: true });
    return () => {
      document.removeEventListener("pointerover", onPointerOver);
      if (showTimer.current !== null) window.clearTimeout(showTimer.current);
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
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
            <span className="buddy-arm arm-left" /><span className="buddy-arm arm-right" />
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
