import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Journey } from "@/components/Journey";
import { loadKnowledgeBase } from "@/lib/content/knowledge-base";
import { loadLessons } from "@/lib/content/lessons";
import { SECTION_HEADINGS } from "@/lib/content/sections";
import { STATIONS, V1_STATION_IDS } from "@/lib/map/stations";
import { INITIAL_PROGRESS, PROGRESS_KEY, useProgress } from "@/lib/progress/store";

const lessons = loadLessons();
const articles = loadKnowledgeBase();
const slug = (id: number) => STATIONS[id - 1]!.slug;

const renderJourney = (routeStationId?: number) =>
  render(
    <Journey
      lessons={lessons}
      articles={articles}
      availableIds={V1_STATION_IDS}
      routeStationId={routeStationId}
    >
      <h1>The Art of SDLC</h1>
    </Journey>,
  );

const openStation1 = () => {
  renderJourney();
  act(() => screen.getByTestId("astronaut").focus());
  fireEvent.keyDown(screen.getByTestId("astronaut"), { key: "Enter" });
  return screen.getByRole("dialog");
};
const markButton = () => screen.getByRole("button", { name: /Mark as complete|Completed/ });
const addPageAction = vi.fn();

beforeEach(() => {
  localStorage.clear();
  useProgress.setState({ ...INITIAL_PROGRESS, onboardingSeen: true });
  window.history.replaceState(null, "", "/");
  window.newrelic = { addPageAction };
});
afterEach(() => {
  addPageAction.mockReset();
  delete window.newrelic;
});

describe("station panel (AOS-4.2)", () => {
  it("renders the 8 sections with the bridges to the previous and next station", () => {
    const panel = openStation1();
    const headings = within(panel)
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(headings).toEqual([...SECTION_HEADINGS]);
    expect(within(panel).getByText("Where we are:")).toBeInTheDocument();
    expect(within(panel).getByText("Next:")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/station/problem-statement");
  });

  it("interview mode shows only the interview sections (AOS-4.5)", () => {
    const panel = openStation1();
    fireEvent.click(within(panel).getByRole("button", { name: /Interview mode/ }));
    expect(
      within(panel)
        .getAllByRole("heading", { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(["Say this in your interview", "Interview questions you'll get"]);
  });

  it("Previous/Next move between available stations; a lesson in progress can't be completed", () => {
    const panel = openStation1();
    expect(within(panel).queryByRole("button", { name: /Previous/ })).toBeNull();
    fireEvent.click(within(panel).getByRole("button", { name: /Next/ }));
    expect(screen.getByRole("dialog")).toHaveTextContent("#2 PRD creation");
    expect(screen.getByTestId("lesson-pending")).toBeInTheDocument();
    expect(markButton()).toBeDisabled();
    expect(window.location.pathname).toBe("/station/prd");
    expect(useProgress.getState().lastStation).toBe("prd");

    fireEvent.click(screen.getByRole("button", { name: /Previous/ }));
    expect(screen.getByRole("dialog")).toHaveTextContent("#1 Problem statement");
    fireEvent.click(screen.getByRole("button", { name: "Close station" }));
    expect(window.location.pathname).toBe("/");
  });

  it("asks for feedback once and sends the event (AOS-4.4)", () => {
    openStation1();
    fireEvent.click(screen.getByRole("button", { name: "Yes, helpful" }));
    expect(screen.getByRole("status")).toHaveTextContent("Thanks");
    expect(addPageAction).toHaveBeenCalledWith("feedback_given", { station: 1, helpful: true });
  });
});

describe("progress and ranks (AOS-5)", () => {
  it("marks a station complete: button, planet badge and progress bar", () => {
    openStation1();
    fireEvent.click(markButton());
    expect(markButton()).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
    expect(screen.getByTestId("progress-count")).toHaveTextContent("1/14");
    expect(screen.getAllByTestId("planet").find((p) => p.dataset.station === "1")).toHaveAttribute(
      "data-completed",
      "true",
    );
    expect(addPageAction).toHaveBeenCalledWith("station_completed", { station: 1 });

    fireEvent.click(markButton()); // undo
    expect(screen.getByTestId("progress-count")).toHaveTextContent("0/14");
  });

  it("celebrates Junior at 4 stations, tracks Phase 1, and returns focus on close", () => {
    useProgress.setState({ completed: [slug(2), slug(3), slug(4)] });
    openStation1();
    fireEvent.click(markButton());

    const dialog = screen.getByTestId("celebration");
    expect(dialog).toHaveTextContent("You're now Junior");
    expect(dialog).toHaveTextContent("git checkout -b junior");
    expect(screen.getByTestId("rank")).toHaveTextContent("Junior");
    expect(addPageAction).toHaveBeenCalledWith("phase1_completed", {});
    expect(addPageAction).toHaveBeenCalledWith("rank_reached", { rank: "junior" });
    expect(within(dialog).getByRole("button", { name: "Keep exploring" })).toHaveFocus();

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByTestId("celebration")).toBeNull();
    expect(screen.getByRole("dialog")).toBeInTheDocument(); // the panel stays open
    expect(markButton()).toHaveFocus();
  });

  it("reaching Senior shows the journey summary", () => {
    const others = V1_STATION_IDS.filter((id) => id !== 1).map(slug);
    useProgress.setState({ completed: others, highestRank: "mid" });
    openStation1();
    fireEvent.click(markButton());
    expect(screen.getByTestId("celebration")).toHaveTextContent('git commit -m "became senior"');
    expect(screen.getByTestId("journey-summary")).toHaveTextContent("14 of 14 stations completed");
    expect(screen.getByText("Journey complete")).toBeInTheDocument();
  });

  it("reset asks first, then clears progress (AOS-5.4)", () => {
    useProgress.setState({ completed: [slug(1)] });
    renderJourney();
    const reset = screen.getByRole("button", { name: "Reset" });
    fireEvent.click(reset);
    fireEvent.keyDown(screen.getByTestId("reset-dialog"), { key: "Escape" });
    expect(screen.queryByTestId("reset-dialog")).toBeNull();
    fireEvent.click(reset);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByTestId("progress-count")).toHaveTextContent("1/14");
    expect(reset).toHaveFocus();

    fireEvent.click(reset);
    fireEvent.click(screen.getByRole("button", { name: "Reset progress" }));
    expect(screen.getByTestId("progress-count")).toHaveTextContent("0/14");
    expect(screen.queryByRole("button", { name: "Reset" })).toBeNull();
  });
});

describe("start station (AOS-4.3, AOS-5.2)", () => {
  it("starts at the last visited station from saved progress", async () => {
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({
        version: 1,
        state: { ...INITIAL_PROGRESS, lastStation: "technical-feasibility" },
      }),
    );
    await useProgress.persist.rehydrate();
    renderJourney();
    expect(window.__aosMap!.getCurrentStation()).toBe(3);
  });

  it("a station address opens its panel straight away", () => {
    renderJourney(1);
    expect(screen.getByRole("dialog")).toHaveTextContent("#1 Problem statement");
  });

  it("a locked station's address shows its card instead", () => {
    renderJourney(5);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByTestId("preview-card")).toHaveTextContent("Coming soon");
  });
});

