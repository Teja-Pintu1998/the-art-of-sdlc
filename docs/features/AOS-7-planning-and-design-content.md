# AOS-7: Content: planning and design stations ✅

> **As a** learner, **I want** interview-ready lessons on how work is planned and designed, **so that** I can talk confidently about the start of a project.

**Status:** all 5 lessons written on `develop` (Sprint 3). **Signed off by the PO on 2026-11-01** ("looks good").

## Lessons

| # | Station | Reading time | Interview answer | Questions | QuickBite thread |
|---|---------|--------------|------------------|-----------|------------------|
| 7.1 | #1 Problem statement | 4.9 min | 165 words | 5 | Lost lunch orders → problem statement and business case (€70k cost, €156k a year) |
| 7.2 | #2 PRD | 4.7 min | 163 words | 6 | Requirements FR-1 to FR-4 with MoSCoW; review catches card-authorisation expiry → schedule up to 2 days ahead |
| 7.3 | #3 Technical feasibility / spike | 4.7 min | 163 words | 5 | Can 5,000 orders due at 12:00 be released within 60s? Cron vs queue vs a polled table with row locks |
| 7.4 | #4 Epics and stories | 5.0 min | 167 words | 6 | Horizontal split rejected → 4 vertical stories, Given/When/Then, sprint goal. Also covers the backlog lifecycle and task loop (#5 and #6 are locked, PRD v1.3) |
| 7.5 | #7 UX design | 4.8 min | 173 words | 6 | Usability test: 3 of 5 missed "Schedule" in a dropdown → visible toggle; design review adds error and accessibility states |

Each "How we did it" quotes our real artifacts: the PRD review (RC-1, RC-2), the spike (two builds, the Framer drag drift, the PO-found flicker), the 48 → 10 story restructure and the local-workflow trade-off, and the UX design and PO feedback (preview card, title clear of the map).

## Quality gates (automatic, on every build)

3–5 minutes of reading (238 words per minute), a 150–200 word interview answer, at least 5 interview questions, all 8 sections, and no "years of experience". Station 4 first measured 5.1 minutes; the build failed and it was tightened.

## Follow-ups

- [x] PO sign-off of lessons 1, 2, 3, 4 and 7 (2026-11-01).
- [x] Only the open station's lesson is sent to the browser (done in Sprint 4).
