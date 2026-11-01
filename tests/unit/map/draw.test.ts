import { describe, expect, it, vi } from "vitest";

import {
  type Ctx2D,
  drawMiniMap,
  drawStars,
  makeStars,
  miniMapToWorld,
  PARALLAX,
  seededRandom,
  STAR_FIELD,
  TWINKLE_GROUPS,
} from "@/lib/map/draw";
import { WORLD } from "@/lib/map/layout";

function fakeCtx() {
  const alphas: number[] = [];
  const ctx = {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(() => alphas.push(ctx.globalAlpha)),
    strokeRect: vi.fn(),
    fillStyle: "",
    strokeStyle: "",
    globalAlpha: 1,
    lineWidth: 1,
  };
  return { ctx: ctx as typeof ctx & Ctx2D, alphas };
}

describe("seeded stars", () => {
  it("is deterministic for a seed and stays in [0, 1)", () => {
    const a = seededRandom(7);
    const b = seededRandom(7);
    const values = Array.from({ length: 100 }, () => a());
    expect(values).toEqual(Array.from({ length: 100 }, () => b()));
    for (const v of values) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
    expect(seededRandom(8)()).not.toBe(seededRandom(7)());
  });

  it("makes the same starfield every time, inside the star field", () => {
    const stars = makeStars(50);
    expect(stars).toEqual(makeStars(50));
    for (const s of stars) {
      expect(s.x).toBeLessThan(STAR_FIELD.w);
      expect(s.y).toBeLessThan(STAR_FIELD.h);
      expect(s.r).toBeGreaterThan(0.29);
      expect(s.group).toBeGreaterThanOrEqual(0);
      expect(s.group).toBeLessThan(TWINKLE_GROUPS);
    }
  });
});

describe("drawStars", () => {
  const stars = [{ x: 10, y: 20, r: 1, group: 0 }];
  const size = { w: 100, h: 100 };
  const view = { x: 200, y: -400, s: 1 };

  it("twinkles and moves with the map when motion is allowed", () => {
    const { ctx, alphas } = fakeCtx();
    drawStars(ctx, stars, size, { time: 0, view, motion: true });
    drawStars(ctx, stars, size, { time: 700, view, motion: true });
    // One fill per twinkle group (not per star); group 0's brightness changes over time.
    expect(ctx.fill).toHaveBeenCalledTimes(2 * TWINKLE_GROUPS);
    expect(alphas[0]).not.toBe(alphas[TWINKLE_GROUPS]);
    // parallax offset, wrapped into the canvas
    expect(ctx.arc).toHaveBeenCalledWith(
      (10 + 200 * PARALLAX) % 100,
      (((20 - 400 * PARALLAX) % 100) + 100) % 100,
      1,
      0,
      Math.PI * 2,
    );
    expect(ctx.globalAlpha).toBe(1);
  });

  it("is completely still with reduced motion", () => {
    const { ctx, alphas } = fakeCtx();
    drawStars(ctx, stars, size, { time: 0, view, motion: false });
    drawStars(ctx, stars, size, { time: 700, view: { x: 0, y: 0, s: 1 }, motion: false });
    expect(new Set(alphas)).toEqual(new Set([0.7]));
    expect(ctx.arc).toHaveBeenNthCalledWith(1, 10, 20, 1, 0, Math.PI * 2);
    expect(ctx.arc).toHaveBeenNthCalledWith(2, 10, 20, 1, 0, Math.PI * 2);
  });
});

describe("mini-map", () => {
  const mini = { w: 240, h: 82 };

  it("draws every station, dims locked ones, and outlines the viewport", () => {
    const { ctx, alphas } = fakeCtx();
    drawMiniMap(
      ctx,
      mini,
      [
        { x: 0, y: 0, color: "#f00", locked: false },
        { x: 7000, y: 2400, color: "#0f0", locked: true },
      ],
      { x: 0, y: 0, s: 0.5 },
      { w: 1400, h: 600 },
    );
    expect(ctx.fill).toHaveBeenCalledTimes(2);
    expect(alphas).toEqual([1, 0.4]);
    const k = mini.w / WORLD.w;
    expect(ctx.strokeRect).toHaveBeenCalledWith(0, 0, 2800 * k, 1200 * k);
  });

  it("converts a click into world coordinates", () => {
    expect(miniMapToWorld(120, 41, mini)).toEqual({ x: WORLD.w / 2, y: WORLD.h / 2 });
    expect(miniMapToWorld(0, 0, mini)).toEqual({ x: 0, y: 0 });
  });
});

describe("drawStars batching", () => {
  it("draws each star as its own circle inside its group's single fill", () => {
    const { ctx } = fakeCtx();
    const stars = [
      { x: 10, y: 10, r: 1, group: 2 },
      { x: 50, y: 50, r: 2, group: 2 },
    ];
    drawStars(
      ctx,
      stars,
      { w: 100, h: 100 },
      { time: 0, view: { x: 0, y: 0, s: 1 }, motion: false },
    );
    expect(ctx.moveTo).toHaveBeenNthCalledWith(1, 11, 10);
    expect(ctx.moveTo).toHaveBeenNthCalledWith(2, 52, 50);
    expect(ctx.arc).toHaveBeenCalledTimes(2);
    expect(ctx.fill).toHaveBeenCalledTimes(TWINKLE_GROUPS);
  });
});
