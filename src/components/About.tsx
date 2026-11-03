import { AVAILABILITY, LINKS } from "@/data/content";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { Reveal } from "@/components/anim";
import { useTheme } from "@/hooks/useTheme";
import { accent } from "@/data/palette";
import JourneyTimeline from "@/components/JourneyTimeline";
import FunFacts from "@/components/FunFacts";
import { cn } from "@/utils/cn";

export default function About() {
  const { theme } = useTheme();
  const light = theme === "light";
  const ice = accent("ice", light);
  const mint = accent("mint", light);
  const rose = accent("rose", light);

  return (
    <section id="about" className="pt-28 md:pt-32 pb-20 md:pb-24 px-6 md:px-10 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative">
        <Reveal>
          <div className="flex items-center gap-4 mb-8">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
              "ui-tile"
            )}>
              <span className="font-anton text-2xl" style={{ color: ice }}>L</span>
            </div>
            <div>
              <p className="eyebrow mb-1">who i am</p>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">About Me</h1>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-8">
            <Reveal delay={100}>
              <div className="space-y-6 text-lg md:text-xl text-white/60 dark:text-white/40 leading-relaxed">
                <p>
                  I started experimenting with technology in 2020, and I never stopped.
                </p>
                <p>
                  I&#39;m currently pursuing a Bachelor of Technology in Computer Science and Engineering. My attention moves between web development, desktop apps, AI and Android. Whenever something new catches my eye, I build something small with it. Sometimes it works, sometimes it becomes a lesson.
                </p>
              </div>
            </Reveal>

            {/* Personality / Approach cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
              {[
                { i: "🧪", t: "Experiment first", d: "I learn by opening a blank project before I open the documentation.", c: mint },
                { i: "🎯", t: "Utility focus", d: "I build tools that solve my own frustrations first. If it helps me, it helps others.", c: ice },
              ].map((item, i) => (
                <Reveal key={item.t} delay={200 + i * 100}>
                  <div className={cn(
                    "p-8 rounded-[32px] h-full relative transition-all duration-300 tilt-card",
                    "ui-surface hover:-translate-y-1"
                  )} data-tilt>
                    <span className="text-3xl mb-4 block" aria-hidden="true">{item.i}</span>
                    <h2 className="text-lg font-semibold mb-2">{item.t}</h2>
                    <p className="text-sm text-white/50 leading-relaxed">{item.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 sticky top-32">
            <Reveal delay={300}>
              <div className={cn(
                "p-8 rounded-[32px] overflow-hidden relative about-focus-card",
                "ui-surface"
              )}>
                 <div aria-hidden="true" className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-40 ambient-wash" />
                 
                 <div className="about-mascot"><PageMascot pose="ideas" embedded /></div>
                 <p className="font-mono text-[10px] tracking-widest uppercase text-white/30 mb-6">Beyond code</p>
                 <ul className="space-y-6">
                   {[
                     { l: "Interests", v: "Privacy, UX, AI Systems", c: ice },
                     { l: "Status", v: AVAILABILITY.label, c: mint },
                     { l: "Location", v: "India", c: rose },
                   ].map(row => (
                     <li key={row.l} className="flex flex-col gap-1">
                       <span className="text-xs font-medium" style={{ color: row.c }}>{row.l}</span>
                       <span className="text-sm text-white/80">{row.v}</span>
                     </li>
                   ))}
                 </ul>

                 <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4">
                    <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/50 hover:text-white transition-colors group text-sm">
                       <GithubIcon className="w-4 h-4" />
                       <span className="link-sweep">github.com/hmmlavi</span>
                    </a>
                    <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/50 hover:text-white transition-colors group text-sm">
                       <LinkedinIcon className="w-4 h-4" />
                       <span className="link-sweep">linkedin/lakshitsinghsaini</span>
                    </a>
                 </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Integrated About Me additions — the same section, not a new page. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-14 items-start">
          <div className="lg:col-span-8">
            <JourneyTimeline light={light} />
          </div>
          <div className="lg:col-span-4">
            <FunFacts light={light} />
          </div>
        </div>
      </div>
    </section>
  );
}
