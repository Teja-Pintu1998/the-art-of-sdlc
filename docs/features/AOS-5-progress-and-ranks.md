# AOS-5: Progress and ranks ✅

> **As a** learner, **I want** my progress tracked and rewarded with ranks, **so that** I feel myself becoming a senior engineer.

**Status:** built on `develop` (Sprint 2). Code review: running in the background; findings will be added below.

## What was built

| Task | Delivered |
|------|-----------|
| **5.1 Mark complete and progress bar** | **Mark as complete** in the panel. Completed planets get a green ✓ badge. A progress box at the bottom left shows the rank, a progress bar (`role="progressbar"`, "6 of 14 stations completed") and "N more to <next rank>". On phones it sits above the mini-map |
| **5.2 Save progress** | A Zustand store persisted to `localStorage` (`aos-progress`, schema version 1: `completed`, `lastStation`, `highestRank`, `onboardingSeen`). Stations are saved by slug, not number. Saved data loads before the first paint, so the astronaut and camera start at the last visited station with no jump. Unknown versions and malformed data reset safely. If storage is blocked, the app still works but doesn't save |
| **5.3 Ranks and celebration** | Intern → Junior → Mid-level → Senior at 25% / 50% / 100% of *available* stations, rounded up (4 / 7 / 14 today). Each rank-up shows a dialog where the command types out like a terminal (`git checkout -b junior`, and so on); with reduced motion it appears at once. Senior adds a **journey summary** (stations completed and the phases covered). A rank is never lost, even if a station is un-completed. The `station_completed`, `phase1_completed` and `rank_reached` events go through the analytics helper |
| **5.4 Reset progress** | A **Reset** link in the progress box opens a confirmation dialog (Cancel has focus by default). It clears everything, and focus returns to the Reset link |

**Code:** `src/lib/progress/` (`ranks.ts` holds the pure rules, `store.ts` the store) · `src/components/progress/` (`ProgressHud`, `Celebration`) · `src/components/ui/ModalDialog.tsx` (focus trap, Escape, return focus) · `src/components/Journey.tsx` connects the map, lessons and progress.

## Decisions

- **Dialogs return focus to an explicit control**, not "whatever had focus on open". Safari doesn't focus a button when it's clicked, so that approach would have dropped focus to the page there.
- **The celebration opens on top of the lesson.** Closing it returns to the Mark as complete button, so the learner keeps reading.

## Verification

| Check | Result |
|-------|--------|
| Unit tests | Rank thresholds (4/7/14 for 14 stations, 11/21/42 for 42), the store (rank-ups, only available stations count, a rank is never lost, versioned save, reset, migration, sanitising), Junior and Senior celebrations with the analytics events, reset confirmation, start at the saved station. **146/146** pass · statements 98.7%, branches 92.7% (above baseline) |
| E2E (Chromium + WebKit) | Completion survives a reload (count, ✓ badge, start station); the rank-up celebration types the command and Escape returns focus; reset confirms, clears and stays cleared after reload. **72/72** pass overall |
| Visual regression | 4 baselines updated (the new progress box); stable over 2 runs |
| Benchmark | 60 fps at 1× and 4×, 58.5 fps at 20× (59.5 before; within run-to-run noise) |

## Follow-ups

- [ ] Code-review findings (pending).
- [ ] Share achievement on LinkedIn (FR-16, post-v1). The journey summary is ready for it.