const canaryId = STATIONS.find((s) => s.slug === "canary")!.id;

describe("search / quick jump (AOS-6.2)", () => {
  it('"/" opens search; typing "canary" and Enter moves the astronaut there', () => {
    renderJourney();
    fireEvent.keyDown(document.body, { key: "/" });
    const input = screen.getByRole("combobox", { name: "Search stations" });
    expect(input).toHaveFocus();
    fireEvent.change(input, { target: { value: "canary" } });
    expect(screen.getAllByRole("option")[0]).toHaveTextContent("Canary deployment");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.queryByTestId("search-dialog")).toBeNull();
    expect(window.__aosMap!.getCurrentStation()).toBe(canaryId);
    expect(screen.getByTestId("astronaut")).toHaveFocus();
    expect(screen.getByTestId("preview-card")).toHaveTextContent("Canary deployment");
  });

  it("arrow keys choose a result, a click jumps, and no match says so", () => {
    renderJourney();
    fireEvent.click(screen.getByRole("button", { name: /Search/ }));
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.keyDown(input, { key: "ArrowUp" }); // wraps to the last result
    expect(screen.getAllByRole("option").at(-1)).toHaveAttribute("aria-selected", "true");
    fireEvent.click(screen.getAllByRole("option")[1]!);
    expect(window.__aosMap!.getCurrentStation()).toBe(2);

    fireEvent.click(screen.getByRole("button", { name: /Search/ }));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "zebra" } });
    expect(screen.getByRole("status")).toHaveTextContent("No station matches");
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" }); // nothing to choose
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    expect(screen.getByTestId("search-dialog")).toBeInTheDocument();
  });

  it("hovering a result selects it", () => {
    renderJourney();
    fireEvent.click(screen.getByRole("button", { name: /Search/ }));
    fireEvent.mouseEnter(screen.getAllByRole("option")[2]!);
    expect(screen.getAllByRole("option")[2]).toHaveAttribute("aria-selected", "true");
  });

  it("Escape closes search and returns focus to the Search button", () => {
    renderJourney();
    const button = screen.getByRole("button", { name: /Search/ });
    fireEvent.click(button);
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });
    expect(screen.queryByTestId("search-dialog")).toBeNull();
    expect(button).toHaveFocus();
  });

  it('"/" is ignored while typing or with a modifier', () => {
    renderJourney();
    fireEvent.keyDown(document.body, { key: "/", ctrlKey: true });
    expect(screen.queryByTestId("search-dialog")).toBeNull();
    fireEvent.keyDown(document.body, { key: "/" });
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "/" });
    expect(screen.getAllByTestId("search-dialog")).toHaveLength(1);
  });
});

