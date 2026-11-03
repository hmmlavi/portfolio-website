import { requestJson } from "@/utils/request";
import { useEffect, useRef, useState } from "react";
import { GithubIcon } from "@/components/icons";
import { GITHUB_USER, LINKS } from "@/data/content";
import { useTheme } from "@/hooks/useTheme";

type Day = { date: string; count: number; level: number };
type ContributionData = { weeks: Day[][]; total: number | null };

const API = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`;
const CACHE_MS = 5 * 60 * 1000;

/** level → colour, per theme (0 = no contributions) */
const DARK = [
  "rgba(255,255,255,0.07)",
  "rgba(143,179,209,0.28)",
  "rgba(143,179,209,0.46)",
  "rgba(143,179,209,0.66)",
  "#8fb3d1",
];
const LIGHT = [
  "rgba(27,36,50,0.07)",
  "rgba(45,95,136,0.20)",
  "rgba(45,95,136,0.38)",
  "rgba(45,95,136,0.60)",
  "#2d5f88",
];

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

/** Contribution days come from a third-party API — validate before use. */
const isDay = (v: unknown): v is Day => {
  if (!isRecord(v) || typeof v.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v.date)) return false;
  const parsed = new Date(`${v.date}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === v.date &&
    typeof v.count === "number" && Number.isSafeInteger(v.count) && v.count >= 0 &&
    typeof v.level === "number" && Number.isInteger(v.level) && v.level >= 0 && v.level <= 4;
};

const levelColor = (level: number, palette: readonly string[]) => palette[level];
let cache: (ContributionData & { expires: number }) | null = null;
let inFlight: Promise<ContributionData> | null = null;

/** Split the chronological day list into week columns starting on Sunday. */
function toWeeks(days: Day[]): Day[][] {
  const weeks: Day[][] = [];
  let current: Day[] = [];
  for (const day of days) {
    const dow = new Date(`${day.date}T00:00:00`).getDay();
    if (dow === 0 && current.length) {
      weeks.push(current);
      current = [];
    }
    current.push(day);
  }
  if (current.length) weeks.push(current);
  return weeks;
}

function parseContributions(data: unknown): ContributionData {
  if (!isRecord(data) || !Array.isArray(data.contributions) ||
      data.contributions.length === 0 || !data.contributions.every(isDay)) {
    throw new Error("invalid response");
  }
  const list = data.contributions as Day[];
  if (new Set(list.map(day => day.date)).size !== list.length) throw new Error("duplicate dates");
  const value = isRecord(data.total) ? data.total.lastYear : undefined;
  const total = typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
  return { weeks: toWeeks([...list].sort((a, b) => a.date.localeCompare(b.date))), total };
}

/** One shared request across StrictMode and route remounts. */
function fetchContributions(): Promise<ContributionData> {
  if (inFlight) return inFlight;
  const request = requestJson(API, new AbortController().signal, { automaticRetry: true })
    .then((data: unknown) => {
      const parsed = parseContributions(data);
      cache = { ...parsed, expires: Date.now() + CACHE_MS };
      return parsed;
    })
    .finally(() => { inFlight = null; });
  inFlight = request;
  return request;
}

const errorCopy = (error: string): string => {
  if (error === "rate-limit") return "The contribution service is rate-limiting requests. You can retry manually or view the graph directly on GitHub.";
  if (error === "timeout") return "The contribution request timed out. You can retry or view the graph directly on GitHub.";
  if (error === "invalid response" || error === "duplicate dates" || error === "invalid") {
    return "The contribution service returned data that could not be validated. No substitute graph or counts are shown.";
  }
  return "GitHub contribution data is unavailable right now. You can retry or view the public graph directly on GitHub.";
};

