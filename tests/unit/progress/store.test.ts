import { beforeEach, describe, expect, it } from "vitest";

import {
  hydrateProgress,
  INITIAL_PROGRESS,
  PROGRESS_KEY,
  sanitizeProgress,
  useProgress,
} from "@/lib/progress/store";

const AVAILABLE = ["a", "b", "c", "d", "e", "f", "g", "h"]; // Junior at 2, Mid at 4, Senior at 8
const state = () => useProgress.getState();
const saved = () => JSON.parse(localStorage.getItem(PROGRESS_KEY)!);

beforeEach(() => {
  localStorage.clear();
  useProgress.setState({ ...INITIAL_PROGRESS });
});

describe("progress store (AOS-5)", () => {
  it("marks stations complete once and reports rank-ups", () => {
    expect(state().complete("a", AVAILABLE)).toBeNull();
    expect(state().complete("a", AVAILABLE)).toBeNull();
    expect(state().complete("b", AVAILABLE)).toBe("junior");
    expect(state().completed).toEqual(["a", "b"]);
    expect(state().highestRank).toBe("junior");
  });

  it("only counts available stations towards ranks", () => {
    state().complete("locked-1", AVAILABLE);
    expect(state().complete("a", AVAILABLE)).toBeNull();
  });

  it("never takes a rank away", () => {
    state().complete("a", AVAILABLE);
    state().complete("b", AVAILABLE);
    state().uncomplete("b");
    expect(state().completed).toEqual(["a"]);
    expect(state().highestRank).toBe("junior");
    // Re-completing doesn't celebrate Junior again.
    expect(state().complete("b", AVAILABLE)).toBeNull();
  });

  it("saves to localStorage with a version, and reset clears everything", () => {
    state().complete("a", AVAILABLE);
    state().visit("a");
    expect(saved()).toMatchObject({ version: 1, state: { completed: ["a"], lastStation: "a" } });
    state().finishOnboarding();
    state().reset();
    expect(state()).toMatchObject({ ...INITIAL_PROGRESS, onboardingSeen: true });
    expect(saved().state).toEqual({ ...INITIAL_PROGRESS, onboardingSeen: true });
  });
});

describe("loading saved progress", () => {
  it("restores progress synchronously", async () => {
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({
        version: 1,
        state: { ...INITIAL_PROGRESS, completed: ["a"], lastStation: "c" },
      }),
    );
    await useProgress.persist.rehydrate();
    expect(state().completed).toEqual(["a"]);
    expect(state().lastStation).toBe("c");
    hydrateProgress(); // already hydrated: no-op
    expect(state().lastStation).toBe("c");
  });

  it("starts fresh for an unknown schema version", async () => {
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({ version: 99, state: { completed: ["a"] } }),
    );
    await useProgress.persist.rehydrate();
    expect(state().completed).toEqual([]);
  });

  it("drops malformed fields", () => {
    expect(sanitizeProgress(null)).toEqual(INITIAL_PROGRESS);
    expect(
      sanitizeProgress({
        completed: ["a", 3, "a"],
        lastStation: 5,
        highestRank: "boss",
        onboardingSeen: "yes",
      }),
    ).toEqual({ ...INITIAL_PROGRESS, completed: ["a"] });
    expect(sanitizeProgress({ completed: "a", highestRank: "mid", onboardingSeen: true })).toEqual({
      ...INITIAL_PROGRESS,
      highestRank: "mid",
      onboardingSeen: true,
    });
  });
});
