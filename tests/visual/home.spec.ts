import { expect, test } from "@playwright/test";

// Visual regression at 3 zoom levels (spike lesson L4). Reduced motion keeps the starfield and
// path still, so screenshots are stable.
test.use({ reducedMotion: "reduce", viewport: { width: 1280, height: 800 } });

const VIEWS = [
  { name: "map-opening-view", view: null },
  { name: "map-zoomed-out", view: { x: 20, y: 220, s: 0.17 } },
  { name: "map-phase-level", view: { s: 0.5, x: 640 - 2000 * 0.5, y: 400 - 1200 * 0.5 } },
  { name: "map-close-up", view: { s: 2.5, x: 640 - 2100 * 2.5, y: 400 - 1500 * 2.5 } },
];

for (const { name, view } of VIEWS) {
  test(`space map matches the saved screenshot: ${name}`, async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => !!window.__aosMap);
    if (view) await page.evaluate((v) => window.__aosMap?.setView(v), view);
    await page.evaluate(() => document.fonts.ready);
    // Tolerates GPU anti-aliasing noise on glows (seen: 57 of ~1M pixels); real changes are far larger.
    await expect(page).toHaveScreenshot(`${name}.png`, { maxDiffPixels: 200 });
  });
}
