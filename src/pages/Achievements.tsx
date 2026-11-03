import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, BadgeCheck, Cloud, ExternalLink, Medal, Star, Trophy, X, Image as ImageIcon } from "lucide-react";
import PageShell from "@/components/PageShell";
import { Reveal } from "@/components/anim";
import { useTheme } from "@/hooks/useTheme";
import { accent } from "@/data/palette";
import {
  AWARDS,
  CERTIFICATIONS,
  GOOGLE_CLOUD,
  RECOGNITION,
  type AchievementImage,
  type CertItem,
} from "@/data/achievements";
import { cn } from "@/utils/cn";
import PageMascot from "@/components/PageMascot";

/* ──────────────────────── shared helpers ──────────────────────── */

function Lightbox({ img, onClose }: { img: AchievementImage; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      else if (event.key === "Tab") { event.preventDefault(); closeRef.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label={img.alt} className="fixed inset-0 z-[200] flex items-center justify-center ui-lightbox backdrop-blur-xl p-4 animate-fade-in" onClick={onClose}>
      <button ref={closeRef} type="button" aria-label="Close image" onClick={onClose} className="absolute top-8 right-8 w-12 h-12 rounded-full glass flex items-center justify-center text-white/70 hover:text-white transition-all z-10"><X className="w-6 h-6" /></button>
      <div className="relative max-w-6xl max-h-[90vh] w-full flex flex-col items-center gap-6" onClick={e => e.stopPropagation()}>
        <img src={img.src} alt={img.alt} className="w-full h-auto max-h-[80vh] object-contain rounded-3xl shadow-2xl border border-white/10" />
        {img.caption && <p className="text-white/60 font-medium text-lg">{img.caption}</p>}
      </div>
    </div>
  );
}

function MissingVisual({ label }: { label: string }) {
  return (
    <div className="w-full aspect-[4/3] rounded-2xl ui-surface flex flex-col items-center justify-center gap-3 p-5 text-center">
      <Trophy className="w-7 h-7 text-white/30" aria-hidden="true" />
      <p className="text-sm text-white/60">No photograph for this milestone</p>
      <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">{label}</p>
    </div>
  );
}

function AchImage({ img, onOpen }: { img: AchievementImage; onOpen: () => void }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="w-full aspect-[4/3] rounded-[24px] ui-surface flex flex-col items-center justify-center gap-3 p-5 text-center text-sm text-white/60"><ImageIcon className="w-8 h-8" aria-hidden="true" /><span>Image unavailable</span></div>;
  return (
    <button type="button" aria-label={`Open image: ${img.alt}`} onClick={onOpen} className={cn(
      "group relative w-full aspect-[4/3] rounded-[24px] overflow-hidden border transition-all duration-500 cursor-zoom-in",
      "ui-surface"
    )}>
      <img src={img.src} alt="" loading="lazy" onError={() => setFailed(true)} className={cn("absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105", img.fit === "contain" ? "object-contain p-2" : "object-cover")} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
         <p className="text-xs text-white font-medium">{img.caption}</p>
      </div>
    </button>
  );
}

/* ──────────────────────── components ──────────────────────── */

function CertCard({ cert, light }: { cert: CertItem; light: boolean }) {
  const c = accent(cert.accent, light);
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <Reveal>
      <div className={cn(
        "p-8 rounded-[32px] transition-all duration-500",
        "ui-surface"
      )}>
        <div className="flex flex-col md:flex-row gap-10 items-center">
           {cert.image && (
             <div className="w-full md:w-1/3 shrink-0">
                {imageFailed ? <p className="ui-surface rounded-2xl p-6 text-sm text-white/60">Certificate image unavailable</p> : <img src={cert.image.src} alt={cert.image.alt} loading="lazy" onError={() => setImageFailed(true)} className="w-full h-auto rounded-2xl border border-white/10 shadow-lg shadow-black/20" />}
             </div>
           )}
           <div className="flex-1 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                 <span
                   className="px-3 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase border"
                   style={{ color: c, borderColor: "var(--line-strong)" }}
                 >
                   professional certification
                 </span>
                 <span className="text-[11px] text-white/50 font-mono">{cert.date}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">{cert.title}</h3>
              <p className="text-lg text-white/50">{cert.issuer}</p>
              <div className="flex flex-wrap gap-2">
                 {cert.tasks?.map(t => (
                   <span key={t} className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-white/60 font-medium">{t}</span>
                 ))}
              </div>
              {cert.credentialId && (
                 <p className="font-mono text-[11px] text-white/50 break-all">Credential ID: {cert.credentialId}</p>
              )}
              {cert.verifyUrl && <div className="pt-1">
                 <a href={cert.verifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all" style={{ color: c }}>
                    Open certificate file <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                 </a>
              </div>}
           </div>
        </div>
      </div>
    </Reveal>
  );
}

export default function Achievements() {
  const { theme } = useTheme();
  const light = theme === "light";
  const [lb, setLb] = useState<AchievementImage | null>(null);

  return (
    <PageShell
      id="achievements"
      eyebrow="milestones"
      title="Recognition"
      accentTitle="and achievements"
      intro="Awards, representation and professional credentials, each with a verification link where one exists. Photographs appear only where I have the real image."
    >
      <div className="flex justify-end -mt-8 mb-6"><PageMascot pose="trophy" compact /></div>
      {lb && <Lightbox img={lb} onClose={() => setLb(null)} />}

      <div className="space-y-20 md:space-y-24">
        {/* Awards Section */}
        <section>
          <Reveal className="flex items-center gap-4 mb-12">
            <Trophy className="w-6 h-6 text-white/20" />
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Competitions & Awards</h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-6">
            {AWARDS.map((a, i) => (
              <Reveal key={a.id} delay={i * 80}>
                <article className={cn(
                  "p-10 rounded-[32px] transition-all duration-500",
                  "ui-surface"
                )}>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    <div className="md:col-span-7 flex flex-col justify-center">
                       <div className="flex items-center gap-3 mb-6">
                          <Medal className="w-5 h-5" style={{ color: accent(a.accent, light) }} />
                          <span className="text-[10px] font-mono tracking-widest text-white/30 uppercase">{a.date}</span>
                       </div>
                       <h3 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">{a.title}</h3>
                       <p className="text-lg text-white/50 mb-8 leading-relaxed max-w-2xl">{a.detail}</p>
                       <p className="font-mono text-xs uppercase tracking-widest text-white/30">{a.org}</p>
                    </div>
                    <div className={cn("md:col-span-5 grid gap-4 content-center", a.images.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                       {a.images.length
                         ? a.images.map(img => <AchImage key={img.src} img={img} onOpen={() => setLb(img)} />)
                         : <MissingVisual label={a.date} />}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Recognition Section */}
        <section>
          <Reveal className="flex items-center gap-4 mb-12">
            <Star className="w-6 h-6 text-white/20" />
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Recognition & Representation</h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-6">
            {RECOGNITION.map((r, i) => (
              <Reveal key={r.id} delay={i * 80}>
                <article className={cn(
                  "p-10 rounded-[32px] transition-all duration-500",
                  "ui-surface"
                )}>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    <div className="md:col-span-7 flex flex-col justify-center">
                       <div className="flex items-center gap-3 mb-6">
                          <Star className="w-5 h-5 text-accent" />
                          <span className="text-[10px] font-mono tracking-widest text-white/30 uppercase">{r.date}</span>
                       </div>
                       <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">{r.title}</h3>
                       <p className="text-lg text-white/50 mb-8 leading-relaxed max-w-2xl">{r.detail}</p>
                       <p className="font-mono text-xs uppercase tracking-widest text-white/30">{r.org}</p>
                    </div>
                    <div className={cn("md:col-span-5 grid gap-4 content-center", r.images.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                       {r.images.length
                         ? r.images.map(img => <AchImage key={img.src} img={img} onOpen={() => setLb(img)} />)
                         : <MissingVisual label={r.date} />}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Certifications Section */}
        <section>
          <Reveal className="flex items-center gap-4 mb-12">
            <BadgeCheck className="w-6 h-6 text-white/20" />
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Professional Certifications</h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-6">
             {CERTIFICATIONS.map(cert => <CertCard key={cert.id} cert={cert} light={light} />)}
          </div>
        </section>

        {/* Google Cloud Section */}
        <section>
          <Reveal className="flex items-center gap-4 mb-12">
            <Cloud className="w-6 h-6 text-white/20" />
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Google Cloud</h2>
          </Reveal>
          <Reveal>
             <div className={cn(
               "p-10 rounded-[32px] relative overflow-hidden",
               "ui-surface"
             )}>
                <div aria-hidden="true" className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-40 ambient-wash" />
                <div className="relative flex flex-col md:flex-row gap-12 items-center">
                   <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center border border-white/5">
                      <Cloud className="w-12 h-12" style={{ color: accent("ice", light) }} />
                   </div>
                   <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-wrap items-center gap-4 mb-4 justify-center md:justify-start">
                         <h3 className="text-3xl md:text-5xl font-bold tracking-tighter tabular-nums">{GOOGLE_CLOUD.labsCompleted}</h3>
                         <span className="text-xl text-white/40 font-medium">hands-on labs completed</span>
                      </div>
                      <p className="text-lg text-white/50 max-w-xl mb-8 leading-relaxed">{GOOGLE_CLOUD.summary}</p>
                      <a href={GOOGLE_CLOUD.credly} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 group text-sm font-bold uppercase tracking-widest transition-all" style={{ color: accent("ice", light) }}>
                         Google Cloud profile on Credly <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </a>
                   </div>
                </div>
             </div>
          </Reveal>
        </section>
      </div>
    </PageShell>
  );
}
