# AOS-3: Astronaut and navigation ✅

> **As a** learner (mouse, keyboard or touch), **I want** to move an astronaut between stations, **so that** exploring the SDLC feels like a journey.

**Status:** built on `develop` (Sprint 1). Code review: 1 blocker found and fixed (see "Review fixes").

## What was built

| Task | Delivered |
|------|-----------|
| **3.1 Drag and snap** | Custom pointer drag (no Framer Motion `drag`, per spike 3.3): screen movement ÷ zoom = world movement, so the astronaut stays under the cursor at every zoom. On drop it snaps to the nearest station within 160 world units, using a Framer Motion spring (instant with reduced motion). Dropped in empty space, it springs back to its last station |
| **3.2 Preview card (SC-2)** | On landing: phase, `#id name`, a one-line summary and **Enter station →**. The card sits to the right of the planet, or to the left near the edge, or below/above on phones, and never covers it. Locked stations show "🔒 Coming soon" and have no button. The button opens the station panel |
| **3.3 Keyboard** | The astronaut is a focusable `role="button"` whose `aria-label` names its station. Arrows move it (the map pans if a station would go off screen). Enter or Space opens the panel. Escape closes the panel, then the card, and focus always returns to the astronaut. A polite live region announces each landing |
| **3.4 Mobile tap** | Tapping a planet (moving less than 6px) flies the astronaut there and shows the card. Dragging across a planet still pans, and pinch still zooms. Tapping empty space closes the card |
| **3.5 Recommended next** | The first uncompleted available station has a pulsing ring (static with reduced motion) and is marked "(recommended next)" in the screen-reader overview |

**Station panel shell** (`components/station/StationPanel.tsx`): a focus-trapped `role="dialog"` that takes about 40% of the width on desktop and the full screen on phones, with a dimmed backdrop. It shows the title and summary; AOS-4 fills in the 8 content sections.

**Code:** `src/lib/map/navigation.ts` (snapping, steps, recommended next, card placement and tap detection, all pure) · `src/components/astronaut/` (`Astronaut`, `PreviewCard`) · `src/components/station/StationPanel.tsx` · `SpaceMap.tsx` wires them together.

## Decisions

- **One-line summaries live in the station manifest** (`stations.ts`, all 42 stations), so locked stations get one too. AOS-4/6 can make the manifest their single source, rather than repeating `summary` in the MDX frontmatter. *(Decide in AOS-4.)*
- **Clicking a planet with the mouse also moves the astronaut there**, using the same code as a mobile tap. It's a natural extra for desktop users.
- **The hover teaser is mouse-only.** On touch, tapping shows the card instead, which fixes the AOS-2 review note that the touch teaser only flashed.
- **AOS-2 review follow-ups fixed here:** the right and middle mouse buttons no longer pan, `lostpointercapture` cleans up, a pinch that starts with both fingers on one spot still zooms, Firefox line-based wheel deltas are converted, and the hero never reserves more than half the screen.
- **Performance:** the AOS-3 elements cost about 3 fps at 20× CPU throttle (AOS-2 measured 54 that day, AOS-3 measured 51). Fixes:
  - The starfield now **redraws at half the display rate**. Twinkle and 5%-speed parallax look the same, and the map stays at 60 fps.
  - Stars are drawn in 6 twinkle groups (6 fills instead of 500).
  - The mini-map station list is cached.
  - The pulse ring animates opacity only, and the astronaut's glow is a static gradient rather than a filter.

## Verification

| Check | Result |
|-------|--------|
| Unit tests | 96/96 pass · statements 98.4%, branches 91.0% |
| E2E (Chromium + WebKit) | 44/44 pass, including: drag stays within 2px of the cursor at 0.4×, 1× and 2× and snaps to station 2; empty-space drop returns home; Tab → arrows → Enter → Escape → Escape with focus checks; the card never overlaps its planet; real touch taps on a 390px phone; no sideways scroll; axe passes with the card and panel open |
| Visual regression | 4 baselines updated (astronaut and recommended ring); stable over 3 runs |
| Benchmark (`npm run bench:map`) | **60 fps** at 1× and 4× · **59.5 fps** at 20× (3 runs: 59.3–59.7) |

- **PO finding: the map slid under the landing hero after zooming.** The hero is a fixed overlay, and only the opening view reserved space for it. Now, on the first pan, zoom, drag, keypress, tap or mini-map jump, the hero shrinks to a compact top-left title and the tagline and hint hide. A new E2E test zooms out with the wheel and checks that no visible hero text overlaps any planet or sector title. The opening view is checked the same way.

## Lessons

- **Benchmark the baseline on the same day.** The AOS-2 figure (58.3 at 20×) came from a different machine state; the same build measured 54 today. Comparing against a stale number would have hidden or exaggerated the regression. Re-measure the previous build side by side (`git stash`, build, bench, `git stash pop`).
- **Profile before optimising.** My first guesses (the pulse ring and the glow filter) changed little. Hiding elements one at a time showed the full-screen starfield redraw was the real cost.

## Review fixes

- 🔴 **Wheel events inside the open panel zoomed the map and blocked panel scrolling.** The wheel handler now ignores `[data-no-pan]` targets (the panel, card and mini-map). A regression test checks that the view is unchanged and `defaultPrevented` is false.
- **Everything behind the panel is `inert`** while it is open. Escape works even if focus fell to `<body>`.
- **A cancelled drag** (or lost pointer capture) returns the astronaut home instead of snapping it to a station.
- **The arrow keys announce** "first station" or "last station" at the ends.

## Lessons

- **jsdom doesn't implement `inert`, but real browsers do.** After adding `inert`, closing the panel returned focus to nothing, because the astronaut was still inert when `focus()` ran. Only the Playwright E2E test caught it. Focus now moves after the re-render. Keep focus-return checks in E2E, not only in unit tests.

## Follow-ups

- [ ] Decide in AOS-4 whether station summaries stay only in the manifest or move into the MDX frontmatter (and are validated against it).
- [ ] The starfield still redraws (at 30 fps) when nothing moves. Pause it when the tab is hidden (`visibilitychange`) to save battery.
- [ ] Keyboard and tap moves recentre the map instantly; a short animated pan would feel smoother (skip it with reduced motion).
- [ ] Linux visual baselines and Firefox E2E are verified at final integration (CI).
- [ ] Screen readers may read the station twice per move (the astronaut's changing `aria-label` plus the live region). Consider a static label with `aria-describedby`.
- [ ] Stop in-flight snap springs on unmount (`ax.stop()` / `ay.stop()`). This is harmless today, but tidier.
