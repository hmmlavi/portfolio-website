import type { HexColor } from "@/data/palette";

export const LINKS = {
  github: "https://github.com/hmmlavi",
  linkedin: "https://www.linkedin.com/in/lakshitsinghsaini/",
  instagram: "https://www.instagram.com/lakshitsinghsaini/",
  x: "https://x.com/Lakshits27",
  /** Public resume link. */
  resume:
    "https://drive.google.com/drive/folders/1w-3xXPftM9oVKjTJ1_Mkifsh0h4H-3E9",
  resumeLabel: "Resume",
  email: "lakshitsinghsaini@gmail.com",
  // Public username from the owner’s earlier portfolio; not an invite URL.
  discordUsername: "hmmlavi",
  discord: "", // Optional invite URL, if provided later.
};

export const GITHUB_USER = "hmmlavi";

/** One honest, easy-to-update availability line (no pulsing indicator). */
export const AVAILABILITY = {
  label: "Open to internships & collaborations",
  detail: "Open to internships, collaborations and interesting projects.",
} as const;

/** id doubles as the route slug ("/about" → About page) */
export const NAV_ITEMS = [
  { label: "Home", id: "home", path: "" },
  { label: "About", id: "about", path: "about" },
  { label: "Skills", id: "skills", path: "skills" },
  { label: "Projects", id: "projects", path: "projects" },
  { label: "Education", id: "education", path: "education" },
  { label: "Experience", id: "experience", path: "experience" },
  { label: "Achievements", id: "achievements", path: "achievements" },
  { label: "GitHub", id: "github", path: "github" },
  { label: "Contact", id: "contact", path: "contact" },
];

/** Desktop pill navigation now carries every section. The same list powers
 *  the mobile menu, so active states and destinations stay identical. */
export const PILL_ITEMS = NAV_ITEMS;

/** Counted from the selected PROJECTS archive: 7 public projects, 5 web
 *  builds and 1 Kotlin Android app. No open-ended or invented figures. */
export const HERO_STATS = [
  { value: "07", label: "Public projects" },
  { value: "05", label: "Web builds" },
  { value: "01", label: "Kotlin Android app" },
];

export const CAPABILITIES: {
  index: string;
  title: string;
  color: HexColor;
  colorLight: HexColor;
  desc: string;
}[] = [
  {
    index: "01",
    title: "AI Software",
    color: "#8fb3d1",
    colorLight: "#2d5f88",
    desc: "AI-powered applications, generative AI and intelligent software experiences built on modern AI APIs.",
  },
  {
    index: "02",
    title: "Software Development",
    color: "#8fb9a5",
    colorLight: "#2f6a54",
    desc: "Building practical software products by experimenting with different technologies and ideas.",
  },
  {
    index: "03",
    title: "Android",
    color: "#cf8b90",
    colorLight: "#a33a48",
    desc: "Native Android applications in Kotlin and Jetpack Compose — with AI-powered functionality where it genuinely helps.",
  },
  {
    index: "04",
    title: "Web Development",
    color: "#cf8b90",
    colorLight: "#a33a48",
    desc: "Modern web experiences with React, Next.js and Tailwind CSS — fast, clean and responsive.",
  },
];

/* ------------------------------ skills (4 categories) ------------------------------ */