describe("knowledge base (AOS-6.3)", () => {
  it("opens from its button, expands a topic, and closes with Escape", () => {
    renderJourney();
    const button = screen.getByRole("button", { name: /Knowledge base/ });
    fireEvent.click(button);
    const kb = screen.getByRole("dialog", { name: "Knowledge base" });
    expect(within(kb).getAllByTestId("kb-article")).toHaveLength(4);
    expect(within(kb).getByRole("button", { name: "Close knowledge base" })).toHaveFocus();
    expect(kb).toHaveTextContent("Sprint planning");
    fireEvent.keyDown(kb, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(button).toHaveFocus();
  });
});

describe("onboarding intro (AOS-6.1)", () => {
  beforeEach(() => useProgress.setState({ onboardingSeen: false }));
  afterEach(() => vi.useRealTimers());

  it("shows once for a new learner and advances through 3 steps in about 10 seconds", () => {
    vi.useFakeTimers();
    renderJourney();
    const intro = screen.getByTestId("onboarding");
    expect(intro).toHaveTextContent("1/3");
    act(() => vi.advanceTimersByTime(3500));
    expect(intro).toHaveTextContent("2/3");
    act(() => vi.advanceTimersByTime(3500));
    expect(intro).toHaveTextContent("3/3");
    act(() => vi.advanceTimersByTime(10_000)); // stays on the last step until dismissed
    fireEvent.click(screen.getByRole("button", { name: "Start exploring" }));
    expect(screen.queryByTestId("onboarding")).toBeNull();
    expect(useProgress.getState().onboardingSeen).toBe(true);
  });

  it("Skip ends it, and Next steps through by hand", () => {
    renderJourney();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByTestId("onboarding")).toHaveTextContent("2/3");
    fireEvent.click(screen.getByRole("button", { name: "Skip intro" }));
    expect(screen.queryByTestId("onboarding")).toBeNull();
  });

  it("ends as soon as the learner moves the astronaut, and isn't shown on station links", () => {
    renderJourney();
    act(() => screen.getByTestId("astronaut").focus());
    fireEvent.keyDown(screen.getByTestId("astronaut"), { key: "ArrowRight" });
    expect(screen.queryByTestId("onboarding")).toBeNull();
    cleanup();

    useProgress.setState({ onboardingSeen: false });
    renderJourney(1);
    expect(screen.queryByTestId("onboarding")).toBeNull();
  });

  it("with reduced motion, the hand stays still and steps wait for Next", () => {
    vi.useFakeTimers();
    const mm = vi.spyOn(window, "matchMedia").mockImplementation(
      (q: string) =>
        ({
          matches: q.includes("reduce"),
          media: q,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
    renderJourney();
    act(() => vi.advanceTimersByTime(8000));
    expect(screen.getByTestId("onboarding")).toHaveTextContent("1/3");
    mm.mockRestore();
  });
});

describe("review fixes", () => {
  it("after a confirmed reset, focus moves to the progress box, not the page", () => {
    useProgress.setState({ completed: [slug(1)] });
    renderJourney();
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset progress" }));
    expect(screen.getByTestId("progress-hud")).toHaveFocus();
  });

  it("a station link records that station as the last visited", () => {
    renderJourney(3);
    expect(useProgress.getState().lastStation).toBe(slug(3));
  });

  it("Escape with focus on the page closes the celebration, not the lesson under it", () => {
    useProgress.setState({ completed: [slug(2), slug(3), slug(4)] });
    openStation1();
    fireEvent.click(markButton());
    act(() => (document.activeElement as HTMLElement).blur());
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(screen.queryByTestId("celebration")).toBeNull();
    expect(screen.getByRole("dialog")).toHaveTextContent("#1 Problem statement");
  });

  it("opening and closing a lesson updates the page title", () => {
    openStation1();
    expect(document.title).toBe("Problem statement / business case · The Art of SDLC");
    fireEvent.click(screen.getByRole("button", { name: "Close station" }));
    expect(document.title).toBe("The Art of SDLC");
  });

  it("still works when browser storage is blocked", async () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    const { hydrateProgress } = await import("@/lib/progress/store");
    expect(() => hydrateProgress()).not.toThrow();
    renderJourney();
    expect(screen.getByTestId("progress-count")).toHaveTextContent("0/14");
    getItem.mockRestore();
  });
});
