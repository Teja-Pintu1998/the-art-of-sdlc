---
title: Working with other teams
summary: Dependencies, contracts and collaboration across teams in a larger company.
---

In a big company, almost no feature ships within one team. QuickBite's "Schedule your order" needs the **ordering** team, the **courier dispatch** team, the **payments** team, **notifications**, and a **platform** team that runs the infrastructure.

**Find dependencies early.** During planning, list what you need from other teams and when. Their roadmap is already full, so a request that arrives late is a request that misses the release.

**Agree contracts, not just conversations:**

- **API contracts:** agree the request and response format (for example as an **OpenAPI** spec) before either side builds. Then both teams can work in parallel against mocks.
- **Design docs / RFCs:** a short written proposal that other teams review before you build something that affects them.
- **SLOs and SLAs:** an **SLO** is a service's internal target (e.g. 99.9% of requests succeed); an **SLA** is a contractual promise to customers, usually with penalties. Knowing them lets you design for the other service's failures.

**Communicate through the right channel:** a shared Slack channel or ticket for day-to-day work, a sync meeting for blockers, and the **escalation path** (your manager, then theirs) only when a blocker threatens a date. Escalating is normal. Escalating as a surprise isn't.

**During incidents,** teams work together under one **incident commander**: one channel, clear roles, and blame-free reviews afterwards.

**When teams disagree,** seniors argue with data, write down the trade-offs, and once a decision is made they **disagree and commit**, supporting it fully.

**What seniors do differently:** they build relationships before they need favours, make it easy for other teams to say yes (clear asks, prepared contracts), and give credit generously.

**In an interview:** describe a cross-team dependency you handled: how you found it early, what you agreed, and how you kept it on track.