export type SkillCategory = {
  index: string;
  title: string;
  sub: string;
  /** accent for dark theme */
  color: HexColor;
  /** readable accent for light theme */
  colorLight: HexColor;
  skills: string[];
};

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    index: "01",
    title: "Programming Languages",
    sub: "foundational logic",
    color: "#8fb3d1",
    colorLight: "#2d5f88",
    skills: ["C", "C++", "Python", "JavaScript", "TypeScript", "SQL", "HTML", "CSS"],
  },
  {
    index: "02",
    title: "Frontend Development",
    sub: "ui & interactions",
    color: "#a49dc0",
    colorLight: "#574b7c",
    skills: ["React", "Next.js", "Tailwind CSS", "Vite"],
  },
  {
    index: "03",
    title: "Backend Development",
    sub: "server & logic",
    color: "#8fb9a5",
    colorLight: "#2f6a54",
    skills: ["Node.js", "Express", "REST APIs"],
  },
  {
    index: "04",
    title: "Databases",
    sub: "storage & structure",
    color: "#cf8b90",
    colorLight: "#a33a48",
    skills: ["PostgreSQL", "Supabase", "SQLite"],
  },
  {
    index: "05",
    title: "Artificial Intelligence",
    sub: "models & prompting",
    color: "#8fb3d1",
    colorLight: "#2d5f88",
    skills: ["Prompt Engineering", "AI-Assisted Development", "Gemini API"],
  },
  {
    index: "06",
    title: "Android Development",
    sub: "mobile native",
    color: "#a49dc0",
    colorLight: "#574b7c",
    skills: ["Kotlin", "Jetpack Compose", "Android Studio"],
  },
  {
    index: "07",
    title: "Desktop Development",
    sub: "cross-platform apps",
    color: "#8fb9a5",
    colorLight: "#2f6a54",
    skills: ["Python", "PySide6", "Qt"],
  },
  {
    index: "08",
    title: "Tools & Platforms",
    sub: "ecosystem & shipping",
    color: "#cf8b90",
    colorLight: "#a33a48",
    skills: ["Git", "GitHub", "Vercel"],
  },
];

/* ---------------------------------- projects ---------------------------------- */
/* Every description, technology and fact below is taken from the actual
   GitHub repository READMEs and API metadata — nothing is invented. */

export type ProjectStatus = "development" | "ready";

export type Project = {
  featured?: boolean;
  index: string;
  name: string;
  repo: string;
  tagline: string;
  desc: string;
  why: string;
  useful: string;
  tags: string[];
  color: HexColor;
  colorLight: HexColor;
  status: ProjectStatus;
  /** GitHub social-preview image — the repo's own artwork, loaded lazily */
  logo?: string;
  /** Home-page flagship build. */
  spotlight?: boolean;
  /** Official repo name shown on the spotlight card (the project NAME is unchanged). */
  spotlightLabel?: string;
  /** Plain-language category for the spotlight card. */
  category?: string;
  /** Verified facts from the repository README, shown on the spotlight card. */
  highlights?: string[];
  /** Real screenshot from the repo's own docs/screenshots folder. */
  screenshot?: string;
  /** Explicit canonical repository URL. */
  github?: string;
};

/** GitHub's social-preview endpoint needs the owner segment: /<cache-key>/<owner>/<repo>.
 *  The three flagship builds use real local screenshots; these previews are the
 *  fallback artwork for the rest of the archive. */
const repoCard = (repo: string) => `https://opengraph.githubassets.com/1/hmmlavi/${repo}`;

