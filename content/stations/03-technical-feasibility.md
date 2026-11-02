---
id: 3
slug: technical-feasibility
where: "The PRD is signed off, but one requirement is risky: we aren't sure it can be built well. Before committing to dates, we test it."
next: "The approach is proven. Next, we break the feature into epics and user stories a team can build."
---

## What it is

A **spike** (or technical feasibility study) is a short, **time-boxed** investigation that answers one specific question **before** the team commits to building something.

- **Input:** a risky unknown, phrased as a question: *"Can X handle Y?"* or *"Which of A or B fits better?"*
- **Output:** **knowledge**: findings, measurements and a recommendation. The code is usually **thrown away**.

The term comes from Extreme Programming (XP). Related terms:

- A **proof of concept (PoC)** shows something *can* work at all.
- A **prototype** shows how something *would* look or feel, often for users.
- A **spike** answers a question to reduce risk, often by comparing options.

## Why it exists

Estimates are guesses when the riskiest part is unknown. Spikes exist to find the problem **before** it's in the middle of a sprint, with a date already promised.

- **Turns unknowns into facts:** "we think it's fine" becomes "we measured it".
- **Makes estimates real:** you can size work you understand.
- **Compares options with data,** not opinions.
- **Is cheap:** a few days of work, against weeks of rework if the chosen approach fails later.

## How it works in big companies

- **Triggered by risk:** the PRD review or tech lead flags the riskiest assumption.
- **Planned like work:** the spike is a backlog item with a **time box** (often one to three days) and clear **success criteria**.
- **Built in isolation:** on a throwaway branch or sandbox, never merged into production code.
- **Measured realistically:** load tests with tools such as k6, JMeter or Gatling, benchmarks, and tests with real-sized data.
- **Written up:** a short findings document with the question, approach, results, decision and *when to revisit*. Big decisions are also recorded as an **ADR** (Architecture Decision Record).
- **Reviewed:** the tech lead and PM agree the recommendation; then the stories can be estimated.

## Real-world example

QuickBite's riskiest requirement is FR-2: *the restaurant receives every scheduled order in time to cook it.*

**The question:** at 12:00 on a weekday, about **5,000 scheduled orders** are due within the same minute. Can we release all of them to restaurants within 60 seconds, without losing or duplicating any?

**Time box:** 2 days. **Success:** all 5,000 released within 60 seconds, with zero lost and zero duplicated, in a load test.

**Options tried:**

| Option | Result |
|---|---|
| **A. One cron job every minute** reading due orders | Took about 3 minutes to clear the peak, so too late |
| **B. Message queue with a delivery delay** | Simple, but the queue's maximum delay (15 minutes on Amazon SQS) is far shorter than a 2-day schedule |
| **C. "Due orders" table polled every 15 s by several workers**, each claiming rows with database row locks (`SELECT … FOR UPDATE SKIP LOCKED`) | All 5,000 released in about 40 seconds; no duplicates, because a locked row can't be claimed twice |

**Surprise finding:** "due time" isn't the delivery time. It's **delivery time − prep time − travel time**, and prep time changes at peak hours. That became a new requirement.

**Decision:** option C, written up as an ADR. The spike code is deleted; the real version is built properly, with tests.

## Common problems and how seniors handle them

- **No clear question.** "Look into scheduling" becomes endless research. Seniors write the question and the success criteria first.
- **No time box.** Seniors stop at the limit and report what they know, including "we need one more day, because…".
- **Spike code shipped to production.** It was written to learn, not to last. Seniors rebuild it properly.
- **Testing only the happy path.** Seniors test the peak, failures and real-sized data, and check what users actually *see*, not just the numbers.
- **Findings stay in someone's head.** Seniors write them down, with the decision and when to revisit it.

## Say this in your interview

"When a requirement carries real technical risk, I don't estimate it blind. I run a **spike**: a time-boxed investigation that answers one specific question before we commit.

I start by writing the question and the success criteria. For example, 'can we release 5,000 scheduled orders within 60 seconds at the lunch peak, with none lost or duplicated?' Then I build the smallest thing that answers it, usually comparing two or three options, and I measure them under realistic load rather than on my laptop with ten rows.

The output isn't production code; it's a short write-up with the results, the decision, the trade-offs and when to revisit it, often recorded as an ADR. The spike code gets thrown away and rebuilt properly.

Spikes regularly surprise you. In that example, we learned the release time depends on the restaurant's prep time, which became a new requirement. Finding that in a two-day spike is far cheaper than finding it mid-sprint with a date already promised."

## Interview questions you'll get

### What is a spike, and when would you use one?

A time-boxed investigation that answers a specific technical question before committing to the work. I use one when a requirement has a risky unknown that makes the estimate a guess: performance at scale, a new technology, or an unfamiliar integration.

### What's the difference between a spike, a PoC and a prototype?

A spike reduces risk by answering a question, often by comparing options. A proof of concept proves something can work at all. A prototype shows how something would look or behave, usually for user feedback.

### What do you do if the time box runs out without an answer?

I stop and report what we learned, what's still unknown, and what it would take to finish: maybe one more day, or a fallback plan. Extending silently defeats the purpose.

### Should spike code go to production?

No. It was written fast to learn. I keep the findings and rebuild the solution properly, with tests, reviews and production-quality error handling.

### How do you choose between two technical options?

I agree the criteria first (performance, reliability, cost, team skills, operability), measure each option against them, and record the decision and trade-offs in an ADR, including when we'd revisit it.

## How we did it in this project

Our riskiest question was the space map you're on. Can 42 stations with a draggable astronaut be **smooth, accurate, accessible and search-friendly**? Our [spike findings](https://github.com/Teja-Pintu1998/the-art-of-sdlc/blob/main/docs/03-spike-findings.md):

- **Built the map twice** on a throwaway branch: HTML with Framer Motion, and PixiJS (WebGL). An automated benchmark measured frame rates under CPU slowdown.
- **Both ran at about 60 fps**, so speed didn't decide it. **Accessibility** did: the WebGL canvas is invisible to keyboards and screen readers, and its bundle was about 3× larger.
- **Surprise 1:** Framer Motion's built-in drag drifts from the cursor on a zoomed map, so we built our own pointer drag.
- **Surprise 2:** the PO tested it by hand and saw planets flicker when zoomed out, which the numbers had missed. The fix ("semantic zoom") and the lesson ("metrics aren't enough") led to our visual regression tests.
