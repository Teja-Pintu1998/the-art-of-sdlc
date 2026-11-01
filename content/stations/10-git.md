---
id: 10
slug: git
where: "The designs are approved (technical design and the security review, #8 and #9, unlock later). Now code gets written, and Git records every change."
next: "Feature flags (#11) and unit tests (#12) unlock later. Next, automatic code-quality checks that run before code even leaves your laptop."
---

## What it is

**Git** is a **version control system**: it records every change to the code, who made it and why, and lets many people work on the same code at once without overwriting each other.

The core ideas:

- **Commit:** a saved snapshot of the code, with a message explaining the change.
- **Branch:** an independent line of work. You build a feature on a branch, then merge it back.
- **`main`:** the shared branch everyone builds on. In most companies it must **always be releasable**.
- **Merge or rebase:** two ways to bring branches together. Merging keeps both histories; rebasing replays your commits on top of the latest `main` for a straight line.
- **Remote:** the shared copy on a server (GitHub, GitLab, Bitbucket) that everyone pushes to and pulls from.

## Why it exists

- **Safe collaboration.** Hundreds of engineers can change the same codebase in parallel.
- **A full history.** You can see what changed, when, by whom and *why*, which is invaluable when debugging production.
- **Undo.** A bad change can be reverted in minutes.
- **The basis of everything after it.** Pull requests, CI pipelines and deployments all start from a Git commit.

## How it works in big companies

- **Branching strategy:**
  - **Trunk-based development** (most common today): short-lived branches, often less than a day, merged into `main` frequently, with unfinished features hidden behind **feature flags**.
  - **GitFlow:** long-lived `develop`, `release/*` and `hotfix/*` branches. It suits products with scheduled releases, such as mobile apps, but is heavier.
- **Protected `main`:** nobody pushes directly. Changes arrive through **pull requests** with required reviews and passing checks.
- **Branch names and commit messages** link to the ticket: `feat/QB-142-delivery-slots`, `fix(checkout): handle closed restaurants (QB-150)`. Many teams use **Conventional Commits** (`feat:`, `fix:`, `docs:`) so changelogs can be generated.
- **Squash merging** turns a branch's work-in-progress commits into one clean commit on `main`.
- **Undo safely:** `git revert` adds a new commit that undoes an old one, which is safe on shared branches. `git reset` rewrites history, so it's only for your own local work.
- **Never commit secrets.** If a key is ever pushed, it is **rotated immediately**: deleting it doesn't remove it from history.

## Real-world example

QuickBite developer **Sam** picks up story **S1** (choose a delivery time at checkout).

1. **Branch from the latest `main`:** `git switch -c feat/QB-142-delivery-slots`.
2. **Small, focused commits:**
   - `feat(checkout): show 15-minute slots within opening hours (QB-142)`
   - `test(checkout): slots for today and the next 2 days (QB-142)`
3. **Stay up to date:** `main` moves on as teammates merge, so Sam rebases daily. A **merge conflict** appears in `checkout.ts`, where a teammate renamed a function. Sam resolves it, runs the tests and continues.
4. **Push and open a pull request** for review.

Meanwhile, **production breaks**: a payments bug. A teammate creates `hotfix/QB-160` from `main`, fixes it and merges it within the hour. Sam's feature branch isn't affected, and it picks up the fix on the next rebase.

Two weeks later, a slot bug appears. `git log` and `git blame` on the slot code show exactly which commit, story and pull request introduced it, in seconds.

## Common problems and how seniors handle them

- **Long-lived branches** that drift and end in painful merges. Seniors keep branches small and merge often.
- **Huge commits with messages like "fixes".** Seniors make each commit one logical change with a clear *why*.
- **Rewriting shared history** (`push --force` on `main`). Seniors only rewrite their own branches, and use `--force-with-lease`, which refuses if someone else pushed.
- **Secrets committed by accident.** Seniors use `.gitignore` and secret-scanning hooks, and rotate any leaked key.
- **Panic when something breaks.** Seniors use `git revert` to undo fast, and `git bisect` to find the commit that caused it.

## Say this in your interview

"I use Git so that every change is small, traceable and safe to undo. `main` stays releasable at all times: nobody pushes to it directly, and changes arrive through pull requests with reviews and passing checks.

I prefer **trunk-based development**: short-lived feature branches, merged often, with feature flags hiding unfinished work. That avoids the painful merges you get from long-lived branches. Each branch and commit references its ticket, and I write commits as one logical change with a message that explains *why*, so `git log` and `git blame` tell the story later.

I rebase my branch on the latest `main` regularly, resolve conflicts early and re-run the tests. When something goes wrong, I undo it with `git revert`, which is safe on shared branches, rather than rewriting history, and I use `git bisect` to find the commit that introduced a bug.

And I'm strict about secrets: they never go into Git, and if one ever leaks, it gets rotated immediately, because Git history keeps it forever."

## Interview questions you'll get

### What's the difference between merge and rebase?

Merge joins two branches with a merge commit and keeps both histories as they happened. Rebase replays your commits on top of another branch, giving a straight history. I rebase my own branch to stay current, but never rebase shared history.

### What's the difference between git revert and git reset?

`revert` creates a new commit that undoes an earlier one, so history stays intact and it's safe on shared branches. `reset` moves the branch pointer and can discard commits, so it's for local work only.

### Trunk-based development or GitFlow?

Trunk-based for most web teams: short branches, frequent merges and feature flags, which suit continuous delivery. GitFlow fits scheduled releases with long stabilisation periods, such as mobile apps. It's heavier, with more merges.

### How do you resolve a merge conflict?

Understand both changes before choosing. I talk to the other author if the intent isn't clear, combine them correctly, then run the tests before continuing. A conflict is a sign to merge more often.

### Someone committed a password. What do you do?

Rotate the credential immediately, because removing the commit doesn't help: clones and forks may already have it. Then remove it from history if policy requires, and add secret scanning to stop it happening again.

## How we did it in this project

- **Protected `main`:** pull request required, 7 required CI checks, linear history only, and the rules apply to admins too.
- **Commit messages** use Conventional Commits with the story ID, e.g. `feat(map): ... (AOS-2.3)`.
- **The first pull requests were squash-merged** into `main`. Then, for speed, the PO chose to work on a `develop` branch with one commit per task, pushed to GitHub as a backup, and one final PR into `main`.
- **A real recovery:** a script once truncated `SpaceMap.tsx` mid-task. `git checkout` restored the last committed version in seconds. That's why we commit small and often.