export const PROJECTS: Project[] = [
  {
    index: "01",
    name: "SaBuddy",
    featured: false,
    repo: "SaBuddy",
    tagline: "Plan and draft social media content, offline-first.",
    desc: "An Android app for planning and drafting social media content. It brings content ideas, short-form video scripts, post and carousel outlines, captions, hashtag groups, a calendar, a saved library, brand settings and manually maintained analytics into one local workspace.",
    why: "Content creators plan in one app, draft in another and track ideas in a third. I wanted one calm workspace that holds all of it — and that works even when nothing is configured.",
    useful: "Everything lives locally on the device, so there is no account and no cloud dependency. Gemini generation is optional: enter an API key to use it, or stay offline with the built-in local generator as a fallback.",
    tags: ["Kotlin", "Jetpack Compose", "Material 3", "Room", "Gemini API", "OkHttp"],
    color: "#8fb3d1",
    colorLight: "#2d5f88",
    status: "ready",
    logo: repoCard("SaBuddy"),
  },
  {
    index: "02",
    name: "Veylo",
    featured: false,
    repo: "Veylo",
    tagline: "A calm, private habit tracker for everyday progress.",
    desc: "A habit tracker built around small daily actions. Create habits with names, icons, schedules, goals and reminders, check in with a tap, follow current and longest streaks, browse a monthly completion calendar and review weekly, monthly and yearly trends.",
    why: "Most habit apps demand an account and quietly sync your data to someone else's server. I wanted the opposite — a tracker that respects the person using it and works with no signal at all.",
    useful: "There is no sign-in, no backend and no analytics. Habits and check-ins stay in device-local storage, and the installed app caches its shell so tracking and planning keep working offline. A deterministic rule-based planner spreads habits across the time you actually have.",
    tags: ["React 19", "TypeScript", "Tailwind CSS 4", "Vite 7", "Capacitor 8", "Framer Motion"],
    color: "#cf8b90",
    colorLight: "#a33a48",
    status: "ready",
    logo: repoCard("Veylo"),
  },
  {
    index: "03",
    name: "Pustakalaya LMS",
    featured: true,
    spotlight: true,
    spotlightLabel: "Pustakalaya-LMS",
    category: "Library system · Local-first",
    github: "https://github.com/hmmlavi/Pustakalaya-LMS",
    screenshot: "/projects/pustakalaya-lms.webp",
    highlights: [
      "Searchable catalog with branch-level copy inventory",
      "Issuing, returns, renewals and FIFO reservations",
      "INR fines with an auditable ledger and CSV reports",
      "Runs fully offline on Flask and SQLite",
    ],
    repo: "Pustakalaya-LMS",
    tagline: "An offline-ready library management system.",
    desc: "A full library management system covering book cataloguing, inventory, memberships, circulation, reservations, fines, reports and staff access control — built to work without an internet connection.",
    why: "Plenty of libraries run on paper registers or expensive hosted software. I wanted something a school or college could run on a single machine, with no subscription and no connectivity requirement.",
    useful: "Because it runs offline on Flask and SQLite, the entire library — members, loans, reservations, fines and staff roles — can be managed from one computer. Reports and circulation history stay on that machine.",
    tags: ["Python", "Flask", "SQLite", "HTML", "CSS", "JavaScript"],
    color: "#7db4b0",
    colorLight: "#1f6a66",
    status: "ready",
    logo: repoCard("Pustakalaya-LMS"),
  },
  {
    index: "04",
    name: "FacilityFix",
    spotlight: true,
    spotlightLabel: "FacilityFix",
    category: "Web app · Campus operations",
    github: "https://github.com/hmmlavi/FacilityFix",
    screenshot: "/projects/facilityfix.webp",
    highlights: [
      "Report an issue with building, floor and room",
      "Role-based workflow from student to coordinator",
      "Priority, status and resolution tracking",
      "Flask and SQLite with 45 recorded tests",
    ],
    repo: "FacilityFix",
    tagline: "Report campus facility issues and track the repair.",
    desc: "A Flask and SQLite web app for reporting campus facility issues and tracking repairs through a role-based workflow — from the moment a problem is reported to the moment it is actually fixed.",
    why: "On a campus, a broken light or a leaking tap usually gets reported verbally and then forgotten. There was no record of who reported it, who owns it, or whether it was ever resolved.",
    useful: "Reports move through a role-based workflow instead of vanishing. Students can raise an issue, staff can pick it up, and everyone can see where a repair actually stands — so nothing falls through the gaps.",
    tags: ["Python", "Flask", "SQLite", "Role-Based Access", "HTML"],
    color: "#d8b27c",
    colorLight: "#8a5a20",
    status: "ready",
    logo: repoCard("FacilityFix"),
  },
  {
    index: "05",
    name: "Sortify",
    spotlight: true,
    spotlightLabel: "Sortify Desktop",
    category: "Desktop app · Windows",
    github: "https://github.com/hmmlavi/sortify-desktop",
    screenshot: "/projects/sortify-desktop.webp",
    highlights: [
      "Reads inside PDF, Word, Excel, PowerPoint and images",
      "Offline local heuristics, or an opt-in AI endpoint",
      "Review and edit every proposed name before renaming",
      "Undo the last batch from a local SQLite history",
    ],
    repo: "sortify-desktop",
    tagline: "Safe, reviewable file renaming for Windows.",
    desc: "A Windows desktop app that reads supported files and proposes safe, reviewable new filenames — using local heuristics, or an opt-in AI endpoint if you choose to connect one.",
    why: "Renaming hundreds of files by hand is tedious and error-prone, and doing it with a script risks destroying names you can't undo. I wanted the speed of automation with a human still in control.",
    useful: "Nothing is renamed until you review and approve it. Local heuristics work completely offline, and the AI endpoint is strictly opt-in — so the tool stays useful without sending your files anywhere.",
    tags: ["Python", "PySide6", "SQLite", "Inno Setup", "Windows"],
    color: "#a49dc0",
    colorLight: "#574b7c",
    status: "ready",
    logo: repoCard("sortify-desktop"),
  },
  {
    index: "06",
    name: "Sarp",
    repo: "Sarp",
    tagline: "A 3D browser Snake game.",
    desc: "A 3D Snake game that runs in the browser, with special apples, rising difficulty, local high scores and keyboard or touch controls.",
    why: "I wanted to find out how much of a 3D feel could be pushed into the browser without a heavy engine — and a game is the most honest way to test performance, input handling and collision logic.",
    useful: "It plays on both desktop and phone, saves your best runs locally, and gets harder as you survive longer — a small, complete game rather than a demo.",
    tags: ["React 19", "TypeScript", "Three.js", "Tailwind CSS 4", "Supabase"],
    color: "#8fb3d1",
    colorLight: "#2d5f88",
    status: "ready",
    logo: repoCard("Sarp"),
  },
  {
    index: "07",
    name: "Portfolio Site",
    repo: "porto",
    tagline: "The site you're looking at right now.",
    desc: "A personal portfolio built from scratch — hash-based page routing, light and dark themes, a live GitHub section and scroll-driven motion. Designed and coded by me.",
    why: "I wanted a place that explains what I build in my own voice, and a reason to learn routing, theming and animation properly rather than copying a template.",
    useful: "It works as a public reference: project details link to their repositories, while live GitHub figures and third-party contribution data are labelled with their sources and fallback states.",
    tags: ["React", "TypeScript", "Tailwind CSS", "Vite"],
    color: "#8fb9a5",
    colorLight: "#2f6a54",
    status: "ready",
    logo: repoCard("porto"),
  },
];

