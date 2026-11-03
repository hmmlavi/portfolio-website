/**
 * Production-bundle smoke test — simulates Arena's embedded preview.
 *
 * The shipped `dist/index.html` is a single file with an inline module
 * script (vite-plugin-singlefile). jsdom cannot execute module scripts, so
 * we evaluate the very same inline script in a browser-like window, with the
 * `?embed=true` URL used by the preview iframe. This reproduces the exact
 * "?embed=true:42" crash condition: a render-time TypeError leaves #root
 * empty ("blue-gradient-only screen").
 *
 * Every route is visited in BOTH themes and any console/runtime error fails
 * the test. Run with `npm run test:smoke` (builds first).
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

const DIST = "dist/index.html";
// Optional: point at a live dev/preview server (SMOKE_URL) or a saved HTTP
// response (SMOKE_FILE) to verify the actual embedded preview response too.
const html = process.env.SMOKE_FILE
  ? readFileSync(process.env.SMOKE_FILE, "utf8")
  : process.env.SMOKE_URL
    ? await (await fetch(process.env.SMOKE_URL)).text()
    : (() => {
        if (!existsSync(DIST)) {
          throw new Error(`${DIST} missing — run "npm run build" or "npm run test:smoke" first.`);
        }
        return readFileSync(DIST, "utf8");
      })();

const PREVIEW_URL = "https://5173-portfolio.e2b.app/?embed=true";

// Refined palette accents (kept in sync with src/data/palette.ts).
const DARK_ACCENT = "#8fb3d1";
const LIGHT_ACCENT = "#2d5f88";
const NAV_HREFS = [
  "#/", "#/about", "#/skills", "#/projects", "#/education",
  "#/experience", "#/achievements", "#/github", "#/contact",
];
const SPOTLIGHT_LABELS = ["Sortify Desktop", "Pustakalaya-LMS", "FacilityFix"];
const SPOTLIGHT_REPOS = [
  "https://github.com/hmmlavi/sortify-desktop",
  "https://github.com/hmmlavi/Pustakalaya-LMS",
  "https://github.com/hmmlavi/FacilityFix",
];
const DARK_HUES = ["#8fb3d1", "#a49dc0", "#8fb9a5", "#cf8b90", "#d8b27c", "#7db4b0"];
const LIGHT_HUES = ["#2d5f88", "#574b7c", "#2f6a54", "#a33a48", "#8a5a20", "#1f6a66"];

const NAV_LABELS = [
  "Home", "About", "Skills", "Projects", "Education",
  "Experience", "Achievements", "GitHub", "Contact",
];

const ROUTES = [
  { hash: "", name: "Home (default, embed URL)", expect: ["Lakshit Singh", "Featured projects", "What I build", "Milestones", "Let's build something", "Sortify Desktop", "Pustakalaya-LMS", "FacilityFix"] },
  { hash: "#/", name: "Home", expect: ["Featured projects", "What I build", "Sortify Desktop", "Pustakalaya-LMS", "FacilityFix"] },
  { hash: "#/about", name: "About", expect: ["About Me", "Currently exploring", "Quick answers"] },
  { hash: "#/skills", name: "Skills", expect: ["Technical Skills", "Programming Languages", "Frontend Development", "Artificial Intelligence", "Tools & Platforms"] },
  { hash: "#/projects", name: "Projects", expect: ["Projects", "SaBuddy", "Veylo", "Portfolio Site"] },
  { hash: "#/education", name: "Education", expect: ["education", "Computer Science in practice", "Self-directed learning"] },
  { hash: "#/experience", name: "Experience", expect: ["Practical", "YuvaIntern", "Independent Projects & Public Repositories", "1 October 2026", "12 November 2026"] },
  { hash: "#/achievements", name: "Achievements", expect: ["Recognition", "Competitions & Awards", "Professional Certifications", "Google Cloud"] },
  { hash: "#/github", name: "GitHub", expect: ["GitHub Activity"] },
  { hash: "#/contact", name: "Contact", expect: ["Get in touch", "Open résumé folder"] },
  { hash: "#/privacy", name: "Privacy (legal)", expect: ["Privacy", "Last updated"] },
  { hash: "#/terms", name: "Terms (legal)", expect: ["Terms"] },
  { hash: "#/cookies", name: "Cookies (legal)", expect: ["Cookies"] },
  { hash: "#/refunds", name: "Refunds (legal)", expect: ["Refund"] },
  { hash: "#/does-not-exist", name: "404", expect: ["awkward", "Attempted path"] },
];

const rgbOf = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};
const hasColor = (markup, hex) => {
  const lower = markup.toLowerCase();
  return lower.includes(hex.toLowerCase()) || lower.includes(rgbOf(hex));
};

const assertThemeColour = (doc, theme) => {
  const expected = theme === "light" ? "#f2f5f9" : "#07090e";
  const metas = [...doc.querySelectorAll('meta[name="theme-color"]')];
  assert.ok(metas.length >= 1, "theme-color metadata is missing");
  for (const meta of metas) {
    assert.equal(meta.getAttribute("content"), expected, "theme-color is not synchronised");
    assert.equal(meta.hasAttribute("media"), false, "conflicting theme-color media condition remains");
  }
};

function makeWindow(theme, errors, {
  mockGitHub = false, finePointer = false, reducedMotion = false,
  clipboard = "ok", instrument = false, mobileWidth = false, savedTheme = true, osTheme = "dark",
} = {}) {
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => errors.push(`jsdomError: ${e.stack || e.message}`));
  vc.on("error", (...args) => errors.push(`console.error: ${args.join(" ")}`));

  const dom = new JSDOM(html, {
    url: PREVIEW_URL,
    runScripts: "outside-only",
    pretendToBeVisual: true,
    virtualConsole: vc,
  });
  const { window } = dom;

  if (savedTheme) window.localStorage.setItem("lavi-theme", theme);
  // jsdom has no real canvas backend: provide a minimal 2D context so the
  // particle field can be exercised without a "Not implemented" jsdomError.
  const fakeCtx = {
    clearRect() {}, beginPath() {}, arc() {}, fill() {}, setTransform() {},
    fillStyle: "#000",
  };
  window.HTMLCanvasElement.prototype.getContext = () => fakeCtx;

  // Deterministic clipboard + external-open stubs (jsdom implements neither).
  window.__copied = [];
  window.__opened = [];
  Object.defineProperty(window.navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: (text) => {
        if (clipboard === "fail") return Promise.reject(new Error("clipboard denied"));
        window.__copied.push(text);
        return Promise.resolve();
      },
    },
  });
  window.open = (href) => { window.__opened.push(href); return {}; };

  if (instrument) {
    window.__listenerCounts = {};
    const add = window.addEventListener.bind(window);
    const remove = window.removeEventListener.bind(window);
    window.addEventListener = (type, ...rest) => {
      window.__listenerCounts[type] = (window.__listenerCounts[type] || 0) + 1;
      return add(type, ...rest);
    };
    window.removeEventListener = (type, ...rest) => {
      window.__listenerCounts[type] = (window.__listenerCounts[type] || 0) - 1;
      return remove(type, ...rest);
    };
  }
  let systemDark = osTheme === "dark";
  const mediaQueries = [];
  window.matchMedia = (media = "") => {
    const listeners = new Set();
    const query = {
      get matches() {
        return (finePointer && media.includes("pointer: fine")) ||
          (reducedMotion && media.includes("prefers-reduced-motion")) ||
          (systemDark && media.includes("prefers-color-scheme: dark"));
      },
      media, onchange: null,
      addEventListener(type, callback) { if (type === "change") listeners.add(callback); },
      removeEventListener(type, callback) { if (type === "change") listeners.delete(callback); },
      addListener(callback) { listeners.add(callback); },
      removeListener(callback) { listeners.delete(callback); },
      dispatchEvent: () => false,
    };
    mediaQueries.push({ query, listeners });
    return query;
  };
  window.__themeMediaListenerCount = () => mediaQueries.reduce((count, { query, listeners }) =>
    count + (query.media.includes("prefers-color-scheme: dark") ? listeners.size : 0), 0);
  window.__setOSTheme = (next) => {
    systemDark = next === "dark";
    for (const { query, listeners } of mediaQueries) {
      if (!query.media.includes("prefers-color-scheme: dark")) continue;
      for (const listener of listeners) listener({ matches: query.matches, media: query.media });
    }
  };
  window.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; }
    // With mocked live data, fire immediately so Contributions renders too.
    observe() { if (mockGitHub) this.callback([{ isIntersecting: true }]); }
    unobserve() {} disconnect() {} takeRecords() { return []; }
  };
  // Keep the test offline & deterministic; the components have their own
  // graceful "data unavailable" states.
  window.fetch = mockGitHub
    ? (url) => {
        const href = String(url);
        const ok = (data) =>
          Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
        if (href.includes("/repos")) {
          return ok([
            { name: "SaBuddy", html_url: "https://github.com/hmmlavi/SaBuddy", language: "Kotlin", stargazers_count: 3, forks_count: 1, fork: false, updated_at: "2026-01-01", description: null },
            { name: "partial-record", html_url: "https://example.test", fork: false },
            null,
            { fork: true },
          ]);
        }
        if (href.includes("api.github.com/users/")) {
          return ok({ login: "hmmlavi", name: null, avatar_url: "", html_url: "https://github.com/hmmlavi", bio: null, public_repos: 13, followers: 5, following: 2 });
        }
        // A valid graph response; malformed repository records above are ignored.
        return ok({
          total: { lastYear: 100 },
          contributions: [
            { date: "2026-11-01", count: 2, level: 2 },
            { date: "2026-11-02", count: 0, level: 0 },
            { date: "2026-11-03", count: 1, level: 1 },
          ],
        });
      }
    : () => Promise.reject(new Error("offline in smoke test"));
  window.scrollTo = () => {};
  window.addEventListener("error", (e) =>
    errors.push(`window.error: ${e.error?.stack || e.message}`));
  window.addEventListener("unhandledrejection", (e) =>
    errors.push(`unhandledrejection: ${e.reason}`));

  if (mobileWidth) {
    Object.defineProperty(window, "innerWidth", { value: 390, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 780, configurable: true });
  }

  // Execute the exact inline scripts from the production single-file build:
  // (1) the pre-paint theme bootstrap, (2) the bundled application.
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 2, "expected theme bootstrap + bundled app scripts");
  for (const [, code] of scripts) window.eval(code);

  return dom;
}

const tick = (ms = 40) => new Promise((resolve) => setTimeout(resolve, ms));

function checkHome(doc, root, theme) {
  const text = root.textContent ?? "";
  const markup = root.innerHTML ?? "";

  // 1. The three flagship builds are the only projects on Home.
  for (const label of SPOTLIGHT_LABELS) {
    assert.ok(text.includes(label), `[${theme}] Home: missing flagship ${label}`);
  }
  assert.ok(!text.includes("SaBuddy") && !text.includes("Veylo"),
    `[${theme}] Home: SaBuddy/Veylo still over-promoted on Home`);
  const cards = [...doc.querySelectorAll("[data-spotlight]")];
  assert.equal(cards.length, 3, `[${theme}] Home: expected 3 flagship cards`);
  for (let i = 0; i < cards.length; i++) {
    assert.equal(cards[i].getAttribute("data-spotlight"), SPOTLIGHT_LABELS[i],
      `[${theme}] Home: flagship ${i} out of priority order`);
    assert.equal(cards[i].getAttribute("href"), SPOTLIGHT_REPOS[i],
      `[${theme}] Home: flagship ${i} has no direct repo link`);
    assert.equal(cards[i].getAttribute("target"), "_blank",
      `[${theme}] Home: flagship ${i} link should open the repository`);
    assert.ok(cards[i].querySelector("img[src^='/projects/']"),
      `[${theme}] Home: flagship ${i} has no real screenshot`);
    assert.ok(cards[i].textContent.includes("view repository"),
      `[${theme}] Home: flagship ${i} has no repository CTA`);
  }

  // 2. The hero's right-side panel is personal and interactive, never a project showcase.
  const interestPanel = doc.querySelector("[data-hero-interest-panel]");
  assert.ok(interestPanel, "interactive interests panel is missing from the hero");
  assert.equal(interestPanel.querySelectorAll("[data-interest-tab]").length, 4,
    "hero interests panel should have four topic controls");
  assert.ok(!interestPanel.textContent.includes("Sortify"), "a project name leaked into the hero identity panel");
  assert.ok(!doc.querySelector("[data-featured-build]"), "old featured-project showcase is still in the hero");
  assert.equal(doc.querySelector("[data-identity-rotator]"), null, "the replaced generic identity rotator returned");
  assert.ok(!doc.querySelector("main h1")?.textContent.includes("Sortify"), "Sortify is still associated with the owner's name");
  // Verified statistics only: counted from PROJECTS, no open-ended figures.
  for (const label of ["Public projects", "Web builds", "Kotlin Android app"]) {
    assert.ok(text.includes(label), `[${theme}] Home: verified statistic ${label} missing`);
  }
  assert.ok(!text.includes("Ideas to Build"), `[${theme}] Home: meaningless statistic returned`);
  assert.ok(text.includes("Open to internships"), `[${theme}] Home: availability label missing`);

  // 3. CTA: both actions in ONE explicit horizontal row, balanced sizing.
  const row = doc.querySelector("[data-cta-row]");
  assert.ok(row, `[${theme}] Home: CTA row missing`);
  assert.ok((row.getAttribute("class") || "").includes("flex-row"),
    `[${theme}] Home: CTA buttons are not in a horizontal row`);
  assert.equal(doc.defaultView.getComputedStyle(row).display, "flex",
    `[${theme}] Home: CTA row is not actually a flex row`);
  const actions = [...row.querySelectorAll("a")];
  assert.equal(actions.length, 2, `[${theme}] Home: CTA should have exactly 2 actions`);
  assert.equal(actions[0].getAttribute("href"), "#/contact",
    `[${theme}] Home: Contact destination changed`);
  assert.match(actions[1].getAttribute("href") || "", /^https:\/\//,
    `[${theme}] Home: Résumé destination changed`);
  for (const a of actions) {
    assert.ok((a.getAttribute("class") || "").includes("h-14"),
      `[${theme}] Home: CTA button heights are inconsistent`);
    assert.ok((a.getAttribute("class") || "").includes("inline-flex"),
      `[${theme}] Home: CTA button alignment is inconsistent`);
  }
  assert.ok(text.includes("Let's build something") && text.includes("Contact me") && text.includes("Open résumé folder"),
    `[${theme}] Home: CTA content is missing or mislabelled`);
  assert.ok(!text.includes("Let's create the"), `[${theme}] Home: generic CTA wording returned`);

  // 4. Colour variety — several complementary hues, consistent per theme.
  const hues = theme === "dark" ? DARK_HUES : LIGHT_HUES;
  const found = hues.filter((hex) => hasColor(markup, hex));
  assert.ok(found.length >= 4,
    `[${theme}] Home: only ${found.length} complementary hues in use (${found.join(", ")})`);
  assert.ok(hasColor(markup, theme === "dark" ? DARK_HUES[3] : LIGHT_HUES[3]),
    `[${theme}] Home: reddish Contact accent missing`);

  // 5. New interactions + no broken links.
  assert.ok(doc.querySelectorAll("[data-scroll-reveal]").length >= 5,
    `[${theme}] Home: scroll reveals missing`);
  assert.ok(doc.querySelectorAll(".spotlight-card").length >= 8,
    `[${theme}] Home: interactive cards missing`);
  assert.ok(doc.querySelectorAll(".ui-tech-tile").length >= 3,
    `[${theme}] Home: technology tiles missing`);
  assert.match(html, /@media\s*\(\s*hover\s*:\s*hover\s*\)\s*and\s*\(\s*pointer\s*:\s*fine\s*\)/,
    "hover interactions are not gated to hover-capable pointers");
  const reducedAt = html.indexOf("@media(prefers-reduced-motion:reduce)");
  assert.ok(reducedAt >= 0, "reduced-motion media query missing");
  const reduced = html.slice(reducedAt, reducedAt + 800);
  assert.match(reduced, /animation-duration:\.01ms!important/, "reduced motion does not neutralise animations");
  assert.match(reduced, /\[data-scroll-reveal\]\{animation:none!important\}/, "reduced motion does not disable scroll reveals");
  assert.match(html, /@media\s*\(hover:hover\)\s*and\s*\(pointer:fine\)\s*\{[^}]*\.spotlight-card:hover/,
    "project-card hover is not gated to hover-capable pointers");
  assert.match(html, /@keyframes reveal-up/, "scroll-reveal keyframes missing");

  // Responsive layout: one column on phones, three on desktop, compact stack.
  const featured = cards[0].closest(".grid");
  assert.match(featured.getAttribute("class") || "", /grid-cols-1/,
    `[${theme}] Home: featured grid has no mobile column`);
  assert.match(featured.getAttribute("class") || "", /lg:grid-cols-3/,
    `[${theme}] Home: featured grid has no desktop columns`);
  assert.match(row.getAttribute("class") || "", /flex-wrap/,
    `[${theme}] Home: CTA row cannot wrap on narrow screens`);
  // The replacement panel occupies the hero's responsive right column.
  const showcase = doc.querySelector("[data-hero-interest-panel]");
  assert.ok(showcase, `[${theme}] Home: interactive interest panel missing`);
  const heroGrid = showcase.closest(".grid");
  assert.match(heroGrid.getAttribute("class") || "", /lg:grid-cols-12/,
    `[${theme}] Home: hero grid lost its responsive layout`);
}

function checkProjects(doc, root, theme) {
  const titles = [...doc.querySelectorAll("article h2")].map((h) => h.textContent.trim());
  assert.deepEqual(titles.slice(0, 3), ["Sortify", "Pustakalaya LMS", "FacilityFix"],
    `[${theme}] Projects: flagship builds are not prioritised first`);
  assert.equal(titles.length, 7, `[${theme}] Projects: a project was removed`);
  assert.ok(titles.includes("SaBuddy") && titles.includes("Veylo"),
    `[${theme}] Projects: SaBuddy/Veylo were removed from the archive`);
  const badges = [...doc.querySelectorAll("article span")].filter((s) => s.textContent.trim() === "flagship");
  assert.equal(badges.length, 3, `[${theme}] Projects: expected 3 flagship badges`);
  assert.ok(doc.querySelectorAll("article img[src^='/projects/']").length >= 3,
    `[${theme}] Projects: real screenshots missing from flagship cards`);

  // The hero-label cleanup must never alter the real Sortify archive entry.
  const sortify = [...doc.querySelectorAll("article")].find((card) =>
    card.querySelector("h2")?.textContent.trim() === "Sortify");
  assert.ok(sortify, `[${theme}] Projects: original Sortify card is missing`);
  assert.ok(sortify.textContent.includes("Safe, reviewable file renaming for Windows."),
    `[${theme}] Projects: Sortify tagline changed`);
  assert.ok(sortify.textContent.includes("A Windows desktop app that reads supported files"),
    `[${theme}] Projects: Sortify description changed`);
  assert.ok(sortify.querySelector('img[src="/projects/sortify-desktop.webp"]'),
    `[${theme}] Projects: Sortify screenshot changed`);
  for (const tag of ["Python", "PySide6", "SQLite", "Inno Setup", "Windows"]) {
    assert.ok(sortify.textContent.includes(tag), `[${theme}] Projects: Sortify technology ${tag} is missing`);
  }
  assert.ok(sortify.querySelector('a[href="https://github.com/hmmlavi/sortify-desktop"]'),
    `[${theme}] Projects: Sortify repository link changed`);
  assert.ok(sortify.querySelector('a[href="#/projects/sortify-desktop"]'),
    `[${theme}] Projects: Sortify case-study link changed`);
}

async function runTheme(theme) {
  const errors = [];
  const dom = makeWindow(theme, errors);
  const { window } = dom;
  const doc = window.document;
  await tick(80);
  assert.equal(doc.querySelectorAll('meta[name="theme-color"]').length, 1, "production metadata must not be duplicated");
  assertThemeColour(doc, theme);

  const expectedDark = theme === "dark" ? DARK_ACCENT : LIGHT_ACCENT;
  const unexpectedDark = theme === "dark" ? LIGHT_ACCENT : DARK_ACCENT;

  try {
    for (const route of ROUTES) {
      if (route.hash) {
        window.location.hash = route.hash;
        window.dispatchEvent(new window.Event("hashchange"));
      }
      await tick();

      const root = doc.getElementById("root");
      const text = root?.textContent ?? "";
      const markup = root?.innerHTML ?? "";

      assert.ok(root && root.childElementCount > 0,
        `[${theme}] ${route.name}: #root is empty (blank screen)`);
      assert.ok(text.length > 200,
        `[${theme}] ${route.name}: rendered text too short (${text.length})`);
      for (const needle of route.expect) {
        assert.ok(text.includes(needle),
          `[${theme}] ${route.name}: missing content ${JSON.stringify(needle)}`);
      }
      assert.ok(!text.includes("Error: #root element not found"),
        `[${theme}] ${route.name}: fallback root error rendered`);

      // The palette fix must produce theme-correct colours on every page.
      assert.ok(hasColor(markup, expectedDark),
        `[${theme}] ${route.name}: missing ${theme} accent ${expectedDark}`);
      assert.ok(!hasColor(markup, unexpectedDark),
        `[${theme}] ${route.name}: leaked ${theme === "dark" ? "light" : "dark"} accent ${unexpectedDark}`);

      // The whole shell follows theme tokens (the old build hard-coded a dark
      // background here, which broke every light-mode page).
      const shell = doc.querySelector(".site-shell");
      assert.ok(shell && (shell.getAttribute("style") || "").includes("var(--site-bg)"),
        `[${theme}] ${route.name}: page shell is not theme-reactive`);
      assert.ok(!markup.includes("#bebebe") && !markup.includes("bg-[#e8e8ed]"),
        `[${theme}] ${route.name}: hard-coded neumorphic light styling still present`);

      // Exactly one solid circular cursor + one soft diffused aura. No ring,
      // no second dot, no trailing shapes.
      const dotLayers = [...doc.querySelectorAll(".cursor-dot")];
      const auraLayers = [...doc.querySelectorAll(".cursor-aura")];
      assert.equal(dotLayers.length, 1, `[${theme}] ${route.name}: expected exactly one cursor dot`);
      assert.equal(auraLayers.length, 1, `[${theme}] ${route.name}: expected exactly one soft aura`);
      assert.equal(doc.querySelectorAll(".cursor-glow, .cursor-ring, .cursor-trail").length, 0,
        `[${theme}] ${route.name}: extra cursor shapes are back`);
      assert.equal(dotLayers[0].getAttribute("data-cursor-part"), "dot");
      assert.equal(auraLayers[0].getAttribute("data-cursor-part"), "aura");

      // Desktop pill nav: nine correct destinations, one active state.
      const pill = doc.querySelector(".ui-nav");
      assert.ok(pill, `[${theme}] ${route.name}: desktop pill nav missing`);
      const pillLinks = [...pill.querySelectorAll("a")];
      assert.equal(pillLinks.length, 9,
        `[${theme}] ${route.name}: desktop nav should have 9 links`);
      for (let i = 0; i < NAV_HREFS.length; i++) {
        const link = pillLinks[i];
        assert.equal(link.getAttribute("href"), NAV_HREFS[i],
          `[${theme}] ${route.name}: nav destination ${i} is wrong`);
        assert.equal(link.textContent.trim(), NAV_LABELS[i],
          `[${theme}] ${route.name}: nav label ${i} is wrong`);
      }
      const href = route.hash || "#/";
      if (NAV_HREFS.includes(href)) {
        const desktopActive = pill.querySelectorAll('a[aria-current="page"]');
        assert.equal(desktopActive.length, 1,
          `[${theme}] ${route.name}: expected one active desktop nav item`);
        assert.equal(desktopActive[0].getAttribute("href"), href,
          `[${theme}] ${route.name}: wrong active nav item`);
        assert.ok([...doc.querySelectorAll('a[aria-current="page"]')]
          .some((a) => a.getAttribute("href") === href),
          `[${theme}] ${route.name}: mobile menu active state missing`);
      }

      if (route.hash === "#/contact") {
        assert.ok(markup.includes("var(--contact)"),
          `[${theme}] Contact: reddish accent identity missing`);
        assert.ok(markup.includes("ui-btn-contact"),
          `[${theme}] Contact: reddish primary action missing`);
      }
      // Every route: no broken links or empty image sources.
      for (const a of doc.querySelectorAll("#root a[href]")) {
        const href = a.getAttribute("href") || "";
        assert.match(href, /^(#main$|#\/|https?:\/\/|mailto:)/,
          `[${theme}] ${route.name}: broken link ${JSON.stringify(href)}`);
      }
      for (const img of doc.querySelectorAll("#root img[src]")) {
        assert.ok((img.getAttribute("src") || "").length > 1,
          `[${theme}] ${route.name}: empty image source`);
      }

      if (route.hash === "" || route.hash === "#/") checkHome(doc, root, theme);
      if (route.hash === "#/projects") checkProjects(doc, root, theme);
      if (route.hash === "#/skills") {
        const tiles = [...doc.querySelectorAll("[data-tech]")];
        assert.ok(tiles.length >= 30,
          `[${theme}] Skills: only ${tiles.length} technology logos rendered`);
        for (const name of ["Python", "React", "PostgreSQL", "Kotlin", "Git"]) {
          assert.ok(tiles.some((t) => t.getAttribute("data-tech") === name && t.querySelector("svg")),
            `[${theme}] Skills: missing accurate logo for ${name}`);
        }
      }
    }

    // Theme plumbing + the real navbar toggle (not just a pre-set preference).
    window.location.hash = "#/";
    window.dispatchEvent(new window.Event("hashchange"));
    await tick();
    assert.equal(doc.documentElement.dataset.theme, theme,
      `[${theme}] <html data-theme> not applied`);
    const flipped = theme === "dark" ? "light" : "dark";
    const toggledColor = flipped === "dark" ? DARK_ACCENT : LIGHT_ACCENT;
    const originalColor = theme === "dark" ? DARK_ACCENT : LIGHT_ACCENT;

    let toggle = doc.querySelector('button[aria-label^="Switch to "]');
    assert.ok(toggle, `[${theme}] theme toggle button missing`);
    toggle.click();
    await tick(60);
    assert.equal(doc.documentElement.dataset.theme, flipped,
      `[${theme}] toggle did not switch theme`);
    assert.equal(window.localStorage.getItem("lavi-theme"), flipped,
      `[${theme}] toggle did not persist theme`);
    assertThemeColour(doc, flipped);
    let flippedMarkup = doc.getElementById("root").innerHTML;
    assert.ok(hasColor(flippedMarkup, toggledColor),
      `[${theme}] ${flipped} accent missing after toggle`);
    assert.ok(!hasColor(flippedMarkup, originalColor),
      `[${theme}] old ${theme} accent leaked after toggle`);

    toggle = doc.querySelector('button[aria-label^="Switch to "]');
    toggle?.click();
    await tick(60);
    assert.equal(doc.documentElement.dataset.theme, theme,
      `[${theme}] toggle did not switch back`);
    assertThemeColour(doc, theme);

    assert.deepEqual(errors, [], `[${theme}] browser console errors`);
    console.log(`  ✓ ${theme} theme: ${ROUTES.length} routes + theme toggle rendered, 0 console errors`);
  } finally {
    dom.window.close();
  }
}

// The app ships no iframe at all: the "vr / ambient-light-sensor / battery /
// sandbox" feature-policy warnings come from the preview iframe that embeds
// this single-file build, not from application code.
assert.doesNotMatch(html, /<iframe\b/i, "unexpected <iframe> in built app");
assert.doesNotMatch(html, /\ballow\s*=/i, "unexpected allow= feature policy in built app");
assert.doesNotMatch(html, /\bsandbox\s*=/i, "unexpected sandbox= attribute in built app");
console.log("  ✓ built HTML contains no iframe / allow / sandbox configuration");

async function runSystemThemeMetadata() {
  for (const osTheme of ["light", "dark"]) {
    const errors = [];
    const dom = makeWindow("dark", errors, { savedTheme: false, osTheme });
    const { window } = dom;
    const doc = window.document;
    try {
      await tick(100);
      assert.equal(doc.documentElement.dataset.theme, osTheme, `OS ${osTheme} was not used without a saved choice`);
      assertThemeColour(doc, osTheme);
      assert.equal(window.localStorage.getItem("lavi-theme"), null, "system fallback must not become an explicit saved choice");
      await settleGesture(() => {}, () => window.__themeMediaListenerCount() > 0);
      assert.ok(window.__themeMediaListenerCount() > 0, "theme media listener was not mounted");

      const changed = osTheme === "dark" ? "light" : "dark";
      window.__setOSTheme(changed);
      await tick(80);
      assert.equal(doc.documentElement.dataset.theme, changed, "live OS theme change was not applied");
      assertThemeColour(doc, changed);
      assert.equal(window.localStorage.getItem("lavi-theme"), null);

      // Even if another script adds a conflicting tag, the hook synchronises
      // every relevant tag rather than updating only the first one.
      const duplicate = doc.createElement("meta");
      duplicate.setAttribute("name", "theme-color");
      duplicate.setAttribute("content", "#000000");
      duplicate.setAttribute("media", "(prefers-color-scheme: dark)");
      doc.head.appendChild(duplicate);
      doc.querySelector('button[aria-label^="Switch to "]').click();
      await tick(80);
      const explicit = changed === "dark" ? "light" : "dark";
      assert.equal(doc.documentElement.dataset.theme, explicit);
      assert.equal(window.localStorage.getItem("lavi-theme"), explicit);
      assertThemeColour(doc, explicit);

      window.__setOSTheme(osTheme);
      await tick(80);
      assert.equal(doc.documentElement.dataset.theme, explicit, "OS changes must not override an explicit selection");
      assertThemeColour(doc, explicit);
      assert.deepEqual(appErrors(errors), []);
    } finally { window.close(); }
  }
  console.log("  ✓ theme-color: explicit light/dark, system light/dark, live OS changes and duplicate-tag synchronisation");
}

async function runHeroCuriosity() {
  for (const [theme, reducedMotion] of [["dark", false], ["light", true]]) {
    const errors = [];
    const dom = makeWindow(theme, errors, { reducedMotion });
    const { window } = dom, doc = window.document;
    try {
      await tick(100);
      const panel = doc.querySelector("[data-hero-interest-panel]");
      const tabs = [...(panel?.querySelectorAll("[data-interest-tab]") ?? [])];
      assert.ok(panel, `${theme}: interactive interests panel missing`);
      assert.equal(tabs.length, 4, "interests panel must have four topic controls");
      assert.equal(panel.querySelector("[data-interest-title]")?.textContent.trim(), "AI & ideas");
      assert.match(panel.querySelector("[data-interest-detail]")?.textContent ?? "", /thoughtful AI/);
      assert.equal(tabs[0].getAttribute("aria-pressed"), "true");
      tabs[1].click();
      await tick(60);
      assert.equal(tabs[1].getAttribute("aria-pressed"), "true");
      assert.equal(panel.querySelector("[data-interest-title]")?.textContent.trim(), "Space");
      assert.match(panel.querySelector("[data-interest-detail]")?.textContent ?? "", /distant worlds/);
      assert.equal(tabs[0].getAttribute("aria-pressed"), "false");
      tabs[3].click();
      await tick(60);
      assert.equal(panel.querySelector("[data-interest-title]")?.textContent.trim(), "Games & worlds");
      assert.equal(tabs[3].getAttribute("aria-pressed"), "true");
      assert.deepEqual(appErrors(errors), []);
    } finally { window.close(); }
  }
  console.log("  ✓ hero interests panel: both themes, topic selection, accessible pressed state and no project promotion");
}

async function runMockGitHub() {
  const errors = [];
  const dom = makeWindow("dark", errors, { mockGitHub: true });
  try {
    dom.window.location.hash = "#/github";
    dom.window.dispatchEvent(new dom.window.Event("hashchange"));
    await tick(120);
    const root = dom.window.document.getElementById("root");
    const text = root?.textContent ?? "";
    assert.ok(root && root.childElementCount > 0, "GitHub page is blank with live data");
    assert.ok(text.includes("GitHub Activity"), "GitHub section missing");
    assert.match(root.querySelector("h1")?.textContent ?? "", /GitHub Activity/, "GitHub page needs a primary heading");
    assert.ok(text.includes("SaBuddy"), "valid GitHub repo not rendered");
    assert.ok(text.includes("contributions in the"), "contribution graph not rendered");
    assert.match(text, /Stars across fetched repositories/, "star figure is mislabelled");
    assert.match(text, /Top 1 of 1 fetched repository with a detected language/,
      "language denominator is not stated");
    assert.match(text, /100\.0%/, "language share is not computed from classified repositories");
    assert.match(text, /Recently updated repositories/, "recent repositories are mislabelled");
    assert.deepEqual(errors, [], "console errors while rendering live GitHub data");
    console.log("  ✓ GitHub page renders malformed API data safely (0 console errors)");
  } finally {
    dom.window.close();
  }
}

async function runCursor() {
  const errors = [];
  const dom = makeWindow("dark", errors, { finePointer: true });
  const { window } = dom;
  const doc = window.document;
  try {
    await tick(80);
    await settleGesture(() => {}, () => doc.documentElement.classList.contains("has-custom-cursor"));
    assert.ok(doc.documentElement.classList.contains("has-custom-cursor"),
      "custom cursor not enabled on a fine pointer");

    const dot = doc.querySelector(".cursor-dot");
    const aura = doc.querySelector(".cursor-aura");
    assert.ok(dot && aura, "cursor dot or aura not rendered");
    assert.ok(!doc.querySelector(".cursor-glow"), "no third cursor layer is allowed");
    assert.equal(doc.defaultView.getComputedStyle(dot).borderRadius, "9999px",
      "cursor must be a solid circle");
    assert.ok(doc.defaultView.getComputedStyle(aura).background.includes("radial-gradient"),
      "aura must be a diffused background wash, not an outline ring");

    window.dispatchEvent(new window.MouseEvent("mousemove", { clientX: 220, clientY: 140 }));
    await tick(120);
    assert.ok(doc.documentElement.classList.contains("cursor-active"),
      "cursor layers did not become visible on pointer move");
    assert.match(dot.style.transform, /translate3d\(/, "dot is not transform-driven");
    assert.match(aura.style.transform, /translate3d\(/, "aura is not transform-driven");
    assert.match(aura.style.transform, /translate3d\(/, "aura does not follow the pointer");

    const link = doc.querySelector('a[href="#/about"]');
    assert.ok(link, "no interactive element for hover feedback");
    link.dispatchEvent(new window.MouseEvent("pointerover", { bubbles: true }));
    await tick(120);
    assert.ok(doc.documentElement.classList.contains("cursor-hover"),
      "no hover feedback on interactive elements");
    dot.ownerDocument.body.dispatchEvent(new window.MouseEvent("pointerover", { bubbles: true }));
    await tick(120);
    assert.ok(!doc.documentElement.classList.contains("cursor-hover"),
      "hover feedback did not reset");
    assert.deepEqual(errors, [], "console errors from custom cursor");
    console.log("  ✓ cursor: one solid dot + soft aura, hover feedback, rAF transforms (0 console errors)");
  } finally {
    dom.window.close();
  }
}

async function runCursorDisabled() {
  for (const [name, opts] of [
    ["touch / coarse pointer", {}],
    ["reduced motion", { finePointer: true, reducedMotion: true }],
  ]) {
    const errors = [];
    const dom = makeWindow("dark", errors, opts);
    try {
      await tick(60);
      assert.ok(!dom.window.document.documentElement.classList.contains("has-custom-cursor"),
        `custom cursor should be disabled for ${name}`);
      assert.ok(dom.window.document.querySelector(".cursor-dot"),
        `cursor layers should still be inert for ${name}`);
      assert.deepEqual(errors, [], `console errors for ${name}`);
    } finally {
      dom.window.close();
    }
  }
  console.log("  ✓ cursor: disabled on touch devices and with reduced motion");
}

async function runHomeInteractions() {
  const errors = [];
  const dom = makeWindow("dark", errors, { finePointer: true });
  const { window } = dom, doc = window.document;
  // Fire the observer with a real target so scroll reveals actually transition.
  window.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; }
    observe(el) { this.cb([{ target: el, isIntersecting: true, intersectionRatio: 1 }], this); }
    unobserve() {} disconnect() {} takeRecords() { return []; }
  };
  try {
    await settleGesture(() => {}, () => { const nodes = [...doc.querySelectorAll("[data-scroll-reveal]")]; return nodes.length >= 5 && nodes.every(r => r.getAttribute("data-scroll-reveal") === "visible"); });
    const reveals = [...doc.querySelectorAll("[data-scroll-reveal]")];
    assert.ok(reveals.length >= 5, "no scroll-reveal wrappers on Home");
    assert.ok(reveals.every((r) => r.getAttribute("data-scroll-reveal") === "visible"),
      "scroll reveals did not activate when observed");
    assert.match(doc.querySelector("[data-scroll-reveal]").getAttribute("style") || "",
      /animation-delay/, "staggered reveal delay missing");

    const wrap = doc.querySelector("[data-cta-row] > div");
    assert.ok(wrap, "CTA button is not wrapped in Magnetic");
    wrap.dispatchEvent(new window.MouseEvent("mousemove", { bubbles: true, clientX: 40, clientY: 25 }));
    await tick(40);
    assert.match(wrap.style.transform, /translate\(/, "CTA magnetic hover did not respond");
    // React synthesises mouseleave from mouseout, so dispatch the native pair.
    wrap.dispatchEvent(new window.MouseEvent("mouseout", { bubbles: true, relatedTarget: doc.body }));
    wrap.dispatchEvent(new window.MouseEvent("mouseleave", { bubbles: true }));
    await tick(40);
    assert.match(wrap.style.transform, /translate\(0px, 0px\)/, "CTA magnetic hover did not reset");

    // Screenshot -> social preview -> typographic fallback (no broken <img>).
    const card = doc.querySelector("[data-spotlight]");
    const first = card.querySelector("img");
    assert.ok(first && first.getAttribute("src").startsWith("/projects/"), "flagship card has no screenshot");
    first.dispatchEvent(new window.Event("error"));
    await tick(50);
    const second = card.querySelector("img");
    assert.ok(second && second.getAttribute("src").startsWith("https://opengraph.githubassets.com/"),
      "screenshot failure did not fall back to the repository preview");
    second.dispatchEvent(new window.Event("error"));
    await tick(50);
    assert.ok(!card.querySelector("img"), "broken image remained after both sources failed");
    assert.ok(card.querySelector(".font-anton"), "no typographic fallback after both images failed");
    assert.ok(card.textContent.includes("Sortify Desktop"), "card content disappeared with its image");

    // The right-side hero panel is interactive and contains no featured project.
    const panel = doc.querySelector("[data-hero-interest-panel]");
    assert.ok(panel, "interactive hero panel missing");
    const space = panel.querySelector('[data-interest-tab="02"]');
    click(window, space);
    await tick(60);
    assert.equal(panel.querySelector("[data-interest-title]").textContent.trim(), "Space");
    assert.ok(!panel.textContent.includes("Sortify"), "Sortify still appears in the hero side panel");

    assert.deepEqual(errors, [], "console errors during Home interactions");
    console.log("  ✓ Home interactions: reveals, magnetic hover/reset, image fallback chain (0 console errors)");
  } finally {
    dom.window.close();
  }
}

// ─────────────────────── NEW-FEATURE HARNESS ───────────────────────

/** Native value setter so React's controlled inputs see a real change. */
function setField(window, el, value) {
  const proto = el.tagName === "TEXTAREA"
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
  el.dispatchEvent(new window.Event("input", { bubbles: true }));
}
const click = (window, el) => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const keyDown = (window, key, opts = {}) =>
  window.dispatchEvent(new window.KeyboardEvent("keydown", { key, bubbles: true, ...opts }));
