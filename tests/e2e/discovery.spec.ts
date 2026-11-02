import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

import { PROGRESS_KEY, PROGRESS_VERSION } from "../../src/lib/progress/storage";

async function visit(page: Page, path = "/") {
  await page.goto(path);
  await page.waitForFunction(() => !!window.__aosMap);
}
const current = (page: Page) => page.evaluate(() => window.__aosMap!.getCurrentStation());

test.describe("onboarding intro (AOS-6.1)", () => {
  // A first-time visitor: no saved progress at all.
  test.use({ storageState: { cookies: [], origins: [] } });

  test("shows for a new visitor, can be skipped, and never shows again", async ({ page }) => {
    await visit(page);
    const intro = page.getByTestId("onboarding");
    await expect(intro).toContainText("1/3");
    await expect(page.getByTestId("onboarding-hand")).toBeVisible();
    await page.getByRole("button", { name: "Skip intro" }).click();
    await expect(intro).toHaveCount(0);
    await page.reload();
    await page.waitForFunction(() => !!window.__aosMap);
    await page.waitForTimeout(300);
    await expect(intro).toHaveCount(0);
  });

  // The LCP fix (QA, Sprint 5): the card is in the server HTML, so it shows before JavaScript loads.
  // Blocking the app's script chunks (not its CSS, which lives in the same folder) freezes the page
  // in that pre-hydration state.
  const withoutJs = (page: Page) =>
    page.route(/\/_next\/static\/chunks\/.*\.js(\?|$)/, (r) => r.abort());

  test("is visible before JavaScript loads, for a fast first paint", async ({ page }) => {
    await withoutJs(page);
    await page.goto("/");
    await expect(page.getByTestId("onboarding")).toBeVisible();
    await expect(page.getByTestId("onboarding")).toContainText("Drag the astronaut");
  });

  test("never flashes for a returning visitor, even before JavaScript loads", async ({ page }) => {
    await page.addInitScript(
      ({ key, version }) => {
        const state = {
          completed: [],
          lastStation: null,
          highestRank: "intern",
          onboardingSeen: true,
        };
        localStorage.setItem(key, JSON.stringify({ state, version }));
      },
      { key: PROGRESS_KEY, version: PROGRESS_VERSION },
    );
    await withoutJs(page);
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-onboarded", "");
    await expect(page.getByTestId("onboarding")).toBeHidden();
    await expect(page.getByTestId("onboarding-hand")).toBeHidden();
  });

  test("takes about 10 seconds to reach its last step", async ({ page }) => {
    await page.clock.install();
    await visit(page);
    await page.clock.runFor(7100);
    await expect(page.getByTestId("onboarding")).toContainText("3/3");
    await expect(page.getByRole("button", { name: "Start exploring" })).toBeVisible();
  });

  test("doesn't block the map: moving the astronaut ends it", async ({ page }) => {
    await visit(page);
    await page.getByTestId("astronaut").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("onboarding")).toHaveCount(0);
    expect(await current(page)).toBe(2);
  });
});

test.describe("search (AOS-6.2)", () => {
  test('typing "canary" finds the station and Enter moves the astronaut there', async ({
    page,
  }) => {
    await visit(page);
    await page.keyboard.press("/");
    await page.getByRole("combobox", { name: "Search stations" }).fill("canary");
    await expect(page.getByRole("option").first()).toContainText("Canary deployment");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("search-dialog")).toHaveCount(0);
    await expect.poll(() => current(page)).toBe(29);
    await expect(page.getByTestId("astronaut")).toBeFocused();
    await expect(page.getByTestId("preview-card")).toContainText("Canary deployment");
    // The station landed in view, below the hero.
    const astro = (await page.getByTestId("astronaut").boundingBox())!;
    const heroBottom = await page.evaluate(
      () => document.querySelector("header")!.getBoundingClientRect().bottom,
    );
    expect(astro.y).toBeGreaterThan(heroBottom - 10);
  });

  test("the Search button is reachable and Escape returns focus to it", async ({ page }) => {
    await visit(page);
    const button = page.getByRole("button", { name: /Search/ });
    await button.click();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("search-dialog")).toHaveCount(0);
    await expect(button).toBeFocused();
  });
});

test.describe("knowledge base (AOS-6.3)", () => {
  test("opens from its button, works with the keyboard, closes with Escape", async ({ page }) => {
    await visit(page);
    const button = page.getByRole("button", { name: /Knowledge base/ });
    await button.click();
    const kb = page.getByRole("dialog", { name: "Knowledge base" });
    await expect(kb.getByTestId("kb-article")).toHaveCount(4);
    // Keyboard: Tab to the first topic, Enter expands it.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(kb.getByTestId("kb-article").first()).toHaveAttribute("open", "");
    await expect(kb).toContainText("Sprint planning");
    await page.keyboard.press("Escape");
    await expect(kb).toHaveCount(0);
    await expect(button).toBeFocused();
  });

  test("Close button closes it, and no serious accessibility issues", async ({ page }) => {
    await visit(page);
    await page.getByRole("button", { name: /Knowledge base/ }).click();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    const serious = results.violations.filter((v) => ["serious", "critical"].includes(v.impact!));
    expect(serious.map((v) => v.id)).toEqual([]);
    await page.getByRole("button", { name: "Close knowledge base" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test.describe("on a 375px phone", () => {
    test.use({ viewport: { width: 375, height: 740 } });

    test("toolbar buttons don't overlap the title", async ({ page }) => {
      await visit(page);
      const title = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
      for (const name of [/Search/, /Knowledge base/]) {
        const b = (await page.getByRole("button", { name }).boundingBox())!;
        const overlaps =
          b.x < title.x + title.width &&
          b.x + b.width > title.x &&
          b.y < title.y + title.height &&
          b.y + b.height > title.y;
        expect(overlaps).toBe(false);
      }
    });
  });
});
