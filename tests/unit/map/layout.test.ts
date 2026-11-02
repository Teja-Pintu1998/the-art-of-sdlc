import { describe, expect, it } from "vitest";

import {
  allBounds,
  centerOn,
  clampScale,
  fitBounds,
  MAX_SCALE,
  MIN_PLANET_R,
  MIN_SCALE,
  panBy,
  pathD,
  phaseBounds,
  PLACED_STATIONS,
  planetScale,
  rectsOverlap,
  SECTOR_FONT_PX,
  SECTOR_MAX_PX,
  SECTOR_MIN_PX,
  SECTORS,
  sectorScale,
  sectorScreenRect,
  toScreen,
  toWorld,
  visibleWorldRect,
  WORLD,
  zoomAt,
} from "@/lib/map/layout";

const viewport = { w: 1440, h: 900 };

describe("world layout", () => {
  it("places all 42 stations inside the world, left to right", () => {
    expect(PLACED_STATIONS).toHaveLength(42);
    for (const s of PLACED_STATIONS) {
      expect(s.x - s.r).toBeGreaterThanOrEqual(0);
      expect(s.x + s.r).toBeLessThanOrEqual(WORLD.w);
      expect(s.y - s.r).toBeGreaterThanOrEqual(0);
      expect(s.y + s.r).toBeLessThanOrEqual(WORLD.h);
    }
    const xs = PLACED_STATIONS.map((s) => s.x);
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
  });

  it("has one sector title per phase, alternating above and below the path", () => {
    expect(SECTORS).toHaveLength(9);
    SECTORS.forEach((sec, i) => {
      expect(sec.y < WORLD.h / 2).toBe(i % 2 === 0);
    });
  });
});

describe("view math", () => {
  it("clamps the scale", () => {
    expect(clampScale(0.01)).toBe(MIN_SCALE);
    expect(clampScale(10)).toBe(MAX_SCALE);
    expect(clampScale(1)).toBe(1);
  });

  it("converts between world and screen coordinates", () => {
    const v = { x: 100, y: -50, s: 0.5 };
    const p = toScreen(v, 400, 300);
    expect(p).toEqual({ x: 300, y: 100 });
    expect(toWorld(v, p.x, p.y)).toEqual({ x: 400, y: 300 });
  });

  it("zooms around a fixed screen point", () => {
    const v = { x: 10, y: 20, s: 1 };
    const before = toWorld(v, 500, 400);
    const z = zoomAt(v, 2, 500, 400);
    expect(z.s).toBe(2);
    const after = toWorld(z, 500, 400);
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
  });

  it("never zooms beyond the scale limits", () => {
    expect(zoomAt({ x: 0, y: 0, s: 1 }, 100, 0, 0).s).toBe(MAX_SCALE);
    expect(zoomAt({ x: 0, y: 0, s: 1 }, 0.001, 0, 0).s).toBe(MIN_SCALE);
  });

  it("pans by a screen delta", () => {
    expect(panBy({ x: 1, y: 2, s: 3 }, 10, -5)).toEqual({ x: 11, y: -3, s: 3 });
  });

  it("centres a world point in the viewport", () => {
    const v = centerOn(1000, 500, 0.5, viewport);
    expect(toScreen(v, 1000, 500)).toEqual({ x: 720, y: 450 });
  });

  it("reports the visible part of the world", () => {
    const r = visibleWorldRect({ x: -200, y: -100, s: 2 }, viewport);
    expect(r).toEqual({ x: 100, y: 50, w: 720, h: 450 });
  });
});

describe("opening view (fit a phase)", () => {
  it("throws for an unknown phase", () => {
    expect(() => phaseBounds(10)).toThrow(/Unknown phase/);
  });

  it.each([1, 5, 9])("fits every planet of phase %i on screen, below the hero", (phase) => {
    const top = 160;
    const v = fitBounds(phaseBounds(phase), viewport, { top });
    for (const s of PLACED_STATIONS.filter((st) => st.phase === phase)) {
      const p = toScreen(v, s.x, s.y);
      const r = s.r * planetScale(s.r, v.s);
      expect(p.x - r).toBeGreaterThanOrEqual(0);
      expect(p.x + r).toBeLessThanOrEqual(viewport.w);
      expect(p.y - r).toBeGreaterThanOrEqual(top);
      expect(p.y + r).toBeLessThanOrEqual(viewport.h);
    }
  });

  it("never zooms in past 1× and copes with a tiny viewport", () => {
    expect(fitBounds({ x: 0, y: 0, w: 10, h: 10 }, viewport).s).toBe(1);
    expect(fitBounds(phaseBounds(1), { w: 0, h: 0 }).s).toBe(MIN_SCALE);
  });
});

describe("semantic zoom", () => {
  it("keeps planets at least MIN_PLANET_R on screen at every zoom", () => {
    for (const s of [MIN_SCALE, 0.2, 0.5, 1, MAX_SCALE]) {
      for (const st of PLACED_STATIONS) {
        expect(st.r * planetScale(st.r, s)).toBeGreaterThanOrEqual(MIN_PLANET_R - 1e-9);
      }
    }
    expect(planetScale(40, 2)).toBe(2);
  });

  it("clamps sector titles between their min and max on-screen size", () => {
    expect(SECTOR_FONT_PX * sectorScale(MIN_SCALE)).toBe(SECTOR_MIN_PX);
    expect(SECTOR_FONT_PX * sectorScale(MAX_SCALE)).toBe(SECTOR_MAX_PX);
    expect(sectorScale(0.3)).toBe(0.3);
  });

  it.each([MIN_SCALE, 0.25, 0.5, 1, MAX_SCALE])("never overlaps sector titles at scale %f", (s) => {
    const v = { x: 0, y: 0, s };
    const rects = SECTORS.map((sec) => sectorScreenRect(sec, v));
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        expect(
          rectsOverlap(rects[i]!, rects[j]!),
          `${SECTORS[i]?.name} / ${SECTORS[j]?.name}`,
        ).toBe(false);
      }
    }
  });

  it("detects overlapping rectangles", () => {
    expect(rectsOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 })).toBe(true);
    expect(rectsOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 10, y: 0, w: 10, h: 10 })).toBe(false);
  });

  it("draws the path through every station in screen coordinates", () => {
    const d = pathD({ x: 10, y: 20, s: 0.5 }, [
      { x: 0, y: 0 },
      { x: 100, y: 50 },
    ]);
    expect(d).toBe("M10.0,20.0 L60.0,45.0");
    expect(pathD({ x: 0, y: 0, s: 1 }).match(/[ML]/g)).toHaveLength(42);
  });
});

describe("fit all (keyboard 0)", () => {
  it("contains every planet, and fits them all on a desktop screen by zooming out", () => {
    const b = allBounds();
    for (const s of PLACED_STATIONS) {
      expect(s.x - s.r).toBeGreaterThanOrEqual(b.x);
      expect(s.x + s.r).toBeLessThanOrEqual(b.x + b.w);
      expect(s.y - s.r).toBeGreaterThanOrEqual(b.y);
      expect(s.y + s.r).toBeLessThanOrEqual(b.y + b.h);
    }
    const v = fitBounds(b, viewport);
    expect(v.s).toBeGreaterThanOrEqual(MIN_SCALE);
    expect(v.s).toBeLessThan(1); // the whole journey is wider than one screen
  });
});
