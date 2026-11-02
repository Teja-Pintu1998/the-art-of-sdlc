# AOS-8: Content: development and CI stations ✅

> **As a** learner, **I want** interview-ready lessons on how code is written, reviewed and integrated, **so that** I can talk confidently about engineering practices.

**Status:** all 5 lessons written on `develop` (Sprint 4). **Signed off by the PO on 2026-11-01** ("go" at the Go/No-Go meeting, which was conditional on this sign-off).

## Lessons

| # | Station | Reading time | QuickBite thread (developer Sam builds story S1, the slot picker) |
|---|---------|--------------|------------------|
| 8.1 | #10 Git | ~4.6 min | Branch, small commits, rebase and conflict; a hotfix lands in parallel; `git blame` traces a bug |
| 8.2 | #13 Code quality | ~4.4 min | The pre-commit hook catches a missing `await` that would double-book the last slot |
| 8.3 | #14 Pull request | ~4.5 min | A reviewer's 🔴 blocker: slots in the server's time zone, not the customer's |
| 8.4 | #15 CI pipeline | ~4.8 min | The Safari E2E job catches a date-parsing bug; a flaky test is quarantined; pipeline time cut from 14 to 6 min |
| 8.5 | #17 Docker | ~4.6 min | Multi-stage build (1.1 GB → 180 MB), SHA tag, scan blocks a critical CVE, rollback by previous tag |

All pass the build-time rules (3–5 min, 150–200 word answer, at least 5 questions, no "years").

**#17's "How we did it" describes the plan,** because Docker (AOS-1.6) moved to Sprint 5. It gets the real numbers once AOS-1.6 is done.

## Also in this sprint

- **Pages carry only the lesson in the address** (for SEO). Others load from pre-built `/lessons/<slug>` JSON, prefetched when the astronaut lands, with loading and retry states (AOS-4 review follow-up).
- **The dev server is used for PO previews** (live reload); lessons are cached only in production.
- Tests that used an unwritten station now simulate one, so they hold as lessons are added.

## Review fixes

Code review: REQUEST CHANGES, with 1 🔴, all fixed:
- 🔴 **Focus left the panel after "Try again".** The lesson area is now a stable focus target, and a test checks it.
- **Opening a station always retries,** so a failed background prefetch shows "Loading" rather than a stale error.
- **The starting station is prefetched too.**
- **`/lessons/<unknown>` returns 404** without touching the file system.
- **Lesson accuracy:**
  - `@typescript-eslint/no-floating-promises` needs type-aware linting
  - the time-zone example now uses Berlin (Lisbon is UTC+0 in winter)
  - Docker tags are mutable unless the registry enforces it (or you deploy by digest)
  - only ISO date strings are guaranteed in JavaScript
  - fast-forward merges, and `--force-with-lease` semantics
  - LCP wording, and what `test:all` covers
  - an unverifiable claim in #10 was replaced

## Follow-ups

- [ ] **PO sign-off** of lessons 10, 13, 14, 15 and 17.
- [ ] Update #17's "How we did it" after AOS-1.6 (Docker).
- [ ] AOS-1.6: copy `content/` into the standalone image, and test that `/lessons/<unwritten>` returns 404 there (review 🟡).
- [ ] 🟢 Announce the loading state more reliably for screen readers (the `aria-busy` wrapper is in place; check with VoiceOver).
