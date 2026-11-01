// Astronaut navigation: snapping, keyboard steps, the recommended next station and preview-card
// placement. Pure functions, so the rules are unit-tested without a browser.

import { type Point, type Rect, type Size } from "./layout";

/** A drop within this many world units of a station snaps to it; further away returns home. */
export const SNAP_RADIUS = 160;

/** Id of the station nearest to (x, y) within maxDist, or null if none is close enough. */
export function nearestStation(
  stations: readonly (Point & { id: number })[],
  x: number,
  y: number,
  maxDist = SNAP_RADIUS,
): number | null {
  let best: number | null = null;
  let bestDist = maxDist;
  for (const st of stations) {
    const d = Math.hypot(st.x - x, st.y - y);
    if (d <= bestDist) {
      bestDist = d;
      best = st.id;
    }
  }
  return best;
}

/** Station id after moving `delta` steps along the path, clamped to 1…total. */
export function stepStation(current: number, delta: number, total: number): number {
  return Math.min(total, Math.max(1, current + delta));
}

/** Arrow keys move along the path: Right/Down go forward, Left/Up go back. */
export function arrowDelta(key: string): number {
  if (key === "ArrowRight" || key === "ArrowDown") return 1;
  if (key === "ArrowLeft" || key === "ArrowUp") return -1;
  return 0;
}

/** The next uncompleted available station, in path order (FR-5 "recommended next"). */
export function recommendedNext(
  availableIds: readonly number[],
  completedIds: readonly number[],
): number | null {
  const next = [...availableIds].sort((a, b) => a - b).find((id) => !completedIds.includes(id));
  return next ?? null;
}

const CARD_GAP = 16;
const EDGE = 8;

/**
 * Where to put the preview card so it sits beside the planet and never covers it:
 * to the right if it fits, otherwise to the left, otherwise below; always kept on screen and
 * below `minY` (the bottom of the landing hero).
 */
export function cardPlacement(
  planet: Point,
  radius: number,
  card: Size,
  viewport: Size,
  minY = 0,
): Rect & { side: "right" | "left" | "below" } {
  const top = minY + EDGE;
  const clampY = (y: number) => Math.max(top, Math.min(viewport.h - card.h - EDGE, y));
  const clampX = (x: number) => Math.min(viewport.w - card.w - EDGE, Math.max(EDGE, x));
  const y = clampY(planet.y - card.h / 2);

  const right = planet.x + radius + CARD_GAP;
  if (right + card.w <= viewport.w - EDGE)
    return { x: right, y, w: card.w, h: card.h, side: "right" };

  const left = planet.x - radius - CARD_GAP - card.w;
  if (left >= EDGE) return { x: left, y, w: card.w, h: card.h, side: "left" };

  // Narrow screens: under the planet (or above it if there's no room below).
  const below = planet.y + radius + CARD_GAP;
  const by = below + card.h <= viewport.h - EDGE ? below : planet.y - radius - CARD_GAP - card.h;
  return {
    x: clampX(planet.x - card.w / 2),
    y: Math.max(top, by),
    w: card.w,
    h: card.h,
    side: "below",
  };
}

/** Pointer movement below this many px counts as a tap/click rather than a drag. */
export const TAP_SLOP = 6;

export const isTap = (from: Point, to: Point) =>
  Math.hypot(to.x - from.x, to.y - from.y) < TAP_SLOP;
