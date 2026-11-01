# UX Design

| | |
|---|---|
| **Date** | 2026-11-01 |
| **SDLC steps** | 10. UX design · 11. UX design review |
| **Status** | ✅ Approved by the PO (wireframes; the visual design is refined in Sprint 1) |

---

## Visual Style

| Element | Choice |
|---------|--------|
| Theme | Dark space command centre; deep navy background (`#050816`) with a twinkling starfield |
| Phase colours | One neon colour per phase: purple, pink, blue, cyan, green, yellow, orange, red, slate (as in the spike) |
| Headings | Space Grotesk |
| Body | Inter |
| Commands / taglines | JetBrains Mono, styled like a terminal |
| Motion | Spring snaps, glowing paths, subtle parallax; everything off under `prefers-reduced-motion` |

## Screens

### 1. Map (desktop)

```
┌──────────────────────────────────────────────────────────────┐
│ ◉ The Art of SDLC        [🔍 Search]  [📚 Knowledge base]      │
│ Rank: Junior  ▓▓▓▓▓▓░░░░ 6/14                                 │
│                                                              │
│   ● ─ ● ─ ●            Development                           │
│  🧑‍🚀          ╲ ● ─ ●      ┌────────────────────────┐          │
│   Discovery       ●       │ #10 Git                │          │
│                           │ Track every change…    │          │
│                           │ [ Enter station → ]    │          │
│                           └────────────────────────┘          │
│                                               [ mini-map ]   │
└──────────────────────────────────────────────────────────────┘
```

- **Top bar:** logo, search (FR-10), knowledge base (FR-11), rank and progress bar (FR-5, FR-6)
- **First visit:** the landing tagline `npm install experience` is shown in the hero area above the map
- **Preview card** (SC-2): appears beside the planet the astronaut lands on, never covering it
- **Locked stations:** dimmed, with a 🔒 icon and "Coming soon" on hover or focus
- **Recommended next:** a pulsing glow on the next uncompleted station

### 2. Station open (desktop)

```
┌───────────────────────────────────┬──────────────────────────┐
│                                   │ #15 CI PIPELINE        ✕ │
│        (map dimmed)               │ Phase 4 · CI             │
│                                   │ ──────────────────────── │
│              🧑‍🚀                   │ What it is               │
│                                   │ Why it exists            │
│                                   │ How it works in big cos  │
│                                   │ Real-world example       │
│                                   │ Common problems          │
│                                   │ Say this in your interview│
│                                   │ Interview questions      │
│                                   │ How we did it            │
│                                   │ 👍 / 👎 Helpful?          │
│                                   │ [ ✓ Mark as complete ]   │
│                                   │ ◀ Prev          Next ▶   │
└───────────────────────────────────┴──────────────────────────┘
```

- A side panel about 40% of the width; the map stays visible but dimmed
- Section headings stay visible while scrolling (jump links)
- "Say this in your interview" is styled as a highlighted quote card

### 3. Mobile

- The map fills the screen; tap a planet to move the astronaut there and show the card (FR-3)
- The station panel opens as a **full-screen sheet** with a sticky header and close button
- At 375px width: no horizontal scrolling, body text ≥ 16px

### 4. Overlays

| Overlay | Behaviour |
|---------|-----------|
| **Onboarding** (FR-9) | About 10 seconds: an animated hand drags the astronaut onto Station 1; a Skip button; shown once only |
| **Rank-up celebration** (FR-6) | Short burst animation; the rank's command types out like a terminal, e.g. `$ git checkout -b junior` |
| **Senior + journey summary** | `$ git commit -m "became senior"`, stations completed, phases covered, a share option (post-v1) |
| **Reset progress** (FR-13) | Confirmation dialog |

## Accessibility (built into the design)

- Every interactive element is reachable by keyboard, with a visible focus ring
- Panels and dialogs trap focus. The **station panel and preview card** return focus to the astronaut when closed; other dialogs (search, knowledge base, reset) return focus to the control that opened them
- Colour is never the only signal: completed and locked states also use icons
- Text contrast ≥ 4.5:1 on the dark background; non-text UI (focus ring, planet states, icons) ≥ 3:1 (WCAG 1.4.11)

## Design Review (step 11)

Reviewed with the PO on 2026-11-01: ✅ approved. The visual polish is refined during Sprint 1, and the PO accepts it at the sprint demo.
