// Prototype B: everything rendered in a single WebGL canvas with PixiJS.
import { useEffect, useRef } from 'react'
import { Application, Container, Graphics, Text } from 'pixi.js'
import { PHASES, STATIONS, WORLD, type View, centerOn, nearestStation, zoomAt } from './layout'

export default function PixiMap() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const app = new Application()
    let destroyed = false
    let view: View = centerOn(STATIONS[0].x, STATIONS[0].y, 0.5)
    let current = 0

    ;(async () => {
      await app.init({
        resizeTo: window, background: '#050816', antialias: true,
        autoDensity: true, resolution: devicePixelRatio,
      })
      if (destroyed) { app.destroy(true); return }
      hostRef.current!.appendChild(app.canvas)

      // Starfield (screen space).
      const stars = new Container()
      const starData = Array.from({ length: 500 }, () => {
        const g = new Graphics().circle(0, 0, Math.random() * 1.6 + 0.3).fill(0xffffff)
        g.x = Math.random() * innerWidth
        g.y = Math.random() * innerHeight
        stars.addChild(g)
        return { g, p: Math.random() * 6 }
      })

      // World (pans and zooms).
      const world = new Container()
      const path = new Graphics()
      STATIONS.forEach((s, i) => (i ? path.lineTo(s.x, s.y) : path.moveTo(s.x, s.y)))
      path.stroke({ width: 6, color: 0x7dd3fc, alpha: 0.45 })
      world.addChild(path)
      PHASES.forEach((p, i) => {
        const first = STATIONS.find((s) => s.phase === i)!
        const t = new Text({ text: p.name, style: { fill: p.color, fontSize: 64, fontWeight: '700' } })
        t.position.set(first.x - 40, 120)
        world.addChild(t)
      })
      STATIONS.forEach((s) => {
        const glow = new Graphics().circle(s.x, s.y, s.r * 1.7).fill({ color: s.color, alpha: 0.18 })
        const body = new Graphics().circle(s.x, s.y, s.r).fill(s.color)
        const label = new Text({ text: `#${s.id}`, style: { fill: '#fff', fontSize: 22, fontWeight: '700' } })
        label.anchor.set(0.5)
        label.position.set(s.x, s.y)
        world.addChild(glow, body, label)
      })
      const astro = new Text({ text: '🧑‍🚀', style: { fontSize: 56 } })
      astro.anchor.set(0.5)
      astro.position.set(STATIONS[0].x, STATIONS[0].y)
      astro.eventMode = 'static'
      astro.cursor = 'grab'
      world.addChild(astro)

      app.stage.addChild(stars, world)
      app.stage.eventMode = 'static'
      app.stage.hitArea = app.screen

      const applyView = () => {
        world.position.set(view.x, view.y)
        world.scale.set(view.s)
      }
      applyView()

      // Snap tween handled in the ticker.
      let tween: { tx: number; ty: number } | null = null
      const moveTo = (i: number) => {
        current = Math.max(0, Math.min(STATIONS.length - 1, i))
        tween = { tx: STATIONS[current].x, ty: STATIONS[current].y }
      }

      // Pointer handling: astronaut drag vs background pan/pinch.
      const pointers = new Map<number, { x: number; y: number }>()
      let pinchDist = 0
      let drag: { px: number; py: number; ax: number; ay: number } | null = null
      astro.on('pointerdown', (e) => {
        e.stopPropagation()
        drag = { px: e.global.x, py: e.global.y, ax: astro.x, ay: astro.y }
        tween = null
      })
      app.stage.on('pointerdown', (e) => {
        if (drag) return
        pointers.set(e.pointerId, { x: e.global.x, y: e.global.y })
        if (pointers.size === 2) {
          const [a, b] = [...pointers.values()]
          pinchDist = Math.hypot(a.x - b.x, a.y - b.y)
        }
      })
      app.stage.on('globalpointermove', (e) => {
        if (drag) {
          astro.position.set(drag.ax + (e.global.x - drag.px) / view.s, drag.ay + (e.global.y - drag.py) / view.s)
          return
        }
        const prev = pointers.get(e.pointerId)
        if (!prev) return
        const cur = { x: e.global.x, y: e.global.y }
        pointers.set(e.pointerId, cur)
        if (pointers.size === 1) view = { ...view, x: view.x + cur.x - prev.x, y: view.y + cur.y - prev.y }
        else if (pointers.size === 2) {
          const [a, b] = [...pointers.values()]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          view = zoomAt(view, d / pinchDist, (a.x + b.x) / 2, (a.y + b.y) / 2)
          pinchDist = d
        }
        applyView()
      })
      const end = (e: { pointerId: number }) => {
        if (drag) {
          drag = null
          const i = nearestStation(astro.x, astro.y)
          moveTo(i >= 0 ? i : current)
        }
        pointers.delete(e.pointerId)
      }
      app.stage.on('pointerup', end)
      app.stage.on('pointerupoutside', end)
      app.canvas.addEventListener('wheel', (e) => {
        e.preventDefault()
        view = zoomAt(view, Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY)
        applyView()
      }, { passive: false })

      app.ticker.add(() => {
        const t = performance.now()
        for (const s of starData) s.g.alpha = 0.4 + 0.6 * Math.abs(Math.sin(t / 900 + s.p))
        if (tween) {
          astro.x += (tween.tx - astro.x) * 0.2
          astro.y += (tween.ty - astro.y) * 0.2
          if (Math.hypot(tween.tx - astro.x, tween.ty - astro.y) < 0.5) {
            astro.position.set(tween.tx, tween.ty)
            tween = null
          }
        }
      })

      window.__spike = {
        impl: 'pixi',
        setView: (v) => { view = v; applyView() },
        getView: () => view,
        getCurrent: () => current,
        reset: () => { current = 0; tween = null; astro.position.set(STATIONS[0].x, STATIONS[0].y) },
        worldToScreen: (wx, wy) => ({ x: wx * view.s + view.x, y: wy * view.s + view.y }),
        stations: STATIONS,
        isDialogOpen: () => false, // no keyboard / dialog support in this prototype
      }
      void WORLD
    })()

    return () => {
      destroyed = true
      if (app.renderer) app.destroy(true)
    }
  }, [])

  return <div ref={hostRef} className="root" />
}
