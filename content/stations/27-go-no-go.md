---
id: 27
slug: go-no-go
where: "The change is approved by the CAB (#26). Before anything touches production, the team meets one last time."
next: "It's a Go. Now the release goes out to production."
---

## What it is

The **Go/No-Go meeting** is the final checkpoint before a release. The people who own each part of the release confirm they're ready, and one **decision owner** (usually the product owner or release manager) makes the call:

- **Go:** ship as planned.
- **Go with conditions:** ship, but only once named conditions are met.
- **No-Go:** hold the release, with a reason and a new date.

The decision is made against **release criteria agreed in advance**, such as no open critical bugs, UAT signed off, the CR approved, and monitoring and rollback ready, not against how people feel on the day.

## Why it exists

- **One clear, accountable decision.** Everyone hears the same status, and someone owns the call.
- **The last cheap moment to stop.** Holding a release costs a day; a bad release costs users, money and trust.
- **Nothing falls through the cracks:** support briefed, on-call ready, rollback tested, stakeholders informed.
- **A record:** if something goes wrong later, the team can see what was known and decided.

## How it works in big companies

- **The release manager runs it,** usually 15–30 minutes, shortly before the release window.
- **Roll call by function:** each owner says *go* or *no-go* with a one-line reason: engineering, QA, SRE/on-call, security, support, product.
- **A shared readiness checklist** (in Confluence, Jira or a release tool) maps every release criterion to evidence: test reports, the CR, the runbook, dashboards.
- **Any single no-go is discussed,** not outvoted. A blocker from security or SRE usually holds the release.
- **The decision is recorded** with its conditions and sent to stakeholders.
- **Big launches only:** teams that deploy many times a day replace the meeting with **automated release gates** in the pipeline. The meeting is kept for high-risk launches, mobile app releases and major versions.

## Real-world example

QuickBite's **"Schedule your order"** (v2.4) has CAB approval. Monday 16:00, the release manager runs the Go/No-Go for Tuesday's 10:00 window:

- **Engineering:** Go. All tests green.
- **QA:** Go. No open P1 or P2 bugs.
- **SRE:** Go. On-call is staffed; rollback is a feature-flag switch.
- **Support:** Go. Agents were briefed this morning.
- **Payments:** **No-Go.** In staging, pre-authorisation holds fail for 3% of test cards against 1% normally.

The product owner decides **No-Go for Tuesday.** It's a revenue risk, and the release criteria say no known payment regressions. The team finds a timeout set too low on the payment provider call, fixes it, and re-tests. On Wednesday the failure rate is back to 1%, payments says Go, and the release ships on Thursday with nothing to roll back.

## Common problems and how seniors handle them

- **A rubber stamp.** Everyone says go because the date was promised. Seniors insist on evidence for each criterion.
- **Criteria invented in the meeting.** Seniors agree release criteria at planning time, so the meeting just checks them.
- **No-Go seen as failure.** Seniors treat a No-Go as the process working, and protect the person who raised it.
- **Missing voices:** support or security isn't in the room. Seniors make sure every function that's affected gives a status.
- **Vague conditions** like "go if it looks okay". Seniors name each condition, its owner and its deadline.

## Say this in your interview

"A Go/No-Go meeting is the last checkpoint before a release. Each owner, from engineering, QA, SRE, security, support and product, confirms readiness, and one decision owner makes the call: go, go with conditions, or no-go.

The key is that we decide against release criteria agreed in advance: no open critical bugs, UAT signed off, the change approved, monitoring in place, and a tested rollback plan. Each criterion needs evidence, not just a verbal yes, otherwise the meeting becomes a rubber stamp for a date someone promised.

I treat a no-go as the process working, not failing. For example, a team held a payments release when staging showed card pre-authorisations failing three times more often than normal. They found a timeout bug, fixed it, and shipped two days later with no incident.

For teams that deploy many times a day, I'd automate these checks as pipeline gates and keep the meeting for high-risk launches."

## Interview questions you'll get

### What do you check in a Go/No-Go meeting?

The agreed release criteria, each with evidence: test results and open bugs, UAT sign-off, CR approval, rollback plan and who runs it, monitoring and alerts, on-call and support readiness, and known issues.

### Who makes the final decision?

One accountable decision owner, usually the product owner or release manager, after hearing every function. A no-go from security or SRE normally holds the release.

### What would make you call a No-Go?

A criterion not met: a critical bug, a failed or untested rollback, missing monitoring, no on-call cover, or a known regression in something critical like payments.

### How do you handle pressure to ship on a promised date?

Make the trade-off visible: what could go wrong, how many users it affects, and what a short delay costs. Offer options such as go with a feature flag off, a smaller scope, or a new date. Then let the decision owner decide, on record.

### Do teams that deploy continuously still need Go/No-Go meetings?

Not for every deploy. Automated gates (tests, security scans, canary health) make the decision. The meeting remains for high-risk launches, mobile releases and major versions.

## How we did it in this project

- **Our meeting** decided the v1.0.0 launch: [`docs/13-go-no-go.md`](https://github.com/Teja-Pintu1998/the-art-of-sdlc/blob/develop/docs/13-go-no-go.md).
- **Criteria:** the PRD's release criteria, agreed months earlier at the PRD stage. Six of seven were met with evidence (QA report, UAT, CR-001, Terraform-applied monitoring).
- **The open one:** the PO hadn't yet signed off six lessons. Engineering recommended **Go with a condition**: that sign-off.
- **Risks reviewed:** no canary for v1.0.0 (smoke test and one-minute rollback instead), Firefox verified only in CI, and no alert notifications (daily dashboard checks).
- **Decision:** the PO said **"go"** on 2026-11-01, which also met the condition. Both are recorded in the decision table.