/** jsdom has no mail client: a mailto handoff reports "Not implemented:
 *  navigation". That is an environment limitation, not an application error. */
const appErrors = (errors) => errors.filter((e) => !/Not implemented: navigation/.test(e));
/** React effects commit asynchronously in jsdom; retry a pointer gesture a few
 *  times so a slow mount is not reported as a broken interaction. The final
 *  assertion is unchanged: the gesture must produce its feedback. */
async function settleGesture(action, check, tries = 4) {
  for (let i = 0; i < tries && !check(); i++) {
    action();
    await tick(200);
  }
}

async function runDirectHome() {
  const errors = [];
  const dom = makeWindow("dark", errors);
  try {
    await tick(200);
    assert.ok(dom.window.document.querySelector("main#main h1"), "Home must render directly");
    assert.ok(!dom.window.document.querySelector("[data-intro-globe]"), "removed overlay must not render");
    assert.deepEqual(appErrors(errors), []);
  } finally { dom.window.close(); }
}

async function runPortfolioEnhancements() {
  for (const theme of ["dark", "light"]) {
    const errors = [];
    const dom = makeWindow(theme, errors, { mobileWidth: true });
    const { window } = dom, doc = window.document;
    const navigate = async hash => { window.location.hash = hash; window.dispatchEvent(new window.Event("hashchange")); await tick(120); };
    try {
      await navigate("#/projects");
      const search = doc.querySelector("#project-search");
      assert.ok(search);
      const buttons = [...doc.querySelectorAll('button[aria-pressed]')];
      for (const label of ["Web Development", "Desktop Applications", "AI / Machine Learning", "Tools & Utilities", "Other"]) {
        click(window, buttons.find(b => b.textContent === label)); await tick(80);
        assert.ok(doc.querySelectorAll("article h2").length, `${label} should have results`);
      }
      click(window, buttons.find(b => b.textContent === "Desktop Applications")); await tick(80);
      setField(window, search, "sqlite"); await tick(80);
      assert.deepEqual([...doc.querySelectorAll("article h2")].map(e => e.textContent), ["Sortify"]);
      setField(window, search, "no such project"); await tick(80);
      assert.match(doc.body.textContent, /No projects match/);
      click(window, [...doc.querySelectorAll("button")].find(b => b.textContent === "Clear filters")); await tick(80);
      assert.equal(doc.querySelectorAll("article h2").length, 7);
      for (const repo of ["sortify-desktop", "Pustakalaya-LMS", "FacilityFix"]) {
        await navigate(`#/projects/${repo}`);
        assert.ok(doc.querySelector("main h1")); assert.ok(doc.querySelector("main img[src^='/projects/']"));
        assert.equal(doc.querySelector('main a[href="#/projects"]').textContent.includes("Back"), true);
        const graph = doc.querySelector("[data-architecture]");
        const node = graph.querySelector("button[aria-pressed]"); click(window, node); await tick(50);
        assert.equal(node.getAttribute("aria-pressed"), "true");
        click(window, [...graph.querySelectorAll("button")].find(b => b.textContent === "Overview")); await tick(50);
        assert.equal(node.getAttribute("aria-pressed"), "false");
      }
      await navigate("#/quick-view");
      // Empty data must hide the cards instead of showing placeholder updates.
      assert.doesNotMatch(doc.body.textContent, /Currently building/);
      assert.doesNotMatch(doc.body.textContent, /No updates have been published/);
      assert.match(doc.body.textContent, /Complete skill map/, "skills summary link missing");
      assert.doesNotMatch(doc.body.textContent, /Programming Languages: C, C\+\+/, "full skill list repeated");
      assert.ok(doc.querySelector('a[href="https://github.com/hmmlavi"]'));
      const terminal = doc.querySelector("[data-terminal]"); terminal.open = true;
      const input = terminal.querySelector("input");
      async function command(value) { setField(window, input, value); await tick(30); input.closest("form").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })); await tick(50); }
      for (const value of ["HELP", "about", "projects", "skills", "education", "experience", "achievements", "contact", "resume", "github", "sudo", "nope"]) await command(value);
      assert.match(terminal.textContent, /Unknown command/);
      assert.match(terminal.textContent, /Curiosity/);
      assert.ok(window.__opened.some(url => String(url).includes("github.com/hmmlavi")));
      // `contact` must offer a real mail link, `resume` must say it is a folder.
      assert.ok(terminal.querySelector('a[href^="mailto:"]'), "contact command has no actionable mail link");
      assert.ok(terminal.querySelector('a[href^="https://drive.google.com/"]'), "resume command has no folder link");
      assert.match(terminal.textContent, /résumé folder/i, "resume command mislabels the destination");
      input.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true })); await tick(50);
      assert.equal(input.value, "nope");
      input.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true })); await tick(50);
      assert.equal(input.value, "");
      setField(window, input, "educ"); await tick(30);
      input.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true })); await tick(50);
      assert.equal(input.value, "education");
      // Ambiguous prefixes list every match instead of doing nothing.
      setField(window, input, "e"); await tick(30);
      input.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true })); await tick(50);
      const completionButtons = [...terminal.querySelectorAll("button")].map(b => b.textContent);
      assert.ok(completionButtons.includes("education") && completionButtons.includes("experience"),
        "multiple tab matches were not suggested");
      await command("clear"); assert.doesNotMatch(terminal.textContent, /Unknown command/);
      assert.deepEqual(appErrors(errors), []);
    } finally { dom.window.close(); }
  }
  console.log("  ✓ project filters, three case studies, architecture controls and terminal commands in both themes (jsdom)");
}

