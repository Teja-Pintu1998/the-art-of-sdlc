// Analytics helper (created in AOS-4/5, connected to New Relic in AOS-10.1, ADR-5).
// Anonymous, cookie-free and storage-free: events become New Relic page actions when the browser
// agent is loaded, and are a no-op otherwise (local development, tests, ad blockers).

export type AnalyticsEvent =
  | { name: "station_completed"; station: number }
  | { name: "phase1_completed" }
  | { name: "rank_reached"; rank: string }
  | { name: "feedback_given"; station: number; helpful: boolean };

type NewRelicAgent = {
  addPageAction: (name: string, attributes?: Record<string, string | number | boolean>) => void;
  setCustomAttribute?: (name: string, value: string | number | boolean) => void;
};

declare global {
  interface Window {
    newrelic?: NewRelicAgent;
  }
}

export function track(event: AnalyticsEvent) {
  const { name, ...attributes } = event;
  try {
    window.newrelic?.addPageAction(name, attributes);
  } catch {
    // Analytics must never break the app.
  }
}
