# Release Notes: The Art of SDLC v1.0.0

| | |
|---|---|
| **Date** | 2026-11-01 (draft; final at Go/No-Go) |
| **SDLC step** | 28. Release notes |
| **Owner** | Claude (Release manager) |
| **Release candidate** | `develop` at `90ea5fd` (code freeze `727fea9`, UAT approved) |
| **Status** | 📝 Draft for the CR and Go/No-Go |

---

## For learners: what's new

**The Art of SDLC is live.** It's a space-themed journey through the whole software development life cycle, from the first problem statement to production monitoring, with interview-ready lessons along the way.

- 🗺️ **Explore the map:** 9 phases and 42 stations along a glowing path. Drag to pan, scroll or pinch to zoom, or use the keyboard (`+`, `-`, and `0` to see the whole journey). A mini-map shows where you are.
- 👩‍🚀 **Fly the astronaut:** drag it onto a planet, tap one, or use the arrow keys. Land to preview a station, then **Enter station** to open the lesson.
- 📚 **14 lessons in v1**, each with 8 sections, including "Say this in your interview" and 5 interview questions. Other stations show "Coming soon".
  - **Planning and design:** problem statement, PRD, technical feasibility, epics and stories, UX design
  - **Development and CI:** Git, code quality, pull requests, CI pipeline, Docker
  - **Release and monitoring:** Change Request, Go/No-Go, canary deployment, New Relic. Their "How we did it" sections show this very release, so #29 and #34 are completed after launch.
- 🎓 **Interview mode:** show only the interview answers and questions.
- 🏅 **Progress and ranks:** mark stations complete and rank up from Intern to Junior, Mid-level and Senior. Progress stays in your browser; there are no accounts.
- 🔎 **Quick jump** (`/`) to find any station, plus a **knowledge base**: Agile ceremonies, Jira workflow, stakeholder communication, working with other teams.
- ♿ **Accessible:** fully usable from the keyboard, works with screen readers (a text overview of the journey), honours "reduce motion", and works on phones.

**Privacy:** no accounts and no personal data. Analytics are anonymous and cookie-free. The only cookie is a random number that keeps you on one version during a canary rollout.

## For the team: technical changes since the last production deploy

Production (`main`) currently serves the Sprint 0 placeholder. This release ships everything built in Sprints 1 to 5 (49 commits):

| Area | Change | Story |
|---|---|---|
| Map | Canvas starfield, semantic zoom, mini-map, locked stations; keyboard zoom; zoomed-out lock badges | AOS-2 |
| Navigation | Draggable astronaut with snap, preview card, keyboard and tap navigation | AOS-3 |
| Content | Markdown lessons validated at build time; station pages with their own URL and metadata (SEO); interview mode | AOS-4, 7, 8 |
| Progress | Versioned `localStorage` store, ranks, celebrations, reset | AOS-5 |
| Discovery | Onboarding intro (server-rendered for a fast first paint), search, knowledge base | AOS-6 |
| Monitoring | New Relic browser agent (anonymous), events tagged by `release`; dashboard and alerts as Terraform | AOS-10 |
| Release | Security headers and CSP everywhere; Docker image built, scanned and pushed in CI; cookie-based canary router in `proxy.ts` | AOS-1.6, 1.7 |

**Quality:** 222 unit tests (98.8% coverage), 106 E2E tests on Chromium and WebKit (Firefox in CI), 4 visual tests, Lighthouse performance 96 and accessibility 100. See the [QA report](09-qa-report.md).

**Config needed in production:** `NEXT_PUBLIC_NEW_RELIC=on` (set). For the canary, also `CANARY_URL`, `CANARY_PERCENT` and `VERCEL_AUTOMATION_BYPASS_SECRET`; see the runbook.

## Known issues

- Lighthouse's simulated slow phone measures LCP at about 2.8 s. Real first paint is under 0.1 s, and the PO accepted a 3 s CI limit (PRD SC-4).
- Firefox is verified by CI only (no local runs).
- Minor polish deferred (P4): mini-map viewport ignores the hero; star density is higher on phones. Full list in the QA report.

## Rollback

Vercel Instant Rollback to the previous production deployment (under a minute). During a canary, set `CANARY_PERCENT=0` and redeploy. Details are in the runbook.
