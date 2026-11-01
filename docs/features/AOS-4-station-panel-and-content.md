# AOS-4: Station panel and content system ✅

> **As a** learner, **I want** each station to open into a rich, well-structured lesson, **so that** I can learn the topic in depth and use it in interviews.

**Status:** built on `develop` (Sprint 2). Code review: running in the background; findings will be added below.

## What was built

| Task | Delivered |
|------|-----------|
| **4.1 Content format** | One Markdown file per station in `content/stations/` (`01-problem-statement.md`). Frontmatter holds `id`, `slug`, `where` and `next`, followed by exactly the 8 `##` sections in order. `src/lib/content/lessons.ts` parses and validates every file at build time, and **any problem fails the build** with the file name and the reason (missing section, wrong order, empty section, a slug that doesn't match the manifest, duplicate station). Adding a lesson is just adding a file |
| **4.2 Station panel** | Shows the 8 sections, a **Where we are** line at the top and a **Next** line at the end, plus **Mark as complete** (click again to undo), feedback, and Previous/Next across the available stations, with Close. Up to 42rem wide on desktop and full screen on phones. At 375px there's no sideways scrolling and body text is 16px. A station without a lesson yet shows "This lesson is being written", with Mark as complete disabled |
| **4.3 Station web addresses** | `/station/<slug>` is pre-built for all 42 stations, each with its own title and description. It opens the map with the astronaut on that station and the panel open, skipping the card. A locked station shows its card instead. The lesson is in the pre-built HTML (SEO). The address bar follows the open panel (`/station/prd` after Next, `/` after Close). Unknown slugs get a **real 404** via `src/proxy.ts`, because with Cache Components a `notFound()` inside the page would keep a 200 status |
| **4.4 Feedback prompt** | "Was this helpful for interviews?" 👍/👎 at the end of each lesson. It sends `feedback_given` through the analytics helper (`src/lib/analytics/track.ts`, connected to New Relic in AOS-10.1) and stores nothing |
| **4.5 Interview mode** *(Could)* | A toggle that shows only "Say this in your interview" and "Interview questions you'll get" |

**First lesson:** station 1, *Problem statement / business case*, written to the PO's content bar (accurate, core first, simple, interview-ready). It starts the running example used across all 42 stations: **QuickBite**, a food-delivery app, adds **"Schedule your order"** (PO decision).

## Decisions

- **Plain Markdown instead of MDX** (amends ADR-3). Lessons don't need components, no code from content files ever runs, and the HTML is sanitised as well. The build-time validation ADR-3 asked for is unchanged.
- **Summaries live only in the station manifest** (closes the AOS-3 follow-up). Name, phase and summary come from `stations.ts`, so locked stations have them too and there's one source. Frontmatter holds only lesson-specific fields.
- **All 14 v1 stations stay unlocked** while their lessons are written (AOS-7 to AOS-9). Lessons in progress say so and can't be completed. Every v1 lesson exists before launch, so this state never ships.
- **Connected lessons** (PO decision): every lesson opens with *Where we are* and ends with *Next*, and its "Real-world example" continues the QuickBite story.

## Verification

| Check | Result |
|-------|--------|
| Unit tests | Lesson parser (every validation rule, heading levels, sanitising, tables), the real content files, the station page (static params, metadata, panel open, 404), the proxy, and the panel in jsdom (8 sections, interview mode, Previous/Next with address-bar sync, feedback event) |
| E2E (Chromium + WebKit) | Title and description per station; lesson present in the server HTML; unknown station returns 404; address bar follows Next and Close; feedback; 375px has no sideways scroll and text ≥ 16px; axe finds no serious issues with the lesson open |
| Build | No warnings. The content folder is excluded from server file tracing (`turbopackIgnore`) because pages are pre-built |

## Follow-ups

- [ ] Write lessons 2–14 (AOS-7 to AOS-9), continuing the QuickBite story.
- [ ] Code-review findings (pending).
