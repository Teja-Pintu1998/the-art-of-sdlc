---
id: 14
slug: pull-requests
where: "The code passes every automated check on the laptop (#13). Now a teammate reviews it before it joins main."
next: "The pull request is approved, but it can only merge when the pipeline is green. Next, the CI pipeline."
---

## What it is

A **pull request (PR)**, called a *merge request* in GitLab, asks to merge a branch into `main`. It shows the exact changes (the **diff**) and is where **code review** happens: teammates read the change, ask questions, suggest improvements, and finally **approve** it.

A good PR has:

- **A clear title and description:** *what* changed, *why*, and *how to test it*, with a link to the ticket.
- **A small, focused diff:** ideally a few hundred lines at most.
- **Evidence:** tests added, and screenshots for UI changes.

## Why it exists

- **Catches what tools can't:** logic errors, missed edge cases, security holes and confusing design.
- **Shares knowledge:** at least two people understand every change, so nobody is a single point of failure.
- **Keeps standards consistent** across the team, and mentors newer engineers.
- **Creates a record:** months later, the PR explains why the code is the way it is.

## How it works in big companies

- **Required approvals:** branch protection requires one or two approvals, plus passing CI, before merging.
- **CODEOWNERS:** a file that automatically requests reviews from the team that owns the changed code, such as payments for payment files.
- **PR templates** prompt the author for a summary, test plan, screenshots and risk.
- **Review comments are labelled** so the author knows what blocks the merge, e.g. *blocker*, *suggestion* and *nit* (a minor preference).
- **Turnaround matters:** many teams aim to review within one working day, because waiting PRs slow everyone down.
- **Automated helpers** comment before humans do: coverage, security scanners, preview deployments and, increasingly, AI review.
- **Tools:** GitHub, GitLab, Bitbucket, Azure DevOps or Gerrit.

## Real-world example

Sam opens a PR for QuickBite's story **S1**: *"feat(checkout): choose a delivery slot (QB-142)"*. It has a 280-line diff, tests, and screenshots of the slot picker on phone and desktop.

Reviewer **Priya** leaves three comments:

1. 🔴 **Blocker:** *"Slots are generated in the server's time zone (UTC), but the PRD says the delivery address's time zone. A customer in Lisbon would see 11:45 for a 12:45 slot. Can we pass the address's time zone in, and add a test?"*
2. 🟡 **Suggestion:** *"`getSlots()` and `isSlotOpen()` duplicate the opening-hours logic. Extract one helper?"*
3. 🟢 **Nit:** *"`s` → `slot` for readability."*

Sam fixes the blocker with a test that runs with a different time zone, applies the suggestion, and replies to the nit. Priya approves, CI is green, and the PR is squash-merged. The time-zone bug that would have hit every customer outside the server's time zone **never reached production**.

## Common problems and how seniors handle them

- **Huge PRs** that get skimmed and rubber-stamped. Seniors split work into small PRs that each make sense alone.
- **Unclear feedback.** Seniors label severity, explain *why*, and suggest a fix instead of just saying "this is wrong".
- **Reviews that feel personal.** Seniors comment on the code, not the person, ask questions ("what happens if…?"), and say what's good too.
- **Slow reviews blocking the team.** Seniors make reviewing a daily priority and keep PRs small enough to review quickly.
- **Only style comments.** Seniors leave style to tools and review behaviour, edge cases, security, tests and readability.

## Say this in your interview

"I see code review as the last human check before code joins `main`, and as the best way to share knowledge across the team.

As an **author**, I keep PRs small and focused, ideally a few hundred lines at most. I write a description that explains what changed, why, and how to test it, with tests and screenshots. Small PRs get careful reviews; huge ones get rubber-stamped.

As a **reviewer**, I let the tools handle style and focus on what they can't catch: correctness, edge cases, error handling, security, test coverage and whether the design will be easy to change. I label every comment as a blocker, a suggestion or a nit, so the author knows exactly what stops the merge, and I explain why rather than just saying what.

For example, a review once caught that delivery slots were generated in the server's time zone instead of the customer's, a bug that would have hit every customer in another time zone. I try to review within a day, and I keep comments about the code, never the person."

## Interview questions you'll get

### What do you look for when reviewing a PR?

Correctness and edge cases, error handling, security (input validation, secrets, permissions), tests that prove the change, readability, and whether the design fits the codebase. Not style: tools handle that.

### What makes a good pull request?

Small and focused, with a clear description of what and why, a link to the ticket, a test plan, tests, and screenshots for UI changes. It should be easy to review in under half an hour.

### How do you handle disagreement in a code review?

Discuss the trade-offs with evidence, ideally in a quick call if the comments go back and forth. If it's a preference, the author decides. If it's a real risk, involve a tech lead and record the decision.

### How do you give feedback to a junior engineer?

Be specific and kind: explain the why, link to examples, suggest a better approach, and point out what's good. Label minor points as nits so they don't feel like blockers.

### How big should a PR be?

Small enough to review well in one sitting: often under about 400 lines of real change. Bigger work is split into stacked PRs or hidden behind feature flags.

## How we did it in this project

- **A PR template** asks for a summary, the linked story, a test plan and screenshots.
- **Our foundation PR (#13)** set up code quality, testing and CI. It could only merge after all 7 required checks passed.
- **Every story is reviewed** by a code-review agent that labels findings 🔴 blocker, 🟡 should fix or 🟢 nit, with file and line. Real catches:
  - **AOS-3:** scrolling inside an open lesson zoomed the map behind it.
  - **AOS-4:** a malformed station address crashed the server (500) instead of showing "not found".
  - **AOS-5:** resetting progress lost keyboard focus.
- **Our rule:** blockers are fixed in a follow-up commit, and suggestions are recorded as follow-ups in each story's feature doc.
