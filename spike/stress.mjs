// Stress run: frame rate under heavier CPU throttling (simulating low-end laptops / phones).
import { chromium } from 'playwright'
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--use-angle=metal'] })
const out = []
for (const impl of ['dom', 'pixi']) for (const rate of [10, 20]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  await page.goto(`http://localhost:4173/?impl=${impl}`)
  await page.waitForFunction(() => !!window.__spike)
  await page.waitForTimeout(500)
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate })
  const r = await page.evaluate(() => new Promise((resolve) => {
    const api = window.__spike, d = [], t0 = performance.now(); let last = t0
    const f = (t) => { d.push(t - last); last = t; const k = (t - t0) / 1000, s = 0.3 + 0.6 * (1 + Math.sin(k * 1.3))
      const wx = 3500 + 3000 * Math.sin(k * 0.5), wy = 1200 + 400 * Math.cos(k * 0.7)
      api.setView({ s, x: innerWidth / 2 - wx * s, y: innerHeight / 2 - wy * s })
      if (t - t0 < 6000) requestAnimationFrame(f); else { d.shift(); const so = [...d].sort((a, b) => a - b), avg = d.reduce((a, b) => a + b, 0) / d.length
        resolve({ fps: +(1000 / avg).toFixed(1), p95: +so[Math.floor(so.length * .95)].toFixed(1), jank: +(d.filter(x => x > 25).length / d.length * 100).toFixed(1) }) } }
    requestAnimationFrame(f) }))
  out.push({ impl, throttle: `${rate}x`, ...r })
  await ctx.close()
}
await browser.close()
console.table(out)
