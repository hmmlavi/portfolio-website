<div align="center">

# LAKSHIT — PORTFOLIO

### A little corner of the internet where ideas turn into things.

**Personal portfolio · Selected projects · Engineering notes · Ways to connect**

[![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/hmmlavi/portfolio-website/actions)

[**Live portfolio**](https://lakshitss.vercel.app/) · [**GitHub profile**](https://github.com/hmmlavi) · [**LinkedIn**](https://www.linkedin.com/in/lakshitsinghsaini/)

*Designed and developed by **Lakshit Singh Saini (Lavi)**.*

</div>

---

## Overview

This is my personal developer portfolio: a home for the products I build, technologies I explore, work I've done and ideas I'm curious about.

The site is a React + TypeScript single-page application built with Vite and Tailwind CSS. It uses hash-based navigation, dedicated project case studies, light and dark themes, and a compact single-file production build.

The goal is to keep the experience personal, responsive and useful without making the interface heavier than it needs to be.

## What's inside

| Section | Description |
| --- | --- |
| Home | Introduction, capabilities, selected work and interests |
| About | Background, journey, fun facts and FAQs |
| Skills | Technologies grouped by development area |
| Projects | Searchable project archive and case studies |
| Education & Experience | Academic background and practical work |
| Achievements | Awards, certificates and learning milestones |
| GitHub | Public profile, repository and contribution information |
| Contact | Contact options and social links |
| Quick View | Compact portfolio overview |

### Interaction details

- Light/dark theme with system preference support.
- Keyboard-accessible command palette and navigation.
- Developer terminal-style interaction.
- Dedicated project case-study routes.
- Responsive layouts and mobile navigation.
- Copy feedback for contact details.
- GitHub data loading, timeout, rate-limit and error states.
- Reduced-motion-aware interaction effects.

## Technology

- **React 19** and **TypeScript 5** — application UI and type safety.
- **Vite 7** — development server and production bundling.
- **Tailwind CSS 4** — utility styling through the official Vite plugin.
- **Lucide React** and **React Icons** — iconography.
- **clsx** and **tailwind-merge** — conditional and conflict-aware class composition.
- **Node.js test runner** and **jsdom** — automated regression and DOM smoke tests.
- **GitHub Actions** — automated verification on pushes and pull requests.

## Run locally

### Requirements

- Node.js 22 or newer.
- npm (included with Node.js).
- Git.

```bash
git clone https://github.com/hmmlavi/portfolio-website.git
cd portfolio-website
npm ci
npm run dev
```

Vite prints the local development URL. Open it in a browser.

### Production build

```bash
npm run build
npm run preview
```

The production output is generated in `dist/`. Deploy the complete directory to the configured static host.

## Quality checks

Run the full verification suite before publishing:

```bash
npm run verify
```

Individual commands:

| Command | What it checks |
| --- | --- |
| `npm run typecheck` | TypeScript without emitting files |
| `npm test` | Typecheck and Node regression tests |
| `npm run build` | Production Vite build |
| `npm run test:smoke` | Build and run production-bundle smoke tests |
| `npm run verify` | Tests followed by production smoke tests |

The smoke suite uses jsdom to exercise routes, themes, key interactions, links, images, focus behaviour and console-error handling. jsdom does not provide a real browser layout engine, so it cannot replace manual responsive, visual, touch or cross-browser checks.

GitHub Actions runs `npm run verify` for pushes to `main` and pull requests targeting `main`.

## Live GitHub data

The GitHub area uses public GitHub API data. Contribution activity relies on a separate third-party data service.

The implementation includes response validation, a short-lived cache, shared in-flight requests, bounded retry behaviour and explicit loading/error states. Public API availability and rate limits remain outside the site's control. No personal access token is intended to be shipped in the browser bundle.

## Repository layout

```text
.
├── .github/workflows/   # CI verification
├── public/
│   ├── achievements/    # Certificate and event images
│   ├── projects/        # Project preview images
│   ├── favicon.png
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── components/      # Reusable UI components
│   ├── data/            # Portfolio content and case-study data
│   ├── hooks/           # Theme and interaction hooks
│   ├── pages/           # Route-level pages
│   ├── utils/            # Shared utilities
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── tests/               # Regression and smoke tests
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

### Content locations

| File | Responsibility |
| --- | --- |
| `src/data/content.ts` | Navigation, links, skills, projects and FAQs |
| `src/data/achievements.ts` | Awards and certificates |
| `src/data/projectExtras.ts` | Project filters and case-study details |
| `src/data/journey.ts` | Journey timeline |
| `src/data/portfolioUpdates.ts` | Current-work and update entries |
| `src/data/legal.ts` | Legal information content |

## Routes

Navigation is hash-based; these are client-side routes within the same HTML document.

| Route | Page |
| --- | --- |
| `#/` | Home |
| `#/about` | About |
| `#/skills` | Skills |
| `#/projects` | Project archive |
| `#/projects/sortify-desktop` | Sortify Desktop case study |
| `#/projects/Pustakalaya-LMS` | Pustakalaya LMS case study |
| `#/projects/FacilityFix` | FacilityFix case study |
| `#/education` | Education |
| `#/experience` | Experience |
| `#/achievements` | Achievements |
| `#/github` | GitHub |
| `#/contact` | Contact |
| `#/quick-view` | Recruiter quick view |

Legal pages are available at `#/privacy`, `#/terms`, `#/cookies` and `#/refunds`. Unknown routes show the not-found page.

## SEO and hosting notes

The public site is hosted at [lakshitss.vercel.app](https://lakshitss.vercel.app/). The document declares that canonical URL and the sitemap lists the public homepage. Because the application uses hash fragments, individual hash routes are not separate crawlable URLs; the homepage is the canonical indexable document.

The repository includes a Vercel configuration for baseline browser security headers. Hosting-provider behaviour should still be checked against the deployed response headers after deployment.

## Design & engineering principles

- **Preserve the experience:** engineering improvements should not needlessly change the visual identity.
- **Useful over flashy:** interactions should support navigation or understanding.
- **Honest data:** no invented project metrics, certificates or contribution counts.
- **Graceful failure:** external APIs can fail; the interface should communicate that clearly.
- **Maintainability:** keep portfolio content in focused data modules.
- **Ship carefully:** typecheck, regression tests, production build and smoke tests are part of the workflow.

## Feedback

Found a bug or have a thoughtful improvement?

- [Open an issue](https://github.com/hmmlavi/portfolio-website/issues)
- [Browse the repository](https://github.com/hmmlavi/portfolio-website)
- [Connect on LinkedIn](https://www.linkedin.com/in/lakshitsinghsaini/)
- [Email Lakshit](mailto:lakshitsinghsaini@gmail.com)

## About

**Lakshit Singh Saini (Lavi)** is a Computer Science student interested in building practical software across web, desktop and Android, and exploring the intersection of software engineering and AI.

| Platform | Link |
| --- | --- |
| GitHub | [@hmmlavi](https://github.com/hmmlavi) |
| LinkedIn | [Lakshit Singh Saini](https://www.linkedin.com/in/lakshitsinghsaini/) |
| Instagram | [@lakshitsinghsaini](https://www.instagram.com/lakshitsinghsaini/) |
| X | [@Lakshits27](https://x.com/Lakshits27) |
| Email | [lakshitsinghsaini@gmail.com](mailto:lakshitsinghsaini@gmail.com) |
