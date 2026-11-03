import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { createServer } from "vite";
let server, content, extra, request, updates;
before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  content = await server.ssrLoadModule("/src/data/content.ts");
  extra = await server.ssrLoadModule("/src/data/projectExtras.ts");
  request = await server.ssrLoadModule("/src/utils/request.ts");
  updates = await server.ssrLoadModule("/src/data/portfolioUpdates.ts");
});
after(async () => server.close());
test("project filtering combines category and case-insensitive text", () => {
  for (const category of extra.CATEGORIES) assert.ok(extra.filterProjects(content.PROJECTS, category, "").length, category);
  assert.deepEqual(extra.filterProjects(content.PROJECTS, "Desktop Applications", "SQLITE").map(p => p.repo), ["sortify-desktop"]);
  assert.equal(extra.filterProjects(content.PROJECTS, "Other", "SQLite").length, 0);
  assert.equal(extra.filterProjects(content.PROJECTS, "All", "does not exist").length, 0);
});
test("request handles success, rate limit and cancellation", async () => {
  const old = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ok: true, json: async () => ({hello: true})});
    assert.deepEqual(await request.requestJson("https://example.test", new AbortController().signal), {hello: true});
    globalThis.fetch = async () => ({ok: false, status: 403, headers: {get: () => "0"}});
    await assert.rejects(request.requestJson("https://example.test", new AbortController().signal), /rate-limit/);
    globalThis.fetch = (_url, {signal}) => new Promise((resolve, reject) => signal.addEventListener("abort", () => reject(new Error("aborted"))));
    const controller = new AbortController();
    const promise = request.requestJson("https://example.test", controller.signal);
    controller.abort();
    await assert.rejects(promise, /aborted/);
  } finally { globalThis.fetch = old; }
});
test("request timeout aborts the underlying fetch", async () => {
  const oldFetch = globalThis.fetch, oldSetTimeout = globalThis.setTimeout;
  try {
    globalThis.setTimeout = (fn) => oldSetTimeout(fn, 0);
    globalThis.fetch = (_url, {signal}) => new Promise((resolve, reject) => signal.addEventListener("abort", () => reject(new Error("aborted"))));
    await assert.rejects(request.requestJson("https://example.test", new AbortController().signal), /timeout/);
  } finally { globalThis.fetch = oldFetch; globalThis.setTimeout = oldSetTimeout; }
});


test("request retries one transient rate limit once, then succeeds", async () => {
  const old = globalThis.fetch;
  let calls = 0;
  try {
    globalThis.fetch = async () => {
      calls++;
      return calls === 1
        ? { ok: false, status: 429, headers: { get: () => null } }
        : { ok: true, json: async () => ({ ok: true }) };
    };
    const result = await request.requestJson("https://example.test", new AbortController().signal, {
      automaticRetry: true, retryDelayMs: 0,
    });
    assert.deepEqual(result, { ok: true });
    assert.equal(calls, 2);
  } finally { globalThis.fetch = old; }
});

test("request retries a transient network failure once, never permanently failing more than twice", async () => {
  const old = globalThis.fetch;
  try {
    let calls = 0;
    globalThis.fetch = async () => {
      calls++;
      if (calls === 1) throw new Error("connection reset");
      return { ok: true, json: async () => ({ recovered: true }) };
    };
    assert.deepEqual(await request.requestJson("https://example.test", new AbortController().signal, {
      automaticRetry: true, retryDelayMs: 0,
    }), { recovered: true });
    assert.equal(calls, 2);

    calls = 0;
    globalThis.fetch = async () => {
      calls++;
      return { ok: false, status: 503, headers: { get: () => null } };
    };
    await assert.rejects(request.requestJson("https://example.test", new AbortController().signal, {
      automaticRetry: true, retryDelayMs: 0,
    }), /http/);
    assert.equal(calls, 2, "a persistent transient failure must stop after one retry");
  } finally { globalThis.fetch = old; }
});

test("request does not retry permanent HTTP errors or invalid JSON", async () => {
  const old = globalThis.fetch;
  try {
    let calls = 0;
    globalThis.fetch = async () => {
      calls++;
      return { ok: false, status: 404, headers: { get: () => null } };
    };
    await assert.rejects(request.requestJson("https://example.test", new AbortController().signal, {
      automaticRetry: true, retryDelayMs: 0,
    }), /http/);
    assert.equal(calls, 1);

    globalThis.fetch = async () => {
      calls++;
      return { ok: true, json: async () => { throw new Error("bad JSON"); } };
    };
    await assert.rejects(request.requestJson("https://example.test", new AbortController().signal, {
      automaticRetry: true, retryDelayMs: 0,
    }), /invalid/);
    assert.equal(calls, 2, "invalid JSON is permanent and adds only the second test's single call");
  } finally { globalThis.fetch = old; }
});

