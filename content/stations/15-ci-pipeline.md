---
id: 15
slug: ci-pipeline
where: "The pull request is open and reviewed (#14). Now a pipeline proves it builds and passes every test on a clean machine."
next: "Static analysis (#16) unlocks later. Next, the tested code is packaged into a Docker image."
---

## What it is

**Continuous Integration (CI)** means every change is automatically **built and tested** on a clean machine as soon as it's pushed, and merged into `main` often, so problems surface within minutes instead of at the end of a project.

A **CI pipeline** is that automation, defined as code in the repository. A typical pipeline:

1. **Install** dependencies exactly as locked (`npm ci`).
2. **Check:** format, lint and type check.
3. **Test:** unit tests with a coverage gate, then integration and end-to-end tests.
4. **Build** the production app.
5. **Scan:** vulnerable dependencies and security issues.

Each step is a **required check**: if any fails, the pull request can't merge.

*CI* is often paired with *CD* (continuous delivery or deployment), which takes the tested build further, towards production.

## Why it exists

- **"It works on my machine" isn't proof.** CI runs on a clean machine, with exact dependency versions, every time.
- **Fast, objective feedback.** Problems appear minutes after a push, while the change is fresh in the author's mind.
- **`main` stays releasable.** Nothing merges unless it builds and passes.
- **Humans can't skip it.** Unlike local hooks, CI checks are enforced.

## How it works in big companies

- **Pipeline as code:** a YAML file in the repo, so changes to the pipeline are reviewed like code. Common tools are GitHub Actions, GitLab CI, Jenkins, CircleCI and Azure Pipelines.
- **Triggers:** every pull request and every merge to `main`.
- **Speed is managed carefully:**
  - jobs run in parallel
  - dependencies are cached
  - test suites are split across machines
  - outdated runs are cancelled when a new commit arrives
  - a common target is under about 10 minutes
- **Fail fast:** cheap checks (lint, types) run first, before slow ones (E2E).
- **Matrix builds:** the same tests on several browsers, operating systems or runtime versions.
- **Artifacts:** test reports, screenshots and the build output are saved for debugging and for the next stage.
- **Secrets** (API keys, cloud credentials) live in the CI tool's secret store, never in the repo.
- **Flaky tests** are tracked and fixed or quarantined quickly, because a pipeline people don't trust gets ignored.

## Real-world example

Sam's PR for QuickBite's slot picker triggers the pipeline:

| Job | Result |
|---|---|
| Lint, types, format | ✅ 1 min |
| Unit tests (coverage ≥ 80%) | ✅ 2 min |
| Build | ✅ 2 min |
| E2E: Chrome, Safari, Firefox (in parallel) | ❌ Safari failed |
| Dependency security scan | ✅ 1 min |

**The Safari failure is real:** the date picker parsed `"2026-11-03 12:45"`. The JavaScript standard only guarantees ISO 8601 formats, so other strings are up to each browser, and Safari rejected this one. The fix is an ISO string with an explicit offset (`2026-11-03T12:45+01:00`), which also keeps the delivery address's time zone. Without a browser matrix in CI, this would have been found by customers.

**A second problem, a week later:** one checkout E2E test fails about 1 run in 20 for no clear reason. The team **quarantines** it (it still runs, but doesn't block merges), finds that it clicks before the page has loaded, fixes the wait, and restores it within two days.

**Speed:** the pipeline had grown to 14 minutes. Caching dependencies and running the E2E browsers in parallel brought it down to 6.

## Common problems and how seniors handle them

- **Slow pipelines** that people work around. Seniors cache, parallelise, run cheap checks first and measure pipeline time.
- **Flaky tests** that make everyone hit "re-run". Seniors track flakiness, quarantine the test, and fix the root cause quickly.
- **A red `main` left broken.** Seniors treat a broken `main` as the team's top priority: revert first, debug second.
- **CI and local commands that differ.** Seniors make CI run the same scripts developers run (`npm run test`).
- **Secrets in logs or in the repo.** Seniors use the secret store and mask output.

## Say this in your interview

"Continuous integration means every change is built and tested automatically, on a clean machine, before it can merge, so `main` is always releasable.

Our pipeline is defined as code in the repo and runs on every pull request. It installs exact dependency versions, runs the cheap checks first (formatting, linting, type checking), then unit tests with a coverage gate, a production build, end-to-end tests across browsers in parallel, and a dependency security scan. Every job is a required check: if anything fails, the PR can't merge.

I care a lot about **speed** and **trust**. A slow pipeline gets worked around, so I cache dependencies, parallelise jobs and fail fast. A flaky pipeline gets ignored, so I track flaky tests, quarantine them and fix the root cause quickly.

The browser matrix has paid for itself: it once caught a date-parsing bug that only broke Safari, before any customer saw it. And if `main` ever goes red, fixing it is the team's top priority: revert first, debug second."

## Interview questions you'll get

### What's the difference between CI, continuous delivery and continuous deployment?

CI builds and tests every change automatically. Continuous delivery keeps every passing build ready to release with a manual approval. Continuous deployment releases every passing change to production automatically.

### What stages would you put in a CI pipeline?

Install, then format/lint/type check, unit tests with coverage, build, integration and E2E tests, and security scans. Cheap and fast first, slow last, with every stage a required check.

### How do you speed up a slow pipeline?

Cache dependencies and builds, run jobs in parallel, split test suites across machines, run only what changed where safe, fail fast on cheap checks, and cancel outdated runs.

### How do you deal with flaky tests?

Detect them by tracking failures, quarantine them so they don't block merges, fix the root cause (often a timing or test-isolation problem) and restore them. Never just add retries and forget.

### Why use npm ci instead of npm install in CI?

`npm ci` installs exactly what's in the lockfile, from a clean state, and fails if the lockfile and `package.json` disagree. Builds become reproducible.

## How we did it in this project

Our pipeline is [`.github/workflows/ci.yml`](https://github.com/Teja-Pintu1998/the-art-of-sdlc/blob/main/.github/workflows/ci.yml) on GitHub Actions. It runs on every pull request and every push to `main`, with **7 required checks**:

1. **Quality:** format, lint, types, unit tests with at least 80% coverage and no drop from the baseline, and a production build.
2. **E2E** on Chromium, WebKit (Safari) and Firefox.
3. **Visual regression:** screenshots compared at 4 zoom levels.
4. **Lighthouse:** performance at least 90, and the largest content shown within 2.5 seconds (LCP).
5. **Security:** a dependency vulnerability scan.

Dependabot proposes dependency updates, CodeQL scans the code, and outdated runs are cancelled when new commits arrive. **Our trade-off:** for speed, CI runs on pull requests and `main`. During stories we run most of the same checks locally: unit, E2E on Chromium and WebKit, and visual tests (`npm run test:all`), with lint and formatting in the pre-commit hook.
