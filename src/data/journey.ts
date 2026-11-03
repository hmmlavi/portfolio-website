import { EDUCATION, EXPERIENCE, EXPLORING } from "@/data/content";

/**
 * The About Me journey timeline is assembled ONLY from details already in the
 * site's own data (education, experience, exploring, about copy). No dates,
 * employers or achievements are invented — where the source gives no calendar
 * year, the era label describes the study or project period without guessing.
 */
export type JourneyStep = {
  id: string;
  era: string;
  title: string;
  org: string;
  summary: string;
  details: readonly string[];
};

export const JOURNEY: readonly JourneyStep[] = [
  {
    id: "2020",
    era: "2020",
    title: "First experiments",
    org: "Self-directed · independent",
    summary: "I started experimenting with technology in 2020, and I never stopped.",
    details: [
      EDUCATION[1].detail,
      "What I was learning: whatever caught my eye — building something small with it, then figuring out why it did or didn't work.",
    ],
  },
  {
    id: "degree",
    era: "B.TECH",
    title: "Computer Science & Engineering",
    org: EDUCATION[0].place,
    summary: "The degree became the formal half of a self-directed education.",
    details: [
      EDUCATION[0].detail,
      "What I was learning: programming, database and systems fundamentals — the ones I keep reaching for when I build.",
    ],
  },
  {
    id: "internship",
    era: "OCT—NOV 2026",
    title: EXPERIENCE[0].role,
    org: EXPERIENCE[0].org,
    summary: "A Junior Software Developer internship with YuvaIntern — by Henry Harvin, scheduled for approximately six weeks.",
    details: [...EXPERIENCE[0].points],
  },
  {
    id: "public-repositories",
    era: "PUBLIC PROJECTS",
    title: EXPERIENCE[1].role,
    org: EXPERIENCE[1].org,
    summary: "Selected builds are published on GitHub with documentation and, where available, releases.",
    // The independent entry covers projects and public publishing in one place,
    // so the timeline quotes only the publishing point.
    details: [EXPERIENCE[1].points[2]],
  },
  {
    id: "now",
    era: "NOW",
    title: "Still building",
    org: "Independent · public repositories",
    summary: "These days, I learn by building things, breaking them, figuring out what went wrong, and fixing them.",
    details: [
      `Currently exploring: ${EXPLORING.map((item) => item.label).join(", ")}.`,
    ],
  },
];

/** Verified short facts drawn from existing About / FAQ / Experience content. */
export type FunFact = { label: string; value: string; icon: "spark" | "code" | "globe" | "box" | "layers" | "shield" };

export const FUN_FACTS: readonly FunFact[] = [
  { label: "Interests", value: "Privacy, UX, AI systems", icon: "shield" },
  { label: "Builder identity", value: "LAVI — my own name on my work", icon: "spark" },
  { label: "How I learn", value: "Build it, break it, fix it", icon: "code" },
  { label: "Based in", value: "India", icon: "globe" },
  { label: "Public code", value: "Selected projects on GitHub", icon: "box" },
  { label: "Exploring", value: "Offline-first sync & Next.js", icon: "layers" },
];
