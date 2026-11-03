import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import GitHubSection from "@/components/GitHubSection";
import FAQ from "@/components/FAQ";
import Exploring from "@/components/Exploring";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Cursor from "@/components/Cursor";
import Home from "@/pages/Home";
import Education from "@/pages/Education";
import Experience from "@/pages/Experience";
import Achievements from "@/pages/Achievements";
import CaseStudy from "@/pages/CaseStudy";
import QuickView from "@/pages/QuickView";
import NotFound from "@/pages/NotFound";
import LegalPage from "@/pages/LegalPage";
import ParticleField from "@/components/ParticleField";
import CommandPalette from "@/components/CommandPalette";
import Toast from "@/components/Toast";
import { LEGAL_DOCS } from "@/data/legal";
import { NAV_ITEMS, PROJECTS } from "@/data/content";
import { STUDIES } from "@/data/projectExtras";
import { ThemeProvider } from "@/hooks/useTheme";
import { useInteractionEnhancements } from "@/hooks/useInteractionEnhancements";

type PageKey =
  | "home" | "about" | "skills" | "projects" | "education"
  | "experience" | "achievements" | "github" | "contact";

type Route =
  | { kind: "page"; page: PageKey }
  | { kind: "legal"; slug: string }
  | { kind: "case"; repo: string }
  | { kind: "quick" }
  | { kind: "notfound"; slug: string };

const PAGE_KEYS: readonly PageKey[] = [
  "home", "about", "skills", "projects", "education",
  "experience", "achievements", "github", "contact",
];

/** Narrow an arbitrary hash slug to a known page without a type assertion. */
const isPageKey = (slug: string): slug is PageKey =>
  PAGE_KEYS.some((key) => key === slug);

const resolveRoute = (hash: string): Route => {
  const raw = hash.startsWith("#/") ? hash.slice(2) : hash.startsWith("#") ? hash.slice(1) : "";
  const slug = raw.split(/[?#]/)[0].replace(/\/+$/, "");
  if (!slug) return { kind: "page", page: "home" };
  if (slug === "quick-view") return { kind: "quick" };
  if (slug.startsWith("projects/")) return { kind: "case", repo: slug.slice(9) };
  if (LEGAL_DOCS.some((d) => d.slug === slug)) return { kind: "legal", slug };
  if (isPageKey(slug)) return { kind: "page", page: slug };
  return { kind: "notfound", slug };
};

function Site() {
  const [route, setRoute] = useState<Route>(() =>
    typeof window === "undefined" ? { kind: "page", page: "home" } : resolveRoute(window.location.hash)
  );

  useInteractionEnhancements();

  useEffect(() => {
    const onHashChange = () => {
      setRoute(resolveRoute(window.location.hash));
      // Hash routes are pages, not in-page anchors: start the new page at top.
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const go = (hash: string) => { window.location.hash = hash; };
  const legalDoc = route.kind === "legal" ? LEGAL_DOCS.find((d) => d.slug === route.slug) ?? null : null;
  const currentPage = route.kind === "page" ? route.page : null;

  useEffect(() => {
    document.title = "Lakshit Singh";
  }, [route]);

  return (
    <div
      className="site-shell"
      style={{ background: "var(--site-bg)", color: "var(--site-fg)" }}
    >
      <a className="skip-link" href="#main" onClick={(event) => {
        event.preventDefault();
        const main = document.getElementById("main");
        if (main) { main.tabIndex = -1; main.focus(); }
      }}>Skip to content</a>
      <ParticleField />
      <Cursor />
      <CommandPalette onNavigate={go} />
      <Toast />

      <div className="site-content">
        <Navbar current={currentPage} onNavigate={go} />
        <div>
          {route.kind === "case" ? (
            <CaseStudy repo={route.repo} />
          ) : route.kind === "quick" ? (
            <main id="main"><QuickView /></main>
          ) : route.kind === "notfound" ? (
            <NotFound attempted={route.slug} />
          ) : legalDoc ? (
            <LegalPage doc={legalDoc} onNavigate={(slug) => go(slug ? `#/${slug}` : "/")} />
          ) : currentPage === "home" ? (
            <main id="main"><Home /></main>
          ) : currentPage === "about" ? (
            <main id="main"><About /><Exploring /><FAQ /></main>
          ) : currentPage === "skills" ? (
            <main id="main"><Skills /></main>
          ) : currentPage === "projects" ? (
            <main id="main"><Projects /></main>
          ) : currentPage === "education" ? (
            <main id="main"><Education /></main>
          ) : currentPage === "experience" ? (
            <main id="main"><Experience /></main>
          ) : currentPage === "achievements" ? (
            <main id="main"><Achievements /></main>
          ) : currentPage === "github" ? (
            <main id="main"><GitHubSection padded /></main>
          ) : (
            <main id="main"><Contact /></main>
          )}
        </div>
        <Footer onNavigate={(target) => go(target ? `#/${target}` : "/")} onNavigatePage={go} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Site />
    </ThemeProvider>
  );
}
