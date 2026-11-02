# Estimation and Release Plan

| | |
|---|---|
| **Date** | 2026-11-01 |
| **SDLC steps** | 8. Estimation and prioritisation · 9. Release plan |
| **Status** | ✅ Approved by the PO |

---

## Estimation (story points, Fibonacci: 1, 2, 3, 5, 8, 13)

Story points measure relative size (effort, complexity and uncertainty), not hours.

| Story | Points | Main driver |
|-------|--------|-------------|
| AOS-1 Engineering foundation | 13 | Many tools; cloud setup (Cloud Run, canary) has the most unknowns |
| AOS-2 Space map | 8 | De-risked by the spike, but has to be production quality |
| AOS-3 Astronaut and navigation | 8 | Pointer, keyboard and touch input plus accessibility |
| AOS-4 Station panel and content system | 8 | Content schema, panel, SEO routes |
| AOS-5 Progress and ranks | 5 | Small state store and celebration UI |
| AOS-6 Onboarding and discovery | 5 | Three small features |
| AOS-7 Content: planning and design | 8 | 5 stations of high-quality writing |
| AOS-8 Content: development and CI | 8 | 5 stations |
| AOS-9 Content: release and monitoring | 5 | 4 stations, 2 completed after launch |
| AOS-10 Observability and analytics | 5 | New Relic, Terraform, alerts |
| **Total** | **73** | |

**Assumed velocity:** about 13 points per sprint, to be revised after Sprint 0 based on actual results.

## Release Plan (v1)

| Sprint | Goal | Stories | Points |
|--------|------|---------|--------|
| Sprint 0 | Engineering foundation (tasks 1.1–1.5) | AOS-1 | 13 |
| Sprint 1 | A map you can explore | AOS-2, AOS-3 | 16 (deliberate stretch: the spike de-risked both) |
| Sprint 2 | Stations you can open, and progress | AOS-4, AOS-5 | 13 |
| Sprint 3 | Onboarding and first content | AOS-6, AOS-7 | 13 |
| Sprint 4 | Engineering content and monitoring | AOS-8, AOS-10 | 13 |
| Sprint 5 | Release | AOS-1.6 Docker (built in CI) and 1.7 Vercel environments (SC-3), then QA, UAT, CR, go/no-go, canary launch (build steps 22–37); AOS-9 written along the way | 5 |

**Target v1 launch:** mid-December 2026, based on the **1-week sprints** agreed at kickoff (6 sprints from 2026-11-01). If a sprint slips, the date is reviewed at the sprint review.

**Notes**
- **Re-plan (PO decision, 2026-11-01):** to reach visible features sooner, AOS-1.6 (Docker) and 1.7 (Cloud Run environments) move from Sprint 0 to the start of Sprint 5. AOS-1 stays open until then. Until 1.7, "deployed to the preview environment" in the Definition of Done is replaced by a local production build check.
- AOS-7 tasks 7.1–7.3 (Problem statement, PRD, Spike) can be written as soon as the content system (AOS-4) exists, since we've already lived those steps.
- **Analytics dependency:** tasks 4.4 (feedback) and 5.3 (ranks) call a small analytics helper (`src/lib/analytics`) that is created in Sprint 2 with the agreed event names and does nothing yet. AOS-10.1 connects it to New Relic in Sprint 4. This keeps Sprint 2 "Ready" without pulling AOS-10 forward.
- **Launch sequence (PO decision, 2026-11-01):** production (`main`) still served the Sprint 0 placeholder, so v1.0.0 had no stable version to canary against, and the canary router only reaches production with the release itself. **v1.0.0 launches as a standard production deploy** (step 33, smoke test, Instant Rollback ready). **The canary runs for real on v1.0.1**, the hypercare release (#29 and #34 "How we did it", P4 polish), at 25% against stable v1.0.0 (steps 34 and 36). See the [runbook](11-runbook.md).
- **Release-content order (Sprint 5):** CR approved → write station #26 (CR) → go/no-go meeting → write #27's "How we did it" → launch v1.0.0 → canary v1.0.1. #27's "How we did it" is therefore exempt from the go/no-go content check, like #29 and #34 (PRD v1.4).
- AOS-9 tasks 9.3 and 9.4 close after launch, during hypercare (PRD RC-1).
