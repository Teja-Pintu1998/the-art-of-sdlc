import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NewRelicAgent } from "@/components/analytics/NewRelicAgent";
import { NEW_RELIC, newRelicConfigScript } from "@/lib/analytics/newrelic";

vi.mock("next/script", () => ({
  default: ({
    id,
    src,
    children,
    onLoad,
  }: {
    id: string;
    src?: string;
    children?: string;
    onLoad?: () => void;
  }) => (
    <script data-testid={id} data-src={src} onClick={onLoad}>
      {children}
    </script>
  ),
}));

describe("New Relic browser agent (AOS-10.1)", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("isn't loaded in local previews or tests", () => {
    vi.stubEnv("NEXT_PUBLIC_NEW_RELIC", "");
    const { container } = render(<NewRelicAgent />);
    expect(container).toBeEmptyDOMElement();
  });

  it("needs exactly 'on'", () => {
    vi.stubEnv("NEXT_PUBLIC_NEW_RELIC", "true");
    expect(render(<NewRelicAgent />).container).toBeEmptyDOMElement();
  });

  it("loads the pinned agent with our app's settings on the real site", () => {
    vi.stubEnv("NEXT_PUBLIC_NEW_RELIC", "on");
    const { getByTestId } = render(<NewRelicAgent />);
    expect(getByTestId("nr-loader")).toHaveAttribute("data-src", NEW_RELIC.loaderUrl);
    expect(getByTestId("nr-config").textContent).toBe(newRelicConfigScript());
  });

  // Runs the config script and returns the release attribute every event is tagged with.
  const releaseAttribute = () => {
    const run = new Function("window", `${newRelicConfigScript()}; return window.NREUM;`);
    return (run({}) as { info: { jsAttributes: unknown } }).info.jsAttributes;
  };

  it("tags every event, from the first, with this deployment's release (canary comparisons)", () => {
    vi.stubEnv("NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA", "9b28d36abcdef");
    expect(releaseAttribute()).toEqual({ release: "9b28d36" });
  });

  it("tags local builds as 'local'", () => {
    vi.stubEnv("NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA", "");
    expect(releaseAttribute()).toEqual({ release: "local" });
  });

  it("is anonymous: no cookies, no session replay or traces", () => {
    const run = new Function("window", `${newRelicConfigScript()}; return window.NREUM;`);
    const nreum = run({}) as Record<string, Record<string, unknown>>;
    expect(nreum.init).toMatchObject({
      privacy: { cookies_enabled: false },
      session_replay: { enabled: false },
      session_trace: { enabled: false },
      distributed_tracing: { enabled: false },
    });
    expect(nreum.loader_config).toMatchObject({ applicationID: "653457490", accountID: "8688649" });
  });
});
