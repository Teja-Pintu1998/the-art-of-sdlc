# The Art of SDLC: Working Rules

See `README.md` for the product, the 42 stations, and the 46-step build process.

This project uses Next.js 16.4. Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` (see `AGENTS.md`).

@AGENTS.md

## Before every commit (mandatory)

1. Run the **`code-reviewer`** agent on the pending changes. Fix all 🔴 blockers (and 🟡 where reasonable).
2. Run the **`test-guardian`** agent. All tests must pass, coverage must be ≥ 80% with no drop from baseline, and there must be no regressions.
3. Commit only when the review says **APPROVE** and the tests say **PASS**. Use a Conventional Commit message.

Never bypass the pre-commit hooks (`--no-verify`) or skip or delete tests to get a green run.
