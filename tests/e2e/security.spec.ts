import { expect, test } from "@playwright/test";

// AOS-1.7: security headers on every response, and the CSP doesn't break the app.

const REQUIRED = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
];

test.describe("security headers", () => {
  for (const path of ["/", "/station/git", "/lessons/git"]) {
    test(`are set on ${path}`, async ({ request }) => {
      const headers = (await request.get(path)).headers();
      for (const name of REQUIRED) expect(headers[name], name).toBeTruthy();
      expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
      expect(headers["x-content-type-options"]).toBe("nosniff");
    });
  }

  test("the CSP blocks nothing the app needs", async ({ page }) => {
    const violations: string[] = [];
    page.on("console", (m) => {
      if (/Content.Security.Policy|Refused to/i.test(m.text())) violations.push(m.text());
    });
    await page.goto("/");
    await page.getByTestId("astronaut").focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog").getByRole("heading", { level: 3 })).toHaveCount(8);
    expect(violations).toEqual([]);
  });
});