async function runDiscordCopy() {
  for (const theme of ["dark", "light"]) for (const clipboard of ["ok", "fail"]) {
    const errors = []; const dom = makeWindow(theme, errors, {clipboard, mobileWidth: true});
    const {window} = dom, doc = window.document;
    try {
      window.location.hash = "#/contact"; window.dispatchEvent(new window.Event("hashchange")); await tick(150);
      const row = doc.querySelector("[data-discord-contact]");
      assert.ok(row && row.textContent.includes("hmmlavi"));
      assert.ok(row.querySelector("svg"));
      const button = row.querySelector("[data-copy-discord]"); click(window, button); await tick(120);
      if (clipboard === "ok") { assert.deepEqual(window.__copied, ["hmmlavi"]); assert.match(button.textContent, /Copied!/); }
      else { assert.doesNotMatch(button.textContent, /Copied!/); assert.ok(doc.querySelector('[data-toast="error"]')); }
      assert.deepEqual(appErrors(errors), []);
    } finally { dom.window.close(); }
  }
  console.log("  ✓ Discord username and clipboard success/failure in both themes (jsdom)");
}

async function runMobileMenuAccessibility() {
  const errors = [], dom = makeWindow("dark", errors, {mobileWidth: true});
  const {window} = dom, doc = window.document;
  try {
    await tick(150);
    const menu = doc.querySelector("#mobile-menu"), toggle = doc.querySelector('button[aria-controls="mobile-menu"]');
    assert.ok(menu.hasAttribute("inert")); assert.equal(menu.getAttribute("aria-hidden"), "true");
    click(window, toggle); await tick(120);
    assert.ok(!menu.hasAttribute("inert")); assert.equal(toggle.getAttribute("aria-expanded"), "true");
    assert.ok(menu.contains(doc.activeElement));
    keyDown(window, "Escape"); await tick(120);
    assert.ok(menu.hasAttribute("inert")); assert.equal(doc.activeElement, toggle);
    assert.deepEqual(appErrors(errors), []);
  } finally { dom.window.close(); }
  console.log("  ✓ mobile menu focus, Escape and closed-menu inert state (jsdom)");
}

