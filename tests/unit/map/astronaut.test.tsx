import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SpaceMap } from "@/components/map/SpaceMap";
import { PLACED_STATIONS } from "@/lib/map/layout";
import { V1_STATION_IDS } from "@/lib/map/stations";

const renderMap = (props: Partial<Parameters<typeof SpaceMap>[0]> = {}) =>
  render(<SpaceMap availableIds={V1_STATION_IDS} {...props} />);

const api = () => window.__aosMap!;
const astronaut = () => screen.getByTestId("astronaut");
const current = () => api().getCurrentStation();
const planet = (id: number) =>
  screen.getAllByTestId("planet").find((el) => el.dataset.station === String(id))!;

type PointerInit = { id?: number; x: number; y: number; button?: number; type?: string };
const pointer = (
  type: string,
  target: Element,
  { id = 1, x, y, button = 0, type: pt = "mouse" }: PointerInit,
) =>
  fireEvent(
    target,
    new PointerEvent(type, {
      pointerId: id,
      clientX: x,
      clientY: y,
      button,
      pointerType: pt,
      bubbles: true,
    }),
  );

const key = (k: string, opts: object = {}) =>
  fireEvent.keyDown(document.activeElement!, { key: k, ...opts });

/** Screen position of a station at the current view. */
const screenOf = (id: number) => {
  const st = PLACED_STATIONS[id - 1]!;
  const v = api().getView();
  return { x: st.x * v.s + v.x, y: st.y * v.s + v.y };
};

