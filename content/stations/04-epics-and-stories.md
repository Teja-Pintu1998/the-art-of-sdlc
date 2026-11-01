---
id: 4
slug: epics-and-stories
where: "The PRD is approved and the riskiest question is answered. Now we break the work into pieces a team can build and finish."
next: "Estimation (#5) and sprint planning (#6) unlock in a later release; this lesson covered their essentials. Next, we design what users will see: UX design."
---

## What it is

Big features are broken into smaller pieces, from large to small:

- **Epic:** a large body of work, usually one feature. *"Schedule your order."*
- **User story:** a small slice that delivers value to a user, written as **"As a … I want … so that …"**.
- **Acceptance criteria (AC):** testable conditions that say when the story is done, often as **Given / When / Then**.
- **Tasks:** the technical steps to deliver a story (API, UI, tests).

Good stories follow **INVEST**: **I**ndependent, **N**egotiable, **V**aluable, **E**stimable, **S**mall and **T**estable.

**The backlog lifecycle** (normally stations #5 and #6, covered here because they unlock later):

1. **Backlog:** all stories, ordered by priority.
2. **Refinement (grooming):** the team clarifies, splits and estimates stories, often in **story points** using planning poker. A story that's clear enough meets the **Definition of Ready**.
3. **Sprint planning:** the team agrees a **sprint goal** and pulls in the top stories it can finish.
4. **The task loop:** In Progress → Code review → QA → Done, judged against the **Definition of Done**.
5. **Sprint review:** demo to stakeholders, who accept the story or give feedback.

## Why it exists

- **Value arrives sooner.** Small stories can be finished and shipped one at a time.
- **Risk drops.** A small story that goes wrong costs days, not months.
- **Everyone knows when it's done.** Acceptance criteria end "is it finished?" debates, and QA tests against them.
- **Planning becomes possible:** "choose a delivery slot" can be estimated; "build scheduling" can't.

## How it works in big companies

- **Who:** the **Product Owner** writes and orders the stories; the whole team refines them.
- **Vertical slices:** each story cuts through every layer (UI, API, database) to deliver something a user can do, rather than "build the database" as one story.
- **Estimation:** story points (Fibonacci: 1, 2, 3, 5, 8, 13) measure *relative* effort and uncertainty, not hours. Velocity helps plan the next sprint; it's never a target.
- **Definitions:** the **DoR** says when a story can start; the **DoD** says when it's truly done (tested, reviewed, merged, deployed).
- **Tools:** Jira, Azure Boards, Linear or GitHub Projects.

## Real-world example

QuickBite's **epic: "Schedule your order"**. A first attempt split it by layer: *"create the database table", "build the API", "build the UI"*. None of these gives a user anything, so the team re-slices it **vertically**:

| Story | Points |
|---|---|
| **S1.** As an office worker, I want to choose a delivery time at checkout, so that lunch arrives when I'm free | 5 |
| **S2.** As a restaurant, I want scheduled orders to arrive in time to cook them, so that food is fresh and on time | 5 |
| **S3.** As a customer, I want a reminder 30 minutes before delivery, so that I'm ready | 2 |
| **S4.** As a customer, I want to cancel a scheduled order until 1 hour before, so that plans can change | 3 |

**Acceptance criteria for S1:**

- **Given** the restaurant is open from 11:00 to 22:00, **when** I open the time picker, **then** I see 15-minute slots inside those hours for today and the next 2 days only.
- **Given** I choose 12:45–13:00 tomorrow, **when** I place the order, **then** my confirmation shows that slot in my delivery address's time zone.
- **Given** the restaurant closes early, **when** my slot is no longer possible, **then** I'm told before paying.

**Sprint goal:** *"A customer can schedule an order and the restaurant gets it on time."* The team takes S1 and S2 (10 points, about its average velocity); S3 and S4 wait for the next sprint.

## Common problems and how seniors handle them

- **Stories that are too big.** Seniors split them until each fits comfortably in a sprint.
- **Horizontal slicing.** "Backend story" and "frontend story" deliver nothing alone. Seniors push for vertical slices.
- **Vague acceptance criteria.** "Works well" isn't testable. Seniors write concrete Given/When/Then cases, including errors.
- **Technical tasks dressed as stories.** "As a developer I want a database" isn't user value. Seniors make it a task under a real story.
- **Points treated as hours or targets.** Seniors use points to plan, and never to compare teams or people.

## Say this in your interview

"I break a feature down from **epic** to **user stories** to **tasks**. Each story is a **vertical slice**: a small piece a real user can use, cutting through UI, API and data, rather than a backend story and a frontend story that deliver nothing on their own.

Every story gets acceptance criteria in **Given/When/Then** form, including the edge cases and errors, so the whole team and QA agree on what 'done' means before we start.

In refinement, we clarify and split stories until they meet our Definition of Ready, and we estimate them in story points, as relative size rather than hours. In sprint planning, we agree a sprint goal and pull in what we can genuinely finish, based on recent velocity. Then each story moves through development, code review and QA, and it's only done when it meets the Definition of Done: tested, reviewed, merged and deployed.

The aim is a steady flow of small, finished, valuable pieces rather than a big bang at the end."

## Interview questions you'll get

### What makes a good user story?

INVEST: independent, negotiable, valuable, estimable, small and testable. In practice: written from the user's point of view, a vertical slice, small enough for one sprint, with clear acceptance criteria.

### How do you write acceptance criteria?

As concrete, testable scenarios, usually Given/When/Then, covering the main path, edge cases and errors. They describe behaviour, not UI details, and QA turns them into test cases.

### What's the difference between an epic, a story and a task?

An epic is a large feature. A story is a user-valuable slice of it that fits in a sprint. A task is a technical step needed to deliver a story.

### How would you split a story that's too big?

By workflow step, business rule or data variation, or happy path first and edge cases next. Each piece must still deliver value.

### What's the difference between the Definition of Ready and the Definition of Done?

Ready means a story can start: clear acceptance criteria, dependencies resolved, designs available. Done means it's truly finished: code reviewed, tested, merged, deployed, and accepted.

### Why story points instead of hours?

Teams estimate relative effort more reliably than hours. Points support planning through velocity, but they're not a performance metric.

## How we did it in this project

Our [stories](https://github.com/Teja-Pintu1998/the-art-of-sdlc/blob/main/docs/04-epics-and-stories.md) and [Definition of Ready / Done](https://github.com/Teja-Pintu1998/the-art-of-sdlc/blob/main/docs/05-definition-of-ready-done.md) follow this flow:

- **The first draft had 8 epics and 48 stories.** At the PO's request they were folded into **10 stories (AOS-1 to AOS-10)**, each with a task checklist and acceptance criteria per task, tracked on a GitHub project board.
- **Example:** AOS-6, onboarding and discovery, has three tasks. One of them (6.2) has the acceptance criterion *"typing 'canary' finds the station"*. Try 🔍 Search.
- **A real process trade-off:** we started with a pull request and CI run per task. To go faster, the PO switched to one commit per task on a development branch, with local tests and background code reviews, and one final pull request. Process should serve the team, not the other way round.
