import { describe, expect, it } from "vitest";

import { bucketOf, canaryConfig, inCanary } from "@/lib/release/canary";

describe("canaryConfig", () => {
  const url = "https://canary.vercel.app";
  it("is off unless a valid URL and a percentage above 0 are set", () => {
    expect(canaryConfig({})).toBeNull();
    expect(canaryConfig({ CANARY_URL: url })).toBeNull();
    expect(canaryConfig({ CANARY_URL: url, CANARY_PERCENT: "0" })).toBeNull();
    expect(canaryConfig({ CANARY_URL: url, CANARY_PERCENT: "ten" })).toBeNull();
    expect(canaryConfig({ CANARY_URL: "not a url", CANARY_PERCENT: "10" })).toBeNull();
    expect(canaryConfig({ CANARY_URL: "http://canary.example", CANARY_PERCENT: "10" })).toBeNull();
  });

  it("reads the settings, capping the percentage at 100", () => {
    const c = canaryConfig({
      CANARY_URL: url,
      CANARY_PERCENT: "250",
      VERCEL_AUTOMATION_BYPASS_SECRET: "s",
    });
    expect(c).toMatchObject({ percent: 100, bypassSecret: "s" });
    expect(c?.url.href).toBe(`${url}/`);
    expect(
      canaryConfig({ CANARY_URL: "http://localhost:3300", CANARY_PERCENT: "5" })?.percent,
    ).toBe(5);
  });
});

describe("bucketOf / inCanary", () => {
  it("keeps a valid bucket and replaces anything else", () => {
    expect(bucketOf("42")).toEqual({ bucket: 42, isNew: false });
    for (const bad of [undefined, "", "100", "-1", "4.5", "x"]) {
      expect(bucketOf(bad, () => 0.07)).toEqual({ bucket: 7, isNew: true });
    }
  });

  it("puts bucket < percent on the canary, so raising the percentage only adds visitors", () => {
    expect(inCanary(9, 10)).toBe(true);
    expect(inCanary(10, 10)).toBe(false);
    expect(inCanary(10, 50)).toBe(true);
  });
});
