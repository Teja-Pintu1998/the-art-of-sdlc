// Rank rules (AOS-5.3, FR-6): Intern → Junior (25%) → Mid-level (50%) → Senior (100%) of the
// *available* stations, rounded up. With 14 stations at launch: 4 / 7 / 14.

export type RankId = "intern" | "junior" | "mid" | "senior";

export type Rank = {
  id: RankId;
  name: string;
  /** Share of available stations needed, before rounding up */
  share: number;
  /** Command tagline shown in the rank-up celebration */
  command: string | null;
};

export const RANKS: readonly Rank[] = [
  { id: "intern", name: "Intern", share: 0, command: null },
  { id: "junior", name: "Junior", share: 0.25, command: "git checkout -b junior" },
  { id: "mid", name: "Mid-level", share: 0.5, command: "docker build -t you:mid ." },
  { id: "senior", name: "Senior", share: 1, command: 'git commit -m "became senior"' },
];

export const rankById = (id: RankId): Rank => RANKS.find((r) => r.id === id)!;
export const rankIndex = (id: RankId): number => RANKS.findIndex((r) => r.id === id);

/** Completed stations needed for a rank. */
export const rankThreshold = (rank: Rank, total: number): number => Math.ceil(rank.share * total);

/** The highest rank earned with `done` of `total` available stations completed. */
export function rankFor(done: number, total: number): Rank {
  if (total <= 0) return RANKS[0]!;
  let earned = RANKS[0]!;
  for (const rank of RANKS) if (done >= rankThreshold(rank, total)) earned = rank;
  return earned;
}

/** The next rank to earn and how many more stations it needs, or null at Senior. */
export function nextRank(current: RankId, done: number, total: number) {
  const next = RANKS[rankIndex(current) + 1];
  if (!next) return null;
  return { rank: next, remaining: Math.max(0, rankThreshold(next, total) - done) };
}
