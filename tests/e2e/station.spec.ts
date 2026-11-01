import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const current = (page: Page) => page.evaluate(() => window.__aosMap!.getCurrentStation());

async function visit(page: Page, path: string) {
  await page.goto(path);
  await page.waitForFunction(() => !!window.__aosMap);
}

/** Saves progress as the app does, before the page loads. */
async function seedProgress(page: Page, completed: string[], lastStation: string | null = null) {
  await page.addInitScript(
    ([c, l]) => {
      if (!sessionStorage.getItem("seeded")) {
        sessionStorage.setItem("seeded", "1");
        localStorage.setItem(
          "aos-progress",
          JSON.stringify({
            version: 1,
            state: { completed: c, lastStation: l, highestRank: "intern", onboardingSeen: true },
          }),
        );
      }
    },
    [completed, lastStation] as const,
  );
}

test.describe("station pages and lessons (AOS-4)", () => {
  test("/station/<slug> opens the lesson with its own title and description", async ({ page }) => {
    await visit(page, "/station/problem-statement");
    await expect(page).toHaveTitle("Problem statement / business case · The Art of SDLC");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /Agree on the problem/,
    );
    const panel = page.getByRole("dialog");
    await expect(panel.getByRole("heading", { level: 3 })).toHaveCount(8);
    expect(await current(page)).toBe(1);
    await expect(page.getByTestId("preview-card")).toHaveCount(0); // the card is skipped
  });

  test("the lesson is in the pre-built HTML (SEO)", async ({ request }) => {
    const html = await (await request.get("/station/problem-statement")).text();
    expect(html).toContain("Say this in your interview");
    expect(html).toContain("QuickBite");
  });

  test("the home page carries no lesson HTML; lessons load on demand", async ({
    page,
    request,
  }) => {
    const home = await (await request.get("/")).text();
    expect(home).not.toContain("Say this in your interview");
    const json = await (await request.get("/lessons/prd")).json();
    expect(json.sections).toHaveLength(8);

    await visit(page, "/");
    await page.getByTestId("astronaut").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog").getByRole("heading", { level: 3 })).toHaveCount(8);
  });

  test("an unknown station is a 404", async ({ request }) => {
    expect((await request.get("/station/not-a-station")).status()).toBe(404);
  });

  test("Next/Previous and Close keep the address bar in sync", async ({ page }) => {
    await visit(page, "/");
    await page.getByTestId("astronaut").focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/station\/problem-statement$/);
    await page.getByRole("button", { name: /Next/ }).click();
    await expect(page).toHaveURL(/\/station\/prd$/);
    await expect(page.getByRole("dialog")).toContainText("PRD creation");
    await page.getByRole("button", { name: "Close station" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("nothing on the map sits on top of an open lesson", async ({ page }) => {
    await visit(page, "/station/problem-statement");
    const covered = await page.evaluate(() =>
      ["Search", "Knowledge base"].map((label) => {
        const b = [...document.querySelectorAll("button")].find((el) =>
          el.textContent?.includes(label),
        )!;
        const r = b.getBoundingClientRect();
        const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return !b.contains(top);
      }),
    );
    expect(covered).toEqual([true, true]);
    await page.getByRole("button", { name: "Close station" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("feedback prompt thanks the learner", async ({ page }) => {
    await visit(page, "/station/problem-statement");
    await page.getByRole("button", { name: "Yes, helpful" }).click();
    await expect(page.getByRole("status")).toHaveText("Thanks for the feedback!");
  });

  test.describe("on a 375px phone", () => {
    test.use({ viewport: { width: 375, height: 740 } });

    test("no sideways scrolling and body text is at least 16px", async ({ page }) => {
      await visit(page, "/station/problem-statement");
      const m = await page.evaluate(() => {
        const dialog = document.querySelector("[role=dialog]")!;
        const sizes = [...dialog.querySelectorAll(".lesson p, .lesson li")].map((el) =>
          parseFloat(getComputedStyle(el).fontSize),
        );
        return {
          page: document.documentElement.scrollWidth,
          dialog: dialog.scrollWidth - dialog.clientWidth,
          minFont: Math.min(...sizes),
        };
      });
      expect(m.page).toBeLessThanOrEqual(375);
      expect(m.dialog).toBe(0);
      expect(m.minFont).toBeGreaterThanOrEqual(16);
    });

    test("the progress box doesn't cover the mini-map", async ({ page }) => {
      await visit(page, "/");
      const hud = (await page.getByTestId("progress-hud").boundingBox())!;
      const mini = (await page.getByTestId("mini-map").boundingBox())!;
      expect(hud.y + hud.height).toBeLessThanOrEqual(mini.y);
    });
  });

  test("no serious accessibility issues with the lesson open", async ({ page }) => {
    await visit(page, "/station/problem-statement");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    const serious = results.violations.filter((v) => ["serious", "critical"].includes(v.impact!));
    expect(serious.map((v) => v.id)).toEqual([]);
  });
});

test.describe("progress and ranks (AOS-5)", () => {
  test("the completed check badge is drawn above the planet, not hidden behind it", async ({
    page,
  }) => {
    await seedProgress(page, ["problem-statement"]);
    await visit(page, "/");
    const planet = page.locator('[data-station="1"]');
    await expect(planet).toHaveAttribute("data-completed", "true");
    // The planet body is an absolutely positioned child; without a z-index the ✓ (::before) is
    // painted first and the body covers it (QA review blocker).
    const badge = await planet.evaluate((el) => {
      const s = getComputedStyle(el, "::before");
      return { content: s.content, zIndex: s.zIndex };
    });
    expect(badge).toEqual({ content: '"✓"', zIndex: "1" });
  });

  test("completion is saved: survives a reload, with the badge and the last station", async ({
    page,
  }) => {
    await visit(page, "/station/problem-statement");
    await page.getByRole("button", { name: "Mark as complete" }).click();
    await page.getByRole("button", { name: /Next/ }).click();
    await page.reload();
    await page.waitForFunction(() => !!window.__aosMap);
    await expect(page.getByTestId("progress-count")).toHaveText("1/14");
    await expect(page.locator('[data-station="1"]')).toHaveAttribute("data-completed", "true");

    await visit(page, "/");
    expect(await current(page)).toBe(2); // starts where the learner left off
  });

  test("rank-up celebration types the command; Escape returns focus", async ({ page }) => {
    await seedProgress(page, ["prd", "technical-feasibility", "epics-and-stories"]);
    await visit(page, "/station/problem-statement");
    await page.getByRole("button", { name: "Mark as complete" }).click();
    const dialog = page.getByTestId("celebration");
    await expect(dialog).toContainText("You're now Junior");
    await expect(dialog).toContainText("git checkout -b junior");
    await expect(page.getByTestId("rank")).toHaveText("Junior");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId("mark-complete")).toBeFocused();
    await expect(page.getByRole("dialog")).toBeVisible(); // the lesson stays open
  });

  test("reset asks for confirmation, then clears progress", async ({ page }) => {
    await seedProgress(page, ["problem-statement"]);
    await visit(page, "/");
    await page.getByRole("button", { name: "Reset" }).click();
    await page.getByRole("button", { name: "Reset progress" }).click();
    await expect(page.getByTestId("progress-count")).toHaveText("0/14");
    await page.reload();
    await expect(page.getByTestId("progress-count")).toHaveText("0/14");
  });
});
