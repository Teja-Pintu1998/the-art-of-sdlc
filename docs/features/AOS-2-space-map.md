# AOS-2: Space map ✅

> **As a** learner, **I want** an immersive, explorable space map of the whole SDLC, **so that** I understand the journey and enjoy exploring it.

**Status:** built on `develop` (Sprint 1). Code review (Sprint 5, 2026-11-01): **APPROVE**, no blockers. The two 🟡 accessibility items go to QA bug triage (Sprint 5, step 23).

## What was built

| Task | Delivered |
|------|-----------|
| **2.1 Landing view and starfield** | Command-centre hero (`The Art of SDLC`, `$ npm install experience`) over the map. Twinkling canvas starfield with parallax, `aria-hidden`, seeded so it looks the same on every load. With reduced motion it is drawn once: no twinkle, no parallax |
| **2.2 Planets and path** | 9 phases and 42 stations from the manifest `src/lib/map/stations.ts`, on a winding glowing dashed path. Sector titles alternate above and below the path. The path animation stops with reduced motion |
| **2.3 Pan and zoom** | Drag to pan, wheel and pinch to zoom (0.15×–2.5×). **Semantic zoom:** the path is always 2.5px, planets never go below a 9px radius, sector titles stay 12–40px, and station numbers hide below 0.45×. The view lives in a ref, and each frame updates only `transform` (no React re-render). The map opens fitted to the current station's phase, below the hero |
| **2.4 Mini-map** | All stations (locked ones dimmed) plus the current viewport. Clicking centres the map on that spot |
| **2.5 Locked stations** | Stations outside the 14 v1 stations are dimmed and desaturated, with a 🔒 icon (colour is never the only signal). Hovering shows a teaser with the station name and "🔒 Coming soon" |

**Code:** `src/lib/map/` (manifest, layout and zoom math, canvas drawing) · `src/components/map/` (`SpaceMap`, `Starfield`, `MiniMap`) · `src/lib/use-prefers-reduced-motion.ts`

## Decisions

- **Reused the spike engine (Option A),** rebuilt as tested modules: pure math and drawing functions in `lib/`, thin components on top.
- **Screen readers get a journey overview instead of the canvas map.** The visual map is `aria-hidden`; a visually hidden list names all 9 phases and 42 stations, marking locked ones "(coming soon)". Keyboard navigation of the map arrives with the astronaut (AOS-3).
- **"Available" means the 14 v1 stations for now.** The manifest's `V1_STATION_IDS` stands in until content loading (AOS-6) derives it from the MDX files.
- **Opens on station 1's phase** until progress is saved (AOS-5); `SpaceMap` already takes `currentStationId`.
- **`window.__aosMap` test hook** (`getView`, `setView`), as in the spike. E2E, visual tests and the benchmark use it to set exact views. It only exposes the map view, nothing sensitive.
- **Visual screenshots use reduced motion** (a still starfield and path) and tolerate ≤ 200 differing pixels, to absorb GPU anti-aliasing noise. A flaky diff of 57 pixels out of about a million was seen in 1 of 6 runs.

## Verification

| Check | Result |
|-------|--------|
| Unit tests (Vitest) | 54/54 pass · statements 98.7%, branches 88.6%, lines 100% |
| E2E (Chromium + WebKit) | 24/24 pass: semantic zoom at 3 zoom levels (path 2.5px, planets ≥ 18px, sector titles measured non-overlapping), pan, wheel zoom, mini-map, locked teaser, reduced motion, axe (no serious violations) |
| Visual regression | 4 screenshots (opening view, zoomed out, phase level, close-up); stable over 5 repeat runs |
| Benchmark (`npm run bench:map`, continuous pan and zoom for 6s) | **60 fps** at 1× and 4× CPU throttle, **58.3 fps** at 20× (target ≥ 58) |

## Lessons

- **Stale Turbopack cache:** the first production build was missing new CSS in `globals.css` (the path rendered as black filled shapes). A clean `rm -rf .next && npm run build` fixed it. If styles look wrong after CSS edits, rebuild clean.

## Follow-ups

- [ ] Linux visual baselines are created at final integration, from the CI `visual-results` artifact. Only macOS baselines exist now.
- [ ] Firefox E2E runs in CI only (local Playwright Firefox fails to launch on this Mac).
- [ ] The starfield redraws every frame even when idle. Consider pausing it when the tab is hidden, or after a period of inactivity, to save battery.
- [ ] 🟡 Keyboard zoom and pan: arrow keys only move the astronaut, so keyboard users can't zoom out to see the whole map. Add `+`/`-` and `0` (fit all). *To QA triage.*
- [ ] 🟡 Below 0.45× zoom the 🔒 hides with the numbers, so locked stations are marked only by dimming. Keep a small lock badge. *To QA triage.*
- [ ] 🟢 Mini-map viewport box uses the full window height; subtract the hero (`topInset`).
- [ ] 🟢 Star density scales with screen size (about 5× denser on a phone); scale the count to the viewport area.
- [ ] 🟢 Mini-map canvas is fixed at 2×; use `devicePixelRatio`.
- [ ] 🟢 Hitting the first/last station twice doesn't re-announce (same live-region text).
- [ ] 🟢 Two-finger pinch zooms but doesn't pan with the fingers' midpoint.
- [ ] 🟢 Check planet number sharpness at 2.5× on a real high-DPR device (`will-change: transform`).