/** The three flagship builds, in the order they are highlighted on Home.
 *  Existing project names, descriptions and order in PROJECTS are untouched. */
export const SPOTLIGHT_PROJECTS: Project[] = [
  "sortify-desktop",
  "Pustakalaya-LMS",
  "FacilityFix",
]
  .map((repo) => PROJECTS.find((project) => project.repo === repo))
  .filter((project): project is Project => Boolean(project));

/* ------------------------------ education ------------------------------ */

export type EducationEntry = {
  title: string;
  place: string;
  detail: string;
  status: "current" | "independent";
  color: HexColor;
  colorLight: HexColor;
};

export const EDUCATION: EducationEntry[] = [
  {
    title: "Bachelor of Technology — Computer Science & Engineering",
    place: "Currently pursuing",
    detail:
      "The degree anchors everything else: the programming, database and systems fundamentals I learn in class are the ones I keep reaching for when I build. Alongside it I practise by shipping real projects — the web apps, desktop tools and Android apps on this site are the practical counterpart to the coursework.",
    status: "current",
    color: "#8fb9a5",
    colorLight: "#2f6a54",
  },
  {
    title: "Self-directed learning",
    place: "since 2020 · independent",
    detail:
      "My education started before the degree: experimenting with technology on my own since 2020, learning in public on GitHub, and treating every shipped project — from a 3D game to a library system — as part of the curriculum.",
    status: "independent",
    color: "#8fb3d1",
    colorLight: "#2d5f88",
  },
];

/** Current study areas mapped to practical work; not a completed-course list. */
export const COURSEWORK: { subject: string; applied: string }[] = [
  { subject: "Data Structures & Algorithms", applied: "C++ problem solving, Sortify's logic" },
  { subject: "Database Management Systems", applied: "SQLite schemas and relational data modelling" },
  { subject: "Object-Oriented Programming", applied: "Kotlin and Python project architecture" },
  { subject: "Operating Systems", applied: "desktop packaging, file handling in Sortify" },
  { subject: "Computer Networks", applied: "REST APIs, client/server behaviour" },
  { subject: "Web Technologies", applied: "React, Next.js, Flask templating" },
];

