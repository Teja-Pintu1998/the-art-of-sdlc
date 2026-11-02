// Canvas drawing for the starfield and mini-map. Kept as pure functions over a minimal 2D-context
// interface so they can be unit-tested without a real canvas.

import { WORLD, type Point, type Size, type View, visibleWorldRect } from "./layout";

export type Ctx2D = Pick<
  CanvasRenderingContext2D,
  "clearRect" | "beginPath" | "moveTo" | "arc" | "fill" | "strokeRect"
> & {
  fillStyle: CanvasRenderingContext2D["fillStyle"];
  strokeStyle: CanvasRenderingContext2D["strokeStyle"];
  globalAlpha: number;
  lineWidth: number;
};

/** `group` is the star's twinkle group: stars in a group twinkle together and are drawn in one fill. */
export type Star = { x: number; y: number; r: number; group: number };

/** Number of twinkle groups. Drawing per group (not per star) keeps the frame cost low (AOS-3 perf fix). */
export const TWINKLE_GROUPS = 6;

/** Deterministic PRNG (mulberry32), so the starfield looks the same on every load and in screenshots. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const STAR_FIELD = { w: 4000, h: 3000 } as const;
/** Stars move at this fraction of the map's pan speed (parallax). */
export const PARALLAX = 0.05;

export function makeStars(count = 500, seed = 42): Star[] {
  const rand = seededRandom(seed);
  return Array.from({ length: count }, () => ({
    x: rand() * STAR_FIELD.w,
    y: rand() * STAR_FIELD.h,
    r: rand() * 1.6 + 0.3,
    group: Math.floor(rand() * TWINKLE_GROUPS),
  }));
}

const wrap = (n: number, size: number) => ((n % size) + size) % size;

/**
 * Draws the starfield. With `motion` off (reduced motion), stars neither twinkle nor move with the map.
 */
export function drawStars(
  ctx: Ctx2D,
  stars: readonly Star[],
  size: Size,
  { time, view, motion }: { time: number; view: View; motion: boolean },
): void {
  ctx.clearRect(0, 0, size.w, size.h);
  ctx.fillStyle = "#ffffff";
  const ox = motion ? view.x * PARALLAX : 0;
  const oy = motion ? view.y * PARALLAX : 0;
  for (let group = 0; group < TWINKLE_GROUPS; group++) {
    ctx.globalAlpha = motion ? 0.4 + 0.6 * Math.abs(Math.sin(time / 900 + group + 0.5)) : 0.7;
    ctx.beginPath();
    for (const star of stars) {
      if (star.group !== group) continue;
      const x = wrap(star.x + ox, size.w);
      const y = wrap(star.y + oy, size.h);
      ctx.moveTo(x + star.r, y); // start a new circle, not a line from the previous one
      ctx.arc(x, y, star.r, 0, Math.PI * 2);
    }
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export type MiniStation = Point & { color: string; locked: boolean; current?: boolean };

/** Draws every station and the current viewport rectangle on the mini-map. */
export function drawMiniMap(
  ctx: Ctx2D,
  mini: Size,
  stations: readonly MiniStation[],
  view: View,
  viewport: Size,
): void {
  const k = mini.w / WORLD.w;
  ctx.clearRect(0, 0, mini.w, mini.h);
  for (const st of stations) {
    ctx.globalAlpha = st.locked && !st.current ? 0.4 : 1;
    ctx.fillStyle = st.current ? "#ffffff" : st.color;
    ctx.beginPath();
    ctx.arc(st.x * k, st.y * k, st.current ? 4 : 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const r = visibleWorldRect(view, viewport);
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 1;
  ctx.strokeRect(r.x * k, r.y * k, r.w * k, r.h * k);
}

/** Converts a point clicked on the mini-map (CSS px) into world coordinates. */
export function miniMapToWorld(px: number, py: number, mini: Size): Point {
  return { x: (px / mini.w) * WORLD.w, y: (py / mini.h) * WORLD.h };
}