export default function Contributions({ compact = false }: { compact?: boolean }) {
  const { theme } = useTheme();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [weeks, setWeeks] = useState<Day[][] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  // Fetch on visibility (or immediately without IntersectionObserver). The
  // shared request may finish after unmount to warm the cache; cancelled
  // consumers never set state, and a remount reuses the same in-flight promise.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let cancelled = false;
    let started = false;
    let io: IntersectionObserver | undefined;
    setError(null);
    const load = () => {
      if (started) return;
      started = true;
      io?.disconnect();
      if (cache && cache.expires > Date.now()) {
        setWeeks(cache.weeks);
        setTotal(cache.total);
        return;
      }
      fetchContributions().then((data) => {
        if (cancelled) return;
        setTotal(data.total);
        setWeeks(data.weeks);
      }).catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "network");
      });
    };
    if (typeof IntersectionObserver === "undefined") load();
    else {
      io = new IntersectionObserver(entries => { if (entries[0]?.isIntersecting) load(); }, { rootMargin: "200px" });
      io.observe(el);
    }
    return () => { cancelled = true; io?.disconnect(); };
  }, [retry]);

  const palette = theme === "light" ? LIGHT : DARK;
  const loading = !weeks && !error;
  const failed = Boolean(error);

  return (
    <div ref={wrapRef} className={compact ? "" : "mt-8"}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <p className="eyebrow mb-2">activity</p>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
            {failed ? "GitHub Activity" : "Contributions"}
          </h2>
          {compact && (
            <p className="mt-2 text-xs font-mono tracking-[0.2em] uppercase text-white/40 flex items-center gap-2">
              live data ·{" "}
              <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white/70 transition-colors">
                open full GitHub page
              </a>
            </p>
          )}
        </div>
        <p className="text-sm text-white/60" aria-live="polite">
          {loading && <span className="font-mono text-xs">loading contribution activity…</span>}
          {!loading && !failed && total !== null && (
            <>
              <span className="text-white font-semibold">{total.toLocaleString("en-IN")}</span> contributions in the
              last year
            </>
          )}
          {failed && <span className="text-sm">graph unavailable — view it on GitHub</span>}
        </p>
      </div>

      <div
        className="glass rounded-2xl p-4 sm:p-6 overflow-hidden"
        aria-busy={loading}
        data-graph-state={loading ? "loading" : failed ? "error" : "success"}
      >
        {loading && (
          <div role="status" className="h-[104px] flex items-center justify-center rounded-lg bg-white/[0.04]">
            <span className="animate-pulse text-sm text-white/60">Loading the real contribution graph…</span>
          </div>
        )}

        {!loading && failed && (
          <div className="py-8 flex flex-col items-center gap-3 text-center" role="alert">
            <GithubIcon className="w-5 h-5 text-white/50" />
            <p className="text-sm text-white/60 max-w-md">{errorCopy(error ?? "network")}</p>
            <button type="button" className="ui-btn-quiet rounded-xl px-4 py-2 text-sm" onClick={() => setRetry(value => value + 1)}>
              Retry graph
            </button>
            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/80 hover:text-white link-sweep"
            >
              View the contribution graph on GitHub
            </a>
          </div>
        )}

        {!loading && !failed && weeks && (
          <>
            {/* The real grid stays full-size and scrolls horizontally on phones. */}
            <div
              className="overflow-x-auto pb-1"
              role="img"
              tabIndex={0}
              aria-label={total !== null ? `GitHub contribution graph showing ${total} contributions in the last year; scroll horizontally for more` : "GitHub contribution graph; scroll horizontally for more"}
            >
              <div className="flex gap-[3px] w-max" style={{ direction: "ltr" }}>
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((day) => (
                      <span
                        key={day.date}
                        title={`${day.count} contribution${day.count === 1 ? "" : "s"} · ${day.date}`}
                        className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-[2px] transition-transform duration-150 hover:scale-125"
                        style={{ background: levelColor(day.level, palette) }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/50">
                public contribution data · third-party API
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 mr-1">less</span>
                {palette.map((c, i) => (
                  <span key={i} className="w-[10px] h-[10px] rounded-[2px]" style={{ background: c }} aria-hidden="true" />
                ))}
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 ml-1">more</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
