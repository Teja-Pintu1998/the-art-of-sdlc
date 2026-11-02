// Space-map frame-rate benchmark (spike method, docs/03-spike-findings.md).
// Continuously pans and zooms for 6s at several CPU throttle rates and reports the average fps.
// Usage: start the production server (`npm run build && npx next start -p 3000`), then
//        node scripts/bench-map.mjs [baseUrl]
import { chromium } from "@playwright/test";

const BASE = process.argv[2] ?? "http://localhost:3000/";
const THROTTLES = [1, 4, 20];

const browser = await chromium.launch({ args: ["--ignore-gpu-blocklist"] });
const results = [];

for (const rate of THROTTLES) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(BASE);
  await page.waitForFunction(() => !!window.__aosMap);
  await page.waitForTimeout(500);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate });

  const stats = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const deltas = [];
        const t0 = performance.now();
        let last = t0;
        const frame = (t) => {
          deltas.push(t - last);
          last = t;
          const k = (t - t0) / 1000;
          const s = 0.3 + 0.6 * (1 + Math.sin(k * 1.3)); // 0.3 … 1.5
          const wx = 3500 + 3000 * Math.sin(k * 0.5);
          const wy = 1200 + 400 * Math.cos(k * 0.7);
          window.__aosMap.setView({ s, x: innerWidth / 2 - wx * s, y: innerHeight / 2 - wy * s });
          if (t - t0 < 6000) requestAnimationFrame(frame);
          else {
            deltas.shift();
            const sorted = [...deltas].sort((a, b) => a - b);
            const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
            resolve({
              fps: +(1000 / avg).toFixed(1),
              p95ms: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1),
              jankPct: +((deltas.filter((d) => d > 25).length / deltas.length) * 100).toFixed(1),
            });
          }
        };
        requestAnimationFrame(frame);
      }),
  );
  results.push({ throttle: `${rate}x`, ...stats });
  await context.close();
}

await browser.close();
console.table(results);
