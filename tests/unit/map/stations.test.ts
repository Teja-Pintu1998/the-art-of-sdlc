import { describe, expect, it } from "vitest";

import { PHASES, phaseOf, STATIONS, stationById, V1_STATION_IDS } from "@/lib/map/stations";

describe("station manifest", () => {
  it("has 9 phases and 42 stations numbered 1–42 in order", () => {
    expect(PHASES).toHaveLength(9);
    expect(STATIONS).toHaveLength(42);
    expect(STATIONS.map((s) => s.id)).toEqual(Array.from({ length: 42 }, (_, i) => i + 1));
  });

  it("matches the station count per phase from the README", () => {
    const counts = PHASES.map((p) => STATIONS.filter((s) => s.phase === p.id).length);
    expect(counts).toEqual([6, 3, 5, 4, 6, 3, 6, 5, 4]);
  });

  it("keeps phases in order along the path", () => {
    const phases = STATIONS.map((s) => s.phase);
    expect(phases).toEqual([...phases].sort((a, b) => a - b));
  });

  it("has unique, URL-safe slugs", () => {
    const slugs = STATIONS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(42);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("lists the 14 v1 stations from the PRD", () => {
    expect(V1_STATION_IDS).toEqual([1, 2, 3, 4, 7, 10, 13, 14, 15, 17, 26, 27, 29, 34]);
  });

  it("looks up stations and their phase", () => {
    const git = stationById(10);
    expect(git?.slug).toBe("git");
    expect(git && phaseOf(git).name).toBe("Development");
    expect(stationById(43)).toBeUndefined();
  });

  it("throws for a station with an unknown phase", () => {
    expect(() => phaseOf({ id: 99, slug: "x", name: "x", summary: "x", phase: 10 })).toThrow(
      /unknown phase/,
    );
  });
});
