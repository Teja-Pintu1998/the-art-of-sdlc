# QA Test Report: v1 Release Candidate

| | |
|---|---|
| **Date** | 2026-11-01 |
| **SDLC steps** | 22. QA testing · 23. Bug triage and fixes · 24. Performance and accessibility testing |
| **Owner** | Claude (QA) |
| **Build** | `develop` at `b164fbe` |
| **Status** | ✅ Ready for code freeze and UAT: no open P1 or P2 bugs |
| **Inputs** | [PRD v1.6](02-prd.md) (release criteria, NFRs) · [Definition of Done](05-definition-of-ready-done.md) · [Stories](04-epics-and-stories.md) |

---

## 1. Summary

The release candidate passes every automated check: unit, end-to-end on two browser engines, visual regression, accessibility and Lighthouse. QA found **5 bugs**: 3 at P2, plus 2 regressions introduced and caught while fixing them. **All are fixed and covered by tests.** The only release criteria still open are the ones that come after QA by design: UAT, the 4 release lessons, CR and Go/No-Go.

## 2. Scope and approach

| Level | What it checks | Tool |
|---|---|---|
| Unit and component | Map maths, navigation, progress store, lesson parser, panels, canary router, analytics | Vitest + Testing Library (jsdom) |
| End-to-end | Real user journeys in a production build: map, astronaut, stations, progress, onboarding, search, security headers | Playwright: Chromium, WebKit (Firefox in CI) |
| Visual regression | The map at 4 zoom levels against saved screenshots | Playwright screenshots |
| Accessibility | WCAG 2.1 AA rules on the map, lesson, dialogs and phone layout | axe-core inside the E2E suite, plus Lighthouse |
| Performance | Lighthouse on a simulated mid-range phone over slow 4G (3 runs) | Lighthouse CI 0.15.1 |
| Exploratory | Keyboard-only use, zoomed-out views, returning visitors, screenshots reviewed by eye | Manual |

## 3. Results

### 3.1 Automated tests

| Suite | Result |
|---|---|
| Unit and component | ✅ **222 / 222** passed |
| Coverage | ✅ **98.8%** lines · 93.3% branches · 99.7% functions (gate: ≥ 80%) |
| End-to-end (Chromium + WebKit) | ✅ **106 / 106** passed |
| Visual regression | ✅ **4 / 4** passed, stable over 8 consecutive runs |
| Lint, format, type check | ✅ Clean (0 warnings allowed) |

### 3.2 Lighthouse (home page, mobile, 3 runs)

| Metric | Result | Target |
|---|---|---|
| Performance | ✅ **96** | ≥ 90 |
| Accessibility | ✅ **100** | ≥ 90 |
| Best practices · SEO | ✅ **100 · 100** | n/a |
| LCP, simulated slow phone | ✅ **2.76 s** | < 3 s (CI limit, PRD SC-4) |
| LCP, observed | ✅ **0.04–0.08 s** | < 2.5 s (PRD) |
| Total blocking time | ✅ **2–5 ms** | n/a |
| Cumulative layout shift | ✅ **0** | n/a |

### 3.3 Browser matrix (PRD: latest 2 versions of Chrome, Safari, Firefox, Edge)

| Browser | Engine | Status |
|---|---|---|
| Chrome, Edge | Chromium | ✅ Tested locally (full E2E) |
| Safari | WebKit | ✅ Tested locally (full E2E) |
| Firefox | Gecko | ⏳ CI only: Playwright's Firefox can't launch on this Mac ("Could not find profile folder"). Required check on the final PR to `main`. |

## 4. Bugs found

| # | Bug | Priority | Found by | Fix | Test |
|---|---|---|---|---|---|
| 1 | **Slow first load:** new visitors' LCP waited for JavaScript, because the intro card rendered only after hydration (Lighthouse 2.9 s) | P2 | Lighthouse | Card rendered on the server; an inline script hides it before paint for returning visitors. Observed LCP 0.08 s, performance 92 → 96. Simulated LCP stays at about 2.76 s; the PO accepted a 3 s CI limit (SC-4) | Unit (inline script) + 2 E2E with JavaScript blocked |
| 2 | **No keyboard zoom:** keyboard users couldn't zoom out to see the whole journey (WCAG 2.1.1) | P2 | AOS-2 code review | `+` / `-` zoom, `0` fits the journey; browser zoom and text fields untouched | Unit (keys, guards, fit-all) |
| 3 | **Locked stations marked by colour only when zoomed out:** the 🔒 hid with the station numbers (WCAG 1.4.1) | P2 | AOS-2 code review | A fixed-size lock badge over every locked planet when zoomed out | Unit + visual baseline |
| 4 | **Regression from fix 3:** the ✓ on completed planets was partly covered by the new planet layer | P2 | Code review of the fix | ✓ drawn above the planet again | E2E (stacking) |
| 5 | **Flaky screenshot from fix 3:** the badge, inside the planet's `will-change` layer, rendered sharp or blurry depending on timing (also visible to users) | P3 | QA (repeated visual runs) | Badge became a separate, never-scaled element | Visual, 8 runs stable |

Also fixed during QA: map keys (zoom, arrows) no longer act behind an open Search or Knowledge base dialog.

**Lesson learned:** CI runs Lighthouse only on PRs and `main`, so bug 1 sat unnoticed from Sprint 3 until QA. Running `lhci autorun` locally at the end of each UI story would have caught it the same day.

## 5. Known issues (deferred, P4)

Non-blocking polish from code reviews, tracked under "Follow-ups" in each feature doc:

- **Map:** mini-map viewport box ignores the hero; star density is higher on phones; mini-map fixed at 2× pixel ratio; repeated first/last-station announcements; two-finger pan; fit-all test with the hero inset.
- **Onboarding:** Skip/Next are visible a moment before they work on slow phones.
- **CI:** the Lighthouse check is still named "LCP < 2.5s", because `main`'s branch protection requires it by exact name. Rename both together.

## 6. Release criteria status (PRD §10)

| Criterion | Status |
|---|---|
| All Must-have requirements done (FR-1 to FR-7) | ✅ Built and tested; PO acceptance at UAT |
| All 14 v1 stations written and reviewed | 🔵 10 / 14: AOS-7 (5) signed off, AOS-8 (5) awaiting PO sign-off, AOS-9 (4) written during the release by design |
| Coverage ≥ 80%; all tests pass; no open P1/P2 | ✅ 98.8%; all green; none open |
| Lighthouse ≥ 90; accessibility checks pass | ✅ 96 / 100; axe clean |
| UAT signed off by the PO | ⏳ Next (step 27) |
| CR approved; Go/No-Go is **Go** | ⏳ Steps 30–32 |
| Monitoring and alerts live before full rollout | 🔵 Dashboard and alert conditions in Terraform (AOS-10); `NEXT_PUBLIC_NEW_RELIC` must also be enabled for **Preview** so canary visitors report |

## 7. Recommendation

**Proceed to code freeze (step 25) and staging (step 26), then UAT (step 27).** From the freeze on, `develop` takes only fixes for bugs found in UAT.

**Sign-off:** ✅ Claude (QA) · ⏳ Teja (PO, at UAT)
