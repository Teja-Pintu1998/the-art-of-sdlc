import { describe, expect, it } from "vitest";

import { nextRank, rankFor, rankThreshold, RANKS } from "@/lib/progress/ranks";

describe("ranks (AOS-5.3)", () => {
  it("needs 4 / 7 / 14 of the 14 launch stations (25% / 50% / 100%, rounded up)", () => {
    expect(RANKS.map((r) => rankThreshold(r, 14))).toEqual([0, 4, 7, 14]);
    expect(RANKS.map((r) => rankThreshold(r, 42))).toEqual([0, 11, 21, 42]);
  });

  it("gives the highest rank earned", () => {
    expect(rankFor(0, 14).id).toBe("intern");
    expect(rankFor(3, 14).id).toBe("intern");
    expect(rankFor(4, 14).id).toBe("junior");
    expect(rankFor(7, 14).id).toBe("mid");
    expect(rankFor(13, 14).id).toBe("mid");
    expect(rankFor(14, 14).id).toBe("senior");
    expect(rankFor(5, 0).id).toBe("intern");
  });

  it("says what the next rank needs", () => {
    expect(nextRank("intern", 1, 14)).toMatchObject({ rank: { id: "junior" }, remaining: 3 });
    // A kept rank with fewer stations now completed still points to the next one.
    expect(nextRank("mid", 2, 14)).toMatchObject({ rank: { id: "senior" }, remaining: 12 });
    expect(nextRank("senior", 14, 14)).toBeNull();
  });
});
