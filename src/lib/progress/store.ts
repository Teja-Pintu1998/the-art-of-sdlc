// Progress store (AOS-5): Zustand, persisted to localStorage with a versioned schema
// (docs/08-tech-design.md: { version, completed, lastStation, highestRank, onboardingSeen }).
// Stations are stored by slug, so progress survives stations being renumbered.
// Unknown versions and malformed data reset safely to a fresh start.

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { rankFor, type RankId, rankIndex, RANKS } from "./ranks";

import { PROGRESS_KEY, PROGRESS_VERSION } from "./storage";

export { onboardedScript, PROGRESS_KEY, PROGRESS_VERSION } from "./storage";

export type ProgressData = {
  completed: string[];
  lastStation: string | null;
  /** The best rank reached. A rank is never lost, even if a station is un-completed. */
  highestRank: RankId;
  onboardingSeen: boolean;
};

type ProgressActions = {
  /**
   * Marks a station complete. `available` is the list of available station slugs (ranks are a share
   * of them). Returns the new rank if this completion earned one, otherwise null.
   */
  complete: (slug: string, available: readonly string[]) => RankId | null;
  uncomplete: (slug: string) => void;
  visit: (slug: string) => void;
  reset: () => void;
  finishOnboarding: () => void;
};

export const INITIAL_PROGRESS: ProgressData = {
  completed: [],
  lastStation: null,
  highestRank: "intern",
  onboardingSeen: false,
};

const isRankId = (v: unknown): v is RankId => RANKS.some((r) => r.id === v);

/** Keeps only well-formed fields from stored data; anything else falls back to the default. */
export function sanitizeProgress(raw: unknown): ProgressData {
  if (typeof raw !== "object" || raw === null) return { ...INITIAL_PROGRESS };
  const r = raw as Record<string, unknown>;
  const completed = Array.isArray(r.completed)
    ? [...new Set(r.completed.filter((s): s is string => typeof s === "string"))]
    : [];
  return {
    completed,
    lastStation: typeof r.lastStation === "string" ? r.lastStation : null,
    highestRank: isRankId(r.highestRank) ? r.highestRank : "intern",
    onboardingSeen: r.onboardingSeen === true,
  };
}

export const useProgress = create<ProgressData & ProgressActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_PROGRESS,
      complete: (slug, available) => {
        const { completed, highestRank } = get();
        if (completed.includes(slug)) return null;
        const next = [...completed, slug];
        const done = next.filter((s) => available.includes(s)).length;
        const earned = rankFor(done, available.length).id;
        const rankUp = rankIndex(earned) > rankIndex(highestRank);
        set({ completed: next, highestRank: rankUp ? earned : highestRank });
        return rankUp ? earned : null;
      },
      uncomplete: (slug) => set({ completed: get().completed.filter((s) => s !== slug) }),
      visit: (slug) => set({ lastStation: slug }),
      // Progress only: someone who has seen the intro doesn't need it again after a reset.
      reset: () => set({ ...INITIAL_PROGRESS, onboardingSeen: get().onboardingSeen }),
      finishOnboarding: () => set({ onboardingSeen: true }),
    }),
    {
      name: PROGRESS_KEY,
      version: PROGRESS_VERSION,
      storage: createJSONStorage(() => localStorage),
      // Hydrated on the client after mount (see hydrateProgress) so server and first client render match.
      skipHydration: true,
      partialize: ({ completed, lastStation, highestRank, onboardingSeen }) => ({
        completed,
        lastStation,
        highestRank,
        onboardingSeen,
      }),
      // A schema we don't know (older or newer): start fresh rather than misread it.
      migrate: () => ({ ...INITIAL_PROGRESS }),
      merge: (persisted, current) => ({ ...current, ...sanitizeProgress(persisted) }),
    },
  ),
);

/**
 * Loads saved progress once. localStorage is synchronous, so the state is ready when this returns.
 * Storage can be blocked (private mode, strict settings): then progress simply isn't saved.
 */
export function hydrateProgress() {
  if (useProgress.persist.hasHydrated()) return;
  try {
    void useProgress.persist.rehydrate();
  } catch {
    // No storage: keep the in-memory default.
  }
}
