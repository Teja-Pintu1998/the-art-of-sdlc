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

- **Replaces opinions with evidence.** Anyone can disagree with an idea; it's harder to argue with data.
- **Gives the whole team one target.** When design, engineering and QA know the *why*, they can make trade-offs without escalating every decision.
- **Defines success up front,** so after launch you can measure whether it worked instead of explaining it away.
- **Lets leadership compare options.** Every team competes for the same engineers; the business case shows why this deserves them.

## How it works in big companies

- **Who writes it:** usually the **Product Manager**, with input from data analysts, user researchers, design and an engineering lead.
- **Inputs:** product analytics, customer interviews, support tickets, app-store reviews, sales feedback and competitor research.
- **Format:** a short document, often one page. Amazon is known for its **PR/FAQ** ("working backwards"): a press release written as if the feature had already launched, plus the hard questions it must answer. If the press release isn't exciting for customers, the idea is reworked or dropped.
- **Success metrics:** one **primary metric** that should move, with a target and a date, plus **guardrail metrics** that must not get worse.
- **Review:** it is presented at a product or planning review. The outcome is **approve** (it goes on the roadmap), **park** or **kill**.
- **Tools:** Confluence, Notion or Google Docs for the document; Amplitude or Looker for data; Jira Product Discovery or Productboard to track ideas.

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
| **Rough cost** | Two teams for about one quarter (engineering gives a rough size, refined later) |
| **Primary metric** | +1,000 completed orders a week within 8 weeks of launch |
| **Guardrails** | On-time delivery for normal orders doesn't drop; support tickets don't rise |
| **Main risks** | Restaurants may not be ready at the scheduled time; not enough couriers at peak |

Leadership approves it. QuickBite's "Schedule your order" journey begins.

## Common problems and how seniors handle them

- **A solution disguised as a problem.** "Users need a schedule button." Seniors keep asking *why* until they reach the user's pain (the "5 Whys"). That keeps cheaper options on the table.
- **Opinions instead of evidence.** "The CEO wants it." Seniors ask for data, or propose a cheap test first: a survey, five user interviews, or a **fake-door test** (a button that only measures how many people click it).
- **Vague success.** "Improve engagement." Seniors insist on one measurable metric with a target and a date, plus guardrails.
- **Solving everything at once.** Lunch, dinner and group orders in one go. Seniors start with the segment where the pain and the value are biggest.
- **Engineering joins too late.** Engineers know hidden costs and cheaper paths. Seniors get involved early and give a rough size, so the cost in the business case is realistic.

## Say this in your interview

"Before building anything, I make sure we agree on the **problem**, not the solution. A good problem statement says who is affected, what the pain is, the evidence that it's real, and what it costs today. The business case adds the expected value, a rough cost, and how we'll measure success: one primary metric with a target and a date, plus guardrail metrics that must not get worse.

For example, a food-delivery app losing thousands of lunch orders a week because people can't order ahead should frame *that* as the problem, not 'build a scheduling button', size the lost revenue, and agree the target before writing any code.

As an engineer, I like to join this stage early. I can challenge assumptions, suggest cheaper options and give a rough size, because the most expensive bug is building the wrong thing."

## Interview questions you'll get

### What makes a good problem statement?

It is specific about who is affected, describes the pain without prescribing a solution, is backed by evidence, and puts a number on the impact. If you can't measure the problem, you can't tell whether you solved it.

### What's the difference between a problem statement and a business case?

The problem statement explains the pain and who has it. The business case argues whether solving it is worth the investment: expected value, rough cost, risks and success metrics. The first answers "what's wrong?"; the second answers "should we spend money on it now?"

### How do you define success for a feature?

One primary metric tied to the problem, with a target and a time frame, plus guardrail metrics that must not get worse. Agree them **before** building, so the result can't be explained away afterwards.

### A stakeholder insists on a specific feature. What do you do?

I ask what problem it solves and what evidence we have, out of curiosity rather than as a challenge. Then I treat their idea as one option, compare it with cheaper ones, and suggest a small test if the evidence is thin. That keeps the discussion about outcomes, not opinions.

### Why should engineers care about this stage?

Engineering time is usually the biggest cost. Engineers spot technical risks and cheaper alternatives early, make the cost estimate realistic, and build better when they understand the *why*.

## How we did it in this project

This project started exactly here. Before any code, we wrote our [problem statement and business case](https://github.com/Teja-Pintu1998/the-art-of-sdlc/blob/main/docs/01-problem-statement.md):

- **Problem:** tutorials teach languages and frameworks, but not how software is actually delivered inside a company, and interviewers for mid-level and senior roles test exactly that.
- **Who:** graduates, career switchers, developers at small companies, and engineers preparing for interviews.
- **Why existing options fall short:** videos and blogs are scattered, courses teach tools rather than process, and interview platforms focus on algorithms.
- **Success metrics:** at least 60% of visitors complete Phase 1, 20% reach Senior, and 70% rate it "helpful for interviews". The 👍/👎 at the end of this lesson measures that last one.
