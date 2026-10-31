# The Art of SDLC

> `npm install experience`

An interactive, space-themed dashboard that teaches the full software development life cycle, from PRD to production monitoring, the way it's practised at large companies. It's built for people who want to think and talk like a senior engineer in interviews, even before they've been one.

When the user reaches the Senior rank:

> `git commit -m "became senior"`

---

## Table of Contents

1. [The Idea](#the-idea)
2. [Product Decisions](#product-decisions)
3. [How We Build It](#how-we-build-it)
4. [The 42 Stations (Dashboard Content)](#the-42-stations-dashboard-content)
5. [Our Build Process (46 Steps)](#our-build-process-46-steps)
6. [Documentation Structure](#documentation-structure)
7. [Journey Log](#journey-log)

---

## The Idea

Tutorials teach frameworks. They don't teach **how real work flows inside a company**: who hands what to whom, which meetings happen, which approvals are needed, and how code reaches production and is monitored there. Interviewers spot that gap within minutes.

**The Art of SDLC** fills it. The user drags an astronaut across a space-themed map and drops it on a station (Docker, CI, CR, Canary, New Relic and so on) to learn that stage in depth. Each station is written so that **saying it as-is in an interview at a big company would land**. The content is domain-agnostic: the process is the same for a React developer at a retailer and a backend engineer at a bank.

---

## Product Decisions

| Decision | Choice |
|----------|--------|
| Name | **The Art of SDLC** |
| Landing tagline | `npm install experience` |
| Senior-rank tagline | `git commit -m "became senior"` |
| Theme | Space / sci-fi command centre (phases = sectors, stations = planets) |
| Core interaction | A draggable astronaut: drop it on a station and click to enter |
| Progression | Intern → Junior → Mid-level → Senior |
| Tech stack | Next.js, React, Tailwind CSS, Framer Motion |
| v1 scope | Full platform plus a first set of fully written stations; the rest shown as locked |
| v2 (later) | A 60–90s animated, captioned video for every station |

### Content template for every station

| Section | Purpose |
|---------|---------|
| What it is | A simple, clear definition |
| Why it exists | The real problem it solves |
| How it works in big companies | The real process, roles and tools |
| Real-world example | A concrete scenario |
| Common problems and how seniors handle them | Practical experience |
| Say this in your interview | A ready-to-speak, senior-level answer |
| Interview questions you'll get | Likely questions with strong answers |
| How we did it in this project | Links to this project's real artifacts |

---

## How We Build It

**We build the product using the same process it teaches.** Every SDLC step we go through produces a real artifact (PRD, design doc, CI pipeline, CR, monitoring dashboard), and that artifact becomes the live example in the matching station.

### Roles

| Role | Who |
|------|-----|
| Product Manager / Product Owner, stakeholder, CAB approver | Teja |
| Tech Lead, Developer, QA, DevOps/SRE, Scrum Master | Claude |

### Recurring ceremonies

| Ceremony | When | Agenda |
|----------|------|--------|
| Daily standup | Start of every working session | Done last time · Planned today · Blockers · Board status |
| Backlog refinement | Mid-sprint | Clarify upcoming stories, acceptance criteria, re-estimate |
| Sprint planning | Start of sprint | Sprint goal, committed stories, capacity |
| Sprint review / demo | End of sprint | Demo working features; PO accepts or rejects |
| Retrospective | After review | What went well, what didn't, what we'll change |

### The story loop (every ticket)

```
Pick ticket → In Progress → feature branch → code + unit tests
→ lint/format (pre-commit hooks) → PR (template) → CI → code review
→ squash-merge → auto-deploy to Dev → QA verifies → Done
```

---

## The 42 Stations (Dashboard Content)

### Phase 1: Discovery and Planning
1. Problem statement / business case
2. PRD creation and PRD review
3. Technical feasibility / spike
4. Epics, user stories and acceptance criteria
5. Estimation and backlog grooming
6. Sprint planning

### Phase 2: Design
7. UX design and design review
8. Technical design / architecture review
9. Security and privacy review

### Phase 3: Development
10. Git and version control
11. Development with feature flags
12. Unit tests and local testing
13. Code quality (ESLint, Prettier, Husky, lint-staged)
14. Pull request and code review

### Phase 4: Continuous Integration
15. CI pipeline (preflight → install → lint → build → tests → coverage)
16. Static analysis and security scans
17. Docker image build
18. Image tagging and artifact registry

### Phase 5: Testing and Environments
19. Environments (Dev → QA → Stage/Pre-prod → Prod)
20. QA testing (functional, integration, regression, E2E)
21. Performance and accessibility testing
22. UAT
23. Pre-prod testing
24. Stakeholder demo and sign-off

### Phase 6: Release Governance
25. Release notes, runbook and rollback plan
26. CR (Change Request) and CAB approval
27. Go/No-Go meeting

### Phase 7: Deployment
28. Production deployment (CD, multi-region)
29. Canary deployment
30. Smoke testing / post-deploy verification
31. Progressive rollout
32. Full rollout
33. Rollback strategy

### Phase 8: Monitoring and Observability
34. Logs and APM (New Relic)
35. Dashboards as code (Terraform widgets, page actions)
36. User behaviour analytics (Quantum Metric)
37. Alerts and on-call
38. Incident management and postmortem

### Phase 9: Closure
39. Documentation
40. Success metrics review
41. Sprint review and retrospective
42. Close-out and handoff

**Background concepts (knowledge-base side panel):** Agile ceremonies, Jira workflow, stakeholder communication, working with other teams.

---

## Our Build Process (46 Steps)

| Stage | Steps |
|-------|-------|
| **A. Initiation** | 1. Project kickoff · 2. Problem statement and business case · 3. Write the PRD · 4. PRD review and sign-off · 5. Technical feasibility spike |
| **B. Planning** | 6. Epics and user stories · 7. Definition of Ready / Done · 8. Estimation and prioritisation · 9. Release plan |
| **C. Design** | 10. UX design · 11. UX design review · 12. Technical design doc · 13. Architecture review · 14. Security and privacy review |
| **D. Sprint 0 (Foundation)** | 15. Repo and Git setup · 16. Project scaffolding · 17. Code quality tooling · 18. Testing framework · 19. CI pipeline (GitHub Actions) · 20. Docker setup · 21. Environments |
| **E. Development Sprints** | Sprint 1: Space world · Sprint 2: Astronaut and station panel · Sprint 3: Content system and first stations · Sprint 4: Design, Git, Code quality, PR, CI, Docker stations · Sprint 5: Progress, ranks, locked stations, knowledge base · Sprint 6: Polish |
| **F. Testing and Stabilisation** | 22. QA testing · 23. Bug triage and fixes · 24. Performance and accessibility testing · 25. Code freeze · 26. Deploy to staging · 27. UAT |
| **G. Release Governance** | 28. Release notes · 29. Runbook and rollback plan · 30. Change Request · 31. CAB approval · 32. Go/No-Go meeting |
| **H. Deployment** | 33. Production deployment · 34. Canary release · 35. Smoke testing · 36. Progressive and full rollout · 37. Hypercare |
| **I. Monitoring and Operations** | 38. Observability setup · 39. Dashboards as code · 40. User analytics · 41. Alerts · 42. Incident drill and postmortem |
| **J. Closure** | 43. Success metrics review · 44. Final documentation · 45. Project retrospective · 46. Handoff and v2 planning |

---

## Documentation Structure

```
README.md            → overview, decisions, process, journey log (this file)
docs/
  01-problem-statement.md
  02-prd.md
  03-tech-design.md
  ...
  features/          → one document per built feature
                       (goal, scope, decisions, files, how it works, testing, known issues, next steps)
```

---

## Journey Log

| Date | Step | Summary |
|------|------|---------|
| 2026-10-31 | Ideation | Defined the concept, chose the space theme and tech stack, finalised the 42 stations and the 46-step build process, and named the product **The Art of SDLC** with its taglines. |
| 2026-10-31 | 1. Project kickoff | Approved the vision, v1 scope, roles, working agreement, 1-week sprints and risk mitigations. See [docs/00-kickoff.md](docs/00-kickoff.md). |
| 2026-10-31 | 2. Problem statement | Defined the problem, target users, why the SDLC still matters in the AI era, goals (product + portfolio) and success KPIs. See [docs/01-problem-statement.md](docs/01-problem-statement.md). |
| 2026-10-31 | 3. Write the PRD | Drafted the PRD (v0.9): personas, journeys, 16 functional requirements, 13 v1 stations, content rules, non-functional requirements, scope, KPIs and release criteria. Frontend-only v1 (no API or database). See [docs/02-prd.md](docs/02-prd.md). |

**Next:** Step 4, PRD review and sign-off.
