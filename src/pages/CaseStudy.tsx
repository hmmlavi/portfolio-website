import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { colorFor } from "@/data/palette";
import { PROJECTS } from "@/data/content";
import { STUDIES } from "@/data/projectExtras";
import ArchitectureExplorer from "@/components/ArchitectureExplorer";
import NotFound from "@/pages/NotFound";

export default function CaseStudy({ repo }: { repo: string }) {
  const { theme } = useTheme();
  const project = PROJECTS.find(item => item.repo === repo);
  const study = STUDIES[repo];
  if (!project || !study) return <NotFound attempted={`projects/${repo}`} />;

  const color = colorFor(project.color, project.colorLight, theme === "light");
  const label = project.spotlightLabel ?? project.name;
  const repository = project.github ?? `https://github.com/hmmlavi/${project.repo}`;

  return (
    <main
      id="main"
      className="case-study pt-28 md:pt-32 pb-20 px-6 md:px-10"
      style={{ "--project-accent": color } as CSSProperties}
    >
      <article className="max-w-4xl mx-auto space-y-10">
        <header className="case-header">
          <a href="#/projects" className="text-sm underline underline-offset-4">← Back to projects</a>
          <p className="eyebrow mt-7 mb-3" style={{ color }}>Project case study</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">{label}</h1>
          <p className="text-lg md:text-xl text-white/60 mt-4">{project.tagline}</p>
          <ul className="flex flex-wrap gap-1.5 mt-5" aria-label="Technologies">
            {project.tags.map(tag => (
              <li key={tag} className="project-tag px-2.5 py-1 rounded-lg text-[11px] font-medium border">{tag}</li>
            ))}
          </ul>
        </header>

        {project.screenshot && (
          <figure>
            <img
              src={project.screenshot}
              alt={`${label} — screenshot from the project repository`}
              className="w-full rounded-2xl border border-white/5"
            />
            <figcaption className="text-sm text-white/50 mt-2">Screenshot from the project repository.</figcaption>
          </figure>
        )}

        {/* No overview paragraph here: the Projects page already carries the
            full description. This page only adds what it can substantiate. */}
        <div className="grid md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Problem</h2>
            <p className="text-white/70 leading-relaxed">{project.why}</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">Approach</h2>
            <p className="text-white/70 leading-relaxed">{project.useful}</p>
          </section>
        </div>

        <section>
          <h2 className="text-2xl font-semibold mb-3">How it fits together</h2>
          <p className="text-white/70 leading-relaxed mb-5">{study.technology}</p>
          <ArchitectureExplorer key={repo} nodes={study.nodes} />
        </section>

        {project.highlights && project.highlights.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">What it does</h2>
            <ul className="list-disc pl-5 space-y-2 text-white/70">
              {project.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}
            </ul>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-semibold mb-3">Decisions &amp; trade-offs</h2>
          <p className="text-white/70 leading-relaxed">{study.decision}</p>
        </section>

        <section className="flex flex-wrap gap-3 pt-2">
          <a className="ui-btn-quiet rounded-xl px-5 py-3 inline-flex items-center gap-2" href={repository} target="_blank" rel="noopener noreferrer">
            GitHub repository <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </a>
          {study.releases && (
            <a className="ui-btn-quiet rounded-xl px-5 py-3 inline-flex items-center gap-2" href={study.releases} target="_blank" rel="noopener noreferrer">
              Releases <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          )}
        </section>
      </article>
    </main>
  );
}
