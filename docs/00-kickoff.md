# Project Kickoff: The Art of SDLC

| | |
|---|---|
| **Date** | 2026-10-31 |
| **SDLC step** | 1. Project kickoff |
| **Attendees** | Teja (PM / PO), Claude (Tech Lead / Engineering) |
| **Status** | ✅ Approved |

---

## 1. Vision

Help aspiring engineers **think and talk like a senior engineer** by experiencing the full software development life cycle in an interactive, space-themed journey: from PRD to production monitoring.

## 2. v1 Scope

**In scope**
- Space-themed map: the 9 SDLC phases as sectors, the 42 stations as planets, connected by paths
- A draggable astronaut: drop it on a station and click to enter
- A station panel with the standard 8-section content template
- Progress and ranks: Intern → Junior → Mid-level → Senior
- A first set of fully written stations; the rest shown as locked
- A knowledge-base side panel (Agile, Jira workflow, communication, cross-team work)

**Out of scope (v2+)**
- 60–90s animated, captioned videos for each station
- User accounts or a backend (progress is stored locally)

## 3. Roles and Responsibilities

| Who | Role | Responsibilities |
|-----|------|------------------|
| Teja | PM / PO / stakeholder / CAB approver | Owns and approves the PRD, accepts or rejects stories, approves CRs, makes go/no-go calls, performs UAT |
| Claude | Tech Lead, Developer, QA, DevOps/SRE, Scrum Master | Design, build, test, deploy, monitor; runs the ceremonies |
| `code-reviewer` agent | Reviewer | Reviews every change before commit |
| `test-guardian` agent | QA automation | Runs all tests, enforces ≥ 80% coverage, catches regressions |

## 4. Working Agreement

- Every working session starts with a **standup**: done last time, planned today, blockers, board status.
- Every commit passes **code review** and **tests**, then is pushed to GitHub.
- Every step's output is saved in `docs/` and logged in the README journey log.
- Nothing is documented until it has been discussed and agreed.
- We build the product **using the same SDLC it teaches**. Each real artifact becomes the live example in its station.

## 5. Cadence and Tracking

| Item | Decision |
|------|----------|
| Sprint length | 1 week |
| Ceremonies | Standup (every session), refinement (mid-sprint), planning, review/demo, retro |
| Tracking | GitHub Projects board (To Do → In Progress → In Review → QA → Done), set up at step 6 |
| Repository | https://github.com/Teja-Pintu1998/the-art-of-sdlc (private until launch) |
| Target v1 date | To be set in the release plan (step 9) |

## 6. Risks and Mitigations

| # | Risk | Mitigation | Status |
|---|------|------------|--------|
| R1 | Scope creep (42 stations) | Launch v1 with a set of stations; the rest are locked and added incrementally | Accepted |
| R2 | Rich space UI and animations hurt performance | Feasibility spike (step 5) before committing to the approach | Accepted |
| R3 | Content quality is make-or-break | Every station is reviewed against the bar: "Would this land in a big-company interview?" | Accepted |
| R4 | Losing momentum | Weekly sprints with a visible demo at the end of each | Accepted |

## 7. Decisions

- ✅ Vision, v1 scope, roles, working agreement, and risk mitigations approved by the PO.
- ✅ 1-week sprints, tracked on a GitHub Projects board.

## 8. Next Steps

| Step | Owner |
|------|-------|
| 2. Problem statement and business case | Teja and Claude |
| 3. Write the PRD | Teja (owner), Claude (support) |
