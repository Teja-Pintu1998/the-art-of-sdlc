---
id: 2
slug: prd
where: "The business case is approved. Now we describe exactly what to build, for whom, and how we'll know it works."
next: "One requirement worries engineering: can we fire thousands of scheduled orders at exactly the right time? Next, a spike to find out."
---

## What it is

A **PRD (Product Requirements Document)** describes **what** we're building, **who** it's for and **why**, plus how we'll measure success. It deliberately doesn't say **how** to build it; that's the technical design.

A typical PRD contains:

- **Objective:** the problem and the goal, linked to the business case
- **Users and journeys:** who uses it and the steps they take
- **Functional requirements:** what the product must do, each with a priority
- **Non-functional requirements (NFRs):** how well it must do it: speed, reliability, security, accessibility
- **Out of scope:** what we are deliberately *not* building
- **Success metrics, assumptions, open questions and release criteria**

A **PRD review** is where everyone affected reads it, challenges it and finally **signs it off**. After that, changes go through an agreed change process.

## Why it exists

- **One shared picture.** Product, design, engineering and QA build from the same document, not from five different memories of a meeting.
- **Cheap mistakes.** A gap found in review costs a comment. The same gap found in production costs a sprint, or an incident.
- **Clear scope.** "Out of scope" stops endless "while we're at it" additions.
- **A baseline for everything after it.** Engineers estimate from it, QA writes test cases from it, and the release criteria say when it's done.

## How it works in big companies

- **Owner:** the **Product Manager** writes it, with design and an engineering lead involved early.
- **Priorities:** most teams use **MoSCoW**: **M**ust have, **S**hould have, **C**ould have, **W**on't have (this time).
- **Review:** the PRD is shared for comments, often followed by a review meeting. Each reviewer checks their own angle:
  - **Engineering:** feasibility, edge cases, rough size
  - **Design:** journeys and usability
  - **QA:** is every requirement testable?
  - **Security, privacy and legal:** data, payments, compliance
  - **Support and operations:** what happens when things go wrong
- **Comments are labelled** by severity (blocker, should fix, nit), resolved, and recorded. Then each reviewer **signs off**.
- **Living document:** a version number and change log. A change after sign-off gets an **impact assessment** (scope, date, cost) before it's accepted.
- **Tools:** Confluence, Google Docs or Notion. Some teams use lighter formats, such as a one-page brief or a Shape Up "pitch".

## Real-world example

QuickBite's PM writes the PRD for **"Schedule your order"**.

**Objective:** let customers order now for delivery at a chosen time (from station 1's business case).

**Key requirements:**

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | At checkout, choose a delivery slot (15-minute slots) | Must |
| FR-2 | The restaurant receives the order in time to prepare it for that slot | Must |
| FR-3 | Edit or cancel until 1 hour before the slot | Should |
| FR-4 | Reminder notification 30 minutes before delivery | Should |
| — | Recurring weekly orders | Won't (v1) |

**NFRs:** 99.9% of scheduled orders reach the restaurant on time; the slot picker loads in under 300 ms.

**What the review caught:**

- 🔴 **Payments:** a card pre-authorisation can expire before a far-future order is charged. **Decision:** schedule up to 2 days ahead in v1.
- 🔴 **Operations:** what if the restaurant is closed at that time? **Decision:** only show slots within opening hours.
- 🟡 **QA:** "on time" in which time zone? **Decision:** the delivery address's time zone, and FR-2 gets a measurable definition.

Version 1.0 is signed off by product, engineering, design, QA, payments and operations.

## Common problems and how seniors handle them

- **Vague requirements.** "It should be fast." Seniors ask for a number: *under 300 ms for 95% of requests*.
- **No NFRs.** Teams list features and forget reliability, security and accessibility. Seniors add them, because they drive the architecture.
- **Missing "out of scope".** Seniors push for it, because it prevents arguments later.
- **Rubber-stamp reviews.** Seniors review from their own angle, especially edge cases and failure modes, and label each comment by severity.
- **Silent scope creep after sign-off.** Seniors ask "what's the impact?" and route the change through the change process, instead of just absorbing it.

## Say this in your interview

"A PRD defines **what** we're building and **why**: the users, the functional requirements with priorities, the non-functional requirements like performance and security, what's out of scope, and how we'll measure success. It deliberately leaves the **how** to the technical design.

When I review a PRD as an engineer, I look for three things. First, is every requirement testable? 'Fast' becomes 'under 300 milliseconds at p95'. Second, what are the edge cases and failure modes: what happens when a payment fails or a partner is unavailable? Third, are there hidden risks that need a spike before we commit to dates?

For example, on a feature that lets customers schedule orders days ahead, reviewing the payment flow showed that a card authorisation can expire before the order is charged. Catching that in review cost one comment; catching it in production would have meant failed orders.

After sign-off, I treat the PRD as a living document: any change gets an impact assessment before we accept it."

## Interview questions you'll get

### What goes into a PRD?

The objective, target users and journeys, functional requirements with priorities, non-functional requirements, what's out of scope, success metrics, assumptions and open questions, and release criteria.

### What's the difference between a PRD and a technical design document?

The PRD says **what** and **why**, from the user's and the business's point of view. The technical design says **how**: architecture, data, APIs and trade-offs. Engineering writes it after the PRD is stable.

### What's the difference between functional and non-functional requirements?

Functional requirements describe behaviour: "the user can choose a delivery slot." Non-functional ones describe qualities: performance, availability, security, accessibility, scalability. NFRs often decide the architecture.

### How do you review a PRD as an engineer?

I check testability, edge cases and failure modes, dependencies on other teams, and risky unknowns. I label each comment by severity so the PM knows what blocks sign-off.

### How do you handle a requirement change after sign-off?

I don't just absorb it. We assess the impact on scope, date and risk, the PM decides with stakeholders, and the PRD's version and change log are updated. Often the change moves to the next release.

### What does MoSCoW mean?

Must have, Should have, Could have, Won't have this time. It forces explicit priorities, so when time runs short everyone already knows what gets cut.

## How we did it in this project

Our [PRD](https://github.com/Teja-Pintu1998/the-art-of-sdlc/blob/main/docs/02-prd.md) follows this structure:

- **Three personas:** Priya (a fresh graduate), Arjun (a career switcher) and Rahul (a startup developer).
- **16 functional requirements** with MoSCoW priorities, plus NFRs for performance, accessibility and browser support, and a clear out-of-scope list.
- **The review found 2 blockers.** RC-1: the canary and monitoring lessons can't show "How we did it" before launch. RC-2: 42 planets don't fit on one screen, which led to pan, zoom and the mini-map you're using now.
- **A versioned change log (v1.0 to v1.4)** and two **scope changes**. SC-1 added the spike station; SC-2 added the preview card.
