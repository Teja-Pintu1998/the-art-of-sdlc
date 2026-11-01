import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

async function openMap(page: Page) {
  await page.goto("/");
  await page.waitForFunction(() => !!window.__aosMap);
}

const current = (page: Page) => page.evaluate(() => window.__aosMap!.getCurrentStation());

async function center(page: Page, selector: string) {
  const box = (await page.locator(selector).boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function seriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
}

test.describe("astronaut", () => {
  for (const s of [0.4, 1, 2]) {
    test(`drag tracks the cursor and snaps to the nearest station at ${s}× zoom`, async ({
      page,
    }) => {
      await openMap(page);
      // Centre the view between stations 1 and 2 at this zoom.
      await page.evaluate((scale) => {
        const { innerWidth: w, innerHeight: h } = window;
        window.__aosMap!.setView({ s: scale, x: w / 2 - 330 * scale, y: h / 2 - 1350 * scale });
      }, s);
      const from = await center(page, '[data-testid="astronaut"]');
      const to = await center(page, '[data-station="2"]');

      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      // Halfway: the astronaut is exactly under the cursor (custom drag, spike 3.3).
      const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
      await page.mouse.move(mid.x, mid.y, { steps: 8 });
      const during = await center(page, '[data-testid="astronaut"]');
      expect(Math.abs(during.x - mid.x)).toBeLessThan(2);
      expect(Math.abs(during.y - mid.y)).toBeLessThan(2);

      await page.mouse.move(to.x + 12, to.y - 12, { steps: 8 });
      await page.mouse.up();
      await expect.poll(() => current(page)).toBe(2);
      await expect(page.getByTestId("preview-card")).toContainText("PRD creation and PRD review");
      // The snap spring settles on the planet.
      await expect
        .poll(async () => {
          const a = await center(page, '[data-testid="astronaut"]');
          return Math.hypot(a.x - to.x, a.y - to.y);
        })
        .toBeLessThan(2);
    });
  }

  test("dropped in empty space, it returns to its last station", async ({ page }) => {
    await openMap(page);
    const from = await center(page, '[data-testid="astronaut"]');
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(from.x + 250, from.y - 150, { steps: 6 });
    await page.mouse.up();
    expect(await current(page)).toBe(1);
    await expect
      .poll(async () => {
        const a = await center(page, '[data-testid="astronaut"]');
        return Math.hypot(a.x - from.x, a.y - from.y);
      })
      .toBeLessThan(2);
  });

  test("keyboard: Tab, arrows, Enter, Escape, Escape", async ({ page }) => {
    await openMap(page);
    await page.keyboard.press("Tab");
    const astronaut = page.getByTestId("astronaut");
    await expect(astronaut).toBeFocused();
    await expect(astronaut).toHaveAccessibleName(/station 1: Problem statement/);

    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(astronaut).toHaveAccessibleName(/station 3: Technical feasibility/);
    const card = page.getByTestId("preview-card");
    await expect(card).toContainText("#3 Technical feasibility / spike");

    // The card never covers the planet.
    const cardBox = (await card.boundingBox())!;
    const planetBox = (await page.locator('[data-station="3"]').boundingBox())!;
    const covers =
      cardBox.x < planetBox.x + planetBox.width &&
      planetBox.x < cardBox.x + cardBox.width &&
      cardBox.y < planetBox.y + planetBox.height &&
      planetBox.y < cardBox.y + cardBox.height;
    expect(covers).toBe(false);

    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: /Technical feasibility/ });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Close station" })).toBeFocused();
    expect(await seriousViolations(page)).toEqual([]);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(astronaut).toBeFocused();
    await expect(card).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(card).toBeHidden();
    await expect(astronaut).toBeFocused();
  });

  test("'Enter station →' on the card opens the panel", async ({ page }) => {
    await openMap(page);
    await page.getByTestId("astronaut").focus();
    await page.keyboard.press("ArrowRight");
    expect(await seriousViolations(page)).toEqual([]);
    await page.getByRole("button", { name: "Enter station →" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("the recommended next station glows", async ({ page }) => {
    await openMap(page);
    await expect(page.locator('[data-station="1"]')).toHaveAttribute("data-recommended", "true");
  });
});

test.describe("astronaut on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("tapping a planet moves the astronaut there and shows the card", async ({ page }) => {
    await openMap(page);
    const target = await center(page, '[data-station="3"]');
    await page.touchscreen.tap(target.x, target.y);
    await expect.poll(() => current(page)).toBe(3);
    const card = page.getByTestId("preview-card");
    await expect(card).toContainText("Technical feasibility");
    const box = (await card.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
  });

  test("tapping a locked planet shows 'Coming soon'", async ({ page }) => {
    await openMap(page);
    const target = await center(page, '[data-station="5"]');
    await page.touchscreen.tap(target.x, target.y);
    await expect(page.getByTestId("preview-card")).toContainText("Coming soon");
  });

  test("the page never scrolls sideways", async ({ page }) => {
    await openMap(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
