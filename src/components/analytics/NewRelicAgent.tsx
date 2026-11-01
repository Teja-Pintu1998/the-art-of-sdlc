"use client";

import Script from "next/script";

import {
  NEW_RELIC,
  newRelicConfigScript,
  newRelicEnabled,
  releaseName,
} from "@/lib/analytics/newrelic";

/**
 * Loads the New Relic browser agent on the deployed site only (AOS-10.1). The configuration runs
 * first, then the agent loads asynchronously after hydration.
 */
export function NewRelicAgent() {
  if (!newRelicEnabled()) return null;
  return (
    <>
      <Script id="nr-config" strategy="afterInteractive">
        {newRelicConfigScript()}
      </Script>
      {/* Must come after the config. Async, so it doesn't block the page, but early enough to
          catch errors and events from the first interactions. */}
      <Script
        id="nr-loader"
        src={NEW_RELIC.loaderUrl}
        strategy="afterInteractive"
        // Tag every event with this deployment's version, so a canary can be compared with stable.
        onLoad={() => window.newrelic?.setCustomAttribute?.("release", releaseName())}
      />
    </>
  );
}
