# Spike Findings: Space Map Feasibility

| | |
|---|---|
| **Date** | 2026-10-31 |
| **SDLC step** | 5. Technical feasibility spike |
| **Owner** | Claude (Tech Lead) |
| **Time box** | 1 session |
| **Spike branch** | [`spike/map-feasibility`](https://github.com/Teja-Pintu1998/the-art-of-sdlc/tree/spike/map-feasibility) (throwaway code, never merged) |
| **Status** | ✅ Complete. Option A approved by the PO (2026-10-31), after manual verification of the zoom fix. |

---

## 1. Question

> Can we build a pannable, zoomable space map with 42 stations and a draggable astronaut that is **smooth (60fps)**, **accurate**, **keyboard and touch accessible**, and **SEO-friendly**? And which rendering approach should we use?

This was the riskiest part of the PRD (FR-1, FR-2, FR-3, and the performance and accessibility requirements).

## 2. Approach

We built the **same map twice** in a throwaway Vite + React app, then measured both with an automated Playwright benchmark.

| | Option A: DOM + Framer Motion | Option B: PixiJS (WebGL canvas) |
|---|---|---|
| Planets, path, labels | HTML elements and SVG | Drawn on a WebGL canvas |
| Pan / zoom | Per-element `transform` in screen space (semantic zoom, see 3.8) | Container position and scale |
| Animation | Framer Motion (spring snap) | Ticker-based tween |
| Starfield | 2D canvas, 500 twinkling stars | 500 Pixi Graphics circles |

Both include: 42 planets across 9 sectors, a connecting path (animated dashes in A, static in B), a draggable astronaut with snap-to-nearest-station, mouse-wheel zoom, pinch zoom, drag-to-pan, and a mini-map (Option A).

**Test environment:** Chromium 156 (headless), Apple M5 GPU (Metal), 1440×900 at 2× pixel density. CPU throttling was used to simulate slower devices.

## 3. Results

### 3.1 Smoothness: continuous pan and zoom for 6 seconds

Final results, after the zoom-out fix in 3.8:

| CPU speed | A: DOM fps (p95 frame) | B: Pixi fps (p95 frame) |
|-----------|------------------------|-------------------------|
| Normal | 60 (16.8 ms) | 60 (16.7 ms) |
| 4× slower | 60 (16.8 ms) | 60 (16.8 ms) |
| 10× slower | 58.8 (16.7 ms) | 60 (16.7 ms) |
| 20× slower | 59.8 (16.7 ms) | 59.8 (16.8 ms) |

**Finding:** At our scale (42 stations), **both are smooth**.

### 3.2 Snap accuracy: drag astronaut to the next station

| Zoom | A: DOM | B: Pixi |
|------|--------|---------|
| 0.35× (zoomed out) | ✅ | ✅ |
| 1× | ✅ | ✅ |
| 2× (zoomed in) | ✅ | ✅ |

### 3.3 ⚠️ Key discovery: Framer Motion's built-in `drag` breaks inside a zoomed map

| Method | Zoom | Cursor moved | Astronaut moved | Tracks cursor? |
|--------|------|--------------|-----------------|----------------|
| Framer Motion `drag` | 0.5× | 300 px | 150 px | ❌ lags behind |
| Framer Motion `drag` | 2× | 300 px | 600 px | ❌ runs ahead |
| Custom pointer drag | 0.5× | 300 px | 300 px | ✅ |
| Custom pointer drag | 2× | 300 px | 300 px | ✅ |

Framer Motion's `drag` doesn't account for the parent's zoom scale, so the astronaut drifts away from the cursor. **Fix:** handle the drag with our own pointer events (divide screen movement by the zoom scale) and use Framer Motion **only for the snap animation**. Without this spike, we'd have found the problem mid-sprint. (Measured on commit `db379c2`; the Framer Motion drag variant was removed from the prototype afterwards.)

### 3.4 Keyboard and screen reader

| Check | A: DOM | B: Pixi |
|-------|--------|---------|
| Astronaut reachable with Tab | ✅ | ❌ |
| Arrow keys move between stations | ✅ | ❌ |
| Enter opens the station panel | ✅ | ❌ |
| Escape closes it and returns focus | ✅ | ❌ |
| Visible to screen readers | ✅ (1 labelled button) | ❌ (canvas is invisible to them) |

Making Pixi accessible would require building a **second, hidden HTML version** of the map alongside the canvas, which roughly doubles the work.

### 3.5 Touch (finger drag)

| | A: DOM | B: Pixi |
|---|---|---|
| Drag astronaut to a station | ✅ | ✅ |

### 3.6 Bundle size (gzipped JavaScript, loaded on demand)

| | A: DOM + Framer Motion | B: PixiJS |
|---|---|---|
| Map code plus library | **~52 KB** | **~162 KB** (about 3× larger) |

Measured on commit `db379c2`.

### 3.7 SEO

*Not measured in the spike; this follows from how each option renders.* Option A renders the map as real HTML, which search engines can read (and Next.js can pre-render on the server). Option B draws pixels on a canvas, which search engines can't read. This supports the PRD requirement that each station has its own web address and page metadata (e.g. `/station/canary-deployment`).

### 3.8 ⚠️ Visual quality when zoomed out (found by the PO during manual testing)

**Problem:** The PO tried the prototype and reported that, when zoomed out in Option A, **planets flickered and the connecting wire disappeared**. The automated benchmark missed this because it only measured frame rate, not what the screen looked like.

**Root cause:** The first version put the whole map (7000×2400 px) in one container and shrank it with a CSS `scale()`. The browser renders that layer once and then **shrinks it like an image**:
- The 6px dashed wire became about 1px wide with 3px dashes at 0.18× zoom, so it nearly vanished and shimmered.
- The planets' glows and gradient edges were shrunk the same way, which caused flicker during zoom.
- The sector titles also overlapped ("Release Governance" over "Deployment").

**Fix, "semantic zoom" (the technique map apps use):**
1. Don't scale the world. Instead, **re-position** every planet, label and the path in screen coordinates on each frame.
2. Keep the wire a constant **2.5px on screen** at any zoom.
3. Planets never shrink below a **minimum on-screen size** (9px radius).
4. Hide station numbers when zoomed far out (level of detail).
5. Alternate sector titles above and below the path so they never overlap.

**Performance trade-off:** the first version of the fix changed each planet's width, height and shadow on every frame, which forces the browser to recalculate layout. At 20× CPU slowdown it dropped to **44fps (31% janky frames)**. Changing it to update **only `transform`** (move and scale on the GPU, with no layout) brought it back to **~60fps**.

| Version | Wire visible at 0.18× zoom | Planets flicker | 20× CPU slowdown fps |
|---------|----------------------------|-----------------|----------------------|
| v1: whole world scaled | ❌ barely | ❌ yes | 59.8 |
| v2: semantic zoom, size via width/height | ✅ | ✅ no | 43.9 |
| **v3: semantic zoom, transform-only** | ✅ | ✅ no | **59.8** |

**Lesson:** automated metrics (fps) aren't enough for a visual product. The real build needs **visual regression tests** (screenshots compared at several zoom levels) alongside the performance tests.

## 4. Decision

### ✅ Option A: DOM/SVG + Framer Motion, with custom pointer-based drag

| Criterion | Winner |
|-----------|--------|
| Smoothness at our scale | Tie |
| Accessibility (WCAG 2.1 AA, keyboard) | **A** |
| SEO | **A** |
| Bundle size / load speed | **A** (3× smaller) |
| Fits our stack (React, Framer Motion) | **A** |
| Raw rendering headroom | B (not needed for 42 stations) |

**When to revisit:** if a future version needs hundreds of animated objects (e.g. particle effects or the v2 videos rendered live), consider adding a canvas layer **for decoration only**, while keeping the interactive map in HTML.

## 5. Implementation Guidance for the Real Build

1. **Pan/zoom with semantic zoom:** **don't** CSS-scale the whole world. Re-position each planet, label and the path in screen space with **transform-only** updates (no width, height or shadow changes per frame). Clamp planets to a minimum on-screen size, keep the path a constant screen width, and hide small labels when zoomed out. Keep the view in a ref and **don't** store it in React state; that would re-render on every frame.
2. **Astronaut drag:** custom pointer events (`setPointerCapture`), converting screen movement to world movement by dividing by the zoom scale. Framer Motion is used only for the snap spring animation.
3. **Starfield:** a separate 2D canvas behind the map, decorative and hidden from screen readers (`aria-hidden`).
4. **Accessibility (per PRD v1.2, SC-2):** the astronaut is a focusable `role="button"` with an `aria-label`. Landing on a station, by drag or arrow keys, shows the **preview card**. Enter on the astronaut activates "Enter station →" and opens the full panel. Escape closes the panel, then the card, and focus always returns to the astronaut. *(The prototype predates SC-2: there, Enter opens a placeholder panel directly.)*
5. **Reduced motion:** when the user's system setting `prefers-reduced-motion` is on, skip the spring animations, the path animation, and the starfield twinkle and parallax.
6. **Touch:** `touch-action: none` on the map; pointer events cover mouse, pen and touch with a single code path.

## 6. Limitations and Follow-ups

| # | Limitation | Follow-up |
|---|------------|-----------|
| L1 | Measured on a fast Apple M5. CPU throttling simulates a slower CPU, but **not a weaker GPU**. | Re-test on a real low-end Android phone and an older laptop during performance testing (build step 24). |
| L2 | Headless browser only. | Try both prototypes by hand: `git checkout spike/map-feasibility && cd spike && npm install && npm run build && npx vite preview`, then open `http://localhost:4173/?impl=dom` and `?impl=pixi`. To rerun the benchmarks, first run `npx playwright install chromium`, then `node bench.mjs`. |
| L3 | The prototype has no real station content or panels. | Covered by the real build (Sprints 1–3). |
| L4 | The fps benchmark can't detect visual problems like flicker (see 3.8). | Add screenshot-based visual regression tests at several zoom levels in Sprint 0 (testing framework, build step 18). |

## 7. Artifacts

- Prototype code: `spike/src/DomMap.tsx` (A), `spike/src/PixiMap.tsx` (B), `spike/src/layout.ts` (shared layout)
- Benchmark scripts: `spike/bench.mjs`, `spike/stress.mjs`
- All on the `spike/map-feasibility` branch
