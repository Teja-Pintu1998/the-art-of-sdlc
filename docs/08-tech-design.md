# Technical Design, Architecture Review and Security Review

| | |
|---|---|
| **Date** | 2026-11-01 |
| **SDLC steps** | 12. Technical design · 13. Architecture review · 14. Security and privacy review |
| **Owner** | Claude (Tech Lead) |
| **Status** | ✅ Approved by the PO |
| **Inputs** | [PRD v1.4](02-prd.md) · [Spike findings](03-spike-findings.md) · [UX design](07-ux-design.md) |

---

## 1. Architecture Overview

```
                    ┌──────────────── GitHub ────────────────┐
  developer ──PR──▶ │ Actions CI: lint · types · tests ·      │
                    │ Lighthouse · axe · build · Docker image │
                    └───────────────┬────────────────────────┘
                                    │ image tag: <version>-<sha>
                                    ▼
                         Artifact Registry (GCP)
                                    │
             ┌──────────────────────┼───────────────────────┐
             ▼                      ▼                       ▼
     Cloud Run: preview     Cloud Run: staging      Cloud Run: production
     (tagged revision       (pre-prod / UAT)        (canary: 10% → 50% → 100%,
      per PR)                                        rollback = previous revision)
                                    │
                         Browser ── New Relic (errors, performance,
                                    KPI page actions; no cookies or storage)
                                    ▲
                         Terraform: dashboards + alerts
```

v1 is **frontend-only**: no backend API, no database. All pages are pre-built at build time and served by a Next.js server in a container.

## 2. Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router), TypeScript (strict) |
| Styling | Tailwind CSS |
| Animation | Framer Motion (animation only; drag uses custom pointer events, per the spike) |
| State | Zustand store for progress, persisted to `localStorage` with a versioned schema |
| Content | MDX: one file per station, frontmatter plus 8 required sections, validated at build time |
| Unit tests | Vitest + React Testing Library |
| E2E / visual / a11y | Playwright (Chromium, WebKit, Firefox), screenshot comparison, `@axe-core/playwright` |
| Performance | Lighthouse CI |
| Container | Docker, multi-stage build, Next.js `standalone` output, non-root user |
| Hosting | Google Cloud Run + Artifact Registry |
| Monitoring and analytics | New Relic browser agent; KPIs as custom page actions |
| Infrastructure as code | Terraform (New Relic dashboards and alerts) |

## 3. Folder Structure

```
src/
  app/                 → pages: / and /station/[slug]
  components/
    map/               → Starfield, Planet, Path, MiniMap, SectorLabel
    astronaut/         → Astronaut, PreviewCard
    station/           → StationPanel, sections, Feedback
    progress/          → ProgressBar, RankBadge, Celebration
    onboarding/        → intro overlay (FR-9)
    search/            → station search / quick jump (FR-10)
    knowledge-base/    → knowledge-base panel (FR-11)
    ui/                → shared buttons, dialogs
  lib/
    map/               → stations.ts (manifest of all 42 stations), world layout, semantic zoom math, snapping
    content/           → MDX loading and schema validation
    progress/          → Zustand store, rank rules
    analytics/         → New Relic page-action helpers
content/stations/      → 01-problem-statement.mdx, 02-prd.mdx, …
content/knowledge-base/ → Agile ceremonies, Jira workflow, … (MDX)
tests/
  unit/ · e2e/ · visual/
infra/terraform/       → New Relic dashboard and alerts
docs/                  → project docs; docs/features/ per built feature
```

## 4. Key Design Details

- **Semantic zoom** (spike 3.8): the view lives in a ref; every frame updates only `transform` on planets, labels and the astronaut; the path keeps a constant 2.5px screen width.
- **Content validation:** a build step parses every MDX file and fails if frontmatter fields (`id`, `slug`, `title`, `phase`, `summary`, `status`) or any of the 8 section headings are missing.
- **Station manifest:** `src/lib/map/stations.ts` is the single source of truth for all 42 stations (id, slug, name, phase, order). MDX frontmatter references the manifest `id`; the build check fails if they don't match.
- **Locked stations:** manifest stations without a content file (or with `status: locked`) render dimmed and have no panel.
- **Interview mode** (FR-14, Could have): a toggle inside the station panel (`components/station/`).
- **Deep links:** `/station/[slug]` is pre-built for each available station, with its own title and description; it opens with the panel already open.
- **Progress schema:** `{ version, completed: string[], lastStation, highestRank, onboardingSeen }`; unknown versions reset safely.

## 5. Architecture Decision Records (step 13)

| ADR | Decision | Alternatives considered | Reason |
|-----|----------|-------------------------|--------|
| ADR-1 | DOM + Framer Motion map with semantic zoom | PixiJS canvas | Spike: equally smooth, but accessible, SEO-friendly, 3× smaller |
| ADR-2 | Pre-built pages with Next.js in a standalone container | Client-only SPA; static export | SEO plus Docker plus a canary-capable runtime |
| ADR-3 | MDX content validated at build time | JSON; a headless CMS | Easy to write, version-controlled, no extra service |
| ADR-4 | ~~Google Cloud Run for hosting~~ **Superseded by ADR-6** | Vercel; AWS App Runner; Fly.io | Runs our Docker image, native traffic splitting for **real canary releases**, instant rollback, free tier |
| ADR-6 | **Vercel (Hobby) for hosting** (2026-11-01, PRD SC-3) | Google Cloud Run (needs a card); Netlify; Cloudflare Pages | Free with no card, built by the Next.js team, preview URL per branch and PR, instant rollback. Trade-offs: no Docker at runtime (the image is still built and scanned in CI), and traffic splitting is paid, so the canary approach is decided at that step. Diagram above shows the original Cloud Run plan |
| ADR-5 | New Relic for monitoring **and** KPI analytics, no cookies or browser storage | Separate analytics tool | One tool, no consent banner, matches the monitoring stations |
| ADR-6 | Browser storage for progress | Accounts and a database | No personal data in v1; accounts are a v2 item |

**Resolved PRD open questions:** Q1 (hosting) → ADR-4 · Q2 (content format) → ADR-3 · Q5 (cookies) → ADR-5 · Q3 (target date) → mid-December 2026, see the [release plan](06-estimation-and-release-plan.md). Q4 (domain name) is still open and is decided before launch.

## 6. Security and Privacy Review (step 14)

| Area | Control |
|------|---------|
| Personal data | No accounts and nothing stored by us. New Relic runs with session tracking and Session Replay disabled, and writes no cookies or browser storage (verified in DevTools as part of AOS-10.1). IP addresses are processed by New Relic, not stored by us |
| Security headers | Content-Security-Policy limited to our own origin and New Relic, including `frame-ancestors 'none'`; plus `X-Frame-Options: DENY`, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. **Trade-off:** a nonce-based CSP would force dynamic rendering, which contradicts pre-built pages (ADR-2). v1 therefore allows `'unsafe-inline'` for scripts as an **accepted risk** (there is no user-generated content, so XSS exposure is low), to be revisited with hash-based CSP later |
| Dependencies | Dependabot alerts and updates; dependency scanning in CI; CodeQL code scanning |
| Secrets | No secrets in the repo. CI authenticates to Google Cloud with **Workload Identity Federation** (no GCP keys). The New Relic User API key used by Terraform is stored as a **GitHub encrypted secret**, and Terraform state is kept in a remote **GCS bucket** |
| Container | Minimal base image, runs as a non-root user |
| Source control | `main` protected; changes only through reviewed PRs with green CI |
| Content | MDX is ours and compiled at build time; no user-generated content is rendered |

**Result:** ✅ No blocking risks for v1.
