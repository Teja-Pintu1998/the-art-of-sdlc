import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { proxy } from "@/proxy";

const run = (path: string) => proxy(new NextRequest(new URL(path, "http://localhost")));

describe("proxy: station addresses", () => {
  it("lets known stations through", () => {
    expect(run("/station/problem-statement").headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("rewrites unknown and malformed stations to the 404 page", () => {
    for (const path of ["/station/nope", "/station/%E0", "/station/%"]) {
      expect(run(path).headers.get("x-middleware-rewrite")).toContain("/_station-not-found");
    }
  });
});

describe("proxy: canary release (AOS-1.7)", () => {
  const CANARY = "https://the-art-of-sdlc-new-rover19.vercel.app";
  const withCookie = (path: string, bucket?: string) => {
    const req = new NextRequest(new URL(path, "https://the-art-of-sdlc.vercel.app"));
    if (bucket !== undefined) req.cookies.set("aos-canary-bucket", bucket);
    return proxy(req);
  };
  afterEach(() => vi.unstubAllEnvs());

  it("is off by default: no cookie, no routing", () => {
    const res = withCookie("/");
    expect(res.headers.get("x-aos-release")).toBeNull();
    expect(res.cookies.get("aos-canary-bucket")).toBeUndefined();
  });

  it("sends visitors in a low bucket to the canary, with the bypass secret", () => {
    vi.stubEnv("CANARY_URL", CANARY);
    vi.stubEnv("CANARY_PERCENT", "10");
    vi.stubEnv("VERCEL_AUTOMATION_BYPASS_SECRET", "s3cret");
    const res = withCookie("/station/git?x=1", "3");
    expect(res.headers.get("x-aos-release")).toBe("canary");
    expect(res.headers.get("x-middleware-rewrite")).toBe(`${CANARY}/station/git?x=1`);
    expect(res.headers.get("x-middleware-request-x-vercel-protection-bypass")).toBe("s3cret");
    expect(res.cookies.get("aos-canary-bucket")).toBeUndefined(); // already had one
  });

  it("keeps everyone else on stable, and still checks station addresses", () => {
    vi.stubEnv("CANARY_URL", CANARY);
    vi.stubEnv("CANARY_PERCENT", "10");
    expect(withCookie("/", "10").headers.get("x-aos-release")).toBe("stable");
    const unknown = withCookie("/station/nope", "50");
    expect(unknown.headers.get("x-middleware-rewrite")).toContain("/_station-not-found");
  });

  it("gives a new visitor a sticky, anonymous bucket cookie", () => {
    vi.stubEnv("CANARY_URL", CANARY);
    vi.stubEnv("CANARY_PERCENT", "50");
    const cookie = withCookie("/").cookies.get("aos-canary-bucket");
    expect(Number(cookie?.value)).toBeGreaterThanOrEqual(0);
    expect(Number(cookie?.value)).toBeLessThan(100);
    expect(cookie).toMatchObject({ httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  });
});
