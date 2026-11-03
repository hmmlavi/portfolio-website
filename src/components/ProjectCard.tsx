import { useState, type CSSProperties } from "react";
import { ArrowUpRight, Box } from "lucide-react";
import { GithubIcon } from "@/components/icons";
import { Reveal } from "@/components/anim";
import { alpha, colorFor } from "@/data/palette";
import { STUDIES } from "@/data/projectExtras";
import type { Project } from "@/data/content";
import { cn } from "@/utils/cn";

/**
 * The single project card used across the site.
 *
 *  - `spotlight` is the Home presentation: a whole-card repository link with a
 *    real screenshot, README facts and its own accent identity.
 *  - `archive` is the full Projects page presentation: description, tags and
 *    both repository actions.
 *
 * One component (rather than two near-identical cards) keeps the fallback,
 * hover, accent and link behaviour consistent everywhere.
 */
type Variant = "spotlight" | "archive";

export function projectRepo(project: Project): string {
  return project.github ?? `https://github.com/hmmlavi/${project.repo}`;
}

/** Screenshot → repo logo → typographic fallback. Never a broken image. */
function ProjectMedia({
  project,
  c,
  variant,
  ordinal,
}: {
  project: Project;
  c: string;
  variant: Variant;
  ordinal: number;
}) {
  const [failed, setFailed] = useState<string[]>([]);
  const label = project.spotlightLabel ?? project.name;
  const sources = [project.screenshot, project.logo].filter((s): s is string => Boolean(s));
  const src = sources.find((s) => !failed.includes(s));
  const isScreenshot = Boolean(src && src === project.screenshot);
  const markFailed = () => setFailed((prev) => (src ? [...prev, src] : prev));

  return (
    <div
      className={cn(
        "aspect-[16/10] relative overflow-hidden bg-black/20 transition-colors duration-500",
        variant === "spotlight" && "border-b border-white/5",
        variant === "archive" && "group-hover:bg-black/10",
      )}
    >
      <div className={cn("absolute inset-0 flex items-center justify-center", !src && "p-12")}>
        {src ? (
          <img
            src={src}
            alt={isScreenshot ? `${label} — screenshot from the project repository` : ""}
            loading="lazy"
            onError={markFailed}
            className={cn(
              "spotlight-image transition-all duration-700 group-hover:opacity-100",
              isScreenshot
                ? "w-full h-full object-cover object-top opacity-90 group-hover:scale-110"
                : "w-full h-full object-contain opacity-80",
            )}
          />
        ) : variant === "spotlight" ? (
          <span className="font-anton text-6xl opacity-30 select-none" style={{ color: c }}>
            {label.charAt(0)}
          </span>
        ) : (
          <Box className="w-16 h-16 opacity-10" style={{ color: c }} />
        )}
      </div>

      {variant === "spotlight" ? (
        <>
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <span
            className="absolute top-4 left-4 px-2.5 py-1 rounded-full font-mono text-[9px] tracking-[0.14em] uppercase border backdrop-blur-md"
            style={{ color: c, borderColor: alpha(c, 0.4), background: alpha(c, 0.16) }}
          >
            {project.category}
          </span>
          <span className="absolute top-4 right-4 font-mono text-[11px] tracking-widest" style={{ color: c }}>
            0{ordinal + 1}
          </span>
        </>
      ) : (
        <>
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest bg-black/40 backdrop-blur-md border border-white/5 text-white/60 uppercase">
              {project.status}
            </span>
            {project.spotlight && (
              <span
                className="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase border backdrop-blur-md"
                style={{ color: c, borderColor: alpha(c, 0.45), background: alpha(c, 0.18) }}
              >
                flagship
              </span>
            )}
          </div>
          {/* Original ambient depth detail, retained from the archive card. */}
          <div
            aria-hidden="true"
            className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-700 ambient-wash"
          />
        </>
      )}
    </div>
  );
}

