import { afterEach, describe, expect, it, vi } from "vitest";

import { track } from "@/lib/analytics/track";

afterEach(() => {
  delete window.newrelic;
});

describe("track (analytics helper)", () => {
  it("sends a New Relic page action when the agent is loaded", () => {
    const addPageAction = vi.fn();
    window.newrelic = { addPageAction };
    track({ name: "feedback_given", station: 1, helpful: true });
    expect(addPageAction).toHaveBeenCalledWith("feedback_given", { station: 1, helpful: true });
  });

  it("does nothing without the agent, and never throws", () => {
    expect(() => track({ name: "phase1_completed" })).not.toThrow();
    window.newrelic = {
      addPageAction: () => {
        throw new Error("blocked");
      },
    };
    expect(() => track({ name: "rank_reached", rank: "junior" })).not.toThrow();
  });
});
