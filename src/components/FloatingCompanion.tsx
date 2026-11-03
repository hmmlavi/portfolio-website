import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Mood = "happy" | "curious" | "surprised" | "thinking" | "sleepy" | "cheeky" | "excited";

const STORAGE_KEY = "lakshit-companion-enabled";

const jokes: Array<{ test: RegExp; lines: string[]; mood: Mood }> = [
  { test: /project|case study|build|repo/i, mood: "excited", lines: ["Oho, project section! Yahan meri creator ne kaafi tabs khol rakhe the.", "Code dekh lo, bas bugs ko ghar mat le jaana.", "Is project ke peeche caffeine aur questionable sleep schedule hai."] },
  { test: /skill|technology|stack|tool/i, mood: "cheeky", lines: ["Skills! Inmein se kuch kaam ke hain, kuch resume ko confident banate hain.", "Tech stack dekh ke lagta hai install karne mein hi weekend nikal gaya.", "Ek aur technology? Lakshit ka browser tab count already danger zone mein hai."] },
  { test: /about|who|lakshit|intro|profile/i, mood: "happy", lines: ["Ye raha mera human. Thoda ambitious, thoda tab-hoarder.", "About section: carefully written, overthought at least 17 times.", "Main iske baare mein bata sakta hoon, par chai pilani padegi."] },
  { test: /contact|email|message|hire|connect/i, mood: "surprised", lines: ["Contact! Finally, koi inbox mein kaam ki cheez bhejega.", "Message bhej do. Main inbox ke bahar emotional support dunga.", "Professional baat-cheet yahin se shuru hoti hai. Main chup ho jaata hoon."] },
  { test: /education|college|university|degree|study/i, mood: "thinking", lines: ["Education section. Attendance aur assignments ka asli thriller.", "Degree loading... patience.exe is still running.", "Padhai bhi chalti hai, side quests bhi."] },
  { test: /github|contribution|commit|open source/i, mood: "excited", lines: ["GitHub! Yahan green squares se zyada commits ki kahani hai.", "Commit karne se pehle test kar lena. Main judge nahi karunga. Zyada.", "Open source: strangers fixing bugs together. Wholesome chaos."] },
  { test: /achievement|award|winner|certificate/i, mood: "happy", lines: ["Achievement unlocked! Main bhi thoda proud feel kar raha hoon.", "Certificates ka section. Screenshot lene ka mann kar raha hai.", "Ye wali progress save kar lena, boss."] },
  { test: /faq|question|answer/i, mood: "curious", lines: ["FAQ: woh sawaal jo log poochte hain, par type karne se pehle hi.", "Question hai? Mere paas mostly jokes hain, answers human ke paas."] },
];

const genericLines = [
  "Interesting choice. Cursor ko bhi taste aa gaya.",
  "Is element ko itni attention? Main jealous nahi hoon. Thoda sa.",
  "Aap explore karo, main yahan commentary department sambhalta hoon.",
  "Ye bhi website ka hissa hai. Plot twist: sab kuch clickable nahi hota.",
  "Cursor detected. Main apni best side dikha raha hoon.",
];

function getComment(target: Element): { line: string; mood: Mood } {
  const label = [
    target.getAttribute("aria-label"),
    target.getAttribute("title"),
    target.textContent,
    target.getAttribute("data-companion-label"),
  ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim().slice(0, 180);
  const match = jokes.find((item) => item.test.test(label));
  if (match) return { line: match.lines[Math.floor(Math.random() * match.lines.length)], mood: match.mood };
  if (/button|link/i.test(target.tagName) || target.getAttribute("role") === "button") {
    return { line: `“${label.slice(0, 48) || "Button"}” — dabao, zindagi mein risk lena zaroori hai.`, mood: "curious" };
  }
  return { line: genericLines[Math.floor(Math.random() * genericLines.length)], mood: "cheeky" };
}

export default function FloatingCompanion() {
  const [enabled, setEnabled] = useState(true);
  const [comment, setComment] = useState("Oye! Main yahan hoon. Cursor ghumao, main commentary dunga.");
  const [mood, setMood] = useState<Mood>("happy");
  const [visible, setVisible] = useState(true);
  const lastTarget = useRef<Element | null>(null);
  const lastSpokenAt = useRef(0);
  const showTimer = useRef<number | null>(null);
  const idleTimer = useRef<number | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "false") setEnabled(false);
    } catch { /* Storage can be unavailable in private browsing. */ }
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, String(enabled)); } catch { /* Optional preference. */ }
    if (!enabled) {
      setVisible(false);
      if (showTimer.current !== null) window.clearTimeout(showTimer.current);
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
      return;
    }
    setVisible(true);
    const onPointerOver = (event: PointerEvent) => {
      const raw = event.target;
      if (!(raw instanceof Element)) return;
      const target = raw.closest("a, button, [role='button'], h1, h2, h3, .project-card, .skill-row, .funfact, [data-companion-label]");
      if (!target || target.closest(".floating-companion")) return;
      if (target === lastTarget.current && Date.now() - lastSpokenAt.current < 5000) return;
      if (Date.now() - lastSpokenAt.current < 1900) return;
      lastTarget.current = target;
      lastSpokenAt.current = Date.now();
      const next = getComment(target);
      setComment(next.line);
      setMood(next.mood);
      setVisible(true);
      if (showTimer.current !== null) window.clearTimeout(showTimer.current);
      showTimer.current = window.setTimeout(() => setVisible(false), 6200);
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => { setMood("sleepy"); setComment("Itni der se idle? Main power-saving mode mein jaa raha hoon."); setVisible(true); }, 26000);
    };
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    idleTimer.current = window.setTimeout(() => { setMood("sleepy"); setComment("Main yahin hoon... bas thoda recharge kar raha hoon."); setVisible(true); }, 26000);
    return () => {
      document.removeEventListener("pointerover", onPointerOver);
      if (showTimer.current !== null) window.clearTimeout(showTimer.current);
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
    };
  }, [enabled]);

  return (
    <div className="floating-companion" data-companion-widget>
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
      {enabled && (
        <div className={`companion-presence ${visible ? "is-talking" : "is-quiet"}`} aria-live="polite" aria-atomic="true">
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
    </div>
  );
}