async function runGitHubFailures() {
  for (const mode of ["rate", "invalid", "offline"]) {
    const errors = []; const dom = makeWindow("dark", errors);
    const { window } = dom;
    window.fetch = () => mode === "offline" ? Promise.reject(new Error("offline")) : Promise.resolve(mode === "rate" ? {ok: false, status: 429} : {ok: true, json: async () => ({bad: true})});
    try {
      window.location.hash = "#/github"; window.dispatchEvent(new window.Event("hashchange")); await tick(150);
      const text = window.document.body.textContent;
      assert.match(text, mode === "rate" ? /rate limit reached/i : mode === "invalid" ? /invalid response/i : /data unavailable/i);
      const retry = [...window.document.querySelectorAll("button")].find(b => b.textContent === "Retry");
      assert.equal(Boolean(retry), mode !== "rate");
      if (retry) { click(window, retry); await tick(100); assert.match(window.document.body.textContent, mode === "invalid" ? /invalid response/i : /data unavailable/i); }
      assert.deepEqual(appErrors(errors), []);
    } finally { dom.window.close(); }
  }
  console.log("  ✓ GitHub rate-limit, invalid-response, network and manual retry states (jsdom)");
}

async function runContributionRetries() {
  const payload = {
    total: { lastYear: 2 },
    contributions: [{ date: "2026-11-01", count: 2, level: 2 }],
  };
  const ok = (data) => Promise.resolve({ ok: true, status: 200, headers: { get: () => null }, json: async () => data });
  const httpError = (status) => Promise.resolve({ ok: false, status, headers: { get: () => null } });
  const installFetch = (window, onGraph) => {
    let graphRequests = 0;
    window.IntersectionObserver = undefined;
    window.fetch = (url) => {
      const href = String(url);
      if (href.includes("jogruber")) {
        graphRequests++;
        return onGraph(graphRequests);
      }
      if (href.includes("/repos")) {
        return ok([{ name: "SaBuddy", html_url: "https://github.com/hmmlavi/SaBuddy", fork: false, stargazers_count: 0, forks_count: 0 }]);
      }
      return ok({ login: "hmmlavi", public_repos: 1, followers: 0, following: 0 });
    };
    return () => graphRequests;
  };
  const openGraph = async (window) => {
    window.location.hash = "#/github";
    window.dispatchEvent(new window.Event("hashchange"));
    await tick(50);
    await settleGesture(() => {}, () => Boolean(window.document.querySelector("[data-graph-state]")));
    assert.ok(window.document.querySelector("[data-graph-state]"), "contribution graph did not mount");
  };

  for (const mode of ["rate", "network"]) {
    const errors = [];
    const dom = makeWindow("dark", errors);
    const { window } = dom;
    const requests = installFetch(window, (attempt) => {
      if (attempt > 1) return ok(payload);
      return mode === "rate" ? httpError(429) : Promise.reject(new Error("temporary connection failure"));
    });
    try {
      await openGraph(window);
      assert.equal(window.document.querySelector("[data-graph-state]")?.getAttribute("data-graph-state"), "loading");
      await tick(850);
      assert.equal(requests(), 2, `${mode}: expected one automatic retry`);
      assert.equal(window.document.querySelector("[data-graph-state]")?.getAttribute("data-graph-state"), "success");
      assert.ok(window.document.querySelector('[role="img"][aria-label*="2 contributions"]'));
      window.document.querySelector('button[aria-label^="Switch to "]').click();
      await tick(80);
      assert.equal(requests(), 2, "a theme re-render triggered another graph request");
      assert.deepEqual(appErrors(errors), []);
    } finally { window.close(); }
  }

  {
    const errors = [];
    const dom = makeWindow("dark", errors);
    const { window } = dom;
    const requests = installFetch(window, () => httpError(404));
    try {
      await openGraph(window);
      await tick(120);
      assert.equal(requests(), 1, "permanent HTTP failure was retried automatically");
      assert.equal(window.document.querySelector("[data-graph-state]")?.getAttribute("data-graph-state"), "error");
      const manual = [...window.document.querySelectorAll("button")].find((button) => button.textContent === "Retry graph");
      assert.ok(manual, "manual graph retry is missing");
      manual.click();
      await tick(120);
      assert.equal(requests(), 2, "manual retry did not issue exactly one new attempt");
      assert.ok(window.document.querySelector('a[href="https://github.com/hmmlavi"]'));
      assert.deepEqual(appErrors(errors), []);
    } finally { window.close(); }
  }

  {
    const errors = [];
    const dom = makeWindow("dark", errors);
    const { window } = dom;
    const requests = installFetch(window, () => httpError(429));
    try {
      await openGraph(window);
      await tick(850);
      assert.equal(requests(), 2, "persistent rate limit caused an unbounded retry loop");
      assert.equal(window.document.querySelector("[data-graph-state]")?.getAttribute("data-graph-state"), "error");
      const manual = [...window.document.querySelectorAll("button")].find((button) => button.textContent === "Retry graph");
      assert.ok(manual, "manual retry after automatic failure is missing");
      manual.click();
      await tick(850);
      assert.equal(requests(), 4, "manual retry should have its own single bounded automatic retry");
      assert.match(window.document.body.textContent, /rate-limiting requests/);
      await tick(250);
      assert.equal(requests(), 4, "graph kept retrying after its bounded attempts");
      assert.deepEqual(appErrors(errors), []);
    } finally { window.close(); }
  }
  console.log("  ✓ contribution graph: success, rate-limit/network retry, permanent failure, manual retry, bounded attempts and stable re-renders");
}

