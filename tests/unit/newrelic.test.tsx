import { fireEvent, render } from "@testing-library/react";
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

  it("tags events with this deployment's release, for canary comparisons", () => {
    vi.stubEnv("NEXT_PUBLIC_NEW_RELIC", "on");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA", "9b28d36abcdef");
    const setCustomAttribute = vi.fn();
    window.newrelic = { addPageAction: vi.fn(), setCustomAttribute };
    const { getByTestId } = render(<NewRelicAgent />);
    fireEvent.click(getByTestId("nr-loader"));
    expect(setCustomAttribute).toHaveBeenCalledWith("release", "9b28d36");
    delete window.newrelic;
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
