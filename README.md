# Portfolio — LAVI

A personal portfolio for Lakshit Singh Saini: a Vite + React + TypeScript
single-page site with hash routing, light/dark themes, a project archive, three
technical case studies, a live GitHub section, a recruiter quick view, a
developer terminal and a command palette. Home opens directly — there is no
splash screen, entrance animation or globe.

## Technologies

React 19, TypeScript 5, Vite 7 (single-file build), Tailwind CSS 4, lucide-react
and react-icons. Tests run on Node's built-in test runner with jsdom.

## Development and verification

```bash
npm ci
npm run dev          # Vite development server
npm run typecheck    # tsc --noEmit
npm test             # typecheck + Node regression tests (palette, data, requests)
npm run build        # production build to dist/
npm run test:smoke   # build, then jsdom smoke tests of the built bundle
npm run verify       # npm test + npm run test:smoke
```

The smoke harness loads the real `dist/index.html`, evaluates its inline bundle in
jsdom, and walks every route in both themes, asserting rendered content, links,
images, focus handling and zero console errors. It also exercises explicit and
system light/dark themes (including live OS changes), theme-colour metadata,
the interactive hero interests panel and reduced motion, bounded contribution
retries, clipboard success/failure, and accessible copy-email feedback. jsdom has no layout engine,
so it **cannot** verify visual layout, computed breakpoints or touch gestures. No
real-browser runner is installed in this repository; run the site in a browser
(e.g. `npm run preview`) before publishing design changes.

## Routes

| Hash | Page |
| --- | --- |
| `#/` | Home |
| `#/about` | About, journey timeline, fun facts, exploring, FAQ |
| `#/skills` | Skills |
| `#/projects` | Project archive with search + category filters |
| `#/projects/<repo>` | Case study (sortify-desktop, Pustakalaya-LMS, FacilityFix) |
| `#/education` | Education and coursework |
| `#/experience` | Internship and independent work |
| `#/achievements` | Awards, recognition, certifications, Google Cloud |
| `#/github` | Live GitHub profile, contribution graph, languages, repositories |
| `#/contact` | Contact form, Discord, social and résumé links |
| `#/quick-view` | Recruiter quick view |
| `#/privacy` `#/terms` `#/cookies` `#/refunds` | Legal pages |
| anything else | 404 |

## Content maintenance

- `src/data/content.ts` — links, navigation, hero statistics, capabilities,
  skills, projects, education, experience, exploring items and FAQs.
- `src/data/achievements.ts` — awards, recognition, certifications and Google
  Cloud. Image paths are optional; missing files fall back to a labelled panel.
- `src/data/projectExtras.ts` — project categories, filtering and case-study
  component flows (drawn from each repository README).
- `src/data/portfolioUpdates.ts` — manually maintained current work and changelog.
  Both are empty, so the quick view hides those cards instead of inventing an update.
- `src/hooks`, `src/utils` — shared theme, observer, request and feedback helpers.

### Content rules used here

- Statistics must be countable from the selected `PROJECTS` archive: 7 public
  projects, 5 web builds and 1 Kotlin Android app. There are no open-ended
  figures. Public repositories are not called open source unless their licence
  actually permits that description; the current cards use "public repository".
- Independent projects and public-repository publishing are one experience entry,
  not two overlapping jobs. The internship is labelled separately with its exact
  1 October 2026 – 12 November 2026 dates and approximate six-week duration.
- The résumé destination is a Google Drive **folder**, never a PDF. Every label
  says "Open résumé folder" via `LINKS.resumeLabel`.
- Achievement photos and certificate scans are not part of this checkout. Only
  add an image when you have the real one.

## GitHub integration

`src/components/GitHubSection.tsx` fetches the public profile and up to 100 owned
repositories from the GitHub REST API, validates every field, shares one in-flight
request across mounts, caches validated data for five minutes and shows explicit
loading, invalid, rate-limit, timeout and network states. Language shares use only
repositories that report a language, so the bars add up. Stars are summed across
the fetched repositories and labelled as such.

`src/components/Contributions.tsx` uses a third-party contribution API with its own
validation, five-minute cache and shared in-flight request. A transient network,
timeout, rate-limit or server failure gets **one** automatic retry after a 750 ms
base delay (a `Retry-After` hint can raise that delay, capped at two seconds).
Permanent HTTP errors and invalid data are not retried automatically. After a
failed bounded attempt, a manual retry and a direct GitHub fallback remain
available; no graph or contribution count is fabricated. Re-renders do not trigger
new requests. `src/utils/request.ts` documents the same opt-in retry contract.
No API tokens or credentials are used; nothing secret ships in the bundle.

## Deployment

`npm run build` produces a single inlined `dist/index.html` plus the static files
copied from `public/`. Deploy the whole `dist/` directory to any static host.
Routes are hash fragments, so no server rewrites are required. Asset paths assume
deployment at the domain root; set Vite's `base` and update root-relative public
asset references before deploying under a subdirectory.

**No production URL is configured for this repository** (the GitHub repository has
no homepage and no Pages site). Canonical URL, absolute Open Graph image and an
XML sitemap are therefore deliberately absent — `index.html` and `robots.txt`
document this in place. Add them once the real domain is confirmed; do not assume
another repository's site is this project's deployment target.

## Known limitations

- Achievement photographs and certificate scans are not committed; the pages show
  honest fallbacks until real files are added under `public/achievements/`.
- The résumé link opens a Drive folder whose contents have not been verified as a
  résumé PDF, so the site never claims a downloadable résumé.
- Two external services (GitHub REST and a contribution API) can be rate-limited or
  offline; both have explicit failure states.
- Legal text describes the current client-side behaviour but should be reviewed by
  the owner before publication.
