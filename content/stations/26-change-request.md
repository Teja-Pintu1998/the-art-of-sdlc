---
id: 26
slug: change-request
where: "The release notes, runbook and rollback plan are written (#25). Now the change needs formal approval to touch production."
next: "The change is approved. One last meeting decides whether we actually ship: the Go/No-Go."
---

## What it is

A **Change Request (CR)** is a formal record asking permission to change a production system. It answers five questions: **what** is changing, **why**, **how risky** it is, **how** it will be done (and when), and **how to undo it**.

The **Change Advisory Board (CAB)** reviews and approves changes: usually engineering, operations, security and the business owner. In ITIL, the framework most big companies follow, changes come in three types:

- **Standard:** low-risk, repeatable and **pre-approved**, such as a certificate renewal.
- **Normal:** assessed and approved by the CAB before it happens. Most releases are normal changes.
- **Emergency:** fixes an outage or security hole now. An emergency CAB approves it fast; it's reviewed afterwards.

## Why it exists

- **Production affects real users and revenue.** Fresh eyes catch risks the team is too close to see.
- **Coordination:** support, on-call engineers and other teams know what's changing and when, so nobody is surprised.
- **No collisions:** two risky changes don't land on the same evening, and nothing ships during a freeze (Black Friday, year-end).
- **Audit trail:** regulated industries such as banking and healthcare must prove who approved every production change, and why.

## How it works in big companies

- **Tools:** ServiceNow or Jira Service Management. Each CR gets an ID like `CHG0041207`, a risk score and an approval workflow.
- **The CAB meets on a schedule,** often weekly. High-risk changes get discussed; low-risk ones are approved in bulk.
- **Change windows and freezes:** risky changes go out at low-traffic times, never on Friday evening, and not during freeze periods.
- **Automated change management:** the pipeline *is* the evidence. A reviewed PR, green CI and a tested rollback auto-approve a low-risk change; only high-risk changes go to a human CAB.
- **Measured:** the **change failure rate** (the share of changes causing an incident) is a DORA metric. Research in *Accelerate* found heavyweight external approval doesn't lower it; it mainly slows delivery.

## Real-world example

QuickBite is ready to release **"Schedule your order"** (v2.4). The release manager raises **CHG-2041**:

- **What:** the slot picker in checkout, slot generation, and charging the card at delivery time.
- **Risk: Medium.** It touches checkout and payments, which are revenue-critical.
- **Plan:** Tuesday 10:00, the lowest-traffic hour. The feature flag goes to 5% of customers first.
- **Rollback:** turn the flag off (instant), or redeploy the previous image tag `quickbite-api:9e1d4b0`.
- **Evidence:** QA report, UAT sign-off, a load test of slot generation.

At CAB, the payments lead asks: *"If we charge at delivery and the card fails, who absorbs the cost of food already cooked?"* The team shows the PRD decision: a pre-authorisation hold at order time, captured at delivery. Support asks for a short briefing so agents can answer "where's my scheduled order?" calls.

**Decision:** approved, with two conditions: support is briefed by Monday, and the rollout pauses at 5% until the payment failure rate is confirmed to be no higher than normal.

## Common problems and how seniors handle them

- **CRs as paperwork.** Copy-pasted risk sections get rubber-stamped. Seniors write the real risk for *this* change and its mitigation.
- **Vague rollback plans,** like "redeploy if needed". Seniors write exact steps, how long recovery takes, and what triggers a rollback, and they test it.
- **CAB as a bottleneck.** Waiting a week for a low-risk change. Seniors get repeatable changes classified as standard, and push for automated approval based on pipeline evidence.
- **Abused emergency changes:** labelling a normal change "emergency" to skip review. Seniors keep emergencies for real incidents and expect a review afterwards.
- **Forgetting people:** support and on-call aren't told. Seniors list who's affected and how they'll be informed.

## Say this in your interview

"A change request is how a team gets accountable approval to change production. A good CR answers five things: what's changing, why, how risky it is, how and when it'll be done, and exactly how to roll it back, with evidence like test results and a UAT sign-off.

I know the ITIL change types: standard changes are pre-approved and low-risk, normal changes go to the CAB, and emergency changes are approved quickly and reviewed afterwards.

When I raise a CR, I'm honest about risk and specific about rollback: the exact steps, how long recovery takes, and what triggers it. I also pick a low-traffic window and make sure support and on-call know what's coming.

I also think the process should match the risk. A heavy CAB for every small change mostly slows delivery without reducing failures. So I prefer automating low-risk approvals from pipeline evidence, a reviewed PR, green CI and a tested rollback, and saving the CAB's time for changes that are genuinely risky."

## Interview questions you'll get

### What goes into a change request?

What is changing and why, the risk and impact, the implementation plan and time window, the test evidence, the rollback plan with its triggers, and the approvers. The rollback plan is the part reviewers check most closely.

### What's the difference between standard, normal and emergency changes?

Standard changes are low-risk, repeatable and pre-approved. Normal changes are assessed and approved by the CAB first. Emergency changes fix an outage or security issue immediately, with fast approval and a review afterwards.

### Isn't a CAB just bureaucracy that slows teams down?

It can be, if every change waits for a weekly meeting. Research shows heavyweight approval doesn't reduce change failure rate. The fix is risk-based: automate approval for low-risk changes using pipeline evidence, and use the CAB for genuinely risky ones.

### How do you assess the risk of a change?

Look at what it touches (payments and data are high risk), how big it is, how well it's tested, whether it can be rolled back quickly, and how many users it affects. Mitigations such as feature flags, canaries and off-peak windows lower the risk.

### What happens if a change goes wrong after approval?

Follow the rollback plan as soon as a trigger is hit, rather than debugging live. Then record the incident, update the CR, and hold a blameless postmortem so the next change is safer.

## How we did it in this project

- **CR-001** asks to launch v1.0.0, replacing the placeholder page in production. It's in [`docs/12-change-request.md`](https://github.com/Teja-Pintu1998/the-art-of-sdlc/blob/develop/docs/12-change-request.md).
- **Type: normal.** **Risk: low.** It's a static site with no backend or data migration, and progress stays in each browser, so a rollback can't lose anyone's data.
- **Evidence:** the QA report (all suites green, Lighthouse 96 / 100, 5 bugs found and fixed) and the PO's UAT approval.
- **Rollback:** Vercel Instant Rollback in under a minute. Triggers: a failed core smoke test, a critical New Relic alert, or the site being unusable.
- **A risk found while writing it:** production still served the Sprint 0 placeholder, so a canary of v1.0.0 had nothing to compare against. The PO decided to launch v1.0.0 as a standard deploy and run the first real canary on v1.0.1.
- **CAB:** our PO is the whole board. They approved CR-001 in chat on 2026-11-01, and the approval was recorded with their exact words, which is the audit trail.
