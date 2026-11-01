// World layout and semantic-zoom math for the space map (spike findings §3.8, docs/03-spike-findings.md).
//
// The world is never CSS-scaled as one layer (that rasterises it like an image: flicker and vanishing
// thin lines). Instead each element is placed in screen space with transform-only updates, and its
// on-screen size is clamped so planets, labels and the path stay crisp at every zoom level.

import { PHASES, STATIONS, type Station } from "./stations";

export const WORLD = { w: 7000, h: 2400 } as const;

export const MIN_SCALE = 0.15;
export const MAX_SCALE = 2.5;

/** Planets never shrink below this radius on screen (px). */
export const MIN_PLANET_R = 9;
/** The path is always this wide on screen (px). */
export const PATH_WIDTH = 2.5;
/** Station numbers are hidden when zoomed out further than this. */
export const LABEL_MIN_SCALE = 0.45;

/** Sector titles are laid out at this font size (px) and scaled to SECTOR_MIN_PX…SECTOR_MAX_PX on screen. */
export const SECTOR_FONT_PX = 64;
export const SECTOR_MIN_PX = 12;
export const SECTOR_MAX_PX = 40;

export type View = { x: number; y: number; s: number };
export type Point = { x: number; y: number };
export type Size = { w: number; h: number };
export type Rect = { x: number; y: number; w: number; h: number };

export type PlacedStation = Station & Point & { r: number; color: string };

const PATH_MARGIN = 250;
const PATH_AMPLITUDE = 650;

/** Stations placed on a winding path across the world. */
export const PLACED_STATIONS: readonly PlacedStation[] = STATIONS.map((st, i) => {
  const color = PHASES[st.phase - 1]?.color ?? "#ffffff";
  return {
    ...st,
    x: PATH_MARGIN + (i * (WORLD.w - 2 * PATH_MARGIN)) / (STATIONS.length - 1),
    y: WORLD.h / 2 + PATH_AMPLITUDE * Math.sin(i * 0.55),
    r: 34 + ((i * 7) % 4) * 6,
    color,
  };
});

export type Sector = Point & { phase: number; name: string; color: string };

/** Sector titles sit in the middle of each phase, alternating above and below the path so neighbours never overlap. */
export const SECTORS: readonly Sector[] = PHASES.map((phase, i) => {
  const inPhase = PLACED_STATIONS.filter((s) => s.phase === phase.id);
  const first = inPhase[0];
  const last = inPhase[inPhase.length - 1];
  const x = first && last ? (first.x + last.x) / 2 : 0;
  const y = i % 2 === 0 ? WORLD.h / 2 - 1000 : WORLD.h / 2 + 1000;
  return { phase: phase.id, name: phase.name, color: phase.color, x, y };
});

export const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

export function toScreen(v: View, wx: number, wy: number): Point {
  return { x: wx * v.s + v.x, y: wy * v.s + v.y };
}

export function toWorld(v: View, sx: number, sy: number): Point {
  return { x: (sx - v.x) / v.s, y: (sy - v.y) / v.s };
}

/** Zoom by `factor`, keeping the screen point (px, py) fixed. */
export function zoomAt(v: View, factor: number, px: number, py: number): View {
  const s = clampScale(v.s * factor);
  const k = s / v.s;
  return { s, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
}

export function panBy(v: View, dx: number, dy: number): View {
  return { ...v, x: v.x + dx, y: v.y + dy };
}

/** View that centres world point (wx, wy) in the viewport at scale s. */
export function centerOn(wx: number, wy: number, s: number, viewport: Size): View {
  const scale = clampScale(s);
  return { s: scale, x: viewport.w / 2 - wx * scale, y: viewport.h / 2 - wy * scale };
}

/** Bounding box (world units) of all planets in a phase, including their radius. */
export function phaseBounds(phaseId: number): Rect {
  const inPhase = PLACED_STATIONS.filter((s) => s.phase === phaseId);
  if (inPhase.length === 0) throw new Error(`Unknown phase ${phaseId}`);
  const minX = Math.min(...inPhase.map((s) => s.x - s.r));
  const maxX = Math.max(...inPhase.map((s) => s.x + s.r));
  const minY = Math.min(...inPhase.map((s) => s.y - s.r));
  const maxY = Math.max(...inPhase.map((s) => s.y + s.r));
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/**
 * View that fits a world rectangle into the viewport. `insets` reserves screen space
 * (e.g. the landing hero at the top) that the rectangle must not be placed under.
 */
export function fitBounds(
  rect: Rect,
  viewport: Size,
  {
    padding = 48,
    top = 0,
    maxScale = 1,
  }: { padding?: number; top?: number; maxScale?: number } = {},
): View {
  const availW = Math.max(1, viewport.w - 2 * padding);
  const availH = Math.max(1, viewport.h - top - 2 * padding);
  const s = clampScale(Math.min(availW / rect.w, availH / rect.h, maxScale));
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  return { s, x: viewport.w / 2 - cx * s, y: top + (viewport.h - top) / 2 - cy * s };
}

/** On-screen scale for a planet: follows the zoom, but never below MIN_PLANET_R. */
export function planetScale(r: number, s: number): number {
  return Math.max(MIN_PLANET_R / r, s);
}

/** On-screen scale for a sector title: follows the zoom, clamped to SECTOR_MIN_PX…SECTOR_MAX_PX. */
export function sectorScale(s: number): number {
  return Math.min(SECTOR_MAX_PX / SECTOR_FONT_PX, Math.max(SECTOR_MIN_PX / SECTOR_FONT_PX, s));
}

/** SVG path through all stations, in screen coordinates (so its stroke width stays constant). */
export function pathD(v: View, stations: readonly Point[] = PLACED_STATIONS): string {
  return stations
    .map((st, i) => {
      const p = toScreen(v, st.x, st.y);
      return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");
}

/** The part of the world currently visible, in world units. */
export function visibleWorldRect(v: View, viewport: Size): Rect {
  const tl = toWorld(v, 0, 0);
  return { x: tl.x, y: tl.y, w: viewport.w / v.s, h: viewport.h / v.s };
}

/**
 * Estimated on-screen box of a sector title (used to prove titles never overlap).
 * Width uses a conservative average glyph width for bold Space Grotesk.
 */
export function sectorScreenRect(sector: Sector, v: View, glyphEm = 0.65): Rect {
  const font = SECTOR_FONT_PX * sectorScale(v.s);
  const w = sector.name.length * glyphEm * font;
  const h = font * 1.2;
  const c = toScreen(v, sector.x, sector.y);
  return { x: c.x - w / 2, y: c.y - h / 2, w, h };
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}
