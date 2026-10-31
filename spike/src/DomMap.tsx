// Prototype A: DOM/SVG world + CSS transforms for pan/zoom + Framer Motion for animation.
import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'
import {
  PHASES, STATIONS, WORLD, type View, centerOn, nearestStation, prefersReducedMotion, zoomAt,
} from './layout'

const ASTRO = 64
// ?fmdrag=1 uses Framer Motion's built-in `drag` instead of our pointer handling (to test scaled-parent behaviour).
const FM_DRAG = new URLSearchParams(location.search).has('fmdrag')

export default function DomMap() {
  const rootRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const starsRef = useRef<HTMLCanvasElement>(null)
  const miniRef = useRef<HTMLCanvasElement>(null)
  const astroRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const view = useRef<View>(centerOn(STATIONS[0].x, STATIONS[0].y, 0.5))
  const currentRef = useRef(0)
  const [current, setCurrent] = useState(0)
  const [open, setOpen] = useState(false)
  const openRef = useRef(false)
  openRef.current = open

  const ax = useMotionValue(STATIONS[0].x)
  const ay = useMotionValue(STATIONS[0].y)

  // Apply the view directly to the DOM (no React re-render per frame).
  const applyView = () => {
    const { x, y, s } = view.current
    if (worldRef.current) worldRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`
    drawMini()
  }

  const drawMini = () => {
    const c = miniRef.current
    if (!c) return
    const ctx = c.getContext('2d')!
    const k = c.width / WORLD.w
    ctx.clearRect(0, 0, c.width, c.height)
    STATIONS.forEach((st, i) => {
      ctx.fillStyle = i === currentRef.current ? '#fff' : st.color
      ctx.beginPath()
      ctx.arc(st.x * k, st.y * k, 2.5, 0, Math.PI * 2)
      ctx.fill()
    })
    const { x, y, s } = view.current
    ctx.strokeStyle = 'rgba(255,255,255,.8)'
    ctx.strokeRect((-x / s) * k, (-y / s) * k, (innerWidth / s) * k, (innerHeight / s) * k)
  }

  const moveTo = (i: number, pan = true) => {
    const idx = Math.max(0, Math.min(STATIONS.length - 1, i))
    const st = STATIONS[idx]
    const opts = prefersReducedMotion() ? { duration: 0 } : { type: 'spring' as const, stiffness: 260, damping: 26 }
    animate(ax, st.x, opts)
    animate(ay, st.y, opts)
    currentRef.current = idx
    setCurrent(idx)
    if (pan) {
      // Keep the astronaut on screen.
      const { x, y, s } = view.current
      const sx = st.x * s + x
      const sy = st.y * s + y
      if (sx < 80 || sy < 80 || sx > innerWidth - 80 || sy > innerHeight - 80) {
        view.current = centerOn(st.x, st.y, s)
        applyView()
      }
    }
    drawMini()
  }

  // Pan / pinch / wheel on the background.
  useEffect(() => {
    const root = rootRef.current!
    const pointers = new Map<number, { x: number; y: number }>()
    let pinchDist = 0

    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('[data-astronaut],[role=dialog],button')) return
      root.setPointerCapture(e.pointerId)
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y)
      }
    }
    const move = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId)
      if (!prev) return
      const cur = { x: e.clientX, y: e.clientY }
      pointers.set(e.pointerId, cur)
      if (pointers.size === 1) {
        view.current = { ...view.current, x: view.current.x + cur.x - prev.x, y: view.current.y + cur.y - prev.y }
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        view.current = zoomAt(view.current, d / pinchDist, (a.x + b.x) / 2, (a.y + b.y) / 2)
        pinchDist = d
      }
      applyView()
    }
    const up = (e: PointerEvent) => pointers.delete(e.pointerId)
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      view.current = zoomAt(view.current, Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY)
      applyView()
    }
    root.addEventListener('pointerdown', down)
    root.addEventListener('pointermove', move)
    root.addEventListener('pointerup', up)
    root.addEventListener('pointercancel', up)
    root.addEventListener('wheel', wheel, { passive: false })
    applyView()
    return () => {
      root.removeEventListener('pointerdown', down)
      root.removeEventListener('pointermove', move)
      root.removeEventListener('pointerup', up)
      root.removeEventListener('pointercancel', up)
      root.removeEventListener('wheel', wheel)
    }
  }, [])

  // Twinkling starfield with slight parallax, redrawn every frame.
  useEffect(() => {
    const c = starsRef.current!
    const ctx = c.getContext('2d')!
    const stars = Array.from({ length: 500 }, () => ({
      x: Math.random() * 4000, y: Math.random() * 3000, r: Math.random() * 1.6 + 0.3, p: Math.random() * 6,
    }))
    let raf = 0
    const draw = (t: number) => {
      if (c.width !== innerWidth) { c.width = innerWidth; c.height = innerHeight }
      ctx.clearRect(0, 0, c.width, c.height)
      const ox = view.current.x * 0.05
      const oy = view.current.y * 0.05
      for (const s of stars) {
        ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t / 900 + s.p))
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(((s.x + ox) % c.width + c.width) % c.width, ((s.y + oy) % c.height + c.height) % c.height, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Custom astronaut drag: convert screen deltas into world units (divide by scale).
  const dragStart = useRef<{ px: number; py: number; ax: number; ay: number } | null>(null)
  const onAstroDown = (e: React.PointerEvent) => {
    if (FM_DRAG) return
    e.stopPropagation()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    dragStart.current = { px: e.clientX, py: e.clientY, ax: ax.get(), ay: ay.get() }
  }
  const onAstroMove = (e: React.PointerEvent) => {
    const d = dragStart.current
    if (!d) return
    const s = view.current.s
    ax.set(d.ax + (e.clientX - d.px) / s)
    ay.set(d.ay + (e.clientY - d.py) / s)
  }
  const onAstroUp = () => {
    if (!dragStart.current) return
    dragStart.current = null
    drop()
  }
  const drop = () => {
    const i = nearestStation(ax.get(), ay.get())
    moveTo(i >= 0 ? i : currentRef.current, false)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); moveTo(currentRef.current + 1) }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); moveTo(currentRef.current - 1) }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true) }
  }

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  const closeDialog = () => {
    setOpen(false)
    astroRef.current?.focus()
  }

  useEffect(() => {
    window.__spike = {
      impl: 'dom',
      setView: (v) => { view.current = v; applyView() },
      getView: () => view.current,
      getCurrent: () => currentRef.current,
      reset: () => { ax.set(STATIONS[0].x); ay.set(STATIONS[0].y); currentRef.current = 0; setCurrent(0) },
      worldToScreen: (wx, wy) => ({ x: wx * view.current.s + view.current.x, y: wy * view.current.s + view.current.y }),
      stations: STATIONS,
      isDialogOpen: () => openRef.current,
    }
  }, [])

  const pathD = STATIONS.map((s, i) => `${i ? 'L' : 'M'}${s.x},${s.y}`).join(' ')
  const st = STATIONS[current]

  return (
    <div ref={rootRef} className="root" style={{ touchAction: 'none' }}>
      <canvas ref={starsRef} className="stars" aria-hidden="true" />
      <div ref={worldRef} className="world" style={{ width: WORLD.w, height: WORLD.h }}>
        <svg width={WORLD.w} height={WORLD.h} className="path" aria-hidden="true">
          <path d={pathD} />
        </svg>
        {PHASES.map((p, i) => {
          const first = STATIONS.find((s) => s.phase === i)!
          return (
            <div key={p.name} className="sector" style={{ left: first.x - 40, top: 120, color: p.color }}>
              {p.name}
            </div>
          )
        })}
        {STATIONS.map((s) => (
          <div
            key={s.id}
            className="planet"
            style={{
              left: s.x - s.r, top: s.y - s.r, width: s.r * 2, height: s.r * 2,
              background: `radial-gradient(circle at 30% 30%, #fff8, ${s.color} 45%, #000a)`,
              boxShadow: `0 0 ${s.r}px ${s.color}`,
            }}
          >
            <span>#{s.id}</span>
          </div>
        ))}
        <motion.div
          ref={astroRef}
          data-astronaut
          data-testid="astronaut"
          role="button"
          tabIndex={0}
          aria-label={`Astronaut at station ${st.id}. Arrow keys move between stations, Enter opens the station.`}
          className="astro"
          style={{ x: ax, y: ay, width: ASTRO, height: ASTRO, marginLeft: -ASTRO / 2, marginTop: -ASTRO / 2 }}
          onPointerDown={onAstroDown}
          onPointerMove={onAstroMove}
          onPointerUp={onAstroUp}
          onKeyDown={onKey}
          drag={FM_DRAG}
          dragMomentum={false}
          onDragEnd={FM_DRAG ? drop : undefined}
        >
          🧑‍🚀
        </motion.div>
      </div>
      <canvas ref={miniRef} className="mini" width={240} height={82} aria-hidden="true" />
      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="dlg-title" className="dialog"
          onKeyDown={(e) => e.key === 'Escape' && closeDialog()}>
          <h2 id="dlg-title">Station #{st.id}</h2>
          <p>{PHASES[st.phase].name}</p>
          <button ref={closeRef} onClick={closeDialog}>Close</button>
        </div>
      )}
    </div>
  )
}