function TagRow({ project, limit, className }: { project: Project; limit?: number; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {project.tags.slice(0, limit ?? project.tags.length).map((tag) => (
        <span
          key={tag}
          className="project-tag px-2.5 py-1 rounded-lg text-[10px] font-medium border"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export default function ProjectCard({
  project,
  light,
  variant = "archive",
  ordinal = 0,
  delay = 0,
}: {
  project: Project;
  light: boolean;
  variant?: Variant;
  ordinal?: number;
  delay?: number;
}) {
  const c = colorFor(project.color, project.colorLight, light);
  const label = project.spotlightLabel ?? project.name;
  const repo = projectRepo(project);
  const surface = cn(
    "project-card spotlight-card group relative flex flex-col h-full rounded-[32px] overflow-hidden transition-all duration-500",
    "ui-surface",
  );
  const style = { "--card-accent": c } as CSSProperties;
  const accentRule = (
    <span aria-hidden="true" className="absolute top-0 left-0 right-0 h-[3px] z-10" style={{ background: c }} />
  );

  return (
    <Reveal delay={delay} revealOnScroll={variant === "spotlight"} className="h-full">
      {variant === "spotlight" ? (
        <div className="flex flex-col h-full gap-3">
        <a
          href={repo}
          target="_blank"
          rel="noopener noreferrer"
          data-spotlight={label}
          className={surface}
          style={style}
        >
          {project.spotlight && accentRule}
          <ProjectMedia project={project} c={c} variant={variant} ordinal={ordinal} />

          <div className="p-6 md:p-7 flex flex-col flex-1 gap-3.5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-semibold tracking-tight text-white dark:text-white">{label}</h3>
              <ArrowUpRight
                className="w-5 h-5 shrink-0 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                style={{ color: c }}
              />
            </div>
            <p className="text-[12px] font-medium leading-relaxed" style={{ color: c }}>
              {project.tagline}
            </p>

            {project.highlights && (
              <ul className="space-y-1.5">
                {project.highlights.slice(0, 3).map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 text-[11px] leading-snug text-white/55">
                    <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: c }} aria-hidden="true" />
                    {highlight}
                  </li>
                ))}
              </ul>
            )}

            <TagRow project={project} limit={4} className="mt-auto pt-4" />

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                <GithubIcon className="w-3.5 h-3.5" /> public repository
              </span>
              <span
                className="font-mono text-[9px] uppercase tracking-[0.18em] transition-colors duration-300"
                style={{ color: c }}
              >
                view repository →
              </span>
            </div>
          </div>
        </a>
        {STUDIES[project.repo] && <a href={`#/projects/${project.repo}`} className="project-study-link px-3 py-2 text-sm font-semibold" style={{ color: c }}>Explore case study →</a>}
        </div>
      ) : (
        <article className={surface} style={style}>
          {project.spotlight && accentRule}
          <ProjectMedia project={project} c={c} variant={variant} ordinal={ordinal} />

          <div className="p-6 md:p-7 flex flex-col flex-1 gap-5">
            <div>
              <h2 className="text-2xl font-semibold mb-2 group-hover:text-white transition-colors">{project.name}</h2>
              <p className="text-sm font-medium leading-relaxed" style={{ color: c }}>
                {project.tagline}
              </p>
            </div>

            <p className="text-sm text-white/50 leading-relaxed line-clamp-3">{project.desc}</p>

            <TagRow project={project} className="mb-2" />

            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <a
                  href={repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all"
                  aria-label={`${project.name} repository on GitHub`}
                >
                  <GithubIcon className="w-4.5 h-4.5" />
                </a>
              </div>
              <a
                href={STUDIES[project.repo] ? `#/projects/${project.repo}` : repo}
                target={STUDIES[project.repo] ? undefined : "_blank"}
                rel={STUDIES[project.repo] ? undefined : "noopener noreferrer"}
                className="group/link inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-all"
                style={{ color: c }}
              >
                Details
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </article>
      )}
    </Reveal>
  );
}