async function runCommandPalette() {
  const errors = [];
  const dom = makeWindow("dark", errors, { finePointer: true, instrument: true });
  const { window } = dom, doc = window.document;
  try {
    await settleGesture(() => {}, () => Boolean(doc.querySelector("[data-open-command]")) &&
      (window.__listenerCounts.keydown ?? 0) >= 1);
    assert.ok(!doc.querySelector("[data-command-palette]"), "palette is open on load");
    const listenersBefore = window.__listenerCounts.keydown ?? 0;
    assert.ok(listenersBefore >= 1, "no global keydown listener registered");

    keyDown(window, "k", { ctrlKey: true });
    await tick(200);
    let panel = doc.querySelector("[data-command-palette]");
    assert.ok(panel, "Ctrl+K did not open the palette");
    const input = panel.querySelector("input");
    assert.ok(input, "search field missing");
    assert.equal(doc.activeElement, input, "search field did not receive focus");
    const tab = new window.KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    window.dispatchEvent(tab);
    assert.ok(tab.defaultPrevented && doc.activeElement === input, "Tab escaped the command dialog");
    for (const label of ["Home", "About", "Skills", "Projects", "Education", "Experience", "Achievements", "Contact"]) {
      assert.ok(panel.textContent.includes(label), `palette missing quick access to ${label}`);
    }
    assert.ok(panel.textContent.includes("Ctrl / ⌘ + K"), "keyboard shortcut hint missing");
    assert.ok(/navigate/.test(panel.textContent) && /select/.test(panel.textContent) && /close/.test(panel.textContent),
      "keyboard navigation hints missing");
    assert.ok(doc.querySelector("[data-open-command]"), "navbar shortcut button missing");

    // Instant filtering.
    setField(window, input, "proj");
    await tick(200);
    let options = [...panel.querySelectorAll('[role="option"]')];
    assert.equal(options.length, 1, `"proj" should match only Projects, got ${options.length}`);
    assert.match(options[0].textContent, /Projects/);

    // Arrow keys move the active option.
    setField(window, input, "");
    await tick(200);
    options = [...panel.querySelectorAll('[role="option"]')];
    assert.ok(options.length >= 13, `expected nav + actions + legal commands, got ${options.length}`);
    assert.ok(options[0].getAttribute("aria-selected") === "true", "first option not active");
    keyDown(window, "ArrowDown"); await tick(200);
    assert.equal(doc.querySelector('[aria-selected="true"]')?.getAttribute("data-command-id"), "nav-about",
      "ArrowDown did not move the selection");
    keyDown(window, "ArrowUp"); await tick(200);
    assert.equal(doc.querySelector('[aria-selected="true"]')?.getAttribute("data-command-id"), "nav-home",
      "ArrowUp did not move the selection");

    // Enter selects and navigates.
    setField(window, input, "achie");
    await tick(200);
    options = [...panel.querySelectorAll('[role="option"]')];
    assert.equal(options.length, 1, "filter to Achievements failed");
    keyDown(window, "Enter");
    await tick(200);
    assert.ok(!doc.querySelector("[data-command-palette]"), "Enter did not close the palette");
    assert.equal(window.location.hash, "#/achievements", "Enter did not navigate to the selected page");

    // Cmd+K, Escape and click-outside dismissal.
    keyDown(window, "k", { metaKey: true }); await tick(200);
    assert.ok(doc.querySelector("[data-command-palette]"), "Cmd+K did not open the palette");
    keyDown(window, "Escape"); await tick(200);
    assert.ok(!doc.querySelector("[data-command-palette]"), "Escape did not close the palette");
    keyDown(window, "k", { ctrlKey: true }); await tick(200);
    const overlay = doc.querySelector("[data-command-palette]");
    overlay.dispatchEvent(new window.MouseEvent("mousedown", { bubbles: true }));
    await tick(200);
    assert.ok(!doc.querySelector("[data-command-palette]"), "click outside did not close the palette");

    // Shortcut toggle and focus restore, with no duplicate listeners.
    keyDown(window, "k", { ctrlKey: true }); await tick(200);
    assert.ok(doc.querySelector("[data-command-palette]"), "second shortcut open failed");
    keyDown(window, "k", { ctrlKey: true }); await tick(200);
    assert.ok(!doc.querySelector("[data-command-palette]"), "repeated shortcut did not toggle closed");
    assert.equal(window.__listenerCounts.keydown, listenersBefore,
      "keydown listeners were duplicated (leak)");

    assert.deepEqual(appErrors(errors), [], "console errors from command palette");
    console.log("  ✓ command palette: Ctrl/Cmd+K, filter, arrows, Enter, Escape, click-outside, no listener leaks");
  } finally { dom.window.close(); }
}

