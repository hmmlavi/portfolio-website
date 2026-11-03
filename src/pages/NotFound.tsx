import { ArrowLeft, Home } from "lucide-react";
import { Reveal } from "@/components/anim";
import { cn } from "@/utils/cn";

export default function NotFound({ attempted }: { attempted?: string }) {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* spatial glitches */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
         <div className="absolute top-[20%] left-[20%] w-32 h-32 rounded-full blur-3xl opacity-40 ambient-wash" />
         <div className="absolute bottom-[20%] right-[20%] w-32 h-32 rounded-full blur-3xl opacity-30 ambient-wash" />
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        <Reveal>
          <div className="mb-10 inline-flex items-center justify-center">
             <div className={cn(
               "w-32 h-32 rounded-[32px] flex items-center justify-center transition-all duration-500",
               "ui-surface"
             )}>
                <span className="font-anton text-6xl opacity-20 select-none">404</span>
             </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Well, this is <span className="shimmer-text">awkward</span>.</h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-lg md:text-xl text-white/50 dark:text-white/40 leading-relaxed mb-12">
            This page doesn&#39;t exist. It may have been moved or removed, or the link may be incomplete. The navigation above still works.
          </p>
        </Reveal>

        {attempted && (
          <Reveal delay={250}>
            <div className="mb-10 p-4 rounded-2xl bg-white/5 border border-white/5 inline-block">
               <code className="text-xs font-mono text-white/30">Attempted path: /{attempted}</code>
            </div>
          </Reveal>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <Reveal delay={300}>
              <a 
                href="#/" 
                className={cn(
                  "flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all duration-300",
                  "ui-btn-primary hover:scale-105"
                )}
              >
                <Home className="w-4 h-4" /> Take me home
              </a>
           </Reveal>
           <Reveal delay={350}>
              <button 
                onClick={() => window.history.back()}
                className={cn(
                  "flex items-center gap-2 px-8 py-4 rounded-2xl font-medium border border-white/10 transition-all duration-300",
                  "ui-btn-quiet"
                )}
              >
                <ArrowLeft className="w-4 h-4" /> Go back
              </button>
           </Reveal>
        </div>
      </div>
    </main>
  );
}
