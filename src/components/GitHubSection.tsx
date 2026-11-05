import { requestJson } from "@/utils/request";
import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowRight, GitFork, Star, GitCommit, Users, BookMarked } from "lucide-react";
import { GITHUB_USER, LINKS } from "@/data/content";
import { GithubIcon } from "@/components/icons";
import Contributions from "@/components/Contributions";
import { Reveal } from "@/components/anim";
import { useTheme } from "@/hooks/useTheme";
import { accent } from "@/data/palette";
import { cn } from "@/utils/cn";

type UserShape = {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
};

type RepoShape = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  updated_at: string;
};

type Payload = { user: UserShape; repos: RepoShape[]; languageTotals: Record<string, number>; languageSource: "bytes" | "primary" };

/** GitHub responses are untrusted JSON — narrow them with real checks. */
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const nullableStr = (v: unknown) => (typeof v === "string" ? v : null);

const count = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v >= 0;
const githubRepoUrl = (v: unknown) => typeof v === "string" && v.startsWith(`https://github.com/${GITHUB_USER}/`);
const toUser = (v: unknown): UserShape | null =>
  isRecord(v) && v.login === GITHUB_USER && count(v.public_repos) && count(v.followers) && count(v.following)
    ? {
        login: v.login,
        name: nullableStr(v.name),
        avatar_url: typeof v.avatar_url === "string" && v.avatar_url.startsWith("https://avatars.githubusercontent.com/") ? v.avatar_url : "",
        html_url: str(v.html_url),
        bio: nullableStr(v.bio),
        public_repos: num(v.public_repos),
        followers: num(v.followers),
        following: num(v.following),
      }
    : null;

const toRepo = (v: unknown): RepoShape | null =>
  isRecord(v) && typeof v.name === "string" && githubRepoUrl(v.html_url) && count(v.stargazers_count) && count(v.forks_count) && typeof v.fork === "boolean"
    ? {
        name: v.name,
        html_url: str(v.html_url),
        description: nullableStr(v.description),
        language: nullableStr(v.language),
        stargazers_count: num(v.stargazers_count),
        forks_count: num(v.forks_count),
        fork: v.fork === true,
        updated_at: str(v.updated_at),
      }
    : null;

// ── One shared request + a short validated cache ───────────────────────────
// React StrictMode mounts effects twice in development and the page can remount
// between routes; both would otherwise fire duplicate API calls. A module-level
// in-flight promise means at most one request pair is ever pending.
const CACHE_MS = 5 * 60 * 1000;
let cached: { data: Payload; expires: number } | null = null;
let inFlight: Promise<Payload> | null = null;

const peekCache = (): Payload | null =>
  cached && cached.expires > Date.now() ? cached.data : null;

