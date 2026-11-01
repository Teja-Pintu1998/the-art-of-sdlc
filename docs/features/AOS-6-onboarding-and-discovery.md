# AOS-6: Onboarding and discovery ✅

> **As a** first-time or returning learner, **I want** help getting started and quick ways to find topics, **so that** I can use the map easily and cram before an interview.

**Status:** built on `develop` (Sprint 3). Code review: **APPROVE** (no blockers); suggestions applied (see "Review fixes").

## What was built

| Task | Delivered |
|------|-----------|
| **6.1 Onboarding intro** | A coach card with 3 steps (drag or arrow keys → preview and Enter station → rank up), 3.5s each, so about 10 seconds. A hand shows the drag from the astronaut to the next station and follows it if the map moves. **Skip intro** or **Start exploring** ends it. It's shown once only (`onboardingSeen` in saved progress, kept on Reset). It **doesn't block the map**: moving the astronaut or opening a lesson ends it. It isn't shown on `/station/<slug>` links. With reduced motion, the hand stays still and steps wait for **Next** |
| **6.2 Search / quick jump** | A 🔍 **Search** button (top left) or the **/** key. An accessible combobox searches station names, topics, phases and numbers. Name matches come first; every word must match; available stations rank above locked ones. ↑↓ choose and Enter or a click jumps: the astronaut flies there (the map pans if needed), the card opens and focus lands on the astronaut. Escape returns focus to the Search button. "canary" finds #29 Canary deployment |
| **6.3 Knowledge base** | A 📚 button (top right) opens a dialog with 4 articles from `content/knowledge-base/*.md`: Agile ceremonies, Jira workflow, stakeholder communication and working with other teams. Each is a native `<details>` disclosure (keyboard and screen-reader friendly). Close or Escape returns focus to the button. The articles are validated at build time like lessons |

**Layout:** the two buttons sit in the hero band's top corners, so they never cover the map. On phones they're icon-only and don't touch the title.

## Decisions

- **Onboarding is a coach card, not a modal.** Learners can start exploring straight away, and the first move counts as "got it".
- **The toolbar and the progress box are rendered inside the map layer** (`SpaceMap` `controls`). Outside it, they were drawn above the open lesson panel and blocked its Close button (found by E2E). Now the panel covers them and they're inert while it's open.

## Verification

| Check | Result |
|-------|--------|
| Unit tests | Search ranking (name first, all words, numbers, ordering), knowledge-base parsing and the 4 required topics, and in jsdom: the / shortcut, ↑↓/Enter/click/hover, no-match message, focus return, the knowledge base, and the intro's timing, Skip, Next, end-on-move, station links and reduced motion. **176/176** pass; coverage above baseline |
| E2E (Chromium + WebKit) | Intro shows for a new visitor and never again after Skip; it reaches step 3 by about 7s (clock-controlled); moving ends it; "canary" + Enter lands on #29 below the hero with focus on the astronaut; knowledge base works by keyboard, closes with Escape, and axe is clean; toolbar doesn't overlap the title at 375px; nothing sits over an open lesson. **90/90** pass |
| Visual regression | 4 baselines updated (toolbar buttons); stable over 2 runs. Tests mark the intro as seen through Playwright `storageState`, except `discovery.spec.ts` |

## Review fixes

- **"/" no longer opens search over an open lesson** (when focus had fallen to the page). It's blocked while any dialog is open, and while typing in any field.
- **The intro pauses** while hovered or focused (WCAG 2.2.1, timing adjustable). With reduced motion, the hand stays still but still tracks the astronaut when the map moves.
- **Search always has a live status:** "N stations" is read out as you type, and "No station matches" when nothing does.
- **Safari:** the default disclosure triangle is hidden on knowledge-base topics.
- **Content accuracy:**
  - The sprint is itself a Scrum event, and the review is a working session.
  - Time boxes are scaled from the Scrum Guide.
  - The Definition of Ready isn't part of the Scrum Guide.
  - In Jira, a Task sits at the same level as a Story, and a Sub-task is a child.
  - SLO (internal target) is distinguished from SLA (contract).
- **Hardening:**
  - Content rules find sections by heading, not by position.
  - Knowledge-base titles and summaries are checked for "years".
  - Duplicate article names fail the build.

## QA fix (Sprint 5)

**Bug: slow first load (P2, LCP).** For a new visitor the intro card is the largest element, and it rendered only after hydration (it depends on `localStorage`), so Lighthouse measured LCP at 2.9s. The card now renders on the server; an inline `<head>` script (`onboardedScript`) marks `<html data-onboarded>` for returning visitors so CSS hides it before the first paint, with no flash. Observed LCP 0.08s, performance 92 → 96. The simulated LCP stays at about 2.76s; the PO accepted a 3s CI limit (PRD SC-4).

## Follow-ups

- [ ] Search could also find knowledge-base articles.
- [ ] Rename the CI check "Lighthouse (… LCP < 2.5s)" to "< 3s" together with `main`'s branch-protection required checks (it's required by exact name).
