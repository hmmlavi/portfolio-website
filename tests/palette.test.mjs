/**
 * Regression tests for the accent-palette crash.
 *
 * The bug: content.ts stores literal hex colours, but Home.tsx / Skills.tsx
 * passed them to `accent()` (which expects a palette KEY). ACCENT[hex] was
 * undefined → "Cannot read properties of undefined (reading 'dark')" →
 * the whole app rendered a blank, gradient-only screen.
 *
 * These tests load the real TypeScript modules through Vite so the checks
 * exercise the shipping code, not a copy of it.
 */
import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createServer } from "vite";

let server;
let palette;
let content;
let achievements;
let journey;

before(async () => {
  server = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "silent",
  });
  palette = await server.ssrLoadModule("/src/data/palette.ts");
  content = await server.ssrLoadModule("/src/data/content.ts");
  achievements = await server.ssrLoadModule("/src/data/achievements.ts");
  journey = await server.ssrLoadModule("/src/data/journey.ts");
});

after(async () => {
  await server?.close();
});

const names = ["ice", "violet", "mint", "rose", "amber", "teal"];

test("ACCENT contains the six complementary light/dark pairs", () => {
  assert.deepEqual(Object.keys(palette.ACCENT).sort(), [...names].sort());
  for (const name of names) {
    assert.match(palette.ACCENT[name].dark, /^#[0-9a-f]{6}$/i);
    assert.match(palette.ACCENT[name].light, /^#[0-9a-f]{6}$/i);
  }
  assert.equal(palette.DEFAULT_ACCENT, "ice");
  assert.equal(palette.ROSE.dark, palette.ACCENT.rose.dark);
  assert.equal(palette.ROSE.light, palette.ACCENT.rose.light);
});

test("accent() resolves every palette key in both themes", () => {
  for (const name of names) {
    assert.equal(palette.accent(name, false), palette.ACCENT[name].dark);
    assert.equal(palette.accent(name, true), palette.ACCENT[name].light);
  }
  assert.equal(palette.rose(false), palette.ACCENT.rose.dark);
  assert.equal(palette.rose(true), palette.ACCENT.rose.light);
});

test("accent() never throws on unknown or missing values", () => {
  const bad = [undefined, null, "", "nope", 42, {}, [], "#not-a-color"];
  for (const light of [false, true]) {
    const fallback = palette.accent(palette.DEFAULT_ACCENT, light);
    for (const value of bad) {
      assert.equal(
        palette.accent(value, light),
        fallback,
        `accent(${String(value)}, ${light}) must fall back safely`,
      );
    }
  }
});

test("hex colours passed to accent() are handled explicitly, not looked up as keys", () => {
  for (const name of names) {
    const { dark, light } = palette.ACCENT[name];
    // Both palette hex variants map back to the right theme colour.
    assert.equal(palette.accent(dark, false), dark);
    assert.equal(palette.accent(dark, true), light);
    assert.equal(palette.accent(light, false), dark);
    assert.equal(palette.accent(light, true), light);
    assert.equal(palette.accentNameForHex(dark), name);
    assert.equal(palette.accentNameForHex(light), name);
  }
  // A non-palette hex is still a valid CSS colour, so it is used as-is.
  assert.equal(palette.accent("#60A5FA", false), "#60a5fa");
});

test("colorFor() resolves every content hex pair for dark and light", () => {
  const datasets = [
    ["CAPABILITIES", content.CAPABILITIES],
    ["SKILL_CATEGORIES", content.SKILL_CATEGORIES],
    ["PROJECTS", content.PROJECTS],
    ["EDUCATION", content.EDUCATION],
    ["EXPERIENCE", content.EXPERIENCE],
    ["EXPLORING", content.EXPLORING],
  ];
  for (const [label, items] of datasets) {
    assert.ok(items.length > 0, `${label} must not be empty`);
    for (const item of items) {
      assert.ok(palette.isHexColor(item.color), `${label}: bad color ${item.color}`);
      assert.ok(palette.isHexColor(item.colorLight), `${label}: bad colorLight ${item.colorLight}`);
      assert.equal(palette.colorFor(item.color, item.colorLight, false), palette.normalizeHex(item.color));
      assert.equal(palette.colorFor(item.color, item.colorLight, true), palette.normalizeHex(item.colorLight));
    }
  }
});

test("colorFor() recovers a missing variant from the other palette half", () => {
  const iceDark = palette.ACCENT.ice.dark;
  const iceLight = palette.ACCENT.ice.light;
  const roseLight = palette.ACCENT.rose.light;
  assert.equal(palette.colorFor(iceDark, undefined, true), iceLight);
  assert.equal(palette.colorFor(undefined, iceLight, false), iceDark);
  assert.equal(palette.colorFor(undefined, null, false), iceDark);
  assert.equal(palette.colorFor(null, null, true), iceLight);
  assert.equal(palette.colorFor("#zzzzzz", "#zzzzzz", false), iceDark);
  assert.equal(palette.colorFor({}, roseLight, true), roseLight);
  assert.equal(palette.normalizeHex("#ABC"), "#aabbcc");
  assert.equal(palette.normalizeHex(`${iceDark}aa`), iceDark);
});

test("cycleAccent() is index-safe and keeps the approved order", () => {
  for (const light of [false, true]) {
    assert.equal(palette.cycleAccent(0, light), palette.accent("ice", light));
    assert.equal(palette.cycleAccent(4, light), palette.accent("ice", light));
    assert.equal(palette.cycleAccent(-1, light), palette.accent("rose", light));
    assert.equal(palette.cycleAccent(Number.NaN, light), palette.accent("ice", light));
  }
  // CYCLE is the deliberately short four-step rotation, not the full palette.
  assert.deepEqual([...palette.CYCLE], ["ice", "violet", "mint", "rose"]);
  for (const name of names) assert.ok(palette.isAccentName(name), `${name} is not a valid key`);
});

const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

test("alpha() validates hex input and clamps opacity", () => {
  const iceDark = palette.ACCENT.ice.dark;
  assert.equal(palette.alpha(iceDark, 0.3), rgba(iceDark, 0.3));
  assert.equal(palette.alpha("#abc", 0.5), "rgba(170,187,204,0.5)");
  assert.equal(palette.alpha(undefined, 2), rgba(iceDark, 1));
  assert.equal(palette.alpha("#oops", -1), rgba(iceDark, 0));
});

test("achievement accents are valid palette identifiers", () => {
  const items = [
    ...achievements.AWARDS,
    ...achievements.RECOGNITION,
    ...achievements.CERTIFICATIONS,
  ];
  assert.ok(items.length > 0);
  for (const item of items) {
    assert.ok(palette.isAccentName(item.accent), `${item.id}: bad accent ${item.accent}`);
    for (const light of [false, true]) {
      assert.match(palette.accent(item.accent, light), /^#[0-9a-f]{6}$/i);
    }
  }
});

test("content hex pairs stay in sync with the refined palette", () => {
  const all = [...Object.values(palette.ACCENT).flatMap((p) => [p.dark, p.light])];
  const datasets = [
    content.CAPABILITIES, content.SKILL_CATEGORIES, content.PROJECTS,
    content.EDUCATION, content.EXPERIENCE, content.EXPLORING,
  ];
  for (const items of datasets) {
    for (const item of items) {
      assert.ok(all.includes(item.color), `stale dark hex: ${item.color}`);
      assert.ok(all.includes(item.colorLight), `stale light hex: ${item.colorLight}`);
    }
  }
  // The reddish Contact identity is a distinct, non-neon tone.
  assert.match(palette.ACCENT.rose.dark, /^#[0-9a-f]{6}$/i);
  assert.notEqual(palette.ACCENT.rose.dark, palette.ACCENT.ice.dark);
});

test("navigation exposes all nine sections with valid destinations", () => {
  const expected = [
    ["Home", "home", ""], ["About", "about", "about"],
    ["Skills", "skills", "skills"], ["Projects", "projects", "projects"],
    ["Education", "education", "education"], ["Experience", "experience", "experience"],
    ["Achievements", "achievements", "achievements"],
    ["GitHub", "github", "github"], ["Contact", "contact", "contact"],
  ];
  assert.equal(content.NAV_ITEMS.length, 9);
  assert.equal(content.PILL_ITEMS.length, 9);
  for (const [label, id, path] of expected) {
    assert.ok(content.NAV_ITEMS.some((n) => n.label === label && n.id === id && n.path === path),
      `missing or misrouted nav item: ${label}`);
    assert.ok(content.PILL_ITEMS.some((n) => n.id === id), `${id} missing from desktop pill nav`);
  }
});

test("the three flagship builds are real, ordered and linked", () => {
  const expected = [
    ["Sortify Desktop", "https://github.com/hmmlavi/sortify-desktop", "/projects/sortify-desktop.webp"],
    ["Pustakalaya-LMS", "https://github.com/hmmlavi/Pustakalaya-LMS", "/projects/pustakalaya-lms.webp"],
    ["FacilityFix", "https://github.com/hmmlavi/FacilityFix", "/projects/facilityfix.webp"],
  ];
  assert.equal(content.SPOTLIGHT_PROJECTS.length, 3);
  for (let i = 0; i < expected.length; i++) {
    const [label, github, screenshot] = expected[i];
    const project = content.SPOTLIGHT_PROJECTS[i];
    assert.equal(project.spotlightLabel, label, `spotlight ${i} is not ${label}`);
    assert.equal(project.github, github, `${label}: wrong repository link`);
    assert.equal(project.screenshot, screenshot, `${label}: wrong screenshot`);
    assert.ok(project.highlights && project.highlights.length >= 3, `${label}: missing README facts`);
    assert.ok(content.PROJECTS.some((p) => p.repo === project.repo), `${label}: not in the full archive`);
    // Every referenced screenshot is a real, committed asset.
    const file = join("public", screenshot.replace(/^\//, ""));
    assert.ok(statSync(file).size > 1000, `${label}: screenshot missing or empty (${file})`);
  }
  // The two previously over-promoted projects remain, but are not highlights.
  for (const name of ["SaBuddy", "Veylo"]) {
    const p = content.PROJECTS.find((item) => item.name === name);
    assert.ok(p, `${name} was removed from the archive`);
    assert.ok(!p.spotlight && !p.featured, `${name} is still a Home highlight`);
  }
  assert.equal(content.PROJECTS.length, 7, "a project was deleted");
});

test("every project link and image points somewhere real", () => {
  for (const p of content.PROJECTS) {
    assert.match(p.repo, /^[\w.-]+$/, `${p.name}: malformed repo slug`);
    assert.equal(p.github ?? `https://github.com/hmmlavi/${p.repo}`,
      `https://github.com/hmmlavi/${p.repo}`, `${p.name}: canonical GitHub URL mismatch`);
    assert.match(p.logo ?? "", /^https:\/\/opengraph\.githubassets\.com\/\w+\/hmmlavi\/[\w.-]+$/,
      `${p.name}: malformed social-preview URL`);
    if (p.screenshot) {
      assert.match(p.screenshot, /^\/projects\/[\w.-]+\.webp$/, `${p.name}: malformed screenshot path`);
      assert.ok(existsSync(join("public", p.screenshot.replace(/^\//, ""))),
        `${p.name}: screenshot file is missing`);
    }
  }
});

test("section accents use the complementary palette, Contact keeps rose", () => {
  const home = readFileSync("src/pages/Home.tsx", "utf8");
  for (const hue of ["violet", "teal", "mint", "amber", "rose"]) {
    assert.ok(home.includes(`accent("${hue}"`) || home.includes(`"${hue}"`),
      `Home does not use the ${hue} hue`);
  }
  assert.ok(home.includes('hue="violet"') && home.includes('hue="teal"') &&
    home.includes('hue="mint"') && home.includes('hue="amber"'),
    "section heads lost their individual accent identities");
  assert.equal(palette.ACCENT.rose.dark, "#cf8b90");
  assert.equal(palette.ACCENT.rose.light, "#a33a48");
});

test("all six complementary hues keep readable contrast in both themes", () => {
  const luminance = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const channel = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  const contrast = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  for (const name of names) {
    const { dark, light } = palette.ACCENT[name];
    assert.ok(contrast(dark, "#0b0f17") >= 4.5,
      `${name} dark hue has poor contrast on the dark page background`);
    assert.ok(contrast(light, "#ffffff") >= 4.5,
      `${name} light hue has poor contrast on white glass surfaces`);
    assert.ok(contrast(light, "#f2f5f9") >= 4.5,
      `${name} light hue has poor contrast on the light page background`);
  }
});

test("no neon colours, rainbow gradients or hard-coded dark shell remain", () => {
  const css = readFileSync("src/index.css", "utf8");
  const neon = ["#7dd3fc", "#a78bfa", "#6ee7b7", "#fda4af", "#8b5cf6", "#f1e05a", "rgba(125, 211, 252"];
  for (const value of neon) {
    assert.ok(!css.toLowerCase().includes(value), `neon colour ${value} still in stylesheet`);
  }
  assert.doesNotMatch(css, /linear-gradient\([^)]*#a78bfa[^)]*\)/i, "rainbow text gradient remains");
  const app = readFileSync("src/App.tsx", "utf8");
  assert.match(app, /background:\s*"var\(--site-bg\)"/, "page shell must follow theme tokens");
  assert.doesNotMatch(app, /background:\s*"#080b12"/, "hard-coded dark shell regressed");
  assert.match(app, /<Cursor\s*\/>/, "custom cursor is not mounted");
});

test("every skill has a real technology logo", () => {
  const src = readFileSync("src/components/TechIcon.tsx", "utf8");
  const block = src.slice(src.indexOf("const TECH_LOGOS"), src.indexOf("One representative"));
  const keys = new Set(
    [...block.matchAll(/^\s{2}(?:"([^"]+)"|([A-Za-z][\w+. ]*)):\s*(?:Si\w+|[A-Z]\w*Logo),/gm)]
      .map((m) => m[1] ?? m[2]),
  );
  const expectedLogos = new Set(content.SKILL_CATEGORIES.flatMap((category) => category.skills));
  assert.equal(keys.size, expectedLogos.size, "logo map contains a missing or unused technology entry");
  for (const cat of content.SKILL_CATEGORIES) {
    for (const skill of cat.skills) {
      assert.ok(keys.has(skill), `no accurate logo mapped for ${skill}`);
    }
  }
  assert.equal(content.SKILL_CATEGORIES.length, 8);
});

test("About journey and fun facts contain no invented biography", () => {
  const source = readFileSync("src/data/content.ts", "utf8");
  assert.equal(journey.JOURNEY.length, 5);
  assert.deepEqual(journey.JOURNEY.map((s) => s.era), ["2020", "B.TECH", "OCT—NOV 2026", "PUBLIC PROJECTS", "NOW"]);
  for (const step of journey.JOURNEY) {
    assert.ok(step.title && step.org && step.summary, "incomplete timeline step");
    assert.ok(step.details.length >= 1, `${step.id}: no expandable detail`);
    // Every detail is either quoted from the site's existing data or a plain
    // restatement of it — no new dates, employers, awards or metrics.
    assert.doesNotMatch(`${step.title} ${step.org}`, /\b20[0-2][0-9]\b/, `${step.id}: invented year`);
  }
  assert.ok(journey.JOURNEY[2].details.every((d) => source.includes(d)),
    "internship details were invented");
  assert.ok(journey.JOURNEY[3].details.every((d) => source.includes(d)),
    "public-repository details were invented");
  const facts = journey.FUN_FACTS.map((f) => f.value).join(" ");
  for (const genuine of ["Privacy, UX", "LAVI", "India"]) {
    assert.ok(facts.includes(genuine), `fun fact ${genuine} is not from existing content`);
  }
  assert.ok(!/%|\d+ years|certified|awarded/.test(facts), "invented statistic in fun facts");
});

test("new interaction components are complete, not placeholders", () => {
  const files = [
    "src/components/CommandPalette.tsx",
    "src/components/ParticleField.tsx", "src/components/Toast.tsx",
    "src/components/JourneyTimeline.tsx", "src/components/FunFacts.tsx",
    "src/components/Cursor.tsx", "src/components/SectionDivider.tsx",
    "src/hooks/useInteractionEnhancements.ts", "src/utils/feedback.ts",
  ];
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    assert.ok(src.length > 400, `${file}: stub component`);
    assert.doesNotMatch(src, /\bTODO\b|coming soon|placeholder component|lorem ipsum/i,
      `${file}: unfinished placeholder`);
    assert.doesNotMatch(src, /\bas any\b/, `${file}: unsafe assertion`);
  }
  // One solid cursor dot + one aura, no ring/glow/second dot.
  const cursor = readFileSync("src/components/Cursor.tsx", "utf8");
  assert.ok(!cursor.includes("cursor-glow") && !cursor.includes("cursor-ring"),
    "extra cursor shapes returned");
  assert.equal((cursor.match(/data-cursor-part=/g) || []).length, 2);
});

test("responsive and asset safeguards are in place", () => {
  const css = readFileSync("src/index.css", "utf8");
  assert.match(css, /body\s*\{[^}]*overflow-x:\s*hidden/, "no horizontal-overflow guard on body");
  assert.match(css, /\.command-overlay \{[^}]*position: fixed/, "command palette is not viewport-bound");
  // Every locally referenced screenshot exists in public/.
  for (const project of content.PROJECTS) {
    if (!project.screenshot) continue;
    const file = join("public", project.screenshot.replace(/^\//, ""));
    assert.ok(existsSync(file) && statSync(file).size > 1000,
      `${project.name}: missing or empty screenshot ${file}`);
  }
  // No full-viewport-width utility that causes horizontal scrollbars.
  const roots = ["src/components", "src/pages"];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const file = join(dir, entry);
      if (statSync(file).isDirectory()) walk(file);
      else if (/\.tsx?$/.test(entry)) {
        const src = readFileSync(file, "utf8");
        assert.doesNotMatch(src, /\bw-screen\b/, `${file}: w-screen can cause horizontal overflow`);
      }
    }
  };
  roots.forEach(walk);
});

test("no source file passes hex content colours to accent() or uses `as any`", () => {
  const roots = ["src/components", "src/pages", "src/data"];
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx?$/.test(entry)) files.push(path);
    }
  };
  roots.forEach(walk);

  for (const file of files) {
    // legal.ts contains the English phrase "as any web request does".
    if (file.endsWith("legal.ts")) continue;
    const src = readFileSync(file, "utf8");
    // The original bug was `accent(cat.color as any, light)`.
    assert.doesNotMatch(src, /\bas any\b/, `${file}: unsafe "as any" assertion`);
    for (const match of src.matchAll(/\baccent\(\s*([^,)]+)/g)) {
      const arg = match[1].trim();
      assert.doesNotMatch(arg, /^["'`]#/, `${file}: hex literal passed to accent()`);
      assert.doesNotMatch(arg, /\.color\b/, `${file}: content hex passed to accent()`);
    }
  }
});
