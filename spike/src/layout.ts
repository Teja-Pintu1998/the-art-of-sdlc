// Shared world layout for both prototypes: 9 phases, 42 stations on a winding path.

export const PHASES = [
  { name: 'Discovery & Planning', count: 6, color: '#8b5cf6' },
  { name: 'Design', count: 3, color: '#ec4899' },
  { name: 'Development', count: 5, color: '#3b82f6' },
  { name: 'Continuous Integration', count: 4, color: '#06b6d4' },
  { name: 'Testing & Environments', count: 6, color: '#10b981' },
  { name: 'Release Governance', count: 3, color: '#eab308' },
  { name: 'Deployment', count: 6, color: '#f97316' },
  { name: 'Monitoring', count: 5, color: '#ef4444' },
  { name: 'Closure', count: 4, color: '#94a3b8' },
]

export const WORLD = { w: 7000, h: 2400 }

export type Station = { id: number; phase: number; x: number; y: number; r: number; color: string }

export const STATIONS: Station[] = (() => {
  const out: Station[] = []
  const total = PHASES.reduce((n, p) => n + p.count, 0)
  let i = 0
  PHASES.forEach((p, phase) => {
    for (let k = 0; k < p.count; k++, i++) {
      out.push({
        id: i + 1,
        phase,
        x: 250 + (i * (WORLD.w - 500)) / (total - 1),
        y: WORLD.h / 2 + 650 * Math.sin(i * 0.55),
        r: 34 + ((i * 7) % 4) * 6,
        color: p.color,
      })
    }
  })
  return out
})()

export const SNAP_RADIUS = 160

export function nearestStation(x: number, y: number, maxDist = SNAP_RADIUS): number {
  let best = -1
  let bestD = maxDist
  STATIONS.forEach((s, i) => {
    const d = Math.hypot(s.x - x, s.y - y)
    if (d < bestD) {
      bestD = d
      best = i
    }
  })
  return best
}

export type View = { x: number; y: number; s: number }

export const MIN_SCALE = 0.15
export const MAX_SCALE = 2.5

export const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))

/** Zoom by `factor` keeping the screen point (px, py) fixed. */
export function zoomAt(v: View, factor: number, px: number, py: number): View {
  const s = clampScale(v.s * factor)
  const k = s / v.s
  return { s, x: px - (px - v.x) * k, y: py - (py - v.y) * k }
}

export function centerOn(wx: number, wy: number, s: number): View {
  return { s, x: window.innerWidth / 2 - wx * s, y: window.innerHeight / 2 - wy * s }
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Test hook used by the benchmark script.
export type SpikeApi = {
  impl: 'dom' | 'pixi'
  setView: (v: View) => void
  getView: () => View
  getCurrent: () => number
  reset: () => void
  worldToScreen: (wx: number, wy: number) => { x: number; y: number }
  stations: Station[]
  isDialogOpen: () => boolean
}

declare global {
  interface Window {
    __spike?: SpikeApi
  }
}
