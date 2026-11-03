import { useState } from "react";
import { CATEGORIES, filterProjects, type Category } from "@/data/projectExtras";
import { PROJECTS, SPOTLIGHT_PROJECTS } from "@/data/content";
import { Reveal } from "@/components/anim";
import ProjectCard from "@/components/ProjectCard";
import { useTheme } from "@/hooks/useTheme";
import PageMascot from "@/components/PageMascot";

/** Flagship builds lead the archive in priority order; every other project
 *  keeps its original relative place. Nothing is removed or renamed. */
const SPOTLIGHT_REPOS = new Set(SPOTLIGHT_PROJECTS.map((p) => p.repo));
const ORDERED_PROJECTS = [
  ...SPOTLIGHT_PROJECTS,
  ...PROJECTS.filter((p) => !SPOTLIGHT_REPOS.has(p.repo)),
];

export default function Projects() {
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const results = filterProjects(ORDERED_PROJECTS, category, query);
  const { theme } = useTheme();
  const light = theme === "light";
  return (
    <section id="projects" className="pt-28 md:pt-32 pb-20 md:pb-24 px-6 md:px-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <Reveal className="mb-14 project-page-heading">
          <p className="eyebrow mb-4">selected work</p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">Projects</h1>
          <p className="text-white/50 dark:text-white/40 text-lg leading-relaxed max-w-lg">
            Seven public repositories: Android, web and desktop apps, a browser game, and this site. Search by name or technology, or narrow the list by category.
          </p>
          <p className="mt-4 font-mono text-[10px] tracking-[0.12em] text-white/40">
            // 03 flagship builds first · 07 repositories in total
          </p>
          <div className="project-page-mascot"><PageMascot pose="building" embedded /></div>
        </Reveal>

        <div className="mb-8 space-y-4" role="group" aria-label="Filter projects">
          <label className="block text-sm font-medium" htmlFor="project-search">Search projects</label>
          <input id="project-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Name, technology or category" className="ui-input w-full max-w-lg rounded-xl px-4 py-3" />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Project categories">
            {CATEGORIES.map(c => <button type="button" key={c} aria-pressed={category === c} onClick={() => setCategory(c)} className="ui-btn-quiet rounded-xl px-4 py-2 text-sm" style={category === c ? { borderColor: "var(--accent)", color: "var(--accent)" } : undefined}>{c}</button>)}
          </div>
          <p role="status" className="text-sm text-white/60">{results.length} {results.length === 1 ? "project" : "projects"}</p>
          {(query || category !== "All") && <button type="button" className="underline text-sm" onClick={() => { setQuery(""); setCategory("All"); }}>Clear filters</button>}
        </div>
        {results.length === 0 && <p className="ui-surface rounded-2xl p-6 mb-6">No projects match. Try another search or clear the filters.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((p, i) => (
            <ProjectCard key={p.name} project={p} delay={i * 50} light={light} />
          ))}
        </div>
      </div>
    </section>
  );
}
