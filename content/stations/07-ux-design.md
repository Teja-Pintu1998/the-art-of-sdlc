---
id: 7
slug: ux-design
where: "The stories are ready. Before anyone builds screens, we design how they'll work and test them with real users."
next: "The design is approved. Next comes the technical design (how it will be built), and then the code itself, starting with Git."
---

## What it is

**UX (user experience) design** decides how a product **works** for its users: the flows, the steps, what appears on each screen, and what happens when things go wrong. **UI (user interface) design** is the visual layer: layout, colour, type and components.

Design usually moves from rough to polished:

1. **User flows:** the steps a user takes, as a diagram.
2. **Wireframes:** low-detail layouts to agree structure quickly.
3. **High-fidelity mockups:** the real look, using the company's **design system**.
4. **Interactive prototype:** clickable screens for user testing.

A **design review** (or design critique) is where product, engineering, QA and accessibility check the design against the requirements, usability and feasibility, **before** it's built.

## Why it exists

- **Changing a design is cheap; changing code is not.** Moving a button in a design tool takes minutes. After release, it takes a sprint.
- **Users don't behave as we expect.** Testing a prototype with just **five users** typically uncovers most of the serious usability problems (Nielsen Norman Group research).
- **Edge states get designed, not improvised.** Loading, empty, error and "not available" states are decided up front, not by an engineer at midnight.
- **Accessibility is built in from the start,** which is far cheaper than fixing it later.

## How it works in big companies

- **Who:** a **product designer**, often with a **UX researcher**, working closely with the PM and an engineering lead.
- **Research first:** interviews, analytics and competitor reviews inform the flows.
- **Tools:** Figma is the most common; alternatives are Sketch and Penpot.
- **Design system:** a shared library of components and tokens (colours, spacing, type), such as Google's Material or IBM's Carbon. It keeps products consistent and speeds up both design and engineering.
- **Usability testing:** the prototype is tested with a handful of real users, and the design is changed based on what they actually do.
- **Design review:** each reviewer checks their angle:
  - **Engineering:** feasibility and the states the design must cover
  - **QA:** testability
  - **Accessibility specialists:** keyboard use, screen readers, contrast
- **Handoff:** final designs with every state, component specs and design tokens, linked from the stories.

## Real-world example

QuickBite designs the **"Schedule your order"** flow:

1. **Checkout:** a choice of **Deliver now** or **Schedule**.
2. **Schedule:** pick a day (today plus 2 days) and a 15-minute slot within opening hours.
3. **Confirmation:** *"Arrives tomorrow, 12:45–13:00."*
4. **Orders page:** a "Scheduled" label, with **Cancel** available until 1 hour before.

**Usability test with 5 office workers:** in version 1, "Schedule" was hidden in a dropdown, and **3 of 5 people never found it**. Version 2 makes it a visible two-option toggle, and all 5 found it.

**Design review comments:**

- **Engineering:** *"What does the user see if the restaurant closes early, or the slot fills up after they pick it?"* An error state was added for both, shown before payment.
- **Accessibility:** unavailable slots were shown only in grey. They now also say "Unavailable", and the time picker works fully with a keyboard and a screen reader.
- **QA:** the confirmation must show the time zone when the delivery address differs from the phone's.

Designs are approved and linked to stories S1 and S4.

## Common problems and how seniors handle them

- **Only the happy path is designed.** Seniors ask for every state: loading, empty, error, offline, no permission.
- **Engineers see the design too late.** Seniors join early, so feasibility issues come up while they're still cheap to fix.
- **Reviews become debates about taste.** Seniors judge against the goals, user research and usability principles, not personal preference.
- **One-off components.** Seniors reuse the design system and propose additions to it, rather than building a new button style per feature.
- **Accessibility as an afterthought.** Seniors check keyboard flow, focus, contrast and labels in the design review, not after launch.

## Say this in your interview

"I see UX design as the cheapest place to fix a product's problems. Moving a button in Figma takes minutes; changing it after release takes a sprint.

I like to be involved early, while the designs are still wireframes, because that's when engineering feedback is cheapest. In a design review, I check three things. First, **feasibility**: can we build it with our components, data and performance budget? Second, **states**: has the design covered loading, empty, error and edge cases, like a slot that fills up after the user picks it? Third, **accessibility**: keyboard use, focus order, contrast, and never relying on colour alone.

I also value **usability testing**. Watching even five real users tends to reveal the biggest problems. In one scheduling flow, three out of five testers never found the option because it was hidden in a dropdown; making it a visible toggle fixed that before a line of code was written.

Finally, I push for a shared **design system**, so features stay consistent and we build components once, not per screen."

## Interview questions you'll get

### What's the difference between UX and UI?

UX is how the product works for the user: flows, structure and behaviour. UI is how it looks: layout, colour, type and components. A beautiful UI can still have poor UX.

### What do you look for as an engineer in a design review?

Feasibility against our components, data and performance; every state, including loading, empty, error and edge cases; accessibility; and consistency with the design system.

### How do you make sure a feature is accessible?

Build it into design and review: keyboard access with a visible focus, logical focus order, contrast of at least 4.5:1 for text, labels for screen readers, and never colour alone. Then test with automated tools such as axe, plus keyboard and screen-reader checks.

### What is usability testing, and how many users do you need?

Watching real users try to complete tasks with a prototype. Around five users per round usually reveals most of the serious issues; several small rounds beat one big one.

### What would you do with a design that's very hard to build?

Raise it early, explain the cost and the risk, and propose alternatives that keep the user goal, then decide together with design and product. I'd never quietly build something different.

### What is a design system, and why does it matter?

A shared library of components, patterns and tokens. It keeps products consistent, speeds up design and engineering, and builds accessibility in once instead of per feature.

## How we did it in this project

Our [UX design](https://github.com/Teja-Pintu1998/the-art-of-sdlc/blob/main/docs/07-ux-design.md) covers this:

- **Visual style:** a dark command-centre theme with one neon colour per phase, using Space Grotesk, Inter and JetBrains Mono fonts.
- **Wireframes** for the map, the station panel, mobile and every overlay: onboarding, rank-up, reset.
- **Accessibility built in:** keyboard access everywhere, focus returning to where you were, contrast of at least 4.5:1, and never colour alone. For example, locked planets also show a 🔒.
- **Design review:** approved by the PO. Real feedback kept improving it:
  - the **preview card** that appears when you land on a planet came from the PO testing the spike
  - the **title staying clear of the map** came from the PO testing Sprint 1
