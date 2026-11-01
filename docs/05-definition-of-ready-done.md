# Definition of Ready / Definition of Done

| | |
|---|---|
| **Date** | 2026-11-01 |
| **SDLC step** | 7. Definition of Ready / Done |
| **Status** | ✅ Approved by the PO |

---

## Definition of Ready (a task can start when)

- [ ] Its acceptance criteria are clear and testable
- [ ] Its dependencies are done (or not blocking)
- [ ] Any design it needs exists ([UX design](07-ux-design.md), [technical design](08-tech-design.md))
- [ ] It's small enough to deliver in **one PR**

## Definition of Done

### A task is Done when

- [ ] Code is merged to `main` through a PR (no direct pushes)
- [ ] CI is green: lint, type check, tests, build, Lighthouse, accessibility checks
- [ ] Test coverage ≥ 80% and no drop from the baseline
- [ ] `code-reviewer` agent: **APPROVE**
- [ ] `test-guardian` agent: **PASS**
- [ ] Its acceptance criteria are verified (QA)
- [ ] The feature document in `docs/features/` is updated
- [ ] Deployed to the preview environment
- [ ] The task is ticked in its GitHub issue

### A story is Done when

- [ ] All of its tasks are Done
- [ ] The PO accepts it at the sprint demo
- [ ] The README journey log is updated
