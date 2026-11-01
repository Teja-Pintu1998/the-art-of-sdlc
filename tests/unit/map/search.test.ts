import { describe, expect, it } from "vitest";

import { MAX_RESULTS, searchStations } from "@/lib/map/search";
import { STATIONS, V1_STATION_IDS } from "@/lib/map/stations";

const names = (q: string) => searchStations(q, V1_STATION_IDS).map((s) => s.name);
const idOf = (slug: string) => STATIONS.find((s) => s.slug === slug)!.id;

describe("searchStations (AOS-6.2)", () => {
  it('finds "canary" first', () => {
    expect(searchStations("canary", V1_STATION_IDS)[0]!.id).toBe(idOf("canary"));
    expect(searchStations("CANARY", V1_STATION_IDS)[0]!.id).toBe(idOf("canary"));
  });

  it("ranks name matches above summary and phase matches", () => {
    const results = names("prd");
    expect(results[0]).toBe("PRD creation and PRD review");
  });

  it("needs every word to match, in any field", () => {
    expect(names("pull review").length).toBeGreaterThan(0);
    expect(names("pull zebra")).toEqual([]);
  });

  it("orders equal matches by station number, available ones first", () => {
    // Every station in phase "Release Governance" matches the phase name equally (score 3).
    const ids = searchStations("release governance", []).map((s) => s.id);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
    const withAvailable = searchStations("release governance", [27]).map((s) => s.id);
    expect(withAvailable.indexOf(27)).toBeLessThan(
      withAvailable.indexOf(ids.find((i) => i !== 27)!),
    );
  });

  it("finds a station by its number", () => {
    expect(searchStations("29", V1_STATION_IDS).map((s) => s.id)).toEqual([29]);
    expect(searchStations("99", V1_STATION_IDS)).toEqual([]);
  });

  it("lists available stations for an empty query, up to the limit", () => {
    const list = searchStations("  ", V1_STATION_IDS);
    expect(list).toHaveLength(MAX_RESULTS);
    expect(list.every((s) => V1_STATION_IDS.includes(s.id))).toBe(true);
  });
});