test("content removes institution placeholders and verifies current project metadata", () => {
  assert.equal("COLLEGE_NAME" in content, false);
  assert.equal(content.EDUCATION[0].status, "current");
  const self = content.PROJECTS.find((project) => project.name === "Portfolio Site");
  assert.equal(self.repo, "porto");
  assert.deepEqual(extra.PROJECT_CATEGORIES.porto, ["Web Development"]);
  assert.equal(extra.PROJECT_CATEGORIES.portfolio, undefined);
  const sarp = content.PROJECTS.find((project) => project.repo === "Sarp");
  assert.ok(sarp.tags.includes("React 19") && sarp.tags.includes("TypeScript") && sarp.tags.includes("Three.js"));
  assert.ok(!sarp.tags.includes("JavaScript"));
  assert.ok(!content.SKILL_CATEGORIES.flatMap((category) => category.skills).some((skill) =>
    ["Figma", "Firebase", "MongoDB", "Postman", "Netlify", "Claude", "ChatGPT", "Google AI Studio"].includes(skill)));
});

test("changelog sorts ISO dates newest first without mutating source", () => {
  const entries = [{date:"2024-01-01",title:"Older"}, {date:"2026-01-01",title:"Newer"}];
  assert.deepEqual(updates.newestUpdates(entries).map(e => e.title), ["Newer", "Older"]);
  assert.equal(entries[0].title, "Older");
  assert.deepEqual(updates.newestUpdates([]), []);
});

test("hero statistics are countable from the real project archive", () => {
  const stats = content.HERO_STATS;
  assert.equal(stats.length, 3);
  for (const stat of stats) {
    assert.match(stat.value, /^\d{2}$/, `${stat.label}: statistic is not a countable number`);
    assert.doesNotMatch(stat.label, /ideas|∞|\+$/, `${stat.label}: open-ended statistic returned`);
  }
  assert.equal(Number(stats[0].value), content.PROJECTS.length, "project total disagrees with the archive");
  const web = content.PROJECTS.filter((p) => extra.PROJECT_CATEGORIES[p.repo]?.includes("Web Development"));
  assert.equal(Number(stats[1].value), web.length, "web-build count disagrees with the archive");
  const kotlin = content.PROJECTS.filter((p) => p.tags.includes("Kotlin"));
  assert.equal(Number(stats[2].value), kotlin.length, "Android count disagrees with the archive");
});

test("independent work is one entry and formal experience stays separate", () => {
  assert.equal(content.EXPERIENCE.length, 2, "overlapping independent work is still split");
  const formal = content.EXPERIENCE.filter((e) => e.kind === "formal");
  const independent = content.EXPERIENCE.filter((e) => e.kind === "independent");
  assert.equal(formal.length, 1);
  assert.equal(independent.length, 1);
  assert.match(independent[0].role, /Public Repositories/);
  assert.match(independent[0].span, /2020.*today/);
  assert.doesNotMatch(content.EXPERIENCE.map((e) => e.role).join(" "), /Open Source Publisher/);
  assert.equal(content.EXPERIENCE[0].span, "1 October 2026 — 12 November 2026");
  assert.match(content.EXPERIENCE[0].points.join(" "), /approximately six weeks/);
  assert.doesNotMatch(content.EXPERIENCE[0].points.join(" "), /completed/i);
});

test("résumé wording always describes a folder, never a downloadable file", () => {
  assert.match(content.LINKS.resumeLabel, /folder/i);
  assert.match(content.LINKS.resume, /^https:\/\/drive\.google\.com\/drive\/folders\//);
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx?$/.test(entry)) files.push(path);
    }
  };
  walk("src");
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    assert.doesNotMatch(src, /View résumé|Get Résumé|Download résumé/,
      `${file}: résumé is still described as something it is not`);
  }
});

test("FAQ and exploring copy contain no unverifiable promises", () => {
  const questions = content.FAQS.map((f) => f.q).join(" ");
  const answers = content.FAQS.map((f) => f.a).join(" ");
  assert.doesNotMatch(questions, /building right now/i, "misleading FAQ entry returned");
  assert.doesNotMatch(answers, /reply quickly|read everything/i, "unrealistic reply promise returned");
  const exploring = readFileSync("src/components/Exploring.tsx", "utf8");
  assert.doesNotMatch(exploring, /bench this month|updated by hand/i, "outdated exploring copy returned");
});
