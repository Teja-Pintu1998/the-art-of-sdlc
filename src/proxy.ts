import { type NextRequest, NextResponse } from "next/server";

import { STATIONS } from "@/lib/map/stations";
import {
  BUCKET_COOKIE,
  BUCKET_MAX_AGE,
  bucketOf,
  canaryConfig,
  inCanary,
} from "@/lib/release/canary";

// Unknown /station/<slug> addresses must be real 404s. With Cache Components the page streams
// before notFound() runs, which keeps a 200 status; checking here, before rendering, fixes that.
const SLUGS = new Set(STATIONS.map((s) => s.slug));

const decode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return null; // malformed encoding, e.g. /station/%E0: not a station
  }
};

function stationCheck(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/station/")) return NextResponse.next();
  const slug = decode(pathname.split("/")[2] ?? "");
  if (slug !== null && SLUGS.has(slug) && pathname.split("/").length === 3)
    return NextResponse.next();
  // No route matches this path, so Next.js serves its 404 page with a 404 status.
  return NextResponse.rewrite(new URL("/_station-not-found", request.url));
}

export function proxy(request: NextRequest) {
  const canary = canaryConfig(process.env);
  if (!canary) return stationCheck(request); // canary off: no cookie, nothing changes

  const { bucket, isNew } = bucketOf(request.cookies.get(BUCKET_COOKIE)?.value);
  let response: NextResponse;
  if (inCanary(bucket, canary.percent)) {
    // Serve this request (page, data or static file) from the new version's deployment.
    const target = new URL(request.nextUrl.pathname + request.nextUrl.search, canary.url);
    const headers = new Headers(request.headers);
    if (canary.bypassSecret) headers.set("x-vercel-protection-bypass", canary.bypassSecret);
    response = NextResponse.rewrite(target, { request: { headers } });
    response.headers.set("x-aos-release", "canary");
  } else {
    response = stationCheck(request);
    response.headers.set("x-aos-release", "stable");
  }
  if (isNew) {
    // Strictly necessary and anonymous: only a number that keeps the visitor on one version.
    response.cookies.set(BUCKET_COOKIE, String(bucket), {
      maxAge: BUCKET_MAX_AGE,
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
    });
  }
  return response;
}

export const config = {
  // Everything (canary visitors need every file from the new version) except image optimisation.
  matcher: "/((?!_next/image).*)",
};
