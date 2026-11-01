# The Art of SDLC: Working Rules

See `README.md` for the product, the 42 stations, and the 46-step build process.

This project uses Next.js 16.4. Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` (see `AGENTS.md`).

@AGENTS.md

## Delivery workflow (PO decision, 2026-11-01, optimised for speed)

1. **One branch and one PR per story** (e.g. `feat/aos-2-space-map`). Inside it, make one commit per task (`feat(map): ... (AOS-2.3)`). The pre-commit hook (lint-staged) runs on every commit.
2. **Work through the whole story autonomously.** Check in with the PO only for decisions that are theirs to make.
3. **Before merging to `main`**, run the **`code-reviewer`** and **`test-guardian`** agents **in parallel** on the story's diff.
   - Only 🔴 blockers and test failures stop the merge. Fix them, with at most **one** re-review.
   - Put 🟡/🟢 suggestions in the story's feature doc under "Follow-ups" and fix them in batches.
4. Merge only when the review has no blockers and tests **PASS** (all tests pass, coverage ≥ 80%, no regressions). Squash-merge with a Conventional Commit PR title.
5. **One concise feature-doc entry per story** in `docs/features/`, plus a README journey-log row. Then demo to the PO.

Never bypass the pre-commit hooks (`--no-verify`), and never skip or delete tests to get a green run.
