// Station manifest: the single source of truth for all 9 phases and 42 stations (docs/08-tech-design.md §4).
// MDX content (AOS-6) references these ids; the build check fails if they don't match.

export type Phase = {
  /** 1-based phase number */
  id: number;
  name: string;
  /** Neon phase colour (docs/07-ux-design.md) */
  color: string;
};

export type Station = {
  /** 1-based station number, also its order on the path */
  id: number;
  slug: string;
  name: string;
  /** Phase id this station belongs to */
  phase: number;
};

export const PHASES: readonly Phase[] = [
  { id: 1, name: "Discovery and Planning", color: "#8b5cf6" },
  { id: 2, name: "Design", color: "#ec4899" },
  { id: 3, name: "Development", color: "#3b82f6" },
  { id: 4, name: "Continuous Integration", color: "#06b6d4" },
  { id: 5, name: "Testing and Environments", color: "#10b981" },
  { id: 6, name: "Release Governance", color: "#eab308" },
  { id: 7, name: "Deployment", color: "#f97316" },
  { id: 8, name: "Monitoring and Observability", color: "#ef4444" },
  { id: 9, name: "Closure", color: "#94a3b8" },
];

// [slug, name] per phase, in path order. Ids are assigned sequentially (1–42).
const STATIONS_BY_PHASE: readonly (readonly [string, string])[][] = [
  [
    ["problem-statement", "Problem statement / business case"],
    ["prd", "PRD creation and PRD review"],
    ["technical-feasibility", "Technical feasibility / spike"],
    ["epics-and-stories", "Epics, user stories and acceptance criteria"],
    ["estimation-and-grooming", "Estimation and backlog grooming"],
    ["sprint-planning", "Sprint planning"],
  ],
  [
    ["ux-design", "UX design and design review"],
    ["technical-design", "Technical design / architecture review"],
    ["security-review", "Security and privacy review"],
  ],
  [
    ["git", "Git and version control"],
    ["feature-flags", "Development with feature flags"],
    ["unit-tests", "Unit tests and local testing"],
    ["code-quality", "Code quality (ESLint, Prettier, Husky, lint-staged)"],
    ["pull-requests", "Pull request and code review"],
  ],
  [
    ["ci-pipeline", "CI pipeline"],
    ["static-analysis", "Static analysis and security scans"],
    ["docker", "Docker image build"],
    ["artifact-registry", "Image tagging and artifact registry"],
  ],
  [
    ["environments", "Environments (Dev → QA → Stage → Prod)"],
    ["qa-testing", "QA testing"],
    ["performance-and-accessibility", "Performance and accessibility testing"],
    ["uat", "UAT"],
    ["pre-prod-testing", "Pre-prod testing"],
    ["stakeholder-demo", "Stakeholder demo and sign-off"],
  ],
  [
    ["release-notes", "Release notes, runbook and rollback plan"],
    ["change-request", "CR (Change Request) and CAB approval"],
    ["go-no-go", "Go/No-Go meeting"],
  ],
  [
    ["production-deployment", "Production deployment"],
    ["canary", "Canary deployment"],
    ["smoke-testing", "Smoke testing / post-deploy verification"],
    ["progressive-rollout", "Progressive rollout"],
    ["full-rollout", "Full rollout"],
    ["rollback", "Rollback strategy"],
  ],
  [
    ["logs-and-apm", "Logs and APM (New Relic)"],
    ["dashboards-as-code", "Dashboards as code"],
    ["user-analytics", "User behaviour analytics"],
    ["alerts-and-on-call", "Alerts and on-call"],
    ["incident-management", "Incident management and postmortem"],
  ],
  [
    ["documentation", "Documentation"],
    ["success-metrics", "Success metrics review"],
    ["sprint-review-and-retro", "Sprint review and retrospective"],
    ["close-out", "Close-out and handoff"],
  ],
];

export const STATIONS: readonly Station[] = STATIONS_BY_PHASE.flatMap((list, p) =>
  list.map(([slug, name]) => ({ slug, name, phase: p + 1 })),
).map((s, i) => ({ id: i + 1, ...s }));

/**
 * Stations written for v1 (docs/02-prd.md). Until content loading lands (AOS-6), these are the
 * "available" stations; every other station is locked ("Coming soon").
 */
export const V1_STATION_IDS: readonly number[] = [
  1, 2, 3, 4, 7, 10, 13, 14, 15, 17, 26, 27, 29, 34,
];

export function phaseOf(station: Station): Phase {
  const phase = PHASES[station.phase - 1];
  if (!phase) throw new Error(`Station ${station.id} has unknown phase ${station.phase}`);
  return phase;
}

export function stationById(id: number): Station | undefined {
  return STATIONS[id - 1];
}
