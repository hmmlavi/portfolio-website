import { useEffect, useState } from "react";

type MascotKind =
  | "star" | "jelly" | "drone" | "circuit" | "plane"
  | "organizer" | "crystal" | "helper" | "book" | "briefcase" | "medal" | "code";

type MascotConfig = { kind: MascotKind; name: string; hint: string };

const PAGE_MASCOTS: Record<string, MascotConfig> = {
  home: { kind: "star", name: "Star Spirit", hint: "A little sparkle for the home page." },
  about: { kind: "jelly", name: "Jelly Buddy", hint: "A curious little jelly friend." },
  skills: { kind: "circuit", name: "Circuit Cube", hint: "A tiny cube of circuits." },
  projects: { kind: "drone", name: "Mini Drone", hint: "Scanning the projects." },
  education: { kind: "book", name: "Book Buddy", hint: "A tiny bookworm for the learning page." },
  experience: { kind: "briefcase", name: "Briefcase Bot", hint: "Ready for the next build." },
  achievements: { kind: "medal", name: "Medal Sprite", hint: "A little celebration of milestones." },
  github: { kind: "code", name: "Code Orb", hint: "A tiny companion for the code page." },
  contact: { kind: "plane", name: "Paper Plane", hint: "Ready to send a hello." },
};

const PROJECT_MASCOTS: Record<string, MascotConfig> = {
  "sortify-desktop": { kind: "organizer", name: "Organizer Buddy", hint: "Keeping files in order." },
  Veylo: { kind: "crystal", name: "Crystal Buddy", hint: "A calm, glassy little companion." },
  SaBuddy: { kind: "helper", name: "Helper Bot", hint: "A friendly helper for this project." },
};

function getMascot(page: string | null, caseRepo: string | null): MascotConfig | null {
  if (caseRepo) return PROJECT_MASCOTS[caseRepo] ?? null;
  return page ? PAGE_MASCOTS[page] ?? null : null;
}

export default function PageMascot({ page, caseRepo }: { page: string | null; caseRepo: string | null }) {
  const mascot = getMascot(page, caseRepo);
  const [reacting, setReacting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (!reacting) return;
    const timer = window.setTimeout(() => setReacting(false), 720);
    return () => window.clearTimeout(timer);
  }, [reacting]);

  if (!mascot) return null;

  return (
    <div className={`page-mascot-dock ${reducedMotion ? "motion-reduced" : ""}`} data-page-mascot={mascot.kind}>
      <button
        type="button"
        className={`page-mascot-button mascot-${mascot.kind} ${reacting ? "is-reacting" : ""}`}
        aria-label={`Make ${mascot.name} react`}
        title={`${mascot.name} · click for a little reaction`}
        onClick={() => setReacting(true)}
      >
        <span className="mascot-aura" aria-hidden="true" />
        <span className="mascot-character" aria-hidden="true">
          <span className="mascot-shadow" />
          <span className="mascot-back" />
          <span className="mascot-core">
            <span className="mascot-eye eye-one" />
            <span className="mascot-eye eye-two" />
            <span className="mascot-mouth" />
          </span>
          <span className="mascot-detail detail-one" />
          <span className="mascot-detail detail-two" />
          <span className="mascot-spark">✦</span>
        </span>
        <span className="mascot-name">{mascot.name}</span>
      </button>
      <span className="mascot-sr-only" aria-live="polite">{reacting ? mascot.hint : ""}</span>
    </div>
  );
}