async function runCopyActions() {
  // Success path: real clipboard copy, honest confirmation, auto revert.
  {
    const errors = [];
    const dom = makeWindow("dark", errors, { clipboard: "ok" });
    const { window } = dom, doc = window.document;
    try {
      window.location.hash = "#/contact";
      window.dispatchEvent(new window.Event("hashchange"));
      await tick(200);
      const btn = doc.querySelector("[data-copy-email]");
      assert.ok(btn, "copy-email action missing");
      assert.equal(btn.tagName, "BUTTON");
      assert.equal(btn.getAttribute("type"), "button");
      assert.equal(btn.tabIndex, 0, "copy email must be keyboard-focusable");
      assert.equal(btn.getAttribute("aria-label"), "Copy email address");
      click(window, btn);
      await tick(200);
      assert.equal(btn.getAttribute("data-copy-state"), "copied", "copy state did not change");
      assert.match(btn.textContent, /Copied!/, "no Copied! confirmation");
      assert.equal(btn.getAttribute("aria-label"), "Copy email address", "visual feedback changed the accessible name");
      const live = doc.querySelector("[data-copy-email-status]");
      assert.notEqual(live, btn, "live status must be separate from the button");
      assert.equal(live?.getAttribute("aria-live"), "polite");
      assert.match(live?.textContent || "", /Email address copied/);
      assert.ok(doc.querySelector('[data-toast="success"]'), "no success toast");
      assert.ok(window.__copied.includes("lakshitsinghsaini@gmail.com"), "actual email was not copied");
      await tick(2300);
      assert.equal(btn.getAttribute("data-copy-state"), "idle", "button did not return to its original state");
      assert.match(btn.textContent, /Copy email/);
      assert.equal(btn.getAttribute("aria-label"), "Copy email address");

      const resumeCopy = doc.querySelector("[data-copy-resume]");
      click(window, resumeCopy);
      await tick(200);
      assert.ok(window.__copied.some((v) => v.startsWith("https://drive.google.com/")),
        "résumé link was not copied");
      assert.deepEqual(appErrors(errors), [], "console errors from copy actions");
    } finally { dom.window.close(); }
  }
  // Failure path: a success message must NEVER appear when copy fails.
  {
    const errors = [];
    const dom = makeWindow("light", errors, { clipboard: "fail" });
    const { window } = dom, doc = window.document;
    try {
      window.location.hash = "#/contact";
      window.dispatchEvent(new window.Event("hashchange"));
      await tick(200);
      const btn = doc.querySelector("[data-copy-email]");
      assert.equal(btn.getAttribute("aria-label"), "Copy email address");
      click(window, btn);
      await tick(220);
      assert.equal(btn.getAttribute("data-copy-state"), "idle", "copy claimed success after a failure");
      assert.doesNotMatch(btn.textContent, /Copied!/, "false Copied! confirmation shown");
      assert.ok(doc.querySelector('[data-toast="error"]'), "no error feedback on clipboard failure");
      assert.equal(btn.getAttribute("aria-label"), "Copy email address", "failure changed the accessible name");
      const live = doc.querySelector('[data-copy-email-status]');
      assert.equal(live?.getAttribute("aria-live"), "polite");
      assert.match(live?.textContent || "", /Copy the address manually: lakshitsinghsaini@gmail.com/);
      assert.ok(!(live?.getAttribute("class") || "").includes("sr-only"), "manual fallback is not visible");
      assert.equal(window.__copied.length, 0, "nothing should be copied on failure");
      assert.deepEqual(appErrors(errors), [], "console errors from failed copy");
    } finally { dom.window.close(); }
  }
  console.log("  ✓ smart copy: real success + Copied! + auto-revert, honest failure state (both themes)");
}

