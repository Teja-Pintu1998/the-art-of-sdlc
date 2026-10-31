# User Stories: The Art of SDLC

| | |
|---|---|
| **Date** | 2026-10-31 |
| **SDLC step** | 6. Epics and user stories |
| **Owner** | Teja (PO); drafted by Claude (Tech Lead) |
| **Source** | [PRD v1.3](02-prd.md) · [Spike findings](03-spike-findings.md) |
| **Tracking** | [GitHub Issues #1–#10](https://github.com/Teja-Pintu1998/the-art-of-sdlc/issues) on the [project board](https://github.com/users/Teja-Pintu1998/projects/2) (To Do → In Progress → In Review → QA → Done) |
| **Status** | ✅ Approved by the PO (10-story structure) |

---

## How the backlog works

- **v1 has 10 user stories (AOS-1 to AOS-10)**, written at the feature level so the board stays clean. The first draft had 8 epics and 48 stories; at the PO's request the epics were folded into these 10 stories (see Traceability).
- Each story has a **task checklist**. Every task keeps its own acceptance criteria and is delivered as its **own small branch and PR**, with code review and tests, so reviews stay small.
- A story moves to **Done** only when **all** of its tasks are done and the PO accepts it at the sprint demo.
- **Lifecycle:** Product backlog → refinement (estimate, clarify) → sprint planning (pick the top stories) → work **one task at a time** (WIP limit: 1) → sprint demo → Done. Refinement can add or reshape tasks (e.g. SC-2).

**Task loop (every task):**
```
In Progress (branch, code, tests) → In Review (PR, code-reviewer, test-guardian, CI) → QA → task ticked ✅
```

Story points are added in step 8; the Definition of Ready / Done is set in step 7.

---

## Overview

| Story | Title | PRD coverage | Tasks |
|-------|-------|--------------|-------|
| AOS-1 | Engineering foundation | Sprint 0, quality NFRs | 7 |
| AOS-2 | Space map | FR-1, FR-7 | 5 |
| AOS-3 | Astronaut and navigation | FR-2, FR-3, FR-8 | 5 |
| AOS-4 | Station panel and content system | FR-4, FR-12, FR-14, SEO | 5 |
| AOS-5 | Progress and ranks | FR-5, FR-6, FR-13 | 4 |
| AOS-6 | Onboarding and discovery | FR-9, FR-10, FR-11 | 3 |
| AOS-7 | Content: planning and design stations | Stations #1, #2, #3, #4, #7 | 5 |
| AOS-8 | Content: development and CI stations | Stations #10, #13, #14, #15, #17 | 5 |
| AOS-9 | Content: release, deployment and monitoring stations | Stations #26, #27, #29, #34 | 4 |
| AOS-10 | Observability and analytics | KPIs, monitoring | 3 |

**Post-v1 backlog (Could have, not part of the 10):** sound effects (FR-15), share your rank on LinkedIn (FR-16).

---

## AOS-1: Engineering foundation

> **As a** developer, **I want** a fully set-up project with quality gates, CI, containers and environments, **so that** every change is built, checked and deployable from day one.

| # | Task | Acceptance criteria |
|---|------|---------------------|
| 1.1 | Repo setup | `main` is protected; merging requires a PR with passing CI; a PR template is used |
| 1.2 | Project scaffolding | Next.js + TypeScript + Tailwind + Framer Motion; the app runs locally; folder structure matches the technical design |
| 1.3 | Code quality tooling | ESLint, Prettier, Husky + lint-staged; a commit with lint or format errors is rejected |
| 1.4 | Testing framework | Unit, E2E and **visual regression** tests set up (spike lesson L4); sample tests pass; coverage report with a ≥ 80% gate; screenshot test at 3 zoom levels; E2E tests run on Chromium, WebKit (Safari) and Firefox (PRD browser support) |
| 1.5 | CI pipeline | GitHub Actions: install → lint → type check → test → build, plus **Lighthouse CI** (performance ≥ 90, main content < 2.5s), **automated accessibility checks** (axe, zero serious violations) and **dependency scanning**; any failure blocks the merge |
| 1.6 | Docker | The app is containerised; the image builds in CI; tag = version + commit SHA |
| 1.7 | Environments and release capability | Each PR gets a preview link; staging and production are deployed by the pipeline; production supports a **canary (partial-traffic) rollout** and a **rollback** to a previous image tag; **security headers** are set in every environment |

**Owned outside this backlog:** re-testing on a real low-end Android phone and an older laptop (spike L1) happens in build step 24, performance and accessibility testing.

## AOS-2: Space map

> **As a** learner, **I want** an immersive, explorable space map of the whole SDLC, **so that** I understand the journey and enjoy exploring it.

| # | Task | Acceptance criteria |
|---|------|---------------------|
| 2.1 | Landing view and starfield | First view shows the command centre with the landing tagline `npm install experience`; twinkling starfield, decorative and `aria-hidden`; twinkle and parallax stop when reduced motion is on; ≥ 58fps average during continuous pan/zoom in the benchmark (spike method) |
| 2.2 | Planets and path | All 9 phases and 42 stations in order, connected by a glowing path; sector titles never overlap; path animation stops when reduced motion is on |
| 2.3 | Pan and zoom | Drag pans; wheel and pinch zoom; **semantic zoom** (path stays 2.5px on screen, planets never below the minimum size, no flicker at any zoom, per spike 3.8); **transform-only** updates with the view kept in a ref (≈ 60fps at 20× CPU throttle); opens on the user's current phase |
| 2.4 | Mini-map | Shows all stations and the current viewport; clicking navigates |
| 2.5 | Locked stations | Unwritten stations dimmed with "Coming soon"; the teaser shows the station name |

## AOS-3: Astronaut and navigation

> **As a** learner (mouse, keyboard or touch), **I want** to move an astronaut between stations, **so that** exploring the SDLC feels like a journey.

| # | Task | Acceptance criteria |
|---|------|---------------------|
| 3.1 | Drag and snap | Custom pointer drag (not Framer Motion's `drag`, per spike 3.3); tracks the cursor exactly at every zoom; snaps to the nearest station with a spring animation (instant when reduced motion is on); returns to its last station if dropped in empty space |
| 3.2 | Preview card (SC-2) | On landing: station name, one-line summary and "Enter station →"; clicking it opens the station panel; doesn't cover the planet |
| 3.3 | Keyboard navigation | The astronaut is a focusable `role="button"` with an `aria-label` naming its current station; Tab focuses it; arrows move it and update the card; Enter opens the station; Escape closes the panel, then the card, returning focus to the astronaut |
| 3.4 | Mobile tap | Tapping a planet moves the astronaut there and shows the card; pinch zooms |
| 3.5 | Recommended next | The next uncompleted station in order glows |

## AOS-4: Station panel and content system

> **As a** learner, **I want** each station to open into a rich, well-structured lesson, **so that** I can learn the topic in depth and use it in interviews.

| # | Task | Acceptance criteria |
|---|------|---------------------|
| 4.1 | Content format | A structured file per station with all 8 sections; the build fails if a section is missing; adding a station needs no code changes |
| 4.2 | Station panel | All 8 sections render; **Mark as complete** button; Previous/Next; Close; on a 375px-wide screen, no horizontal scrolling and body text ≥ 16px |
| 4.3 | Station web addresses (SEO) | `/station/[slug]` opens the map with that panel open (skipping the card) and the astronaut placed on that station; unique page title and description per station |
| 4.4 | Feedback prompt | "Was this helpful for interviews?" 👍/👎 at the end of each panel; sends the feedback event defined in 10.1 |
| 4.5 | Interview mode *(Could have)* | A toggle shows only "Say this in your interview" and the interview questions |

## AOS-5: Progress and ranks

> **As a** learner, **I want** my progress tracked and rewarded with ranks, **so that** I feel myself becoming a senior engineer.

| # | Task | Acceptance criteria |
|---|------|---------------------|
| 5.1 | Mark complete and progress bar | Clicking **Mark as complete** (4.2) marks the station; completed planets are visibly marked; the progress bar updates |
| 5.2 | Save progress | Saved in the browser; survives refresh and browser restart; the astronaut starts at the last station |
| 5.3 | Ranks and celebration | Ranks at **25% / 50% / 100% of available stations, rounded up** (4 / 7 / 14 at launch): Intern → Junior → Mid-level → Senior; each rank-up shows a celebration with its command tagline (`git checkout -b junior` · `docker build -t you:mid .` · `git commit -m "became senior"`); reaching Senior also shows a **journey summary**; a rank is never lost |
| 5.4 | Reset progress | Confirmation prompt; clears all progress |

## AOS-6: Onboarding and discovery

> **As a** first-time or returning learner, **I want** help getting started and quick ways to find topics, **so that** I can use the map easily and cram before an interview.

| # | Task | Acceptance criteria |
|---|------|---------------------|
| 6.1 | Onboarding intro | About 10 seconds; skippable; shown once only |
| 6.2 | Search / quick jump | Typing "canary" finds the station; selecting it moves the astronaut there |
| 6.3 | Knowledge-base panel | Opens from a button on the map and closes with Close or Escape; keyboard accessible; covers Agile ceremonies, Jira workflow, stakeholder communication and working with other teams |

## Content stories (AOS-7, AOS-8, AOS-9)

Each station's content is written **when we reach that step in our own build**, so its "How we did it" section links to real artifacts from this project.

**Acceptance criteria for every station:** all 8 sections (What it is · Why it exists · How it works in big companies · Real-world example · Common problems and how seniors handle them · Say this in your interview · Interview questions · How we did it in this project) · 3–5 minutes of reading · interview answer of 60–90 seconds spoken (150–200 words), first person, confident and specific · at least 5 interview questions with answers · domain-agnostic, with tool alternatives · never mentions years of experience · passes the quality bar ("Would this land in a big-company interview?"), **signed off by the PO before publishing**.

### AOS-7: Content: planning and design stations

> **As a** learner, **I want** interview-ready lessons on how work is planned and designed, **so that** I can talk confidently about the start of a project.

| # | Station | Extra acceptance criteria |
|---|---------|---------------------------|
| 7.1 | #1 Problem statement | |
| 7.2 | #2 PRD | |
| 7.3 | #3 Technical feasibility / spike | Uses our spike as the real example (SC-1) |
| 7.4 | #4 Epics and stories | Also covers the backlog lifecycle and the story/task loop, because #5 and #6 are locked in v1 (PO decision, 2026-10-31, recorded in the PRD change log as v1.3) |
| 7.5 | #7 UX design | |

### AOS-8: Content: development and CI stations

> **As a** learner, **I want** interview-ready lessons on how code is written, reviewed and integrated, **so that** I can talk confidently about engineering practices.

| # | Station |
|---|---------|
| 8.1 | #10 Git |
| 8.2 | #13 Code quality (ESLint, Prettier, Husky) |
| 8.3 | #14 Pull request and code review |
| 8.4 | #15 CI pipeline |
| 8.5 | #17 Docker and image tagging |

### AOS-9: Content: release, deployment and monitoring stations

> **As a** learner, **I want** interview-ready lessons on how software is released and monitored, **so that** I can talk confidently about production ownership.

| # | Station | Extra acceptance criteria |
|---|---------|---------------------------|
| 9.1 | #26 CR | |
| 9.2 | #27 Go/No-Go | |
| 9.3 | #29 Canary | "How we did it" shows "Coming after launch", completed in hypercare (PRD RC-1) |
| 9.4 | #34 New Relic | "How we did it" shows "Coming after launch", completed in hypercare (PRD RC-1) |

**Note:** AOS-9 closes after launch, when 9.3 and 9.4 get their real artifacts.

## AOS-10: Observability and analytics

> **As the** PM and the engineering team, **we want** product analytics and production monitoring, **so that** we can measure success and catch problems before users report them.

| # | Task | Acceptance criteria |
|---|------|---------------------|
| 10.1 | KPI analytics events | Owns all analytics events: station completed, **Phase 1 completed** (all *available* Phase 1 stations, per RC-3), rank reached, feedback given (sent from 4.4); anonymous, cookie-free where possible |
| 10.2 | New Relic + Terraform dashboard | Browser monitoring live; dashboard created from Terraform code; page actions tracked |
| 10.3 | Alerts | Thresholds documented (starting point: JS error rate > 1% of page views, or page load p75 > 2.5s, over 15 minutes); a test alert fires and is received |

---

## Traceability

Every item from the original 48-story draft maps to a task above:

| Original draft | Now |
|----------------|-----|
| AOS-1 to 7 | AOS-1 tasks 1.1–1.7 |
| AOS-8 to 12 | AOS-2 tasks 2.1–2.5 |
| AOS-13 to 17 | AOS-3 tasks 3.1–3.5 |
| AOS-18 to 22 | AOS-4 tasks 4.1–4.5 |
| AOS-23 to 26 | AOS-5 tasks 5.1–5.4 |
| AOS-27 to 29 | AOS-6 tasks 6.1–6.3 |
| AOS-30 to 34 | AOS-7 tasks 7.1–7.5 |
| AOS-35 to 39 | AOS-8 tasks 8.1–8.5 |
| AOS-40 to 43 | AOS-9 tasks 9.1–9.4 |
| AOS-44 to 46 | AOS-10 tasks 10.1–10.3 |
| AOS-47, 48 | Post-v1 backlog |
