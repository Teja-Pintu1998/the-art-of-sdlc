// Spike benchmark: frame rate under pan/zoom, snap accuracy, Framer Motion drag in a scaled parent,
// keyboard and touch support. Run against `vite preview` (production build).
import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:4173/'
const results = { env: {}, perf: [], snap: [], fmDrag: [], keyboard: {}, touch: {}, a11y: {} }

const browser = await chromium.launch({
  args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--use-angle=metal'],
})

async function open(impl, extra = '', ctxOpts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, ...ctxOpts })
  const page = await ctx.newPage()
  await page.goto(`${BASE}?impl=${impl}${extra}`)
  await page.waitForFunction(() => !!window.__spike)
  await page.waitForTimeout(500)
  return { ctx, page }
}

// --- Environment ---
{
  const { ctx, page } = await open('dom')
  results.env.renderer = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl')
    const ext = gl?.getExtension('WEBGL_debug_renderer_info')
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown'
  })
  results.env.browser = browser.version()
  await ctx.close()
}

// --- 1. Frame rate during continuous pan + zoom (6s), at normal speed and 4x CPU throttle ---
for (const impl of ['dom', 'pixi']) {
  for (const throttle of [1, 4]) {
    const { ctx, page } = await open(impl)
    const cdp = await ctx.newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle })
    const stats = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const api = window.__spike
          const deltas = []
          const t0 = performance.now()
          let last = t0
          const frame = (t) => {
            deltas.push(t - last)
            last = t
            const k = (t - t0) / 1000
            const s = 0.3 + 0.6 * (1 + Math.sin(k * 1.3)) // 0.3 .. 1.5
            const wx = 3500 + 3000 * Math.sin(k * 0.5)
            const wy = 1200 + 400 * Math.cos(k * 0.7)
            api.setView({ s, x: innerWidth / 2 - wx * s, y: innerHeight / 2 - wy * s })
            if (t - t0 < 6000) requestAnimationFrame(frame)
            else {
              deltas.shift()
              const sorted = [...deltas].sort((a, b) => a - b)
              const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length
              resolve({
                fps: +(1000 / avg).toFixed(1),
                p95: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1),
                jank: +((deltas.filter((d) => d > 25).length / deltas.length) * 100).toFixed(1),
              })
            }
          }
          requestAnimationFrame(frame)
        }),
    )
    results.perf.push({ impl, throttle: `${throttle}x`, ...stats })
    await ctx.close()
  }
}

// --- 2. Snap accuracy: drag astronaut from station 1 to station 2 at different zoom levels ---
async function dragTo(page, i, { dx = 22, dy = -18 } = {}) {
  await page.evaluate(() => window.__spike.reset())
  const [from, to] = await page.evaluate((i) => {
    const api = window.__spike
    const a = api.stations[0], b = api.stations[i]
    return [api.worldToScreen(a.x, a.y), api.worldToScreen(b.x, b.y)]
  }, i)
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.mouse.move(to.x + dx, to.y + dy, { steps: 15 })
  await page.mouse.up()
  await page.waitForTimeout(900)
  return page.evaluate(() => window.__spike.getCurrent())
}

for (const impl of ['dom', 'pixi']) {
  const { ctx, page } = await open(impl)
  for (const s of [0.35, 1, 2]) {
    await page.evaluate((s) => {
      const api = window.__spike
      const a = api.stations[0], b = api.stations[1]
      api.setView({ s, x: innerWidth / 2 - ((a.x + b.x) / 2) * s, y: innerHeight / 2 - ((a.y + b.y) / 2) * s })
    }, s)
    const landed = await dragTo(page, 1, { dx: 20 * s, dy: -15 * s })
    results.snap.push({ impl, zoom: s, expected: 1, landed, ok: landed === 1 })
  }
  await ctx.close()
}

// --- 3. Does the astronaut track the cursor while dragging inside a zoomed (scaled) map? ---
for (const [label, extra] of [['custom pointer drag', '']]) {
  for (const s of [0.5, 2]) {
    const { ctx, page } = await open('dom', extra)
    await page.evaluate((s) => {
      const api = window.__spike
      const a = api.stations[0]
      api.setView({ s, x: 400 - a.x * s, y: 450 - a.y * s })
    }, s)
    const box0 = await page.getByTestId('astronaut').boundingBox()
    const cx = box0.x + box0.width / 2, cy = box0.y + box0.height / 2
    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.mouse.move(cx + 300, cy, { steps: 20 })
    await page.waitForTimeout(100)
    const box1 = await page.getByTestId('astronaut').boundingBox()
    await page.mouse.up()
    const moved = box1.x + box1.width / 2 - cx
    results.fmDrag.push({ method: label, zoom: s, cursorMoved: 300, astronautMoved: Math.round(moved), tracksCursor: Math.abs(moved - 300) < 10 })
    await ctx.close()
  }
}

// --- 4. Keyboard: Tab to astronaut, arrows move, Enter opens dialog, Escape closes and restores focus ---
for (const impl of ['dom', 'pixi']) {
  const { ctx, page } = await open(impl)
  const r = {}
  await page.keyboard.press('Tab') // first: HUD links
  for (let k = 0; k < 6; k++) {
    const isAstro = await page.evaluate(() => document.activeElement?.hasAttribute('data-astronaut') ?? false)
    if (isAstro) break
    await page.keyboard.press('Tab')
  }
  r.reachableByTab = await page.evaluate(() => document.activeElement?.hasAttribute('data-astronaut') ?? false)
  if (r.reachableByTab) {
    for (let k = 0; k < 3; k++) await page.keyboard.press('ArrowRight')
    r.arrowsMoveToStation = (await page.evaluate(() => window.__spike.getCurrent())) === 3
    await page.keyboard.press('Enter')
    r.enterOpensDialog = await page.getByRole('dialog').isVisible()
    await page.keyboard.press('Escape')
    r.escapeCloses = !(await page.getByRole('dialog').isVisible().catch(() => false))
    r.focusRestored = await page.evaluate(() => document.activeElement?.hasAttribute('data-astronaut') ?? false)
  }
  results.keyboard[impl] = r
  // Accessibility tree: is there anything a screen reader can find?
  results.a11y[impl] = {
    buttonsInA11yTree: await page.getByRole('button', { name: /astronaut/i }).count(),
  }
  await ctx.close()
}

// --- 5. Touch: drag astronaut to station 2 with a finger (CDP touch events) ---
for (const impl of ['dom', 'pixi']) {
  const { ctx, page } = await open(impl, '', { hasTouch: true, isMobile: false })
  const cdp = await ctx.newCDPSession(page)
  await page.evaluate(() => {
    const api = window.__spike
    const a = api.stations[0], b = api.stations[1]
    api.setView({ s: 0.8, x: innerWidth / 2 - ((a.x + b.x) / 2) * 0.8, y: innerHeight / 2 - ((a.y + b.y) / 2) * 0.8 })
  })
  const [from, to] = await page.evaluate(() => {
    const api = window.__spike
    const a = api.stations[0], b = api.stations[1]
    return [api.worldToScreen(a.x, a.y), api.worldToScreen(b.x, b.y)]
  })
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x, y: from.y }] })
  for (let k = 1; k <= 15; k++) {
    const x = from.x + ((to.x + 15 - from.x) * k) / 15
    const y = from.y + ((to.y - 10 - from.y) * k) / 15
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] })
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(900)
  const landed = await page.evaluate(() => window.__spike.getCurrent())
  results.touch[impl] = { expected: 1, landed, ok: landed === 1 }
  await ctx.close()
}

await browser.close()
console.log(JSON.stringify(results, null, 2))
