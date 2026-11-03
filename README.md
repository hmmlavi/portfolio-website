<!--
  Portfolio README — Lakshit Singh Saini (Lavi)
  Keep project counts, routes, links and technical claims aligned with the source.
-->

<div align="center">

# ✦ LAKSHIT — PORTFOLIO

### A little corner of the internet where ideas turn into things.

**Personal portfolio · Selected projects · Engineering notes · Ways to connect**

<br />

[![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![GitHub Actions](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/hmmlavi/portfolio-website/actions)

<br />

[**Explore the repository**](https://github.com/hmmlavi/portfolio-website) ·
[**Browse my GitHub**](https://github.com/hmmlavi) ·
[**Connect on LinkedIn**](https://www.linkedin.com/in/lakshitsinghsaini/)

<br />

*Designed and developed with curiosity by **Lakshit Singh Saini (Lavi)**.*

</div>

---

## 👋 What is this?

This repository contains my personal developer portfolio — a place to bring together the things I build, the technologies I explore, the work I've done and the ideas I'm curious about.

It is not just a list of project cards. The site includes dedicated project case studies, an interactive GitHub area, a recruiter-friendly quick view, a developer-style terminal and a command palette, alongside the usual portfolio essentials.

The experience is intentionally built as a **fast, responsive, single-page application** with hash-based navigation, light and dark themes, and a production build that bundles the application into one HTML file.

---

## ✨ What's inside?

| Area | What you'll find |
| --- | --- |
| 🏠 **Home** | Introduction, capabilities, selected work and an interactive interests panel |
| 🙋 **About** | Background, journey timeline, fun facts, interests and FAQs |
| 🧰 **Skills** | Skills grouped by programming, frontend, backend, databases, AI, Android, desktop and tools |
| 🚀 **Projects** | Searchable project archive with category filters and dedicated case-study pages |
| 🎓 **Education** | Education and relevant coursework |
| 💼 **Experience** | Internship and independent project work |
| 🏆 **Achievements** | Awards, recognition, certificates and learning milestones |
| 🐙 **GitHub** | Live public profile data, repositories, languages and contribution activity |
| ✉️ **Contact** | Contact options, social links and résumé-folder access |
| ⚡ **Quick View** | A compact overview designed for recruiters and people short on time |

### A few interactive details

- 🌗 Light and dark themes, including system-preference support.
- ⌘ Command palette for quick navigation.
- 💻 Developer terminal-style interaction.
- 🧭 Dedicated case studies instead of one endless project list.
- 🎨 Motion and interaction enhancements with reduced-motion awareness.
- 📱 Responsive navigation and layouts.
- 📋 Copy-to-clipboard feedback for contact details.
- 🐙 Live GitHub data with loading, timeout, rate-limit and error states.

---

## 🧱 Tech stack

The stack is kept deliberately modern and relatively lightweight.

### Core

[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)

- **React 19** — component-based UI.
- **TypeScript 5** — typed application code.
- **Vite 7** — development server and production build.
- **vite-plugin-singlefile** — bundles the application into a single HTML entry point.

### Styling & interface

[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Lucide](https://img.shields.io/badge/Lucide_React-Icons-F56565?logo=lucide&logoColor=white)](https://lucide.dev/)
[![React Icons](https://img.shields.io/badge/React_Icons-Icon_Library-E91E63)](https://react-icons.github.io/react-icons/)

- **Tailwind CSS 4** with the official Vite integration.
- **Lucide React** and **React Icons** for interface iconography.
- **clsx** and **tailwind-merge** for composing and resolving utility classes.
- **Google Fonts** — Anton, Inter and JetBrains Mono.

### Quality & testing

[![Node.js](https://img.shields.io/badge/Node.js-Test_Runner-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![jsdom](https://img.shields.io/badge/jsdom-DOM_Testing-8A4182)](https://github.com/jsdom/jsdom)

- **TypeScript compiler** for static type-checking.
- **Node.js built-in test runner** for regression tests.
- **jsdom** for DOM-level smoke testing of the production bundle.
- **GitHub Actions** runs the verification workflow on pushes and pull requests.

---

## 🗺️ Navigation map

The application uses hash routes, so pages can be opened directly without server-side rewrite rules.

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
| `#/privacy`, `#/terms`, `#/cookies`, `#/refunds` | Legal information |
| Any unmatched route | 404 page |

---

## 🛠️ Run it locally

### Requirements

- [Node.js](https://nodejs.org/) — use Node 22 or a compatible newer version.
- npm — included with Node.js.
- Git.

### 1. Clone the repository

```bash
git clone https://github.com/hmmlavi/portfolio-website.git
cd portfolio-website
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Start the development server

```bash
npm run dev
```

Vite will print the local URL in your terminal. Open it in your browser and start exploring.

### 4. Build for production

```bash
npm run build
npm run preview
```

The production output is generated in `dist/`.

---

## 🧪 Verification commands

Run the checks individually, or run the complete verification suite before publishing.

| Command | Purpose |
| --- | --- |
| `npm run typecheck` | TypeScript check without emitting files |
| `npm test` | Typecheck + Node regression tests |
| `npm run build` | Production build |
| `npm run test:smoke` | Build + production-bundle smoke tests |
| `npm run verify` | Full verification: tests + production smoke tests |

The smoke tests load the built application in jsdom and exercise routes, themes, key interactions, links, images, focus behaviour and console-error handling.

> **Testing note:** jsdom does not have a browser layout engine. It cannot prove pixel-perfect visual layout, actual responsive breakpoints, rendering differences across browsers or real touch gestures. Those still need manual browser and device testing.

---

## 🐙 Live GitHub data — how it works

The GitHub section reads public profile and repository information from the GitHub REST API. The contribution area uses a separate third-party contribution-data service.

A few reliability details:

- API responses are validated before being used.
- Validated results are cached for five minutes.
- Concurrent component mounts share an in-flight request.
- Loading, invalid data, rate limits, timeouts and network failures have explicit UI states.
- Transient contribution-service failures get one bounded automatic retry; a manual retry and GitHub fallback remain available.
- Repository language percentages are based only on repositories that report a language.
- No personal access token or API secret is shipped in the client bundle.

External services can still be unavailable or rate-limited. The portfolio is designed to show a useful fallback rather than inventing live data.

---

## 📁 Project structure

A quick map of the codebase:

```text
.
├── .github/
│   └── workflows/       # Automated verification workflow
├── public/
│   ├── achievements/    # Certificate and event images
│   ├── projects/        # Project preview images
│   └── favicon.png
├── src/
│   ├── components/      # Reusable UI and interactive components
│   ├── data/            # Portfolio content, projects, skills and achievements
│   ├── hooks/           # Shared React hooks
│   ├── pages/           # Route-level page components
│   ├── utils/           # Request, feedback and class utilities
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── tests/               # Regression and production smoke tests
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Where to edit content

| File | Responsibility |
| --- | --- |
| `src/data/content.ts` | Navigation, links, hero stats, capabilities, skills, projects and FAQs |
| `src/data/achievements.ts` | Awards, recognition, certificates and learning milestones |
| `src/data/projectExtras.ts` | Project categories, filters and case-study content |
| `src/data/journey.ts` | Journey timeline |
| `src/data/portfolioUpdates.ts` | Manually maintained current-work and changelog entries |
| `src/components/GitHubSection.tsx` | Live GitHub profile and repository area |
| `src/components/Contributions.tsx` | Contribution activity area |
| `src/hooks/` | Theme, observation and interaction hooks |
| `src/utils/` | Shared request and feedback helpers |

---

## 🎯 Design & engineering principles

- **Useful over flashy:** interactions should help navigation or understanding.
- **Readable in both themes:** light and dark modes are treated as first-class experiences.
- **Honest data:** no fabricated statistics, certificates, contribution counts or project claims.
- **Graceful failure:** external APIs can fail; the interface should explain what happened.
- **Keep the user in control:** reduced-motion preferences and clear interaction feedback matter.
- **Maintainable content:** portfolio facts live in focused data modules instead of being scattered across page markup.
- **Ship carefully:** typecheck, regression tests, production build and smoke tests are part of the verification workflow.

---

## 🚢 Build & deployment

This project uses Vite's single-file plugin. The build creates:

- `dist/index.html` — the application bundle.
- Static assets copied from `public/`.

Deploy the **entire `dist/` directory** to a static hosting provider. Hash-based routes do not require server rewrites.

A couple of deployment details:

- Asset paths currently assume the site is hosted at the domain root.
- For a subdirectory deployment, configure Vite's `base` and review root-relative public asset paths.
- This repository does not currently declare a production homepage/domain. A canonical URL, absolute social-preview image and sitemap should only be added after the actual deployment domain is confirmed.

---

## ⚠️ Notes & current limitations

- GitHub and contribution information depends on external services and can be rate-limited or temporarily unavailable.
- The résumé action opens a Google Drive folder; it is labelled as a folder rather than being presented as a direct PDF download.
- Legal copy is project-specific and should be reviewed before relying on it as formal legal advice.
- Automated DOM tests do not replace real-browser visual, accessibility and device testing.

---

## 🤝 Feedback

Found something confusing, spotted a bug, or have an idea that could make the portfolio better?

- Open an [issue](https://github.com/hmmlavi/portfolio-website/issues).
- Start a [discussion through GitHub](https://github.com/hmmlavi/portfolio-website).
- Or reach out through [LinkedIn](https://www.linkedin.com/in/lakshitsinghsaini/) or [email](mailto:lakshitsinghsaini@gmail.com).

Thoughtful feedback is always welcome.

---

## 👨‍💻 About the developer

**Lakshit Singh Saini (Lavi)** — a Computer Science student who enjoys exploring software, building practical products and learning by shipping.

I work across web, desktop and Android development, and I'm especially interested in the intersection of software engineering and AI.

| Find me | Link |
| --- | --- |
| 🐙 GitHub | [@hmmlavi](https://github.com/hmmlavi) |
| 💼 LinkedIn | [Lakshit Singh Saini](https://www.linkedin.com/in/lakshitsinghsaini/) |
| 📸 Instagram | [@lakshitsinghsaini](https://www.instagram.com/lakshitsinghsaini/) |
| 𝕏 X | [@Lakshits27](https://x.com/Lakshits27) |
| ✉️ Email | [lakshitsinghsaini@gmail.com](mailto:lakshitsinghsaini@gmail.com) |

---

<div align="center">

### Thanks for stopping by.

**Built with curiosity, caffeine and a lot of iterations.**

⭐ If something here inspires you, explore the projects or say hello.

</div>
