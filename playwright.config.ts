import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

// E2E tests run on all three engines (PRD browser support). Visual tests run on Chromium only,
// because screenshots differ between engines and operating systems.
export default defineConfig({
  testDir: "tests",
  testMatch: ["e2e/**/*.spec.ts", "visual/**/*.spec.ts"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  // Screenshots are stored per platform, since fonts render differently on macOS and Linux (CI).
  snapshotPathTemplate: "{testDir}/__screenshots__/{platform}/{testFilePath}/{arg}{ext}",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    // The onboarding intro (AOS-6.1) is marked as seen, so it doesn't cover the map in other tests.
    // tests/e2e/discovery.spec.ts starts without it to test the intro itself.
    storageState: {
      cookies: [],
      origins: [
        {
          origin: `http://localhost:${PORT}`,
          localStorage: [
            {
              name: "aos-progress",
              value: JSON.stringify({
                version: 1,
                state: {
                  completed: [],
                  lastStation: null,
                  highestRank: "intern",
                  onboardingSeen: true,
                },
              }),
            },
          ],
        },
      ],
    },
  },
  projects: [
    { name: "chromium", testDir: "tests/e2e", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", testDir: "tests/e2e", use: { ...devices["Desktop Safari"] } },
    { name: "firefox", testDir: "tests/e2e", use: { ...devices["Desktop Firefox"] } },
    { name: "visual", testDir: "tests/visual", use: { ...devices["Desktop Chrome"] } },
  ],
  // Tests run against the production build, like users see it.
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
