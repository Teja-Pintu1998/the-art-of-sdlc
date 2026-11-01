import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "@/proxy";

const run = (path: string) => proxy(new NextRequest(new URL(path, "http://localhost")));

describe("proxy: station addresses", () => {
  it("lets known stations through", () => {
    expect(run("/station/problem-statement").headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("rewrites unknown stations to the 404 page", () => {
    expect(run("/station/nope").headers.get("x-middleware-rewrite")).toContain(
      "/_station-not-found",
    );
  });
});