function drag(from: { x: number; y: number }, to: { x: number; y: number }) {
  const el = astronaut();
  pointer("pointerdown", el, from);
  pointer("pointermove", el, { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 });
  pointer("pointermove", el, to);
  pointer("pointerup", el, to);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("astronaut: keyboard (AOS-3.3)", () => {
  it("is a focusable button whose label names its station", () => {
    renderMap();
    expect(astronaut()).toHaveAttribute("role", "button");
    expect(astronaut()).toHaveAttribute("tabindex", "0");
    expect(astronaut()).toHaveAccessibleName(/^Astronaut at station 1: Problem statement/);
  });

  it("starts on the current station", () => {
    renderMap({ currentStationId: 10 });
    expect(current()).toBe(10);
    expect(astronaut()).toHaveAccessibleName(/station 10: Git and version control/);
  });

  it("arrow keys move between stations and update the card and announcement", () => {
    renderMap();
    act(() => astronaut().focus());
    key("ArrowRight");
    expect(current()).toBe(2);
    const card = screen.getByTestId("preview-card");
    expect(card).toHaveTextContent("#2 PRD creation and PRD review");
    expect(card).toHaveTextContent("Turn the idea into requirements");
    expect(screen.getByTestId("announcer")).toHaveTextContent(
      "Station 2: PRD creation and PRD review. Press Enter to open it.",
    );
    key("ArrowDown");
    key("ArrowLeft");
    key("ArrowUp");
    key("ArrowUp"); // already at the first station
    expect(current()).toBe(1);
    expect(astronaut()).toHaveAccessibleName(/station 1:/);
  });

  it("Enter opens the station; Escape closes the panel, then the card, returning focus", () => {
    renderMap();
    act(() => astronaut().focus());
    key("ArrowRight");
    key("Enter");
    const dialog = screen.getByRole("dialog", { name: "#2 PRD creation and PRD review" });
    expect(within(dialog).getByRole("button", { name: "Close station" })).toHaveFocus();

    key("Escape");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(astronaut()).toHaveFocus();
    expect(screen.getByTestId("preview-card")).toBeInTheDocument();

    key("Escape");
    expect(screen.queryByTestId("preview-card")).toBeNull();
    expect(astronaut()).toHaveFocus();
    key("Escape"); // nothing left to close
    expect(astronaut()).toHaveFocus();
  });

  it("Space also opens the station", () => {
    renderMap();
    act(() => astronaut().focus());
    key(" ");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("a locked station shows 'Coming soon' on the card and has no panel", () => {
    renderMap({ currentStationId: 5 });
    act(() => astronaut().focus());
    key("Enter");
    expect(screen.queryByRole("dialog")).toBeNull();
    const card = screen.getByTestId("preview-card");
    expect(card).toHaveTextContent("Coming soon");
    expect(within(card).queryByRole("button")).toBeNull();
    key("ArrowRight");
    expect(screen.getByTestId("announcer")).toHaveTextContent(
      "Station 6: Sprint planning. Coming soon.",
    );
  });

  it("other keys do nothing", () => {
    renderMap();
    act(() => astronaut().focus());
    key("a");
    expect(current()).toBe(1);
    expect(screen.queryByTestId("preview-card")).toBeNull();
  });

  it("pans the map when the next station is off screen", () => {
    renderMap();
    act(() => api().setView({ x: 0, y: 0, s: 1 }));
    act(() => astronaut().focus());
    for (let i = 0; i < 9; i++) key("ArrowRight");
    // Every station reached by keyboard stays on screen (at least 80px from the edges).
    const p = screenOf(10);
    expect(p.x).toBeGreaterThanOrEqual(80);
    expect(p.x).toBeLessThanOrEqual(window.innerWidth - 80);
    expect(p.y).toBeGreaterThanOrEqual(80);
    expect(p.y).toBeLessThanOrEqual(window.innerHeight - 80);
    expect(api().getView()).not.toEqual({ x: 0, y: 0, s: 1 });
  });
});

describe("preview card and panel (AOS-3.2)", () => {
  it("'Enter station →' opens the panel; the backdrop closes it", () => {
    renderMap();
    act(() => astronaut().focus());
    key("ArrowRight");
    fireEvent.click(screen.getByRole("button", { name: "Enter station →" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("panel-backdrop"));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(astronaut()).toHaveFocus();
  });

  it("Escape inside the card closes it and returns focus to the astronaut", () => {
    renderMap();
    act(() => astronaut().focus());
    key("ArrowRight");
    const enter = screen.getByRole("button", { name: "Enter station →" });
    act(() => enter.focus());
    fireEvent.keyDown(enter, { key: "Escape" });
    expect(screen.queryByTestId("preview-card")).toBeNull();
    expect(astronaut()).toHaveFocus();
  });

  it("Tab keeps focus inside the panel", () => {
    renderMap();
    act(() => astronaut().focus());
    key("Enter");
    const close = screen.getByRole("button", { name: "Close station" });
    key("Tab");
    expect(close).toHaveFocus();
    key("Tab", { shiftKey: true });
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: "a" });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("places the card beside the planet", () => {
    renderMap();
    act(() => astronaut().focus());
    key("ArrowRight");
    const card = screen.getByTestId("preview-card");
    expect(card.style.transform).toContain("translate3d");
    expect(["right", "left", "below"]).toContain(card.dataset.side);
  });
});

describe("astronaut: drag and snap (AOS-3.1)", () => {
  it.each([1, 0.5, 2])("tracks the cursor and snaps to the nearest station at %f× zoom", (s) => {
    renderMap();
    act(() => api().setView({ x: 0, y: 0, s }));
    const from = screenOf(1);
    const to = screenOf(2);
    drag(from, { x: to.x + 10 * s, y: to.y - 10 * s });
    expect(current()).toBe(2);
    expect(screen.getByTestId("preview-card")).toHaveTextContent("#2");
  });

  it("returns to its last station when dropped in empty space", () => {
    renderMap();
    act(() => api().setView({ x: 0, y: 0, s: 1 }));
    const from = screenOf(1);
    drag(from, { x: from.x + 100, y: from.y - 800 });
    expect(current()).toBe(1);
    expect(screen.queryByTestId("preview-card")).toBeNull();
  });

  it("a click on the astronaut shows the card", () => {
    renderMap();
    act(() => api().setView({ x: 0, y: 0, s: 1 }));
    const at = screenOf(1);
    pointer("pointerdown", astronaut(), at);
    pointer("pointerup", astronaut(), { x: at.x + 2, y: at.y });
    expect(screen.getByTestId("preview-card")).toHaveTextContent("#1");
  });

  it("ignores other pointers and the right mouse button", () => {
    renderMap();
    act(() => api().setView({ x: 0, y: 0, s: 1 }));
    const at = screenOf(1);
    pointer("pointerdown", astronaut(), { ...at, button: 2 });
    pointer("pointermove", astronaut(), { x: at.x + 300, y: at.y });
    pointer("pointerup", astronaut(), { x: at.x + 300, y: at.y });
    pointer("pointerdown", astronaut(), { ...at, id: 1 });
    pointer("pointermove", astronaut(), { id: 2, x: 0, y: 0 });
    pointer("pointerup", astronaut(), { id: 2, x: 0, y: 0 });
    expect(current()).toBe(1);
  });

  it("snaps instantly with reduced motion", () => {
    const original = window.matchMedia;
    window.matchMedia = vi.fn((q: string) => ({
      matches: true,
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as never;
    try {
      renderMap();
      act(() => api().setView({ x: 0, y: 0, s: 1 }));
      drag(screenOf(1), screenOf(3));
      expect(current()).toBe(3);
      const p = screenOf(3);
      expect(astronaut().style.transform).toBe(`translate3d(${p.x - 28}px, ${p.y - 28}px, 0)`);
      drag(screenOf(3), { x: 5000, y: 5000 }); // empty space: instant return
      expect(astronaut().style.transform).toBe(`translate3d(${p.x - 28}px, ${p.y - 28}px, 0)`);
    } finally {
      window.matchMedia = original;
    }
  });
});

describe("tap to move (AOS-3.4) and map pointer handling", () => {
  it("tapping a planet moves the astronaut there and shows the card", () => {
    renderMap();
    const p = { x: 50, y: 50 };
    pointer("pointerdown", planet(7), { ...p, type: "touch" });
    pointer("pointerup", planet(7), { x: 52, y: 51, type: "touch" });
    expect(current()).toBe(7);
    expect(screen.getByTestId("preview-card")).toHaveTextContent("#7 UX design");
  });

  it("tapping a locked planet shows its name and 'Coming soon' (touch teaser)", () => {
    renderMap();
    pointer("pointerdown", planet(5), { x: 50, y: 50, type: "touch" });
    pointer("pointerup", planet(5), { x: 50, y: 50, type: "touch" });
    const card = screen.getByTestId("preview-card");
    expect(card).toHaveTextContent("#5 Estimation and backlog grooming");
    expect(card).toHaveTextContent("Coming soon");
  });

  it("dragging across a planet pans instead of moving the astronaut", () => {
    renderMap();
    pointer("pointerdown", planet(7), { x: 50, y: 50 });
    pointer("pointermove", planet(7), { x: 150, y: 50 });
    pointer("pointerup", planet(7), { x: 150, y: 50 });
    expect(current()).toBe(1);
  });

  it("tapping empty space closes the card", () => {
    renderMap();
    act(() => astronaut().focus());
    key("ArrowRight");
    const map = screen.getByTestId("space-map");
    pointer("pointerdown", map, { x: 10, y: 10 });
    pointer("pointerup", map, { x: 10, y: 10 });
    expect(screen.queryByTestId("preview-card")).toBeNull();
  });

  it("a cancelled press is not a tap", () => {
    renderMap();
    pointer("pointerdown", planet(7), { x: 50, y: 50 });
    pointer("pointercancel", planet(7), { x: 50, y: 50 });
    pointer("pointerup", planet(7), { x: 50, y: 50 });
    expect(current()).toBe(1);
  });

  it("the right mouse button doesn't pan", () => {
    renderMap();
    const map = screen.getByTestId("space-map");
    act(() => api().setView({ x: 0, y: 0, s: 1 }));
    pointer("pointerdown", map, { x: 10, y: 10, button: 2 });
    pointer("pointermove", map, { x: 200, y: 200, button: 2 });
    expect(api().getView()).toEqual({ x: 0, y: 0, s: 1 });
  });

  it("a pinch that starts with both fingers on one spot still zooms", () => {
    renderMap();
    const map = screen.getByTestId("space-map");
    act(() => api().setView({ x: 0, y: 0, s: 1 }));
    pointer("pointerdown", map, { id: 1, x: 100, y: 100, type: "touch" });
    pointer("pointerdown", map, { id: 2, x: 100, y: 100, type: "touch" });
    pointer("pointermove", map, { id: 2, x: 150, y: 100, type: "touch" }); // sets the baseline
    pointer("pointermove", map, { id: 2, x: 200, y: 100, type: "touch" }); // twice as far
    expect(api().getView().s).toBeCloseTo(2);
    pointer("pointerup", map, { id: 2, x: 200, y: 100, type: "touch" });
    pointer("pointerup", map, { id: 1, x: 100, y: 100, type: "touch" });
    expect(current()).toBe(1); // a pinch is never a tap
  });

  it("converts line-based wheel deltas (Firefox) to pixels", () => {
    renderMap();
    const map = screen.getByTestId("space-map");
    act(() => api().setView({ x: 0, y: 0, s: 1 }));
    fireEvent.wheel(map, { deltaY: -3, deltaMode: 1, clientX: 0, clientY: 0 });
    expect(api().getView().s).toBeCloseTo(Math.exp(3 * 16 * 0.0015));
  });
});

describe("recommended next (AOS-3.5)", () => {
  it("glows on the first uncompleted available station", () => {
    renderMap();
    expect(planet(1)).toHaveAttribute("data-recommended", "true");
    expect(planet(2)).toHaveAttribute("data-recommended", "false");
    expect(screen.getByText(/Station 1: .* \(recommended next\)/)).toBeInTheDocument();
  });

  it("moves on as stations are completed", () => {
    renderMap({ completedIds: [1, 2, 3, 4] });
    expect(planet(7)).toHaveAttribute("data-recommended", "true");
    expect(planet(5)).toHaveAttribute("data-recommended", "false");
  });
});

describe("review fixes (AOS-3)", () => {
  it("scrolling inside the open panel neither zooms the map nor blocks the scroll", () => {
    renderMap();
    act(() => api().setView({ x: 0, y: 0, s: 1 }));
    act(() => astronaut().focus());
    key("Enter");
    const dialog = screen.getByRole("dialog");
    const wheel = new WheelEvent("wheel", { deltaY: -200, bubbles: true, cancelable: true });
    fireEvent(dialog, wheel);
    expect(api().getView()).toEqual({ x: 0, y: 0, s: 1 });
    expect(wheel.defaultPrevented).toBe(false);
  });

  it("makes everything behind the open panel inert", () => {
    renderMap();
    act(() => astronaut().focus());
    key("ArrowRight"); // opens the card
    key("Enter");
    expect(astronaut()).toHaveAttribute("inert");
    expect(screen.getByTestId("preview-card")).toHaveAttribute("inert");
    expect(screen.getByTestId("mini-map")).toHaveAttribute("inert");
    key("Escape");
    expect(astronaut()).not.toHaveAttribute("inert");
  });

  it("Escape closes the panel even when focus fell out of it", () => {
    renderMap();
    act(() => astronaut().focus());
    key("Enter");
    act(() => (document.activeElement as HTMLElement).blur());
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(astronaut()).toHaveFocus();
  });

  it("a cancelled drag returns home instead of snapping", () => {
    renderMap();
    act(() => api().setView({ x: 0, y: 0, s: 1 }));
    const from = screenOf(1);
    const to = screenOf(2);
    pointer("pointerdown", astronaut(), from);
    pointer("pointermove", astronaut(), to);
    pointer("pointercancel", astronaut(), to);
    pointer("pointerup", astronaut(), to); // already ended: ignored
    expect(current()).toBe(1);
  });

  it("announces the first and last station when an arrow can't go further", () => {
    renderMap();
    act(() => astronaut().focus());
    key("ArrowLeft");
    expect(screen.getByTestId("announcer")).toHaveTextContent("This is the first station.");
    renderMap({ currentStationId: 42 });
    const last = screen.getAllByTestId("astronaut")[1]!;
    act(() => last.focus());
    fireEvent.keyDown(last, { key: "ArrowRight" });
    expect(screen.getAllByTestId("announcer")[1]).toHaveTextContent("This is the last station.");
  });
});

describe("arrow keys anywhere on the map (PO feedback)", () => {
  it("move the astronaut and focus it when focus is on the page", () => {
    renderMap();
    fireEvent.keyDown(document.body, { key: "ArrowRight" });
    expect(current()).toBe(2);
    expect(astronaut()).toHaveFocus();
  });

  it("are ignored while the panel is open, and for other keys", () => {
    renderMap();
    act(() => astronaut().focus());
    key("Enter");
    fireEvent.keyDown(document.body, { key: "ArrowRight" });
    expect(current()).toBe(1);
    key("Escape");
    act(() => astronaut().blur());
    fireEvent.keyDown(document.body, { key: "a" });
    expect(current()).toBe(1);
  });

  it("leave focused controls outside the map alone", () => {
    renderMap();
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    act(() => outside.focus());
    fireEvent.keyDown(outside, { key: "ArrowRight" });
    expect(current()).toBe(1);
    outside.remove();
  });
});
