import { Suspense, lazy, useEffect, useRef, useState } from 'react'

// Lazy-load each prototype so their bundle sizes can be compared separately.
const DomMap = lazy(() => import('./DomMap'))
const PixiMap = lazy(() => import('./PixiMap'))

const impl = new URLSearchParams(location.search).get('impl') === 'pixi' ? 'pixi' : 'dom'

function FpsMeter() {
  const [fps, setFps] = useState(0)
  const frames = useRef(0)
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const tick = (t: number) => {
      frames.current++
      if (t - last >= 1000) {
        setFps(Math.round((frames.current * 1000) / (t - last)))
        frames.current = 0
        last = t
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return <div className="fps">{fps} fps</div>
}

export default function App() {
  return (
    <>
      <Suspense fallback={null}>{impl === 'pixi' ? <PixiMap /> : <DomMap />}</Suspense>
      <nav className="hud">
        <strong>Spike: {impl === 'pixi' ? 'B · PixiJS' : 'A · DOM + Framer Motion'}</strong>
        <a href="?impl=dom">A: DOM</a>
        <a href="?impl=pixi">B: Pixi</a>
        <span>Drag background = pan · wheel/pinch = zoom · drag 🧑‍🚀 onto a planet</span>
      </nav>
      <FpsMeter />
    </>
  )
}
