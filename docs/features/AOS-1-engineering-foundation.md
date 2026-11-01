# Feature: AOS-1 Engineering Foundation

| | |
|---|---|
| **Story** | [AOS-1 (#1)](https://github.com/Teja-Pintu1998/the-art-of-sdlc/issues/1) |
| **Sprint** | Sprint 0 |
| **Points** | 13 |
| **Status** | 🔵 In progress |

---

## 1.1 Repo setup ✅ (the "passing CI" gate completes in 1.5)

**Goal:** changes reach `main` only through a reviewed PR.

**Decisions**
- The repo was made **public** (PO decision, 2026-11-01). GitHub's free plan only supports branch protection on public repos, and the project is a portfolio piece.
- **Required approvals = 0:** this is a solo-developer repo, and GitHub doesn't let authors approve their own PRs. Review is done by the `code-reviewer` agent before each commit, plus the PO at sprint demos. Required CI status checks are added in task 1.5, once the pipeline exists.

**Configuration (`main` branch protection)**

| Setting | Value | Why |
|---------|-------|-----|
| Require a pull request | ✅ (0 approvals) | No direct pushes to `main` |
| Enforce for admins | ✅ | The rule applies to the repo owner too |
| Dismiss stale reviews | ✅ | Only takes effect if approvals are required later |
| Require linear history | ✅ | Clean, readable history |
| Require conversation resolution | ✅ | Every review comment is addressed before merging |
| Allow force pushes | ❌ | History can't be rewritten |
| Allow deletion | ❌ | `main` can't be deleted |
| Required status checks | *(added in 1.5)* | CI must pass before merging |

**Repository settings:** squash merge only (one commit per PR on `main`), with branches automatically deleted after merging.

**Files**
- `.github/pull_request_template.md`: what and why, testing, screenshots, and the Definition of Done checklist

**Trust boundary until 1.5:** with admins enforced, the owner can't push directly or bypass the rules, but can merge their own PRs (0 approvals required).

**How it was verified:** read the protection back through the GitHub API on 2026-11-01; this PR itself is the first change to reach `main` through the new flow.

## Remaining tasks

- [ ] 1.2 Project scaffolding
- [ ] 1.3 Code quality tooling
- [ ] 1.4 Testing framework
- [ ] 1.5 CI pipeline (also completes 1.1's "passing CI" criterion)
- [ ] 1.6 Docker
- [ ] 1.7 Environments and release capability