/* ----------------------------- achievements ----------------------------- */

/** Achievements are now fully managed in src/data/achievements.ts.
 *  This re-export keeps the Home page preview working without a
 *  circular-import restructure. */
export { AWARDS as ACHIEVEMENTS_PREVIEW } from "@/data/achievements";

/* ------------------------------ experience ------------------------------ */

export type ExperienceEntry = {
  role: string;
  org: string;
  /** formal = supervised employment / internship; independent = self-directed work */
  kind: "formal" | "independent";
  span: string;
  points: string[];
  color: HexColor;
  colorLight: HexColor;
};

export const EXPERIENCE: ExperienceEntry[] = [
  {
    role: "Junior Software Developer Intern",
    org: "YuvaIntern — by Henry Harvin",
    kind: "formal",
    span: "1 October 2026 — 12 November 2026",
    points: [
      "A Junior Software Developer internship running for approximately six weeks, from 1 October through 12 November 2026.",
    ],
    color: "#8fb3d1",
    colorLight: "#2d5f88",
  },
  {
    // One entry for self-directed work and selected public repositories, not
    // overlapping jobs or a claim that every public repository is licensed open source.
    role: "Independent Projects & Public Repositories",
    org: "Self-directed · github.com/hmmlavi",
    kind: "independent",
    span: "2020 — today",
    points: [
      "Design, build and maintain my own software end to end — Android apps, web tools and desktop utilities — from first experiment to public release.",
      "Ship production-style concerns: offline-first storage, API fallbacks, role-based workflows, packaging and releases.",
      "Publish selected projects on GitHub with documentation and, where available, releases and a public contribution record.",
    ],
    color: "#8fb9a5",
    colorLight: "#2f6a54",
  },
];

/* --------------------------- currently exploring --------------------------- */

export type ExploringItem = {
  label: string;
  tag: "learning" | "building" | "reading";
  color: HexColor;
  colorLight: HexColor;
};

export const EXPLORING: ExploringItem[] = [
  { label: "Next.js app router", tag: "learning", color: "#8fb9a5", colorLight: "#2f6a54" },
  { label: "Jetpack Compose animations", tag: "building", color: "#cf8b90", colorLight: "#a33a48" },
  { label: "PostgreSQL query design", tag: "learning", color: "#a49dc0", colorLight: "#574b7c" },
  { label: "Prompt patterns for code gen", tag: "reading", color: "#cf8b90", colorLight: "#a33a48" },
  { label: "Offline-first sync", tag: "building", color: "#8fb3d1", colorLight: "#2d5f88" },
];

export const FAQS = [
  {
    q: "Who is Lakshit Singh Saini?",
    a: "A B.Tech Computer Science and Engineering student and aspiring software engineer. I build Android apps, web tools, desktop software and AI-powered experiments — and I publish the work under my personal identity, LAVI.",
  },
  {
    q: "What do you actually build?",
    a: "AI-powered Android apps, web tools, desktop utilities and small games. I take an idea I'm curious about, wire it up with real code, and keep iterating until it feels useful.",
  },
  {
    q: "What technologies do you work with?",
    a: "Kotlin and Jetpack Compose on Android; Python, C and C++ as my programming base; React, Next.js and Node.js on the web — plus a range of AI and data tools. The full map is on the Skills page.",
  },
  {
    q: "What is LAVI?",
    a: "LAVI is my personal builder identity — the name attached to my projects, experiments and this website. Short, memorable, and mine.",
  },
  {
    q: "Are you open to opportunities?",
    a: "Yes. Internships, collaborations and interesting problems in AI, Android or the web — if you're building something real, I'd love to hear about it.",
  },
  {
    q: "Can I collaborate with you?",
    a: "Definitely. Use the contact page or email me directly — lakshitsinghsaini@gmail.com. I aim to reply as soon as I can.",
  },
  {
    q: "Where can I find your résumé?",
    a: "The Resume link opens my shareable documents.",
  },
];
