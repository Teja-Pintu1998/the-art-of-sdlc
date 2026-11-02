# AOS-10: Monitoring and KPIs with New Relic ✅ (alert notifications descoped)

> **As the** product owner, **I want** to see whether the site is healthy and useful, **so that** we can act on real data after launch.

**Status:** built on `develop` (Sprint 4).

## What was built

| Task | Result |
|------|--------|
| 10.1 KPI events | The New Relic browser agent (SPA 1.324.1, pinned) loads only when built with `NEXT_PUBLIC_NEW_RELIC=on`, so local previews and tests send nothing. It is **anonymous**: `cookies_enabled: false`, and session replay, session traces and distributed tracing are off. The existing `track()` events (`station_completed`, `phase1_completed`, `rank_reached`, `feedback_given`) now become page actions. The agent loads when the browser is idle, so it doesn't slow the page. |
| 10.2 Dashboard as code | `infra/newrelic/` (Terraform, provider `newrelic/newrelic`). The dashboard **"The Art of SDLC"** has two pages. **Learning (KPIs):** completions, Phase 1, ranks, drop-off by station, and % helpful by station. **Health:** JS error rate, LCP p75, page views, and top errors. |
| 10.3 Alerts | Policy "The Art of SDLC: site health" with two conditions: JS errors above 1% of page views, and LCP p75 above 2.5 s, each sustained for 15 minutes. |

## Verified

- **End to end in a real browser:** `station_completed` (station 10) and page views arrived in New Relic. The automatic Core Web Vitals showed LCP 0.07 s, INP 50 ms and CLS 0, all from local test visits.
- **Privacy:** 0 cookies from New Relic. (While a canary runs, the site sets one anonymous, strictly necessary cookie: a bucket number 0–99 that keeps a visitor on one version; see AOS-1.7.) The agent writes nothing to local or session storage; the only key is our own `aos-progress`.

## Decisions and lessons

- **Snippet, not the npm package:** our helper already uses `window.newrelic`, and a separate script keeps our bundle small.
- **The secrets split:** the browser licence key is public. The user API key (`NRAK-`) is only for Terraform and lives in `.env.newrelic.local`, which git ignores. Terraform state is git-ignored too.
- **The alert test found a real bug:** the default "event flow" aggregation never closes a window on a low-traffic site, so the alerts would never have fired. All conditions now use `event_timer`.
- **PO decision (2026-11-01): no alert notifications.** The email path was removed. Issues are visible only in New Relic (Alerts → Issues & activity), and the "test alert is received" criterion is descoped.

## How to run

```bash
cd infra/newrelic
source ../../.env.newrelic.local   # NEW_RELIC_API_KEY
terraform init && terraform plan && terraform apply
```

## Review fixes

Code review: APPROVE (no blockers). Applied:
- **Error rate counts in-app route changes** (`BrowserInteraction`) as views, not just full page loads.
- **The "% helpful" widget** works whether `helpful` is stored as a boolean or a string.
- **The agent loads `afterInteractive`** (still async), so early errors and events aren't lost.
- **More Terraform files git-ignored:** `*.tfvars`, plans and crash logs.
- **Tests** check that distributed tracing is off, and that the agent turns on only for exactly `on`.

## Follow-ups

- [ ] **Rotate the `NRAK-` key** (it was pasted in a chat).
- [ ] At deploy (AOS-1.7), build with `NEXT_PUBLIC_NEW_RELIC=on`, and add the production domain in the browser app's settings.
- [ ] Check the "% helpful" widget once real `feedback_given` events arrive (whether `helpful` is stored as a boolean).
- [ ] Tune the alert thresholds after launch with real traffic. If anyone needs to be notified, add a channel (email, Slack or PagerDuty).
- [ ] 🟡 At low traffic, one error in a few views exceeds 1%. Consider a minimum-traffic guard or an absolute count until traffic grows.
- [ ] 🟢 Consider `user_actions: { enabled: false }` if "anonymous" should exclude click targets.
- [ ] 🟢 Terraform state is local only; add a remote backend if someone else needs to run it.
- [ ] Station #34's "How we did it" (AOS-9.4) uses this dashboard, after launch.
