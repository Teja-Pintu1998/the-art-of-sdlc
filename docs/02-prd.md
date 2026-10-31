# Product Requirements Document: The Art of SDLC

| | |
|---|---|
| **Product** | The Art of SDLC |
| **Tagline** | `npm install experience` |
| **SDLC step** | 3. Write the PRD |
| **Owner** | Teja (PM / PO) |
| **Engineering** | Claude (Tech Lead) |
| **Version** | v0.9 (draft, pending PRD review) |
| **Status** | 🟡 In review |
| **Related** | [Kickoff](00-kickoff.md) · [Problem statement](01-problem-statement.md) |

---

## 1. Overview and Objective

**What:** An interactive, space-themed web app where users drag an astronaut across 42 SDLC stations, from PRD to production monitoring, and learn each stage with interview-ready explanations, rising in rank from Intern to Senior.

**Why:** Tutorials teach code, not how software is shipped inside a company. AI writes code faster, but the process of shipping it safely is now the core skill interviewers test. *"AI can write the code. Someone still has to ship it."*

**v1 objective:** Launch a polished, explorable map with 13 fully written stations covering all 9 phases, so a user can start the journey and feel the progression from junior to senior.

**v1 architecture constraint:** Frontend only. No backend API, no database, no accounts. Content lives in the repo; progress is saved in the browser. v1 is still deployed to production through the full lifecycle (CI, Docker, staging, UAT, CR, go/no-go, canary, monitoring).

---

## 2. User Personas

### Priya, the fresh graduate
- 23, computer science graduate, has built projects in React and Node
- **Goal:** land a role above entry level at a good product company
- **Pain:** *"When they asked me about deployments, CRs and canary releases, I had nothing to say. I've never seen a real pipeline."*
- **Needs:** an end-to-end picture of the process, plus ready interview answers

### Arjun, the career switcher
- 30, moving from QA or non-tech support into development; bootcamp graduate
- **Goal:** convince interviewers he understands how real teams work
- **Pain:** *"I know some pieces, but I can't connect them. Who does what, and in what order?"*
- **Needs:** the order of steps, the roles involved, and the vocabulary

### Rahul, the startup developer
- Works at a small startup; deploys straight to production with no formal process
- **Goal:** move to a large company
- **Pain:** *"At my company we just push to main. Big-company interviews ask about CAB approvals and go/no-go meetings, and I've never done them."*
- **Needs:** how large companies do it, and how to talk about it with confidence

---

## 3. User Journeys

### Journey A: First visit (exploration)
1. Lands on the page and sees a space command centre with `npm install experience`
2. A short, skippable intro shows how to drag the astronaut onto a station
3. Drags the astronaut to **Station 1: Problem statement** and opens it
4. The station panel opens with the 8 content sections
5. Marks the station complete; the progress bar fills and the next station glows
6. Continues exploring along the path

### Journey B: Returning user (progression)
1. Returns; progress is restored and the astronaut is on their last station
2. Continues; ranks unlock along the way (Intern → Junior → Mid-level → Senior)
3. Reaches the final station and sees `git commit -m "became senior"`, a celebration, and a journey summary

### Journey C: Interview cram (targeted)
1. Has an interview tomorrow and wants only "CR" and "Canary"
2. Searches or drags straight to those stations; free exploration is allowed
3. Jumps directly to **"Say this in your interview"** and **"Interview questions"**

### Navigation and rank rules
- Stations are **freely explorable**; the recommended next station glows.
- Rank is based on the **percentage of available stations completed**: Junior 25%, Mid-level 50%, Senior 100%.
- A rank is **never lost** once earned, even when new stations are added.

---

## 4. Functional Requirements

Priority: **M** = Must have, **S** = Should have, **C** = Could have

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | **Space map:** 9 phases as sectors, 42 stations as planets, glowing paths showing the order | M |
| FR-2 | **Astronaut:** drag and drop onto any station, snap to the nearest one, click or press Enter to open it | M |
| FR-3 | **Keyboard and mobile alternatives:** Tab or arrow keys move between stations on desktop; tap to select on mobile | M |
| FR-4 | **Station panel:** the 8 content sections, with Close, Previous/Next station and Mark as complete | M |
| FR-5 | **Progress:** completed stations visibly marked; progress bar; progress saved in the browser and survives refresh | M |
| FR-6 | **Ranks:** Intern → Junior (25%) → Mid-level (50%) → Senior (100%), with a celebration and a command tagline at each rank-up | M |
| FR-7 | **Locked stations:** not-yet-written stations appear dimmed with a "Coming soon" teaser | M |
| FR-8 | **Recommended next:** the next station in order glows | S |
| FR-9 | **Onboarding:** a 10-second skippable intro on how to drag the astronaut | S |
| FR-10 | **Quick jump / search:** find a station by name and jump straight to it | S |
| FR-11 | **Knowledge base panel:** Agile ceremonies, Jira workflow, stakeholder communication, working with other teams | S |
| FR-12 | **Feedback prompt:** "Was this helpful for interviews?" (👍/👎) at the end of each station | S |
| FR-13 | **Reset progress:** start the journey over | S |
| FR-14 | **Interview mode:** show only "Say this in your interview" and the interview questions | C |
| FR-15 | **Sound effects** (off by default) | C |
| FR-16 | **Share achievement:** share your rank on LinkedIn | C |

### Rank taglines

