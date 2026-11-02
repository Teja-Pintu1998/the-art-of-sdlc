---
id: 1
slug: problem-statement
where: "The very start. Before any design or code, someone has to show there is a real problem worth solving."
next: "The problem is agreed and the business case is approved. Next, we turn it into requirements everyone can review and sign off: the PRD."
---

## What it is

A **problem statement** says, in a few sentences, **who** has a problem, **what** the problem is and **why it matters**, without proposing a solution.

A **business case** adds the numbers: what solving it is worth, roughly what it will cost, and how we will know it worked.

Together they answer one question before any money is spent: **is this worth building, now?**

A good problem statement has four parts:

- **Who** is affected: a specific group of users, not "everyone"
- **What** they struggle with, described from their side
- **Evidence** that it is real: data, support tickets, user research
- **Impact**: what the problem costs users and the business today

## Why it exists

The most expensive mistake in software isn't a bug. It's building something nobody needed. Teams that start from a solution ("let's build X") can build the wrong thing very well.

Writing the problem down first:

- **Replaces opinions with evidence.**
- **Gives the whole team one target,** so design, engineering and QA can make trade-offs on their own.
- **Defines success up front,** so after launch you can measure whether it worked.
- **Lets leadership compare options,** because every team competes for the same engineers.

## How it works in big companies

- **Who writes it:** usually the **Product Manager**, with input from data analysts, user researchers, design and an engineering lead.
- **Inputs:** product analytics, customer interviews, support tickets, app reviews and competitor research.
- **Format:** a short document, often one page. Amazon is known for its **PR/FAQ** ("working backwards"): a press release written as if the feature had already launched. If it doesn't excite customers, the idea is reworked or dropped.
- **Success metrics:** one **primary metric** that should move, with a target and a date, plus **guardrail metrics** that must not get worse.
- **Review:** at a product or planning review, the outcome is **approve** (onto the roadmap), **park** or **kill**.
- **Tools:** Confluence, Notion or Google Docs; Amplitude or Looker for data; Jira Product Discovery or Productboard for ideas.

## Real-world example

Our running example: **QuickBite**, a food-delivery app. We follow one feature through all 42 stations.

**What the team noticed:**

- About **12,000 users a week** open the app on weekday mornings, browse lunch menus and leave without ordering.
- Support gets around **300 messages a week** like *"Can I order now for 1 pm?"*
- A short exit survey says a third of those users meant to order later but forgot or got busy.

**Problem statement:**

> Office workers who plan lunch in the morning can't order ahead for a specific time. They have to remember to order later, and about a third of them don't. We lose an estimated 4,000 lunch orders a week, and customers are frustrated during the lunch rush.

Notice what it does **not** say: "build a schedule button". Scheduling is one possible solution; a reminder notification is another. The solution is chosen later.

**Business case:**

| | |
|---|---|
| **Value** | Win back 25% of lost orders: about 1,000 orders a week × €3 margin ≈ **€156,000 a year**. Scheduled orders also spread out the lunch peak for restaurants and couriers |
| **Rough cost** | One team for about six weeks, roughly €70,000, so it pays back within six months (engineering gives the rough size) |
| **Primary metric** | +1,000 completed orders a week within 8 weeks of launch |
| **Guardrails** | On-time delivery for normal orders doesn't drop; support tickets don't rise |
| **Main risks** | Restaurants may not be ready at the scheduled time; not enough couriers at peak |

Leadership approves it. QuickBite's "Schedule your order" journey begins.

## Common problems and how seniors handle them

- **A solution disguised as a problem.** "Users need a schedule button." Seniors keep asking *why* until they reach the user's pain (the "5 Whys"). That keeps cheaper options on the table.
- **Opinions instead of evidence.** "The CEO wants it." Seniors ask for data or a cheap test first, such as user interviews or a **fake-door test** (a button that only counts clicks).
- **Vague success.** "Improve engagement." Seniors insist on one measurable metric with a target and a date, plus guardrails.
- **Solving everything at once.** Seniors start with the segment where the pain and value are biggest.
- **Engineering joins too late.** Seniors get involved early and give a rough size, so the cost in the business case is realistic.

## Say this in your interview

"Before building anything, I make sure we agree on the **problem**, not the solution. A good problem statement says who is affected, what the pain is, the evidence that it's real, and what it costs today. The business case then adds the expected value, a rough cost, the main risks, and how we'll measure success: one primary metric with a target and a date, plus guardrail metrics that must not get worse.

For example, a food-delivery app losing thousands of lunch orders a week because people can't order ahead should frame *that* as the problem, not 'build a scheduling button'. Then it sizes the lost revenue and agrees the target before anyone writes code. That keeps cheaper options, like a simple reminder, on the table.

As an engineer, I like to join this stage early. I can challenge assumptions, suggest simpler options and give a rough size, so the business case is realistic. The most expensive mistake isn't a bug; it's building the wrong thing."

## Interview questions you'll get

### What makes a good problem statement?

It names who is affected, describes the pain without prescribing a solution, is backed by evidence, and puts a number on the impact. If you can't measure the problem, you can't tell whether you solved it.

### What's the difference between a problem statement and a business case?

The problem statement explains the pain and who has it. The business case argues whether solving it is worth the investment: value, cost, risks and success metrics. One answers "what's wrong?"; the other, "should we spend money on it now?"

### How do you define success for a feature?

One primary metric tied to the problem, with a target and a time frame, plus guardrail metrics that must not get worse. Agree them **before** building, so the result can't be explained away afterwards.

### A stakeholder insists on a specific feature. What do you do?

I ask what problem it solves and what evidence we have, out of curiosity rather than as a challenge. Then I treat their idea as one option, compare it with cheaper ones, and suggest a small test if the evidence is thin.

### Why should engineers care about this stage?

Engineering time is usually the biggest cost. Engineers spot risks and cheaper options early, and build better when they understand the *why*.

## How we did it in this project

This project started exactly here. Before any code, we wrote our [problem statement and business case](https://github.com/Teja-Pintu1998/the-art-of-sdlc/blob/main/docs/01-problem-statement.md):

- **Problem:** tutorials teach languages and frameworks, but not how software is actually delivered inside a company, and interviewers for mid-level and senior roles test exactly that.
- **Who:** graduates, career switchers, developers at small companies, and engineers preparing for interviews.
- **Success metrics:** at least 60% of visitors complete Phase 1, 20% reach Senior, and 70% rate it "helpful for interviews". The 👍/👎 at the end of this lesson measures that last one.
