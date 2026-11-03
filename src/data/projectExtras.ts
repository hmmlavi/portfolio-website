import type { Project } from "@/data/content";

export const CATEGORIES = ["All", "Web Development", "Desktop Applications", "AI / Machine Learning", "Tools & Utilities", "Other"] as const;
export type Category = typeof CATEGORIES[number];
export const PROJECT_CATEGORIES: Record<string, Category[]> = {
  SaBuddy: ["AI / Machine Learning", "Tools & Utilities"],
  Veylo: ["Web Development", "Tools & Utilities"],
  "Pustakalaya-LMS": ["Web Development", "Tools & Utilities"],
  FacilityFix: ["Web Development", "Tools & Utilities"],
  "sortify-desktop": ["Desktop Applications", "AI / Machine Learning", "Tools & Utilities"],
  Sarp: ["Web Development", "Other"],
  porto: ["Web Development"],
};
export function filterProjects(projects: Project[], category: Category, query: string) {
  const term = query.trim().toLowerCase();
  return projects.filter(p => {
    const categories = PROJECT_CATEGORIES[p.repo] ?? ["Other"];
    return (category === "All" || categories.includes(category)) &&
      [p.name, p.spotlightLabel, p.repo, p.desc, p.tagline, ...p.tags, ...categories].join(" ").toLowerCase().includes(term);
  });
}

export type Node = { id: string; label: string; detail: string };
export type Study = { nodes: Node[]; decision: string; technology: string; releases?: string };
/** Architecture and decisions are drawn from each repository's README. */
export const STUDIES: Record<string, Study> = {
  "sortify-desktop": {
    nodes: [
      { id: "ui", label: "PySide6 interface", detail: "The desktop workspace lets users scan, inspect, edit and approve proposed names." },
      { id: "engine", label: "Naming engines", detail: "File excerpts feed local heuristics by default, or an explicitly configured AI endpoint." },
      { id: "history", label: "SQLite history", detail: "Applied batches are recorded locally so the last session can be undone when safe." },
    ],
    decision: "Safe renaming requires collision checks, a preview and explicit approval. Local history supports undo without overwriting files.",
    technology: "Python handles extraction and renaming; PySide6 provides the desktop interface; SQLite records batch history; Inno Setup packages the Windows installer.",
    releases: "https://github.com/hmmlavi/sortify-desktop/releases",
  },
  "Pustakalaya-LMS": {
    nodes: [
      { id: "ui", label: "Web interface", detail: "Staff use the browser interface to manage catalog, circulation and reports." },
      { id: "app", label: "Flask application", detail: "The local application handles library workflows, staff access and validation." },
      { id: "db", label: "SQLite database", detail: "SQLite stores library records locally with foreign keys and explicit write transactions." },
    ],
    decision: "Single-host operation uses SQLite transactions and conditional updates to protect circulation, including preventing double checkout. The README notes that multi-node operation would require a client-server database.",
    technology: "Flask and Python implement the local web application; SQLite stores records; HTML, CSS and JavaScript provide the interface.",
    releases: "https://github.com/hmmlavi/Pustakalaya-LMS/releases",
  },
  FacilityFix: {
    nodes: [
      { id: "ui", label: "Reporter interface", detail: "Reporters submit issues and follow their status through the web interface." },
      { id: "app", label: "Flask workflow", detail: "The application validates reports and provides role-based coordinator workflows." },
      { id: "db", label: "SQLite records", detail: "The database holds issue and resolution information for the application." },
    ],
    decision: "A structured role-based workflow replaces informal reports with recorded issue status and resolution notes.",
    technology: "Python and Flask provide the application and role-based workflow; SQLite stores records; HTML renders the web interface.",
  },
};
