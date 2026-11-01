import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SpaceMap } from "@/components/map/SpaceMap";
import { MAX_SCALE, PLACED_STATIONS } from "@/lib/map/layout";
import { V1_STATION_IDS } from "@/lib/map/stations";

const renderMap = (props: Partial<Parameters<typeof SpaceMap>[0]> = {}) =>
  render(
    <SpaceMap availableIds={V1_STATION_IDS} {...props}>
      <h1>Hero</h1>
    </SpaceMap>,
  );

const api = () => {
  if (!window.__aosMap) throw new Error("map API not registered");
  return window.__aosMap;
};

const planet = (id: number) =>
  screen.getAllByTestId("planet").find((el) => el.dataset.station === String(id))!;

const pointer = (type: string, target: Element, id: number, x: number, y: number) =>
  fireEvent(
    target,
    new PointerEvent(type, { pointerId: id, clientX: x, clientY: y, bubbles: true }),
  );

describe("SpaceMap", () => {
  it("renders all 9 sector titles, 42 planets, the path and the mini-map", () => {
    renderMap();
    expect(screen.getAllByTestId("sector-title").map((el) => el.textContent)).toEqual([
      "Discovery and Planning",
      "Design",
      "Development",
      "Continuous Integration",
      "Testing and Environments",
      "Release Governance",
      "Deployment",
      "Monitoring and Observability",
      "Closure",
    ]);
    expect(screen.getAllByTestId("planet")).toHaveLength(42);
    expect(screen.getByTestId("map-path").getAttribute("d")).toMatch(/^M/);
    expect(screen.getByTestId("mini-map")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hero" })).toBeInTheDocument();
  });

  it("hides the visual map from screen readers and lists the journey instead", () => {
    renderMap();
    expect(screen.getByTestId("starfield")).toHaveAttribute("aria-hidden", "true");
    expect(planet(1).closest("[aria-hidden=true]")).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Journey overview: 9 phases, 42 stations" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Station 5: Estimation and backlog grooming (coming soon)"),
    ).toBeInTheDocument();
    expect(screen.getByText(/^Station 1: Problem statement \/ business case/)).toBeInTheDocument();
  });

  it("dims locked stations and marks them with a lock icon", () => {
    renderMap();
    expect(planet(1)).toHaveAttribute("data-locked", "false");
    expect(planet(5)).toHaveAttribute("data-locked", "true");
    expect(planet(5)).toHaveTextContent("🔒5");
    expect(planet(5).style.opacity).toBe("0.4");
    expect(planet(1).style.opacity).toBe("1");
  });

  it("opens on the current station's phase and reveals the map", () => {
    renderMap({ currentStationId: 30 });
    const v = api().getView();
    const st = PLACED_STATIONS[29]!;
    const sx = st.x * v.s + v.x;
    expect(sx).toBeGreaterThan(0);
    expect(sx).toBeLessThan(window.innerWidth);
    expect(planet(30).style.transform).toContain("translate3d");
    expect(planet(1).parentElement?.style.opacity).toBe("1");
  });

  it("falls back to station 1 for an unknown current station", () => {
    renderMap({ currentStationId: 999 });
    const v = api().getView();
    expect(PLACED_STATIONS[0]!.x * v.s + v.x).toBeGreaterThan(0);
  });

  it("hides station numbers when zoomed far out", () => {
    renderMap();
    act(() => api().setView({ x: 0, y: 0, s: 0.2 }));
    expect(planet(1).dataset.labels).toBe("off");
    act(() => api().setView({ x: 0, y: 0, s: 1 }));
    expect(planet(1).dataset.labels).toBe("on");
  });

  it("pans when the background is dragged", () => {
    renderMap();
    const map = screen.getByTestId("space-map");
    act(() => api().setView({ x: 0, y: 0, s: 1 }));
    pointer("pointerdown", map, 1, 100, 100);
    pointer("pointermove", map, 1, 130, 90);
    pointer("pointerup", map, 1, 130, 90);
    pointer("pointermove", map, 1, 500, 500); // released: no more panning
    expect(api().getView()).toEqual({ x: 30, y: -10, s: 1 });
  });

  it("pinch-zooms with two pointers", () => {
    renderMap();
    const map = screen.getByTestId("space-map");
    act(() => api().setView({ x: 0, y: 0, s: 1 }));
    pointer("pointerdown", map, 1, 100, 100);
    pointer("pointerdown", map, 2, 200, 100);
    pointer("pointermove", map, 2, 300, 100); // fingers twice as far apart
    expect(api().getView().s).toBeCloseTo(2);
    pointer("pointercancel", map, 2, 300, 100);
    pointer("pointerup", map, 1, 100, 100);
  });

  it("shrinks the landing hero once the user explores, but not before", () => {
    renderMap();
    const overlay = screen.getByTestId("map-overlay");
    expect(overlay.dataset.explored).toBeUndefined();
    act(() => api().setView({ x: 0, y: 0, s: 1 })); // programmatic views don't count
    expect(overlay.dataset.explored).toBeUndefined();
    fireEvent.wheel(screen.getByTestId("space-map"), { deltaY: 100, clientX: 0, clientY: 0 });
    expect(overlay.dataset.explored).toBe("true");
  });

  it("zooms with the mouse wheel and respects the maximum zoom", () => {
    renderMap();
    const map = screen.getByTestId("space-map");
    act(() => api().setView({ x: 0, y: 0, s: 1 }));
    fireEvent.wheel(map, { deltaY: -100, clientX: 0, clientY: 0 });
    expect(api().getView().s).toBeGreaterThan(1);
    for (let i = 0; i < 30; i++) fireEvent.wheel(map, { deltaY: -500, clientX: 0, clientY: 0 });
    expect(api().getView().s).toBe(MAX_SCALE);
  });

  it("shows a teaser with the station name, plus 'Coming soon' when locked", () => {
    renderMap();
    fireEvent.pointerEnter(planet(5), { pointerType: "touch" }); // touch never shows the hover teaser
    expect(screen.queryByTestId("station-teaser")).toBeNull();
    fireEvent.pointerEnter(planet(5), { pointerType: "mouse" });
    const teaser = screen.getByTestId("station-teaser");
    expect(teaser).toHaveTextContent("#5 Estimation and backlog grooming");
    expect(teaser).toHaveTextContent("🔒 Coming soon");
    expect(teaser.style.transform).toContain("translate3d");
    fireEvent.pointerLeave(planet(5), { pointerType: "mouse" });
    expect(screen.queryByTestId("station-teaser")).toBeNull();

    fireEvent.pointerEnter(planet(1), { pointerType: "mouse" });
    expect(screen.getByTestId("station-teaser")).not.toHaveTextContent("Coming soon");
  });

  it("jumps to the clicked spot on the mini-map without panning", () => {
    renderMap();
    const mini = screen.getByTestId("mini-map");
    vi.spyOn(mini, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 1000, y: 600, width: 240, height: 82 }),
    );
    act(() => api().setView({ x: 0, y: 0, s: 1 }));
    pointer("pointerdown", mini, 1, 1120, 641); // the centre of the mini-map
    pointer("pointermove", mini, 1, 1300, 700);
    const v = api().getView();
    expect(3500 * v.s + v.x).toBeCloseTo(window.innerWidth / 2);
    expect(1200 * v.s + v.y).toBeCloseTo(window.innerHeight / 2);
  });

  it("ignores mini-map clicks before it has a size", () => {
    renderMap();
    act(() => api().setView({ x: 5, y: 5, s: 1 }));
    pointer("pointerdown", screen.getByTestId("mini-map"), 1, 10, 10);
    expect(api().getView()).toEqual({ x: 5, y: 5, s: 1 });
  });

  it("re-applies the view on resize and removes its test hook on unmount", () => {
    const { unmount } = renderMap();
    act(() => api().setView({ x: 0, y: 0, s: 1 }));
    planet(1).style.transform = "";
    fireEvent(window, new Event("resize"));
    expect(planet(1).style.transform).toContain("translate3d");
    unmount();
    expect(window.__aosMap).toBeUndefined();
  });
});

