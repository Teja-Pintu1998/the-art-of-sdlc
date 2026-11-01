// New Relic browser agent settings (AOS-10.1, ADR-5). These values are public: the browser agent
// sends them to New Relic from every visitor's browser. The secret user API key is only used by
// Terraform (infra/newrelic) and never appears here.

export const NEW_RELIC = {
  accountID: "8688649",
  trustKey: "8688649",
  agentID: "653457490",
  applicationID: "653457490",
  licenseKey: "NRJS-6e6a87a5177c8d80217",
  /** Pinned so a New Relic release can't change our site without a commit. */
  loaderUrl: "https://js-agent.newrelic.com/nr-loader-spa-1.324.1.min.js",
} as const;

/**
 * Agent only on the real site: set NEXT_PUBLIC_NEW_RELIC=on when building for deployment. Local
 * previews and tests don't send data, so our own clicking never pollutes the KPIs.
 */
export const newRelicEnabled = () => process.env.NEXT_PUBLIC_NEW_RELIC === "on";

/** The agent's configuration script. Anonymous: no cookies, no browser storage, no replays. */
export function newRelicConfigScript(): string {
  const { accountID, trustKey, agentID, applicationID, licenseKey } = NEW_RELIC;
  const init = {
    privacy: { cookies_enabled: false },
    session_replay: { enabled: false },
    session_trace: { enabled: false },
    distributed_tracing: { enabled: false },
    ajax: { deny_list: ["bam.nr-data.net"] },
  };
  const loaderConfig = { accountID, trustKey, agentID, licenseKey, applicationID };
  const info = {
    beacon: "bam.nr-data.net",
    errorBeacon: "bam.nr-data.net",
    licenseKey,
    applicationID,
    sa: 1,
  };
  return [
    "window.NREUM=window.NREUM||{};",
    `window.NREUM.init=${JSON.stringify(init)};`,
    `window.NREUM.loader_config=${JSON.stringify(loaderConfig)};`,
    `window.NREUM.info=${JSON.stringify(info)};`,
  ].join("");
}
