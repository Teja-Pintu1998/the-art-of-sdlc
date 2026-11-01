import Script from "next/script";

import { NEW_RELIC, newRelicConfigScript, newRelicEnabled } from "@/lib/analytics/newrelic";

/**
 * Loads the New Relic browser agent on the deployed site only (AOS-10.1). The configuration runs
 * first; the agent itself loads when the browser is idle, so it doesn't slow down the page.
 * Page timings (LCP etc.) are still measured, because the browser buffers them.
 */
export function NewRelicAgent() {
  if (!newRelicEnabled()) return null;
  return (
    <>
      <Script id="nr-config" strategy="afterInteractive">
        {newRelicConfigScript()}
      </Script>
      <Script id="nr-loader" src={NEW_RELIC.loaderUrl} strategy="lazyOnload" />
    </>
  );
}
