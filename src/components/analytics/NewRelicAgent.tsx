import Script from "next/script";

import { NEW_RELIC, newRelicConfigScript, newRelicEnabled } from "@/lib/analytics/newrelic";

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
      <Script id="nr-loader" src={NEW_RELIC.loaderUrl} strategy="afterInteractive" />
    </>
  );
}
