import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Journey } from "@/components/Journey";
import { loadLessons } from "@/lib/content/lessons";
import { SECTION_HEADINGS } from "@/lib/content/sections";
import { STATIONS, V1_STATION_IDS } from "@/lib/map/stations";
import { INITIAL_PROGRESS, PROGRESS_KEY, useProgress } from "@/lib/progress/store";

const lessons = loadLessons();
const slug = (id: number) => STATIONS[id - 1]!.slug;

const renderJourney = (routeStationId?: number) =>
  render(
    <Journey lessons={lessons} availableIds={V1_STATION_IDS} routeStationId={routeStationId}>
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
  useProgress.setState({ ...INITIAL_PROGRESS });
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