async function runContactForm() {
  // Invalid inputs and missing fields.
  {
    const errors = [];
    const dom = makeWindow("dark", errors, { clipboard: "ok" });
    const { window } = dom, doc = window.document;
    try {
      window.location.hash = "#/contact";
      window.dispatchEvent(new window.Event("hashchange"));
      await tick(200);
      const form = doc.querySelector("[data-contact-form]");
      assert.ok(form, "contact form missing");
      form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
      await tick(200);
      assert.ok(doc.querySelector("[data-form-errors]"), "invalid submit did not report errors");
      assert.ok(!doc.querySelector("[data-form-success]"), "success shown for an invalid form");
      assert.equal(form.getAttribute("data-form-status"), "idle");
      for (const name of ["name", "email", "message", "consent"]) {
        assert.ok(form.querySelector(`[name="${name}"]`) || name === "consent", `field ${name} was removed`);
      }
      assert.ok(form.querySelector('[aria-invalid="true"]'), "invalid fields are not marked for a11y");
      assert.deepEqual(appErrors(errors), [], "console errors from form validation");
    } finally { dom.window.close(); }
  }

  // Genuine handoff + honest success state + reset.
  {
    const errors = [];
    const dom = makeWindow("light", errors, { clipboard: "ok" });
    const { window } = dom, doc = window.document;
    try {
      window.location.hash = "#/contact";
      window.dispatchEvent(new window.Event("hashchange"));
      await tick(200);
      const form = doc.querySelector("[data-contact-form]");
      setField(window, form.querySelector('[name="name"]'), "Ada");
      setField(window, form.querySelector('[name="email"]'), "ada@example.test");
      setField(window, form.querySelector('[name="message"]'), "Hello, I would like to discuss a project with you.");
      click(window, form.querySelector("[data-consent]"));
      await tick(200);
      assert.equal(form.querySelector("[data-consent]").getAttribute("data-consent"), "on", "consent toggle broken");
      form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
      await tick(200);
      assert.equal(form.getAttribute("data-form-status"), "handoff", "form did not reach its handoff state");
      const success = doc.querySelector('[data-form-success="handoff"]');
      assert.ok(success, "polished success state missing");
      assert.match(success.textContent, /Draft ready/);
      assert.match(success.textContent, /nothing has been delivered yet/i, "success overclaims delivery");
      assert.ok(success.querySelector(".form-success-icon svg"), "animated checkmark missing");
      assert.ok(form.querySelector("[data-form-fields]").classList.contains("hidden"), "fields not hidden in success state");
      // Fields are preserved (not replaced by a static mockup).
      assert.ok(form.querySelector('[name="name"]'), "form fields were removed");

      const resetBtn = [...success.querySelectorAll("button")].find((b) => /Write another/.test(b.textContent));
      click(window, resetBtn);
      await tick(200);
      assert.equal(form.getAttribute("data-form-status"), "idle", "Write another did not reset the form");
      assert.ok(form.querySelector('[name="name"]'), "fields did not come back");
      assert.deepEqual(appErrors(errors), [], "console errors during successful form handoff");
    } finally { dom.window.close(); }
  }

  // Handoff/clipboard failure: no success animation, recoverable error state.
  {
    const errors = [];
    const dom = makeWindow("dark", errors, { clipboard: "fail" });
    const { window } = dom, doc = window.document;
    try {
      window.location.hash = "#/contact";
      window.dispatchEvent(new window.Event("hashchange"));
      await tick(200);
      const form = doc.querySelector("[data-contact-form]");
      setField(window, form.querySelector('[name="name"]'), "Ada");
      setField(window, form.querySelector('[name="email"]'), "ada@example.test");
      setField(window, form.querySelector('[name="message"]'), "Hello, I would like to discuss a project with you.");
      click(window, form.querySelector("[data-consent]"));
      await tick(200);
      form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
      await tick(200);
      assert.ok(doc.querySelector('[data-form-success="handoff"]'), "handoff did not happen");
      click(window, doc.querySelector("[data-copy-message]"));
      await tick(200);
      assert.ok(doc.querySelector("[data-form-failure]"), "failure state missing after clipboard failure");
      assert.ok(!doc.querySelector("[data-form-success]"), "success still shown after a real failure");
      assert.match(doc.querySelector("[data-form-failure]").textContent, /Nothing has been sent/i);
      assert.ok(doc.querySelector('[data-toast="error"]'), "no error feedback");
      assert.deepEqual(appErrors(errors), [], "console errors during form failure");
    } finally { dom.window.close(); }
  }
  console.log("  ✓ contact form: validation, honest success checkmark, failure recovery, reset (both themes)");
}

async function runContentAndThemeChecks() {
  const errors = [];
  const dom = makeWindow("dark", errors, { finePointer: true });
  const { window } = dom, doc = window.document;
  const css = readFileSync("src/index.css", "utf8");
  try {
    // About Me: integrated journey timeline + fun facts, original content kept.
    window.location.hash = "#/about";
    window.dispatchEvent(new window.Event("hashchange"));
    await tick(200);
    const timeline = doc.querySelector("[data-journey-timeline]");
    assert.ok(timeline, "About Me journey timeline missing");
    const steps = [...doc.querySelectorAll("[data-journey-step]")];
    assert.equal(steps.length, 5, `expected 5 genuine milestones, got ${steps.length}`);
    assert.equal(steps[0].querySelector("[data-journey-trigger]").getAttribute("aria-expanded"), "true");
    click(window, steps[2].querySelector("[data-journey-trigger]"));
    await tick(200);
    assert.equal(steps[2].querySelector("[data-journey-trigger]").getAttribute("aria-expanded"), "true",
      "milestone did not expand");
    assert.ok(steps[2].querySelector(".journey-detail:not([hidden])"), "expanded detail is hidden");
    assert.equal(steps[0].querySelector("[data-journey-trigger]").getAttribute("aria-expanded"), "false",
      "previously open milestone did not collapse");
    const facts = doc.querySelector("[data-fun-facts]");
    assert.ok(facts, "Fun Facts card missing");
    assert.equal(doc.querySelectorAll("[data-fun-fact]").length, 6);
    assert.match(facts.textContent, /LAVI/);
    assert.match(facts.textContent, /India/);
    const about = doc.querySelector("main").textContent;
    for (const kept of ["About Me", "I started experimenting with technology in 2020", "Beyond code", "Experiment first", "Utility focus", "Currently exploring", "Quick answers"]) {
      assert.ok(about.includes(kept), `existing About content removed: ${kept}`);
    }

    // Skills: real logos, consistent sizing, names, no invented percentages.
    window.location.hash = "#/skills";
    window.dispatchEvent(new window.Event("hashchange"));
    await tick(200);
    const cards = [...doc.querySelectorAll("[data-skill-card]")];
    assert.equal(cards.length, 8, "a skills category was removed");
    for (const card of cards) {
      assert.ok(card.querySelector(".skill-logo"), "glass logo container missing");
      assert.ok(card.querySelector("svg"), "recognizable technology logo missing");
      assert.ok(card.hasAttribute("data-tilt"), "compact card tilt missing");
    }
    assert.ok(doc.querySelectorAll(".skill-logo").length >= 30, "skill logos missing");
    assert.ok(!/%$|\d+\s*%/.test(doc.querySelector("main").textContent), "invented proficiency level present");
    assert.equal(doc.querySelectorAll("[data-tech]").length,
      doc.querySelectorAll(".skill-name").length, "logo and name counts disagree");

    // Home section dividers and preserved CTA.
    window.location.hash = "#/";
    window.dispatchEvent(new window.Event("hashchange"));
    await tick(200);
    assert.equal(doc.querySelectorAll("[data-section-divider]").length, 3, "creative dividers missing or excessive");
    assert.ok(doc.querySelector('[data-cta-row] a[href="#/contact"]'), "Contact destination changed");
    assert.ok(doc.querySelector('[data-cta-row] a[href^="https://drive.google.com/"]'), "Résumé destination changed");

    // Premium light glassmorphism: source-level, because jsdom does not resolve
    // custom-property backgrounds or !important specificity reliably.
    assert.match(css, /\[data-theme="light"\] \.ui-surface[\s\S]{0,400}backdrop-filter:\s*blur/,
      "light surfaces lack controlled background blur");
    for (const selector of ["ui-nav-shell", "ui-nav", "ui-icon-button", "ui-input", "ui-tech-tile", "ui-menu-panel", "ui-footer", "ui-row"]) {
      assert.ok(css.includes(`[data-theme="light"] .${selector}`) ||
        new RegExp(`\\[data-theme="light"\\][^{]*\\.${selector}`).test(css),
        `light theme does not style .${selector}`);
    }
    assert.match(css, /--glass-bg:\s*rgba\(255,\s*255,\s*255,\s*0\.66\)/, "translucent light surface token missing");
    assert.match(css, /--contact:\s*#a33a48/, "signature reddish Contact accent missing in light theme");
    assert.match(css, /--contact:\s*#cf8b90/, "signature reddish Contact accent missing in dark theme");
    assert.match(css, /\.pressable\[data-feedback="ripple"\]\.is-pressed::after/, "button ripple feedback missing");
    assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)[\s\S]{0,400}\.tilt-card:hover/,
      "card tilt is not gated to fine pointers");
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)/, "reduced-motion block missing");

    assert.deepEqual(appErrors(errors), [], "console errors during content/theme checks");
    console.log("  ✓ About timeline + Fun facts, Skills logos, dividers, light glassmorphism, Contact accent");
  } finally { dom.window.close(); }
}

