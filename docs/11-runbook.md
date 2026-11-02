# Release Runbook and Rollback Plan

| | |
|---|---|
| **Date** | 2026-11-01 |
| **SDLC step** | 29. Runbook and rollback plan |
| **Owner** | Claude (DevOps/SRE) · Teja (PO, approver and the only person with Vercel and New Relic access) |
| **Applies to** | v1.0.0 launch (standard deploy) and v1.0.1 (first canary) |
| **Status** | 📝 Draft for the CR |

---

## 0. Launch sequence (PO decision, 2026-11-01)

Production (`main`) still serves the Sprint 0 placeholder, so a canary of v1.0.0 would have nothing meaningful to compare against.

1. **v1.0.0** goes live as a **standard production deploy**, with smoke tests and Instant Rollback ready (sections 2–4).
2. **v1.0.1**, the hypercare release, is the **first real canary**: 25% of visitors, compared with stable v1.0.0 in New Relic (section 5).

## 1. Roles and environments

| Role | Who | Does |
|---|---|---|
| Release manager / DevOps | Claude | PR, CI, merge, smoke tests, watching, recommending rollback |
| Approver / operator | Teja (PO) | CAB and Go/No-Go decisions; anything in the Vercel or New Relic dashboards |

| Environment | Where | Deploys from |
|---|---|---|
| Preview | Per branch and PR, private (Vercel login) | Every push |
| Staging / UAT | `the-art-of-sdlc-git-develop-rover19.vercel.app` | `develop` |
| Production | `the-art-of-sdlc.vercel.app` | `main` (squash-merge) |

## 2. Pre-deployment checklist (v1.0.0)

- [ ] CR approved by CAB, and Go/No-Go is **Go**
- [ ] All 14 lessons ready: #26 and #27 written; #29 and #34 show "Coming after launch" in "How we did it"; AOS-8 signed off
- [ ] PR `develop` → `main`: **all 7 CI checks green** (quality, E2E ×3 including Firefox, visual, Lighthouse, security)
- [ ] Linux visual baselines committed from the CI `visual-results` artifact; `test-guardian` PASS
- [ ] Vercel production env: `NEXT_PUBLIC_NEW_RELIC=on`; no `CANARY_*` variables yet
- [ ] New Relic: `terraform plan` in `infra/newrelic` shows no changes (dashboard and alerts match the code); apply if it does
- [ ] Note the current production deployment in Vercel (the placeholder), for rollback

## 3. Deployment steps (v1.0.0)

1. **Merge:** squash-merge the PR into `main`. Vercel builds production automatically. *Expected:* about 1–2 minutes.
2. **Wait for "Ready"** on the production deployment in Vercel (or the `Vercel` status on the merge commit).
3. **Docker:** the `docker.yml` workflow on `main` builds, smoke-tests and scans the image and pushes `sha-<commit>` to GHCR. This is a record of container readiness; it doesn't serve the site (ADR-6).
4. **Smoke test** (section 4) within 10 minutes of Ready.

## 4. Smoke test (step 35)

Run against `https://the-art-of-sdlc.vercel.app` in a **private window** (a first-time visitor).

| # | Check | Pass when |
|---|---|---|
| 1 | Home loads | 200; the map, the hero and the intro card show |
| 2 | Security headers | `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY` are present (`curl -I`) |
| 3 | Station address | `/station/problem-statement` opens with the lesson panel; `/station/nope` returns **404** |
| 4 | Core journey | Move the astronaut, Enter station, Mark as complete; the ✓ and progress bar update and survive a reload |
| 5 | Search and Knowledge base | Open, find a station, close with Escape |
| 6 | Phone | No sideways scrolling; tapping a planet moves the astronaut |
| 7 | Monitoring | New Relic receives PageView events with `release` = the merge commit's short SHA (dashboard, within about 5 minutes) |

**Any failure in 1–5 → roll back (section 6), then investigate.** A failure in 6–7 → fix forward within a day unless users are blocked.

## 5. Canary (v1.0.1, steps 34 and 36)

**Before:** Vercel → Settings → Deployment Protection → "Protection Bypass for Automation" generated (`VERCEL_AUTOMATION_BYPASS_SECRET`), and `NEXT_PUBLIC_NEW_RELIC` enabled for **Preview** too (the canary is a preview deployment; without it canary visitors send no data).

1. **Candidate:** push the v1.0.1 changes to a `release/v1.0.1` branch. Vercel builds a preview; copy its **deployment URL** (`…-rover19.vercel.app`).
2. **Start:** in the Vercel **production** env, set `CANARY_URL` to that URL and `CANARY_PERCENT=25`, then **Redeploy** production. First visits always get stable; returning visitors with a bucket below 25 get the canary.
3. **Check routing:** in a browser, set the cookie `aos-canary-bucket=0` and reload. The response header `x-aos-release: canary` is present and New Relic shows the candidate's `release`.
4. **Watch** the dashboard's "Canary vs stable" table for at least 24 hours, or until the canary has 50+ page views, whichever is later (traffic is low).
5. **Decide:**
   - **Healthy** (error rate and LCP p75 no worse than stable, no alert): raise to `CANARY_PERCENT=50` and redeploy; then **promote**: merge `release/v1.0.1` to `main` via PR, and delete the `CANARY_*` variables.
   - **Unhealthy:** abort (section 6).

## 6. Rollback plan

| Situation | Action | Time to recover |
|---|---|---|
| v1.0.0 smoke test fails, or a P1 after launch | Vercel → Deployments → the previous production deployment → **Instant Rollback** | < 1 minute |
| Canary unhealthy | Set `CANARY_PERCENT=0` and redeploy production. Everyone is back on stable; the bucket cookie is harmless | about 2 minutes |
| Bad config only (env var) | Fix the variable, redeploy | about 2 minutes |
| After an Instant Rollback | Revert the merge on `main` via PR, so the next deploy doesn't bring the problem back | n/a |

**Rollback triggers:** any smoke-test failure in checks 1–5; a New Relic critical alert ("JavaScript error rate above 1% of page views" or "LCP p75 above 2.5 s"; each fires after 15 minutes above the threshold); the site down or blank for anyone.

**No data migration is needed:** v1 has no backend or database. Progress lives in each browser under a versioned key, so a rollback can't lose or corrupt it.

## 7. Monitoring (hypercare, step 37: 7 days after launch)

- **Dashboard:** "The Art of SDLC" in New Relic: learning KPIs, health, and canary vs stable.
- **Alerts:** JS error rate above 1% of page views; LCP p75 above 2.5 s. Notifications are descoped (SC-3), so **check the dashboard daily** during hypercare.
- **Exit:** 7 days with no P1/P2 and no critical alert. Then fill #29 and #34 "How we did it" with the real results (AOS-9.3, 9.4).

## 8. Communication

| When | Message |
|---|---|
| Before the merge | "Deploying v1.0.0 to production now; smoke test in 10 minutes." |
| After the smoke test | "v1.0.0 is live: [link]. Smoke test passed. Hypercare starts." |
| On rollback | "Rolled back v1.0.0 (reason). Production is on the previous version. Next update in 1 hour." |
