import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
// Vercel's toolbar (comments, feedback) on preview deployments only, e.g. for UAT.
const toolbar = process.env.VERCEL_ENV === "preview" ? " https://vercel.live" : "";

// Security headers in every environment (AOS-1.7). The CSP has no nonces, so pages stay static
// and prerendered ("Without Nonces" in the Next.js CSP guide). New Relic's agent is the only
// third party: its script host and its data endpoint are allowed.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://js-agent.newrelic.com${toolbar}${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'${toolbar}`,
  `img-src 'self' blob: data:${toolbar}${toolbar && " https://vercel.com"}`,
  `font-src 'self'${toolbar}${toolbar && " https://assets.vercel.com"}`,
  `connect-src 'self' https://bam.nr-data.net${toolbar}${toolbar && " wss://ws-us3.pusher.com"}`,
  ...(toolbar ? [`frame-src${toolbar}`] : []),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

export const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  // A self-contained server for the Docker image (AOS-1.6). Vercel ignores this setting.
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
