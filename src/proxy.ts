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
  // A visitor's first request is always stable (it sets the cookie); only returning visitors with a
  // bucket are routed. So cookie-less clients and crawlers never land on the canary.
  const sameHost = canary.url.host === request.nextUrl.host; // misconfigured: would loop
  if (!isNew && !sameHost && inCanary(bucket, canary.percent)) {
    // Serve this request (page, data or static file) from the new version's deployment.
    // The origin always comes from CANARY_URL, never from the request: setting only the path and
    // query means a path like "//evil.example" can't choose where we send the bypass secret.
    const target = new URL(canary.url);
    target.pathname = request.nextUrl.pathname;
    target.search = request.nextUrl.search;
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
  matcher: [
    // Pages and data requests, but not static files (the CDN serves those directly).
    "/((?!_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)",
    // Static files only for visitors with a canary bucket: canary pages need the canary's files.
    { source: "/_next/static/:path*", has: [{ type: "cookie", key: "aos-canary-bucket" }] },
  ],
};
