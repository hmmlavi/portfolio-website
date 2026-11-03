import { ACHIEVEMENTS_PREVIEW, AVAILABILITY, EDUCATION, EXPERIENCE, LINKS, SKILL_CATEGORIES, SPOTLIGHT_PROJECTS } from "@/data/content";
import { CHANGELOG, CURRENTLY_BUILDING, newestUpdates } from "@/data/portfolioUpdates";
import { useTheme } from "@/hooks/useTheme";
import { accent } from "@/data/palette";
import DeveloperTerminal from "@/components/DeveloperTerminal";

export default function QuickView() {
  const { theme } = useTheme();
  const light = theme === "light";
  const updates = newestUpdates(CHANGELOG);

  return <section className="pt-28 md:pt-32 pb-24 px-6 md:px-10"><div className="max-w-5xl mx-auto space-y-8">
    <header>
      <p className="eyebrow mb-4">At a glance</p>
      <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">Recruiter quick view</h1>
      <p className="text-white/70 mt-5 max-w-2xl leading-relaxed">
        Lakshit (Lavi) is a Computer Science student and developer who learns by building Android apps, web tools and desktop software.
      </p>
      <p className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: accent("mint", light) }}>
        {AVAILABILITY.label}
      </p>
    </header>

    <div className="grid md:grid-cols-2 gap-4">
      <section className="quick-card ui-surface rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-3">Education</h2>
        {EDUCATION.map(e => <p className="text-sm text-white/70 mb-2" key={e.title}>{e.title} · {e.place}</p>)}
      </section>

      <section className="quick-card ui-surface rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-3">Experience</h2>
        {EXPERIENCE.map(e => <p className="text-sm text-white/70 mb-2" key={e.role}>{e.role} · {e.org} · {e.span}</p>)}
      </section>

      {/* Concise summary — the complete list lives on the Skills page. */}
      <section className="quick-card ui-surface rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-3">Technical skills</h2>
        <p className="text-sm text-white/70 mb-3">
          Eight groups covering programming languages, frontend, backend, databases, AI tooling, Android, desktop and developer tools.
        </p>
        <ul className="flex flex-wrap gap-1.5 mb-4">
          {SKILL_CATEGORIES.map(c => (
            <li key={c.title} className="px-2.5 py-1 rounded-lg text-[11px] ui-tag text-white/60">{c.title}</li>
          ))}
        </ul>
        <a href="#/skills" className="text-sm underline underline-offset-4">Complete skill map →</a>
      </section>

      <section className="quick-card ui-surface rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-3">Selected recognition</h2>
        {ACHIEVEMENTS_PREVIEW.slice(0, 3).map(a => <p className="text-sm text-white/70 mb-2" key={a.id}>{a.title} · {a.org}</p>)}
        <a href="#/achievements" className="text-sm underline underline-offset-4">All achievements →</a>
      </section>
    </div>

    <section>
      <h2 className="text-xl font-semibold mb-4">Featured projects</h2>
      <div className="flex flex-wrap gap-3">
        {SPOTLIGHT_PROJECTS.map(p => (
          <a className="ui-btn-quiet rounded-xl px-4 py-3 text-sm" href={`#/projects/${p.repo}`} key={p.repo}>{p.spotlightLabel} →</a>
        ))}
      </div>
    </section>

    <div className="flex flex-wrap gap-3">
      <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="ui-btn-quiet rounded-xl px-4 py-3 text-sm">GitHub ↗</a>
      <a href="#/contact" className="ui-btn-quiet rounded-xl px-4 py-3 text-sm">Contact</a>
      <a href={`mailto:${LINKS.email}`} className="ui-btn-quiet rounded-xl px-4 py-3 text-sm">{LINKS.email}</a>
      <a href={LINKS.resume} target="_blank" rel="noopener noreferrer" className="ui-btn-quiet rounded-xl px-4 py-3 text-sm">{LINKS.resumeLabel} ↗</a>
    </div>

    <DeveloperTerminal />

    {/* Empty data hides the card rather than showing a fabricated update. */}
    {(CURRENTLY_BUILDING || updates.length > 0) && (
      <div className="grid md:grid-cols-2 gap-4">
        {CURRENTLY_BUILDING && (
          <section className="quick-card ui-surface rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-3">Currently building</h2>
            <p className="font-medium">{CURRENTLY_BUILDING.project}</p>
            <p className="text-sm text-white/70 mt-2">{CURRENTLY_BUILDING.description}</p>
            <p className="text-sm mt-2">Learning: {CURRENTLY_BUILDING.learning}</p>
            {CURRENTLY_BUILDING.goals && <p className="text-sm mt-2">Goals: {CURRENTLY_BUILDING.goals}</p>}
            <p className="text-sm mt-2">Updated: {CURRENTLY_BUILDING.updated}</p>
            {CURRENTLY_BUILDING.link && <a href={CURRENTLY_BUILDING.link} className="underline">Project link</a>}
          </section>
        )}
        {updates.length > 0 && (
          <section className="quick-card ui-surface rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-3">What&#39;s new</h2>
            <ol className="space-y-4">
              {updates.map(u => (
                <li key={`${u.date}-${u.title}`}>
                  <p className="text-xs" style={{ color: accent(u.accent ?? "teal", light) }}>{u.date} · {u.category}</p>
                  <p className="font-medium">{u.title}</p>
                  <p className="text-sm text-white/70">{u.description}</p>
                  {u.link && <a href={u.link} className="text-sm underline">Explore update</a>}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    )}
  </div></section>;
}
