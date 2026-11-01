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
  /** One-line summary shown on the preview card */
  summary: string;
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

// [slug, name, summary] per phase, in path order. Ids are assigned sequentially (1–42).
const STATIONS_BY_PHASE: readonly (readonly [string, string, string])[][] = [
  [
    [
      "problem-statement",
      "Problem statement / business case",
      "Agree on the problem, who has it and why it's worth solving before anyone writes code.",
    ],
    [
      "prd",
      "PRD creation and PRD review",
      "Turn the idea into requirements everyone can review, challenge and sign off.",
    ],
    [
      "technical-feasibility",
      "Technical feasibility / spike",
      "Build a throwaway prototype to answer the riskiest technical question early.",
    ],
    [
      "epics-and-stories",
      "Epics, user stories and acceptance criteria",
      "Slice the product into user stories with testable acceptance criteria.",
    ],
    [
      "estimation-and-grooming",
      "Estimation and backlog grooming",
      "Size the work in story points and keep the backlog ready for the next sprint.",
    ],
    [
      "sprint-planning",
      "Sprint planning",
      "Commit to a sprint goal and the stories the team can actually finish.",
    ],
  ],
  [
    [
      "ux-design",
      "UX design and design review",
      "Design the screens and flows, then review them before they're built.",
    ],
    [
      "technical-design",
      "Technical design / architecture review",
      "Choose the architecture and record the big decisions as ADRs.",
    ],
    [
      "security-review",
      "Security and privacy review",
      "Find the security and privacy risks while they're still cheap to fix.",
    ],
  ],
  [
    [
      "git",
      "Git and version control",
      "Track every change, branch safely and keep main always releasable.",
    ],
    [
      "feature-flags",
      "Development with feature flags",
      "Ship code dark and switch features on without a redeploy.",
    ],
    [
      "unit-tests",
      "Unit tests and local testing",
      "Prove each piece works on its own, fast, before it ever reaches CI.",
    ],
    [
      "code-quality",
      "Code quality (ESLint, Prettier, Husky, lint-staged)",
      "Let linters, formatters and pre-commit hooks catch problems automatically.",
    ],
    [
      "pull-requests",
      "Pull request and code review",
      "Get a second pair of eyes on every change before it merges.",
    ],
  ],
  [
    [
      "ci-pipeline",
      "CI pipeline",
      "Every push is installed, linted, built and tested automatically.",
    ],
    [
      "static-analysis",
      "Static analysis and security scans",
      "Scan code and dependencies for vulnerabilities on every change.",
    ],
    [
      "docker",
      "Docker image build",
      "Package the app into an image that runs the same everywhere.",
    ],
    [
      "artifact-registry",
      "Image tagging and artifact registry",
      "Tag every image with version and commit so any build can be traced and redeployed.",
    ],
  ],
  [
    [
      "environments",
      "Environments (Dev → QA → Stage → Prod)",
      "Promote the same build through Dev, QA, Stage and Prod.",
    ],
    ["qa-testing", "QA testing", "Test features end to end, and make sure old ones still work."],
    [
      "performance-and-accessibility",
      "Performance and accessibility testing",
      "Check it's fast for everyone and usable by everyone.",
    ],
    ["uat", "UAT", "Real users confirm the product does what the business needed."],
    [
      "pre-prod-testing",
      "Pre-prod testing",
      "A final check in a production-like environment before release.",
    ],
    [
      "stakeholder-demo",
      "Stakeholder demo and sign-off",
      "Show the work to stakeholders and get their sign-off.",
    ],
  ],
  [
    [
      "release-notes",
      "Release notes, runbook and rollback plan",
      "Write down what's shipping, how to run it and how to undo it.",
    ],
    [
      "change-request",
      "CR (Change Request) and CAB approval",
      "Get formal approval to change production from the change board.",
    ],
    ["go-no-go", "Go/No-Go meeting", "The last meeting where the team decides: ship it or hold."],
  ],
  [
    [
      "production-deployment",
      "Production deployment",
      "Deploy to production automatically, across regions.",
    ],
    ["canary", "Canary deployment", "Release to a small slice of traffic first and watch closely."],
    [
      "smoke-testing",
      "Smoke testing / post-deploy verification",
      "Run quick checks right after deploying to confirm the basics work.",
    ],
    [
      "progressive-rollout",
      "Progressive rollout",
      "Widen the release step by step while the metrics stay healthy.",
    ],
    [
      "full-rollout",
      "Full rollout",
      "Send all traffic to the new version once it has proven itself.",
    ],
    ["rollback", "Rollback strategy", "Have a fast, rehearsed way back to the last good version."],
  ],
  [
    [
      "logs-and-apm",
      "Logs and APM (New Relic)",
      "See what the app is doing in production, request by request.",
    ],
    [
      "dashboards-as-code",
      "Dashboards as code",
      "Define monitoring dashboards in code so they're reviewed and versioned.",
    ],
    [
      "user-analytics",
      "User behaviour analytics",
      "Learn how real users actually move through the product.",
    ],
    [
      "alerts-and-on-call",
      "Alerts and on-call",
      "Get paged when something breaks, before users tell you.",
    ],
    [
      "incident-management",
      "Incident management and postmortem",
      "Fix the outage, then learn from it without blame.",
    ],
  ],
  [
    [
      "documentation",
      "Documentation",
      "Leave docs that let the next engineer run and change the system.",
    ],
    [
      "success-metrics",
      "Success metrics review",
      "Check whether the release moved the numbers it was meant to.",
    ],
    [
      "sprint-review-and-retro",
      "Sprint review and retrospective",
      "Demo what was done, then improve how the team works.",
    ],
    ["close-out", "Close-out and handoff", "Hand the product over cleanly and close the project."],
  ],
];

export const STATIONS: readonly Station[] = STATIONS_BY_PHASE.flatMap((list, p) =>
  list.map(([slug, name, summary]) => ({ slug, name, summary, phase: p + 1 })),
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
