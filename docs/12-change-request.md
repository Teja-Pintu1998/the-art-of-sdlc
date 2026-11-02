# Change Request CR-001: Launch The Art of SDLC v1.0.0

| | |
|---|---|
| **CR ID** | CR-001 |
| **Date raised** | 2026-11-01 |
| **SDLC steps** | 30. Change Request · 31. CAB approval |
| **Requested by** | Claude (Release manager) |
| **Change type** | **Normal** (planned, needs CAB approval; not standard or emergency) |
| **Status** | ⏳ Awaiting CAB approval |

---

## 1. Description

Replace the Sprint 0 placeholder in production with **The Art of SDLC v1.0.0**: the space map, astronaut navigation, 14 lessons, progress and ranks, onboarding, search, knowledge base, anonymous New Relic monitoring, security headers and the canary router (inactive until `CANARY_*` is set). Full scope is in the [release notes](10-release-notes.md).

## 2. Reason and business value

This delivers the PRD's v1 goal: learners can use an interview-ready SDLC journey on the public site. It also produces the real artifacts the release lessons teach with (#26 CR, #27 Go/No-Go, #29 Canary, #34 New Relic).

## 3. Implementation plan

Follow the [runbook](11-runbook.md), sections 2–4:

1. PR `develop` → `main` with all 7 CI checks green; Linux visual baselines; `test-guardian` PASS.
2. Squash-merge; Vercel deploys production.
3. Smoke test (7 checks), then hypercare for 7 days.

The first canary runs with the next release, v1.0.1 (PO decision: production has no meaningful stable version yet).

**Proposed window:** the day after Go/No-Go, at a low-traffic time. Duration: about 30 minutes, including the smoke test. **Expected downtime: none** (Vercel switches deployments atomically).

## 4. Impact and risk assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| A bug that tests missed reaches users | Low | Medium | 222 unit, 106 E2E and 4 visual tests; UAT approved; smoke test; Instant Rollback in under a minute |
| Firefox-only issue (not tested locally) | Low | Low | Firefox E2E is a required CI check on the PR |
| Slow first load on poor connections | Low | Low | Observed LCP under 0.1 s; New Relic LCP alert; SC-4 accepted the simulated figure |
| Monitoring blind spot | Low | Medium | Dashboard and alerts are code (`terraform plan` before launch); daily checks (no notifications, SC-3) |
| Security or privacy | Very low | High | CSP and security headers on every response; no accounts or personal data; anonymous, cookie-free analytics; dependency scan and image scan in CI |

**Overall risk: Low.** It's a static frontend with no backend or data migration, and rollback can't lose user data (progress stays in each browser).

**Affected users:** all visitors to the production site. Today they see a placeholder, so the change only adds value.

## 5. Test evidence

- [QA report](09-qa-report.md): all suites green, Lighthouse 96 / 100, 5 bugs found and fixed, no open P1/P2.
- UAT approved by the PO on staging, 2026-11-01.
- Code reviews: every story reviewed; all blockers fixed (feature docs, "Review fixes").

## 6. Rollback plan

Vercel **Instant Rollback** to the previous production deployment (under 1 minute), then revert the merge on `main` via PR. **Triggers:** any core smoke-test failure, a critical New Relic alert, or the site being unusable for anyone. Details are in [runbook](11-runbook.md) section 6.

## 7. Approvals (CAB)

| Role | Name | Decision | Date |
|---|---|---|---|
| Change owner (Engineering) | Claude | ✅ Recommend approval | 2026-11-01 |
| CAB / Product owner | Teja | ⏳ | |

**Conditions for go-ahead:** Go/No-Go is **Go**, and the pre-deployment checklist (runbook section 2) is complete.
