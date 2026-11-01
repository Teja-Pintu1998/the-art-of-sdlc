---
id: 13
slug: code-quality
where: "Code is being written on branches (#10). Before anyone else sees it, automated tools check its quality."
next: "The code passes every local check. Next, a teammate reviews it in a pull request."
---

## What it is

Code-quality tooling catches problems **automatically**, so humans don't have to:

- **Linter (ESLint for JavaScript and TypeScript):** finds likely bugs and bad patterns, such as unused variables, a forgotten `await`, or React hooks used incorrectly.
- **Formatter (Prettier):** rewrites code into one consistent style: spacing, quotes, line length. Nobody argues about style again.
- **Type checker (TypeScript):** catches type errors before the code runs.
- **Pre-commit hooks (Husky):** run these checks automatically when you commit, so problems never leave your laptop.
- **lint-staged:** runs the checks only on the files you're committing, so the hook stays fast.

Other ecosystems have the same idea: Ruff and Black for Python, Checkstyle and Spotless for Java, `golangci-lint` and `gofmt` for Go.

## Why it exists

- **Fast feedback is cheap.** A bug caught in your editor costs seconds. The same bug caught in code review costs a round trip, in CI minutes, and in production an incident.
- **Reviews focus on what matters.** When style and simple mistakes are automated, reviewers spend their time on design and logic.
- **One consistent codebase.** Everyone's code looks the same, so it's easier to read and change.
- **Rules become shared knowledge.** A lint rule encodes a lesson the team learned once, for everyone.

## How it works in big companies

- **Shared configs:** one ESLint and Prettier setup used across many repositories, often published as an internal package.
- **Three layers of the same checks:**
  1. **In the editor:** errors appear as you type, and format on save.
  2. **Pre-commit hook:** Husky with lint-staged checks the staged files.
  3. **CI:** the same checks run again on a clean machine, so nobody can skip them.
- **Zero warnings policy:** warnings are treated as errors (`--max-warnings=0`). Otherwise they pile up and everyone ignores them.
- **Exceptions are explicit:** if a rule must be disabled, it's done on one line with a comment explaining why, so a reviewer can challenge it.
- **Bypassing hooks** (`git commit --no-verify`) is discouraged or forbidden; CI catches it anyway.

## Real-world example

QuickBite's Sam is finishing the delivery-slot picker and runs `git commit`.

The **pre-commit hook** runs ESLint and Prettier on the 4 staged files, and **blocks the commit**:

- **A missing `await`:** `reserveSlot(orderId, slot)` was called without `await` (the TypeScript rule `no-floating-promises`). The checkout would have continued before the slot was reserved, so two customers could get the last 12:45 slot. A real bug, caught in about 2 seconds.
- **An unused import** left over from an experiment.
- **Formatting:** Prettier fixes it automatically, with nothing to discuss in review.

Sam fixes the `await`, commits again, and everything passes. The pull request that follows has **no style comments at all**: the review is about how slots are chosen, which is where human attention belongs.

## Common problems and how seniors handle them

- **Slow hooks** that people bypass. Seniors use lint-staged so only changed files are checked, and keep slow tests in CI.
- **Warnings ignored for months.** Seniors enforce zero warnings, and fix or explicitly disable each one with a reason.
- **Style debates in code review.** Seniors hand formatting to Prettier and stop discussing it.
- **Turning rules off to "make it pass".** Seniors understand why the rule fired first; often it's a real bug.
- **Local and CI checks drift apart.** Seniors make both run the same commands from the same config.

## Say this in your interview

"I want problems caught as early and as cheaply as possible, so I automate code quality in layers.

A **linter** like ESLint catches likely bugs: unused variables, misused React hooks, or a forgotten `await` on an async call. A **formatter** like Prettier makes the style consistent, so nobody debates spacing in code review. **TypeScript** in strict mode catches type errors before the code runs.

These checks run in three places: in the editor as I type, in a **pre-commit hook** with Husky and lint-staged on just the staged files so it stays fast, and again in **CI** so nobody can skip them. I treat warnings as errors; otherwise they pile up until everyone ignores them.

The payoff is real. A lint rule once flagged a missing `await` on a slot reservation, which would have let two customers book the same delivery slot. It was caught in seconds, before review. And because the tools handle style and simple mistakes, code reviews can focus on design and logic, which is where human attention matters most."

## Interview questions you'll get

### What's the difference between a linter and a formatter?

A linter finds problems in what the code does: likely bugs and risky patterns. A formatter only changes how code looks. Use both, with the linter's style rules turned off so they don't conflict.

### Why use pre-commit hooks if CI runs the same checks?

Speed of feedback. A hook catches a problem in seconds on your machine; CI catches it minutes later, after a push. CI remains the safety net, because hooks can be skipped.

### Why is lint-staged useful?

It runs checks only on the files you're committing, not the whole codebase, so hooks stay fast enough that people don't bypass them.

### What would you do if a lint rule blocks you and you think it's wrong?

First understand why it fired, because it's often right. If it's a genuine false positive, disable it for that one line with a comment explaining why, and discuss changing the rule with the team if it happens often.

### How do you introduce linting into a large legacy codebase?

Start with the formatter in one big commit. Enable rules gradually, starting with the ones that catch bugs, apply them to new or changed code first, and fix old code over time, rather than in one huge change.

## How we did it in this project

- **ESLint:** Next.js's recommended rules (Core Web Vitals and TypeScript), with formatting rules turned off so Prettier owns style.
- **Prettier:** 100-character lines, plus a plugin that sorts Tailwind classes.
- **TypeScript in strict mode**, including `noUncheckedIndexedAccess`, so a missing array item can't slip through as a value.
- **Husky with lint-staged:** every commit runs `eslint --fix --max-warnings=0` and Prettier on the staged files only. Our rule: never bypass it with `--no-verify`.
- **Real catches:**
  - React's lint rules flagged reading a ref during render, which led to a cleaner design for the lesson panel.
  - They also flagged a `setState` inside an effect. That one was intentional (to show saved progress on the first frame), so it's disabled on that one line with a comment explaining why.
