import { describe, expect, it } from "vitest";

import {
  arrowDelta,
  cardPlacement,
  isTap,
  nearestStation,
  recommendedNext,
  SNAP_RADIUS,
  stepStation,
} from "@/lib/map/navigation";

const stations = [
  { id: 1, x: 0, y: 0 },
  { id: 2, x: 300, y: 0 },
  { id: 3, x: 600, y: 0 },
];

describe("nearestStation", () => {
  it("snaps to the closest station within the snap radius", () => {
    expect(nearestStation(stations, 280, 30)).toBe(2);
    expect(nearestStation(stations, 20, -40)).toBe(1);
  });

  it("returns null when dropped in empty space", () => {
    expect(nearestStation(stations, 150, 400)).toBeNull();
    expect(nearestStation(stations, 0, SNAP_RADIUS + 1)).toBeNull();
  });

  it("accepts a drop exactly on the radius", () => {
    expect(nearestStation(stations, 0, SNAP_RADIUS)).toBe(1);
  });
});

describe("keyboard steps", () => {
  it("maps arrow keys to forward and back", () => {
    expect(arrowDelta("ArrowRight")).toBe(1);
    expect(arrowDelta("ArrowDown")).toBe(1);
    expect(arrowDelta("ArrowLeft")).toBe(-1);
    expect(arrowDelta("ArrowUp")).toBe(-1);
    expect(arrowDelta("Enter")).toBe(0);
  });

  it("clamps steps to the first and last station", () => {
    expect(stepStation(1, -1, 42)).toBe(1);
    expect(stepStation(42, 1, 42)).toBe(42);
    expect(stepStation(10, 1, 42)).toBe(11);
  });
});

describe("recommendedNext", () => {
  it("is the first uncompleted available station in path order", () => {
    expect(recommendedNext([4, 1, 2], [])).toBe(1);
    expect(recommendedNext([1, 2, 4], [1, 2])).toBe(4);
  });

  it("is null when everything is complete", () => {
    expect(recommendedNext([1, 2], [2, 1])).toBeNull();
    expect(recommendedNext([], [])).toBeNull();
  });
});

describe("cardPlacement", () => {
  const card = { w: 280, h: 160 };
  const viewport = { w: 1440, h: 900 };

  it("goes to the right of the planet when there's room", () => {
    const box = cardPlacement({ x: 400, y: 450 }, 40, card, viewport);
    expect(box).toMatchObject({ x: 456, y: 370, side: "right" });
  });

  it("goes to the left near the right edge", () => {
    const box = cardPlacement({ x: 1300, y: 450 }, 40, card, viewport);
    expect(box.side).toBe("left");
    expect(box.x + box.w).toBeLessThanOrEqual(1300 - 40);
  });

  it("stays on screen vertically", () => {
    expect(cardPlacement({ x: 400, y: 10 }, 40, card, viewport).y).toBe(8);
    expect(cardPlacement({ x: 400, y: 899 }, 40, card, viewport).y).toBe(900 - 160 - 8);
  });

  it("never goes above minY (the bottom of the landing hero)", () => {
    expect(cardPlacement({ x: 400, y: 100 }, 40, card, viewport, 180).y).toBe(188);
    const phone = { w: 375, h: 700 };
    expect(cardPlacement({ x: 180, y: 600 }, 30, card, phone, 500).y).toBeGreaterThanOrEqual(508);
  });

  it("goes below (or above) the planet on narrow screens, never covering it", () => {
    const phone = { w: 375, h: 700 };
    const below = cardPlacement({ x: 180, y: 200 }, 30, card, phone);
    expect(below.side).toBe("below");
    expect(below.y).toBeGreaterThanOrEqual(200 + 30);
    expect(below.x).toBeGreaterThanOrEqual(8);
    expect(below.x + below.w).toBeLessThanOrEqual(375 - 8);

    const above = cardPlacement({ x: 180, y: 600 }, 30, card, phone);
    expect(above.y + above.h).toBeLessThanOrEqual(600 - 30);
  });
});

describe("isTap", () => {
  it("treats tiny movements as a tap and larger ones as a drag", () => {
    expect(isTap({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(true);
    expect(isTap({ x: 0, y: 0 }, { x: 6, y: 0 })).toBe(false);
  });
});