| Rank | Tagline |
|------|---------|
| Intern (landing) | `npm install experience` |
| Junior | `git checkout -b junior` |
| Mid-level | `docker build -t you:mid .` |
| Senior | `git commit -m "became senior"` |

### v1 stations (13 fully written)

| Phase | Stations |
|-------|----------|
| 1. Discovery and planning | #1 Problem statement · #2 PRD · #4 Epics and stories |
| 2. Design | #7 UX design |
| 3. Development | #10 Git · #13 Code quality · #14 Pull request and code review |
| 4. Continuous integration | #15 CI pipeline · #17 Docker image build and image tagging |
| 5–6. Testing and release governance | #26 CR · #27 Go/No-Go |
| 7–8. Deployment and monitoring | #29 Canary · #34 New Relic |

Each station is written when we reach that step in our own build, so its "How we did it" section shows real artifacts. All other stations appear locked.

---

## 5. Station Content Requirements

| Rule | Requirement |
|------|-------------|
| **Template** | All 8 sections required: What it is · Why it exists · How it works in big companies · Real-world example · Common problems and how seniors handle them · Say this in your interview · Interview questions · How we did it in this project |
| **Length** | 3–5 minutes of reading per station |
| **"Say this in your interview"** | A spoken answer of 60–90 seconds (about 150–200 words), in the first person, confident and specific |
| **Interview questions** | At least 5 questions, each with a strong answer |
| **Domain-agnostic** | Examples work for any domain; tool names include alternatives (e.g. "Jenkins / GitHub Actions / GitLab CI") |
| **Quality bar** | "Would this land in a big-company interview?" Reviewed before publishing |
| **Tone** | Simple, direct, no fluff; never mention years of experience, just "senior engineer" |
| **Format** | One structured content file per station; adding a station means adding a file, not code |

---

## 6. Non-Functional Requirements

| Area | Requirement |
|------|-------------|
| **Performance** | Lighthouse ≥ 90; main content loads in under 2.5s; smooth 60fps animations |
| **Accessibility** | WCAG 2.1 AA; fully keyboard-usable; screen-reader friendly; honours the "reduce motion" system setting |
| **Devices** | Desktop is the primary experience; tablet and mobile fully supported |
| **Browsers** | Latest 2 versions of Chrome, Safari, Firefox and Edge |
| **SEO** | Each station has its own web address and page metadata (e.g. `/station/canary-deployment`) |
| **Privacy** | No accounts and no personal data; analytics are anonymous |
| **Security** | Security headers; no secrets in code; dependency scanning in CI |
| **Quality** | Test coverage ≥ 80%; CI must pass before merging |
| **Maintainability** | Content is kept separate from code |

---

## 7. Out of Scope (v1)

| Item | When |
|------|------|
| Animated videos for each station (60–90s, with captions) | v2 |
| User accounts, login, progress across devices | v2 |
| Backend API and database | v2 |
| The remaining 29 stations as full content (locked in v1) | Added over time |
| Multiple languages | Later |
| Paid features | Not planned |

---

## 8. Success Metrics and Tracking

| KPI | Target (first 3 months) | How we measure it |
|-----|-------------------------|-------------------|
| Visitors who complete Phase 1 | ≥ 60% | Analytics event when a station is completed |
| Visitors who reach the Senior rank | ≥ 20% | Analytics event when a rank is reached |
| Users who rate it "helpful for interviews" | ≥ 70% 👍 | Feedback prompt (FR-12) |
| Lighthouse performance score | ≥ 90 | Lighthouse checks in CI plus New Relic browser monitoring |

---

## 9. Assumptions, Dependencies and Open Questions

### Assumptions
- Users are on desktop or modern mobile browsers.
- The content covers how most companies work (we aim for 90% coverage).
- Users accept local progress saving (no login).

### Dependencies
- GitHub (repo, CI, project board)
- A hosting provider (chosen in the technical design, step 12)
- New Relic free tier for monitoring
- Animation and drag-and-drop libraries performing well (confirmed in the feasibility spike, step 5)

### Open questions

| # | Question | Decided in |
|---|----------|------------|
| Q1 | Which hosting provider, and can it support Docker and canary releases? | Step 12, technical design |
| Q2 | Content files in MDX or JSON? | Step 12, technical design |
| Q3 | Target v1 launch date | Step 9, release plan |
| Q4 | Domain name | Before launch |

---

## 10. Release Criteria

v1 is ready to launch when:

- [ ] All **Must have** requirements are done and accepted by the PO
- [ ] All 13 v1 stations are fully written and reviewed against the quality bar
- [ ] Test coverage ≥ 80%; all tests pass; no open P1 or P2 bugs
- [ ] Lighthouse ≥ 90; accessibility checks pass
- [ ] UAT signed off by the PO
- [ ] CR approved and the go/no-go meeting results in **Go**
- [ ] Monitoring and alerts are live before full rollout

---

## Scope Change Process

Changes after sign-off are welcome, but they go through a controlled process:

1. **Raise:** anyone proposes a new feature or change.
2. **Assess:** engineering estimates the effort, risk and timeline impact.
3. **Decide:** the PO adds it to v1, defers it to v2, or rejects it.
4. **Record:** the PRD version is bumped and the change is logged below.
5. **Backlog:** it becomes a story and is prioritised in sprint planning.

## Change Log

| Version | Date | Change | Author |
|---------|------|--------|--------|
| v0.9 | 2026-10-31 | Initial draft (all 10 sections) | Teja / Claude |
