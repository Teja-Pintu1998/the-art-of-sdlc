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

  it("always serves a visitor's first request from stable, even with a low bucket", () => {
    vi.stubEnv("CANARY_URL", CANARY);
    vi.stubEnv("CANARY_PERCENT", "100"); // every bucket is in the canary
    const res = withCookie("/");
    expect(res.headers.get("x-aos-release")).toBe("stable");
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
    expect(res.cookies.get("aos-canary-bucket")).toBeDefined(); // routed from the next request on
  });

  it("treats an invalid cookie as a new visitor (stable, fresh cookie)", () => {
    vi.stubEnv("CANARY_URL", CANARY);
    vi.stubEnv("CANARY_PERCENT", "100");
    const res = withCookie("/", "abc");
    expect(res.headers.get("x-aos-release")).toBe("stable");
    expect(res.cookies.get("aos-canary-bucket")).toBeDefined();
  });

  it("never lets the request path choose where the bypass secret goes", () => {
    vi.stubEnv("CANARY_URL", CANARY);
    vi.stubEnv("CANARY_PERCENT", "10");
    vi.stubEnv("VERCEL_AUTOMATION_BYPASS_SECRET", "s3cret");
    const req = new NextRequest(new URL("https://the-art-of-sdlc.vercel.app/x"));
    req.nextUrl.pathname = "//evil.example/steal";
    req.cookies.set("aos-canary-bucket", "3");
    const rewrite = new URL(proxy(req).headers.get("x-middleware-rewrite") ?? "");
    expect(rewrite.origin).toBe(CANARY);
    expect(rewrite.pathname).toBe("//evil.example/steal");
  });

  it("doesn't route when CANARY_URL points at this same site (it would loop)", () => {
    vi.stubEnv("CANARY_URL", "https://the-art-of-sdlc.vercel.app");
    vi.stubEnv("CANARY_PERCENT", "100");
    const res = withCookie("/", "0");
    expect(res.headers.get("x-aos-release")).toBe("stable");
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it.each([
    ["another site", "https://evil.example"],
    ["a look-alike host", "https://evil.example/.vercel.app"],
    ["plain http", "http://the-art-of-sdlc-new-rover19.vercel.app"],
    ["not a URL", "nope"],
  ])("ignores a CANARY_URL that is %s (canary off, secret never sent)", (_, url) => {
    vi.stubEnv("CANARY_URL", url);
    vi.stubEnv("CANARY_PERCENT", "100");
    vi.stubEnv("VERCEL_AUTOMATION_BYPASS_SECRET", "s3cret");
    const res = withCookie("/", "0");
    expect(res.headers.get("x-aos-release")).toBeNull();
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
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
