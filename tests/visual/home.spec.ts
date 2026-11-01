import { expect, test } from "@playwright/test";

// Visual regression: compares the page with a saved screenshot. Zoom-level screenshots of the
// space map (spike lesson L4) are added with the map in AOS-2.3.
test("home page matches the saved screenshot", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("home.png", { fullPage: true });
});
