import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
