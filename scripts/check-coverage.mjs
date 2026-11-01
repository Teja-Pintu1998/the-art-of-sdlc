// Fails if coverage dropped below the committed baseline (coverage/coverage-baseline.json).
// Update the baseline with `npm run coverage:baseline` when coverage legitimately rises.
import { readFileSync } from "node:fs";

const read = (path) => JSON.parse(readFileSync(path, "utf8")).total;
const current = read("coverage/coverage-summary.json");
const baseline = read("coverage/coverage-baseline.json");

const TOLERANCE = 0.5; // percentage points, to absorb rounding noise
const drops = ["lines", "branches", "functions", "statements"]
  .map((key) => ({ key, now: current[key].pct, base: baseline[key].pct }))
  .filter(({ now, base }) => now + TOLERANCE < base);

for (const { key, now, base } of drops) {
  console.error(`Coverage dropped: ${key} ${now}% < baseline ${base}%`);
}
if (drops.length > 0) process.exit(1);
console.log("Coverage is at or above the baseline.");
