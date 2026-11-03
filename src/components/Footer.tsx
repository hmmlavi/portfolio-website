import { ArrowUp, FileText, Sparkles } from "lucide-react";
import { AVAILABILITY, LINKS, NAV_ITEMS } from "@/data/content";
import { LEGAL_DOCS } from "@/data/legal";
import { GithubIcon, InstagramIcon, LinkedinIcon, MailIcon, XIcon } from "@/components/icons";
import { Magnetic } from "@/components/anim";
import { useTheme } from "@/hooks/useTheme";
import { accent } from "@/data/palette";
import { cn } from "@/utils/cn";

const SOCIALS = [
  { label: "GitHub", href: LINKS.github, Icon: GithubIcon },
  { label: "LinkedIn", href: LINKS.linkedin, Icon: LinkedinIcon },
  { label: "Instagram", href: LINKS.instagram, Icon: InstagramIcon },
  { label: "X", href: LINKS.x, Icon: XIcon },
];

export default function Footer({
  onNavigate,
  onNavigatePage,
}: {
  onNavigate?: (slug: string | null) => void;
  onNavigatePage?: (path: string) => void;
}) {
  const year = new Date().getFullYear();
  const { theme } = useTheme();
  const light = theme === "light";
  const ice = accent("ice", light);
  const violet = accent("violet", light);
  const mint = accent("mint", light);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigatePage?.(path);
  };

  const legal = LEGAL_DOCS.map((d) => ({ label: d.title, slug: d.slug }));

  return (
    <footer className={cn("relative overflow-hidden transition-all duration-500 pt-16 pb-10", "ui-footer")}>
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className={cn("p-8 md:p-10 rounded-[32px] mb-10 transition-all duration-500", "ui-surface")}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-5">
              <div className="flex items-center gap-4 mb-5">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500", "ui-tile")}>
                  <span className="font-anton text-2xl" style={{ color: ice }}>L</span>
                </div>
                <div>
                  {/* Static signature — no typewriter animation. */}
                  <p className="text-lg font-bold tracking-tight">Lakshit Singh Saini</p>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: mint }} aria-hidden="true" />
                    <span className="font-mono text-[9px] tracking-[0.22em] uppercase" style={{ color: mint }}>
                      {AVAILABILITY.label}
                    </span>
                  </span>
                </div>
              </div>
              <p className="text-base text-white/50 leading-relaxed max-w-sm">
                Computer Science student building practical tools for Android, the web and desktop — with a focus on privacy and intentionality.
              </p>
            </div>

            <div className="md:col-span-3">
              <p className="font-mono text-[10px] tracking-widest uppercase text-white/40 mb-6">Quick links</p>
              <div className="flex flex-col gap-3">
                {NAV_ITEMS.slice(0, 4).map(n => (
                  <a key={n.id} href={n.path ? `#/${n.path}` : "#/"} onClick={(e) => go(e, n.path)} className="text-sm text-white/50 hover:text-white transition-colors w-fit">{n.label}</a>
                ))}
              </div>
            </div>

            <div className="md:col-span-4">
              <p className="font-mono text-[10px] tracking-widest uppercase text-white/40 mb-6">Connect</p>
              <div className="flex flex-wrap gap-3 mb-7">
                {SOCIALS.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                    "ui-icon-button"
                  )} aria-label={s.label}>
                    <s.Icon className="w-5 h-5" aria-hidden="true" />
                  </a>
                ))}
              </div>
              <div className="space-y-3">
                <a href={`mailto:${LINKS.email}`} className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors group">
                  <MailIcon className="w-4 h-4 shrink-0" style={{ color: ice }} aria-hidden="true" />
                  <span className="link-sweep">{LINKS.email}</span>
                </a>
                <a href={LINKS.resume} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors group">
                  <FileText className="w-4 h-4 shrink-0" style={{ color: violet }} aria-hidden="true" />
                  <span className="link-sweep">{LINKS.resumeLabel}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4" style={{ color: ice }} aria-hidden="true" />
            <p className="text-[11px] font-mono tracking-widest uppercase text-white/40">© {year} Built with intentionality</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {legal.map(l => (
              <a key={l.slug} href={`#/${l.slug}`} onClick={e => { e.preventDefault(); onNavigate?.(l.slug); }} className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">{l.label}</a>
            ))}
            <Magnetic>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                "ui-icon-button"
              )} aria-label="Back to top">
                <ArrowUp className="w-4 h-4" aria-hidden="true" />
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </footer>
  );
}
