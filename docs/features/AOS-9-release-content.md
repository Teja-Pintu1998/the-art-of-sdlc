# AOS-9: Content: release, deployment and monitoring stations 🔵

> **As a** learner, **I want** interview-ready lessons on how software is released and monitored, **so that** I can talk confidently about production ownership.

**Status:** in progress (Sprint 5). Written along the release, because each lesson's "How we did it" uses the real artifact. AOS-9 closes after launch, once 9.3 and 9.4 have their real results (PRD RC-1).

| Task | Station | Status | Real artifact |
|------|---------|--------|---------------|
| 9.1 | #26 CR and CAB approval | ✅ Written 2026-11-01, after CR-001 was approved | [CR-001](../12-change-request.md) |
| 9.2 | #27 Go/No-Go | ⏳ After the Go/No-Go meeting | Go/No-Go record |
| 9.3 | #29 Canary | ⏳ "How we did it" after the v1.0.1 canary | New Relic canary-vs-stable data |
| 9.4 | #34 New Relic | ⏳ "How we did it" after hypercare | Live dashboard and alerts |

## 9.1 #26 CR and CAB approval

- **Core:** what a CR answers (what, why, risk, plan, rollback); the CAB; ITIL standard, normal and emergency changes; change windows and freezes.
- **Senior angle:** process should match risk. Automate low-risk approvals from pipeline evidence (*Accelerate*: heavyweight approval doesn't lower the change failure rate).
- **QuickBite:** CHG-2041 for "Schedule your order" (medium risk: payments). CAB raised the failed-card question and asked for a support briefing; approved with conditions.
- **How we did it:** CR-001 (normal, low risk), the placeholder-production finding that moved the first canary to v1.0.1, and the PO as the whole CAB, with the approval recorded verbatim.
- **Checks:** passes every build-time rule (reading time under 5 minutes, 165-word interview answer, 5 questions, no years of experience). All 222 unit, 106 E2E and 4 visual tests pass.

**Signed off by the PO on 2026-11-01** ("go" at the Go/No-Go meeting).

## Follow-ups

*(None yet.)*
