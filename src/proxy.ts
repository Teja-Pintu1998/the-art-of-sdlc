import { type NextRequest, NextResponse } from "next/server";

import { STATIONS } from "@/lib/map/stations";

// Unknown /station/<slug> addresses must be real 404s. With Cache Components the page streams
// before notFound() runs, which keeps a 200 status; checking here, before rendering, fixes that.
const SLUGS = new Set(STATIONS.map((s) => s.slug));

export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2] ?? "";
  if (SLUGS.has(decodeURIComponent(slug))) return NextResponse.next();
  // No route matches this path, so Next.js serves its 404 page with a 404 status.
  return NextResponse.rewrite(new URL("/_station-not-found", request.url));
}

export const config = {
  matcher: "/station/:slug",
};