describe("SpaceMap drawing (with a canvas)", () => {
  const ctx = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    strokeRect: vi.fn(),
    fillStyle: "",
    strokeStyle: "",
    globalAlpha: 1,
    lineWidth: 1,
  };
  let reduced = false;
  const original = window.matchMedia;

  beforeEach(() => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(ctx as never);
    window.matchMedia = vi.fn((query: string) => ({
      matches: reduced,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as never;
    vi.clearAllMocks();
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(ctx as never);
  });

  afterEach(() => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    window.matchMedia = original;
    vi.restoreAllMocks();
  });

  it("animates the starfield every frame and draws the mini-map", () => {
    reduced = false;
    const raf = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);
    const cancel = vi.spyOn(window, "cancelAnimationFrame");
    const { unmount } = renderMap();
    expect(raf).toHaveBeenCalled();
    act(() => raf.mock.calls[0]![0](16));
    expect(raf.mock.calls.length).toBeGreaterThan(1);
    expect(ctx.strokeRect).toHaveBeenCalled(); // mini-map viewport
    fireEvent(window, new Event("resize"));
    unmount();
    expect(cancel).toHaveBeenCalledWith(1);
  });

  it("draws a still starfield once with reduced motion, and again on resize", () => {
    reduced = true;
    const raf = vi.spyOn(window, "requestAnimationFrame");
    const { unmount } = renderMap();
    expect(raf).not.toHaveBeenCalled();
    const clears = ctx.clearRect.mock.calls.length;
    fireEvent(window, new Event("resize"));
    expect(ctx.clearRect.mock.calls.length).toBeGreaterThan(clears);
    unmount();
  });
});