const fetchGitHub = (): Promise<Payload> => {
  if (inFlight) return inFlight;
  const controller = new AbortController();
  const request = Promise.allSettled([
    requestJson(`https://api.github.com/users/${GITHUB_USER}`, controller.signal),
    requestJson(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`, controller.signal),
  ])
    .then(async ([userResult, repoResult]) => {
      // Wait for both requests to settle before releasing the in-flight lock;
      // an early failure must not allow a manual retry to duplicate its peer.
      if (userResult.status === "rejected") throw userResult.reason;
      if (repoResult.status === "rejected") throw repoResult.reason;
      const userJson = userResult.value;
      const repoJson = repoResult.value;
      const profile = toUser(userJson);
      if (!profile || !Array.isArray(repoJson)) throw new Error("invalid");
      const parsed = repoJson.map(toRepo).filter((repo): repo is RepoShape => repo !== null);
      if (repoJson.length && !parsed.length) throw new Error("invalid");
      // Forks are not my work, so every figure below counts owned repositories only.
      const ownedRepos = parsed.filter(repo => !repo.fork);
      // GitHub's Languages endpoint reports actual bytes by language.
      const languageResponses = await Promise.allSettled(
        ownedRepos.map(repo => requestJson("https://api.github.com/repos/" + GITHUB_USER + "/" + encodeURIComponent(repo.name) + "/languages", controller.signal))
      );
      const byteTotals: Record<string, number> = {};
      let successfulLanguageResponses = 0;
      for (const response of languageResponses) {
        if (response.status !== "fulfilled" || !isRecord(response.value)) continue;
        successfulLanguageResponses += 1;
        for (const [language, bytes] of Object.entries(response.value)) {
          if (typeof bytes === "number" && Number.isFinite(bytes) && bytes > 0) byteTotals[language] = (byteTotals[language] ?? 0) + bytes;
        }
      }
      const hasByteData = successfulLanguageResponses > 0 && Object.keys(byteTotals).length > 0;
      const primaryTotals = ownedRepos.reduce<Record<string, number>>((totals, repo) => {
        if (repo.language) totals[repo.language] = (totals[repo.language] ?? 0) + 1;
        return totals;
      }, {});
      const data: Payload = {
        user: profile,
        repos: ownedRepos,
        languageTotals: hasByteData ? byteTotals : primaryTotals,
        languageSource: hasByteData ? "bytes" : "primary",
      };
      cached = { data, expires: Date.now() + CACHE_MS };
      return data;
    })
    .finally(() => { inFlight = null; });
  inFlight = request;
  return request;
};

export default function GitHubSection({ padded = false }: { padded?: boolean }) {
  const { theme } = useTheme();
  const light = theme === "light";
  const ice = accent("ice", light);
  const mint = accent("mint", light);
  const rose = accent("rose", light);
  const violet = accent("violet", light);

  const [user, setUser] = useState<UserShape | null>(null);
  const [repos, setRepos] = useState<RepoShape[]>([]);
  const [languageTotals, setLanguageTotals] = useState<Record<string, number>>({});
  const [languageSource, setLanguageSource] = useState<"bytes" | "primary">("bytes");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const Heading = padded ? "h1" : "h2";

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    if (attempt === 0) {
      const warm = peekCache();
      if (warm) {
        setUser(warm.user);
        setRepos(warm.repos);
        setLanguageTotals(warm.languageTotals);
        setLanguageSource(warm.languageSource);
        setLoading(false);
        return () => { alive = false; };
      }
    }
    fetchGitHub()
      .then(data => {
        if (!alive) return;
        setUser(data.user);
        setRepos(data.repos);
        setLanguageTotals(data.languageTotals);
        setLanguageSource(data.languageSource);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "network");
        setLoading(false);
      });
    return () => { alive = false; };
  }, [attempt]);

  const totalStars = repos.reduce((n, repo) => n + repo.stargazers_count, 0);
  // Prefer GitHub's actual language byte counts across all owned repositories.
  // Fall back clearly to primary-language repository counts if unavailable.
  const languageTotal = Object.values(languageTotals).reduce((sum, amount) => sum + amount, 0);
  const langList = Object.entries(languageTotals)
    .map(([name, amount]) => ({ name, amount, pct: languageTotal > 0 ? (amount / languageTotal) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name));
  const recentRepos = [...repos]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 4);

  return (
    <section className={cn("px-6 md:px-10 relative overflow-hidden", padded ? "pt-28 md:pt-32 pb-20 md:pb-24" : "py-20")}>
      <div className="max-w-7xl mx-auto relative">
        <Reveal className="mb-10">
          <p className="eyebrow mb-4">ecosystem</p>
          <Heading className="text-3xl md:text-5xl font-semibold tracking-tight">GitHub Activity</Heading>
          <p className="mt-4 text-sm text-white/60 max-w-2xl leading-relaxed">
            Live data for the public <span className="font-mono">@{GITHUB_USER}</span> account, fetched from GitHub&apos;s
            public API. Statistics describe the fetched repositories, not a complete career record.
          </p>
        </Reveal>

        {loading ? (
          <p role="status" className="ui-surface rounded-2xl p-8">Loading GitHub data…</p>
        ) : error ? (
          <div className="ui-surface rounded-[32px] p-10 text-center">
            <GithubIcon className="w-10 h-10 mx-auto mb-6 opacity-20" aria-hidden="true" />
            <p role="status" className="text-white/60">
              {error === "rate-limit" ? "GitHub rate limit reached. Please try again later." : error === "timeout" ? "GitHub request timed out." : error === "invalid" ? "GitHub returned an invalid response." : "GitHub data unavailable."}{" "}
              <a href={LINKS.github} className="underline">View the profile on GitHub</a>
            </p>
            {error !== "rate-limit" && (
              <button type="button" className="ui-btn-quiet rounded-xl px-4 py-2 mt-4" onClick={() => setAttempt(n => n + 1)}>
                Retry
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Identity Card */}
            <Reveal delay={100} className="lg:col-span-4">
              <div className={cn("p-7 rounded-[32px] h-full transition-all duration-500", "ui-surface")}>
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute -inset-2 rounded-full blur-xl opacity-40 ambient-wash" aria-hidden="true" />
                    {user?.avatar_url && (
                      <img
                        src={user.avatar_url}
                        alt={`@${user.login} GitHub avatar`}
                        className="w-24 h-24 rounded-full border-2 border-white/10 relative z-10"
                      />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold mb-1">@{user?.login || GITHUB_USER}</h2>
                  <p className="text-sm text-white/50 mb-8">{user?.bio || "Building in public."}</p>

                  <div className="grid grid-cols-2 gap-3 w-full">
                    {[
                      { i: BookMarked, l: "Public repos", v: user?.public_repos, c: ice },
                      { i: Users, l: "Followers", v: user?.followers, c: mint },
                      { i: GitCommit, l: "Following", v: user?.following, c: violet },
                      { i: Star, l: "Stars across fetched repositories", v: totalStars, c: rose },
                    ].map(stat => (
                      <div key={stat.l} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-left">
                        <stat.i className="w-4 h-4 mb-3" style={{ color: stat.c }} aria-hidden="true" />
                        <p className="text-lg font-bold leading-none mb-1 tabular-nums">{stat.v ?? "—"}</p>
                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-medium leading-snug">{stat.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Main Stats Area */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Heatmap Area */}
              <Reveal delay={150}>
                <div className={cn("p-7 rounded-[32px] transition-all duration-500", "ui-surface")}>
                  <Contributions />
                </div>
              </Reveal>

              {/* Languages + Repos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Languages */}
                <Reveal delay={200}>
                  <div className={cn("p-7 rounded-[32px] h-full", "ui-surface")}>
                    <p className="font-mono text-[10px] tracking-widest uppercase text-white/40 mb-2">All languages across repositories</p>
                    <p className="text-[11px] text-white/50 mb-6 leading-relaxed">
                      {languageSource === "bytes" ? "Percentages use GitHub language byte counts across" : "GitHub language byte data was unavailable; percentages use primary-language repository counts across"} {repos.length} fetched {repos.length === 1 ? "repository" : "repositories"}. {langList.length} languages detected.
                    </p>
                    <div className="space-y-4">
                      {langList.map(lang => (
                        <div key={lang.name} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/80 font-medium">{lang.name}</span>
                            <span className="text-white/50 tabular-nums">{lang.pct.toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${lang.pct}%`, background: ice }} />
                          </div>
                        </div>
                      ))}
                      {langList.length === 0 && (
                        <p className="text-sm text-white/60">No repository languages were reported.</p>
                      )}
                    </div>
                  </div>
                </Reveal>

                {/* Recently updated repositories */}
                <Reveal delay={250}>
                  <div className={cn("p-7 rounded-[32px] h-full", "ui-surface")}>
                    <p className="font-mono text-[10px] tracking-widest uppercase text-white/40 mb-2">Recently updated repositories</p>
                    <p className="text-[11px] text-white/50 mb-5 leading-relaxed">
                      Ordered by GitHub&apos;s last-push timestamp across the fetched repositories.
                    </p>
                    <div className="space-y-3">
                      {recentRepos.map(repo => (
                        <a key={repo.name} href={repo.html_url} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all group">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-white/90 transition-colors truncate">{repo.name}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-white/40 transition-colors shrink-0" aria-hidden="true" />
                          </div>
                          {repo.description && <p className="text-xs text-white/60 mt-2">{repo.description}</p>}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1 text-[10px] text-white/50">
                              <Star className="w-3 h-3" aria-hidden="true" /> {repo.stargazers_count}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-white/50">
                              <GitFork className="w-3 h-3" aria-hidden="true" /> {repo.forks_count}
                            </span>
                            <span className="text-[10px] text-white/50 ml-auto">{repo.language ?? "—"}</span>
                          </div>
                        </a>
                      ))}
                      {recentRepos.length === 0 && (
                        <p className="text-sm text-white/60">No public repositories were reported.</p>
                      )}
                    </div>
                    <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-6 text-xs font-semibold uppercase tracking-wider" style={{ color: ice }}>
                      All repositories <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
