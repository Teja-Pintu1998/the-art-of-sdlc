# The Art of SDLC: Working Rules

See `README.md` for the product, the 42 stations, and the 46-step build process.

This project uses Next.js 16.4. Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` (see `AGENTS.md`).

@AGENTS.md

## Delivery workflow (PO decision, 2026-11-01: local-only, optimised for speed)

1. **All work happens on the local `develop` branch.** Make one commit per task (`feat(map): ... (AOS-2.3)`). The pre-commit hook (lint-staged) runs on every commit. Don't open a PR or wait for CI per story.
2. **Work through stories autonomously,** in the order set in `docs/06-estimation-and-release-plan.md`. Check in with the PO only for decisions that are theirs to make.
3. **At the end of each story:**
   - Run `npm run test:all` locally (unit tests with coverage ≥ 80%, E2E on Chromium and WebKit, visual).
   - Start **`code-reviewer`** in the background and continue with the next story; don't wait for it. Fix 🔴 blockers in a later commit.
   - Put 🟡/🟢 suggestions under "Follow-ups" in the story's feature doc.
4. **Backup:** push `develop` to GitHub (`git push origin develop`) after each story. CI only runs on PRs and on `main`, so this costs no waiting time.
5. **One concise feature-doc entry per story** in `docs/features/`. Then demo to the PO.
6. **Final integration (once, when the PO asks):**
   - Open one PR `develop` → `main`. All 7 CI checks must pass, including Firefox and the Linux visual baselines (take new baselines from the CI `visual-results` artifact).
   - Run `test-guardian` once, then squash-merge.
   - Tick the tasks in the GitHub issues, move the board cards, and add README journey-log rows.

The plan stays the source of truth in `docs/04-epics-and-stories.md` (stories, tasks, acceptance criteria) and `docs/06-estimation-and-release-plan.md` (order, sprints). Record progress in each story's feature doc.

Never bypass the pre-commit hooks (`--no-verify`), and never skip or delete tests to get a green run.
