import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Unit tests (Vitest + React Testing Library). E2E and visual tests use Playwright.
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/unit/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      // The root layout only wires fonts and metadata; it's covered by E2E tests.
      exclude: ["src/app/layout.tsx"],
      reporter: ["text", "json-summary", "html"],
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
    },
  },
});
