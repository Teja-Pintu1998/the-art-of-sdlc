---
title: Jira workflow
summary: How work items move from idea to done, and how tickets connect to code.
---

**Jira** is the most common tool for tracking work. Alternatives include Linear, Azure Boards and GitHub Projects; the concepts are the same.

**Issue types, from big to small:**

- **Epic:** a large feature, such as *QuickBite "Schedule your order"*.
- **Story:** a user-facing slice of it: *"As an office worker, I can pick a delivery time."*
- **Task:** work that isn't a user story, such as an upgrade or a configuration change. It sits at the same level as a story.
- **Sub-task:** a step inside a story or task, such as "build the slot API".
- **Bug:** something that doesn't work as specified.

**A typical workflow:** To Do → In Progress → In Review → In QA → Done. Teams customise the statuses, but each one should mean something clear, with exit rules. For example, nothing reaches *Done* until it meets the **Definition of Done** (tested, reviewed, merged, deployed).

**Board and backlog:** the **backlog** is the ordered list of everything not yet started. The **board** shows the current sprint's work by status. **Story points** estimate relative effort, and **velocity** (points finished per sprint) helps plan, not judge.

**Connecting tickets to code:** put the issue key in the branch name and commit message, e.g. `feat/AOS-12-search` and `feat(search): quick jump (AOS-12)`. Jira then shows the branch, the pull request and the build on the ticket, so anyone can trace a change from requirement to production.

**What seniors do differently:**

- Write tickets someone else could pick up: context, acceptance criteria and links.
- Keep the board honest: move tickets when the work moves, and flag blocked items.
- Don't let the tool become the goal: a short conversation often beats ten comments.

**In an interview:** explain how a story flows from backlog to production, and how you'd trace a production bug back to the ticket and the commit that introduced it.
