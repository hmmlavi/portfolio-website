import type { ComponentType } from "react";
import {
  SiAndroid,
  SiAndroidstudio,
  SiC,
  SiChatbot,
  SiClaudecode,
  SiCplusplus,
  SiCss,
  SiExpress,
  SiGit,
  SiGithub,
  SiGooglegemini,
  SiHtml5,
  SiJavascript,
  SiJetpackcompose,
  SiKotlin,
  SiNextdotjs,
  SiNodedotjs,
  SiOpenapiinitiative,
  SiPostgresql,
  SiPython,
  SiQt,
  SiReact,
  SiSqlite,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiVite,
} from "react-icons/si";

type Logo = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
  focusable?: boolean | "true" | "false" | "auto";
}>;

/** Generic, accurate database glyph for the SQL language (no vendor logo). */
const SqlLogo: Logo = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
    <path d="M4.5 5.5v13c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-13" />
    <path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
  </svg>
);

/**
 * Accurate Simple Icons logos for every technology named in the skills data.
 * A single muted, theme-aware colour is used for all of them so the icons
 * read as part of the interface rather than a row of brand-coloured stickers.
 */
const TECH_LOGOS: Record<string, Logo> = {
  C: SiC,
  "C++": SiCplusplus,
  Python: SiPython,
  JavaScript: SiJavascript,
  TypeScript: SiTypescript,
  SQL: SqlLogo,
  HTML: SiHtml5,
  CSS: SiCss,

  React: SiReact,
  "Next.js": SiNextdotjs,
  "Tailwind CSS": SiTailwindcss,
  Vite: SiVite,

  "Node.js": SiNodedotjs,
  Express: SiExpress,
  "REST APIs": SiOpenapiinitiative,

  PostgreSQL: SiPostgresql,
  Supabase: SiSupabase,
  SQLite: SiSqlite,

  "Prompt Engineering": SiChatbot,
  "AI-Assisted Development": SiClaudecode,
  "Gemini API": SiGooglegemini,

  Kotlin: SiKotlin,
  "Jetpack Compose": SiJetpackcompose,
  "Android Studio": SiAndroidstudio,

  PySide6: SiPython,
  Qt: SiQt,

  Git: SiGit,
  GitHub: SiGithub,
  Vercel: SiVercel,
};

/** One representative logo per skill category, in category order. */
export const CATEGORY_LOGOS: readonly Logo[] = [
  SiCplusplus,
  SiReact,
  SiNodedotjs,
  SiPostgresql,
  SiGooglegemini,
  SiAndroid,
  SiQt,
  SiGithub,
];

/** Fallback keeps a consistent tile even if new skills are added later. */
const FALLBACK: Logo = SiGit;

export function techLogo(name: string): Logo {
  return TECH_LOGOS[name] ?? FALLBACK;
}

export default function TechIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Logo = techLogo(name);
  return <Logo className={className} aria-hidden="true" focusable="false" />;
}