async function runInteractionFeedback() {
  // Fine pointer: press feedback, ripple origin and compact-card tilt.
  {
    const errors = [];
    const dom = makeWindow("dark", errors, { finePointer: true });
    const { window } = dom, doc = window.document;
    try {
      await settleGesture(() => {}, () => Boolean(doc.querySelector('.pressable[data-feedback="ripple"]')));
      const ripple = doc.querySelector('.pressable[data-feedback="ripple"]');
      const press = doc.querySelector('.pressable[data-feedback="press"]');
      assert.ok(ripple && press, "buttons lack differentiated feedback");
      const href = ripple.getAttribute("href");
      await settleGesture(
        () => ripple.dispatchEvent(new window.MouseEvent("pointerdown", { bubbles: true, clientX: 30, clientY: 20 })),
        () => ripple.classList.contains("is-pressed"));
      assert.ok(ripple.classList.contains("is-pressed"), "ripple button did not acknowledge press");
      assert.ok(ripple.style.getPropertyValue("--press-x"), "ripple origin not set");
      assert.equal(ripple.getAttribute("href"), href, "press feedback changed the destination");
      await settleGesture(
        () => press.dispatchEvent(new window.MouseEvent("pointerdown", { bubbles: true, clientX: 10, clientY: 8 })),
        () => press.classList.contains("is-pressed"));
      assert.ok(press.classList.contains("is-pressed"), "quiet button did not acknowledge press");
      await tick(520);
      assert.ok(!ripple.classList.contains("is-pressed"), "press state did not clean itself up");

      const tilt = doc.querySelector("[data-tilt]");
      assert.ok(tilt, "no compact tilt cards");
      await settleGesture(
        () => tilt.dispatchEvent(new window.MouseEvent("pointermove", { bubbles: true, clientX: 90, clientY: 40 })),
        () => Boolean(tilt.style.getPropertyValue("--tilt-x")));
      assert.ok(tilt.style.getPropertyValue("--tilt-x"), "card tilt did not respond to the pointer");
      assert.ok(tilt.style.getPropertyValue("--sheen-x"), "card highlight did not respond");

      assert.ok(doc.querySelector("[data-particle-field]"), "particle field canvas missing");
      assert.ok(doc.querySelector(".site-content"), "particle field is not layered behind content");
      assert.deepEqual(appErrors(errors), [], "console errors from interaction feedback");
    } finally { dom.window.close(); }
  }
  // Reduced motion / touch: tilt disabled, particles hidden, cursor inert.
  {
    const errors = [];
    const dom = makeWindow("light", errors, { reducedMotion: true });
    const { window } = dom, doc = window.document;
    try {
      await tick(200);
      assert.ok(!doc.documentElement.classList.contains("has-custom-cursor"),
        "custom cursor must be off for reduced motion");
      const tilt = doc.querySelector("[data-tilt]");
      tilt?.dispatchEvent(new window.MouseEvent("pointermove", { bubbles: true, clientX: 60, clientY: 30 }));
      await tick(200);
      assert.ok(!tilt || !tilt.style.getPropertyValue("--tilt-x"),
        "card tilt must be disabled for reduced motion");
      assert.deepEqual(appErrors(errors), [], "console errors for reduced-motion interactions");
    } finally { dom.window.close(); }
  }
  const css = readFileSync("src/index.css", "utf8");
  assert.match(css, /\.particle-field \{[^}]*z-index: 0/, "particles are not behind content");
  assert.match(css, /prefers-reduced-motion[\s\S]{0,600}\.particle-field \{ display: none/,
    "particles are not disabled for reduced motion");
  console.log("  ✓ button press/ripple, card tilt, particles layering; reduced-motion + touch gating");
}

async function runFinalAuditChecks() {
  const errors = [];
  const dom = makeWindow("dark", errors, { mobileWidth: true, clipboard: "fail" });
  const { window } = dom, doc = window.document;
  try {
    await tick(100);
    // A skip link focuses main without rewriting the route hash.
    doc.querySelector(".skip-link").dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
    assert.equal(doc.activeElement?.id, "main");
    assert.notEqual(window.location.hash, "#main");
    window.location.hash = "#/education"; window.dispatchEvent(new window.Event("hashchange")); await tick(100);
    assert.match(doc.title, /^Education/);
    assert.ok(!doc.querySelector("#education").textContent.includes("2020 — 2024"), "unverified education dates returned");
    window.location.hash = "#/achievements"; window.dispatchEvent(new window.Event("hashchange")); await tick(100);
    const imageButton = doc.querySelector('button[aria-label^="Open image:"]');
    assert.ok(imageButton, "achievement image control missing before an image error");
    imageButton.focus(); click(window, imageButton); await tick(100);
    assert.ok(doc.querySelector('[role="dialog"][aria-modal="true"]'), "image dialog missing");
    assert.equal(doc.activeElement?.getAttribute("aria-label"), "Close image");
    keyDown(window, "Escape"); await tick(100);
    assert.equal(doc.activeElement, imageButton, "image dialog failed to restore focus");
    imageButton.querySelector("img").dispatchEvent(new window.Event("error")); await tick(100);
    assert.ok(!imageButton.isConnected && doc.body.textContent.includes("Image unavailable"), "broken image remained interactive");
    const certImg = doc.querySelector('img[src*="datacom-certificate.png"]');
    assert.ok(certImg, "Datacom certificate image is missing before fallback test");
    certImg.dispatchEvent(new window.Event("error")); await tick(100);
    assert.ok(!certImg.isConnected && doc.body.textContent.includes("Certificate image unavailable"), "broken certificate has no fallback");
    // Menu and command dialog may not remain open simultaneously.
    click(window, doc.querySelector('[aria-controls="mobile-menu"]')); await tick(100);
    keyDown(window, "k", {ctrlKey: true}); await tick(100);
    assert.equal(doc.querySelector('[aria-controls="mobile-menu"]').getAttribute("aria-expanded"), "false");
    assert.ok(doc.querySelector('[data-command-palette]'));
    keyDown(window, "Escape"); await tick(100);
    assert.equal(doc.activeElement, doc.querySelector('[aria-controls="mobile-menu"]'));
    // A throwing legacy copy operation must not leak its temporary textarea.
    window.location.hash = "#/contact"; window.dispatchEvent(new window.Event("hashchange")); await tick(100);
    window.document.execCommand = () => { throw new Error("denied"); };
    const btn = doc.querySelector('[data-copy-email]'); btn.focus();
    const before = doc.querySelectorAll("textarea").length;
    click(window, btn); await tick(100);
    assert.equal(doc.querySelectorAll("textarea").length, before);
    assert.equal(doc.activeElement, btn);
    assert.equal(btn.getAttribute("data-copy-state"), "idle");
    assert.deepEqual(appErrors(errors), []);
  } finally { dom.window.close(); }

  const mediaErrors = []; const noMedia = makeWindow("dark", mediaErrors);
  try {
    noMedia.window.matchMedia = undefined;
    await tick(150);
    assert.ok(noMedia.window.document.querySelector("#main"), "missing matchMedia prevented rendering");
    assert.deepEqual(appErrors(mediaErrors), []);
  } finally { noMedia.window.close(); }

  const errs = []; const graphDom = makeWindow("dark", errs);
  const w = graphDom.window; let graphRequests = 0;
  try {
    w.IntersectionObserver = undefined;
    w.fetch = (url) => {
      if (String(url).includes("jogruber")) {
        graphRequests++;
        const contributions = graphRequests === 1 ? [{date:"2026-99-01",count:1,level:9}] : [{date:"2026-11-01",count:2,level:2}];
        return Promise.resolve({ok:true,json:async()=>({total:{lastYear:2},contributions})});
      }
      const data = String(url).includes("/repos")
        ? [{name:"SaBuddy",html_url:"https://github.com/hmmlavi/SaBuddy",fork:false,stargazers_count:1,forks_count:0}]
        : {login:"hmmlavi", public_repos:1, followers:0, following:0};
      return Promise.resolve({ok:true,json:async()=>data});
    };
    w.location.hash = "#/github"; w.dispatchEvent(new w.Event("hashchange")); await tick(150);
    assert.equal(w.document.querySelector("[data-graph-state]")?.getAttribute("data-graph-state"), "error", "invalid graph did not fail safely");
    const retry = [...w.document.querySelectorAll("button")].find(b => b.textContent === "Retry graph");
    assert.ok(retry, "graph retry is missing"); click(w, retry); await tick(150);
    assert.ok(w.document.querySelector('[role="img"][aria-label*="2 contributions"]'));
    assert.equal(graphRequests, 2);
    w.location.hash = "#/"; w.dispatchEvent(new w.Event("hashchange")); await tick(100);
    w.location.hash = "#/github"; w.dispatchEvent(new w.Event("hashchange")); await tick(150);
    assert.equal(graphRequests, 2, "validated graph cache was not reused");
    assert.deepEqual(appErrors(errs), []);
  } finally { graphDom.window.close(); }
  console.log("  ✓ final audit: skip link, titles, education dates, modal focus, achievement image fallbacks, copy cleanup, absent matchMedia, graph validation/retry/cache/no observer");
}

await runSystemThemeMetadata();
await runHeroCuriosity();
await runTheme("dark");
await runTheme("light");
await runMockGitHub();
await runCursor();
await runCursorDisabled();
await runHomeInteractions();
await runDirectHome();
await runPortfolioEnhancements();
await runGitHubFailures();
await runContributionRetries();
await runDiscordCopy();
await runMobileMenuAccessibility();
await runCommandPalette();
await runCopyActions();
await runContactForm();
await runContentAndThemeChecks();
await runInteractionFeedback();
await runFinalAuditChecks();
console.log("Smoke test passed: all routes × both themes, direct Home, command palette, cursor, particles, copy, form, timeline, skills, dividers and CTA verified with 0 console errors.");
