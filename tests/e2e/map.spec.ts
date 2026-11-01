import { expect, type Page, test } from "@playwright/test";

type View = { x: number; y: number; s: number };

const setView = (page: Page, v: View) => page.evaluate((view) => window.__aosMap?.setView(view), v);
const getView = (page: Page) => page.evaluate(() => window.__aosMap!.getView());

async function openMap(page: Page) {
  await page.goto("/");
  await page.waitForFunction(() => !!window.__aosMap);
}

/** Views spanning the zoom range: whole map, phase level, close-up. */
const ZOOMS: { name: string; view: (w: number, h: number) => View }[] = [
  { name: "zoomed out", view: () => ({ x: 30, y: 230, s: 0.15 }) },
  {
    name: "phase level",
    view: (w, h) => ({ s: 0.5, x: w / 2 - 2000 * 0.5, y: h / 2 - 1200 * 0.5 }),
  },
  { name: "close-up", view: (w, h) => ({ s: 2.5, x: w / 2 - 2100 * 2.5, y: h / 2 - 1500 * 2.5 }) },
];

test.describe("space map", () => {
  test("landing view shows the command centre over the map", async ({ page }) => {
    await openMap(page);
    await expect(page.getByRole("heading", { level: 1, name: "The Art of SDLC" })).toBeVisible();
    await expect(page.getByText("npm install experience")).toBeVisible();
    await expect(page.getByTestId("starfield")).toHaveAttribute("aria-hidden", "true");
    await expect(page.getByTestId("planet")).toHaveCount(42);
    await expect(page.getByTestId("sector-title")).toHaveCount(9);
  });

  test("opens on the current phase: all of phase 1 is on screen", async ({ page }) => {
    await openMap(page);
    const viewport = page.viewportSize()!;
    for (let id = 1; id <= 6; id++) {
      const box = (await page.locator(`[data-station="${id}"]`).boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    }
  });

  for (const zoom of ZOOMS) {
    test(`semantic zoom holds when ${zoom.name}`, async ({ page }) => {
      await openMap(page);
      const { width, height } = page.viewportSize()!;
      await setView(page, zoom.view(width, height));

      // Path stays 2.5px on screen.
      const strokeWidth = await page
        .getByTestId("map-path")
        .evaluate((el) => getComputedStyle(el).strokeWidth);
      expect(strokeWidth).toBe("2.5px");

      // Planets never shrink below 9px radius.
      const sizes = await page
        .getByTestId("planet")
        .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
      for (const w of sizes) expect(w).toBeGreaterThanOrEqual(18 - 0.5);

      // Sector titles never overlap (measured, not estimated).
      const boxes = await page
        .getByTestId("sector-title")
        .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON() as DOMRect));
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i]!;
          const b = boxes[j]!;
          const overlap =
            a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
          expect(overlap, `sector titles ${i + 1} and ${j + 1} overlap`).toBe(false);
        }
      }
    });
  }

  test("dragging the background pans the map", async ({ page }) => {
    await openMap(page);
    const before = await getView(page);
    await page.mouse.move(700, 500);
    await page.mouse.down();
    await page.mouse.move(600, 450, { steps: 5 });
    await page.mouse.up();
    const after = await getView(page);
    expect(after.x - before.x).toBeCloseTo(-100, 0);
    expect(after.y - before.y).toBeCloseTo(-50, 0);
    expect(after.s).toBe(before.s);
  });

  test("the mouse wheel zooms around the pointer", async ({ page }) => {
    await openMap(page);
    const before = await getView(page);
    await page.mouse.move(400, 400);
    await page.mouse.wheel(0, -300);
    await expect.poll(async () => (await getView(page)).s).toBeGreaterThan(before.s);
  });

  test("locked stations are dimmed and show a 'Coming soon' teaser on hover", async ({ page }) => {
    await openMap(page);
    const locked = page.locator('[data-station="5"]');
    await expect(locked).toHaveAttribute("data-locked", "true");
    await expect(page.locator('[data-station="1"]')).toHaveAttribute("data-locked", "false");
    await locked.hover();
    const teaser = page.getByTestId("station-teaser");
    await expect(teaser).toContainText("#5 Estimation and backlog grooming");
    await expect(teaser).toContainText("Coming soon");
  });

  test("clicking the mini-map moves the map there", async ({ page }) => {
    await openMap(page);
    const mini = (await page.getByTestId("mini-map").boundingBox())!;
    await page.mouse.click(mini.x + mini.width * 0.9, mini.y + mini.height / 2);
    const v = await getView(page);
    const { width } = page.viewportSize()!;
    // The world point at 90% across is now in the centre of the screen.
    expect(7000 * 0.9 * v.s + v.x).toBeCloseTo(width / 2, 0);
  });
});

test.describe("space map with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("stops the path animation and freezes the starfield", async ({ page }) => {
    await openMap(page);
    const animation = await page
      .getByTestId("map-path")
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe("none");

    const frame = () =>
      page.getByTestId("starfield").evaluate((c) => (c as HTMLCanvasElement).toDataURL());
    const first = await frame();
    await page.waitForTimeout(400);
    expect(await frame()).toBe(first);
  });
});
