import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET, generateStaticParams } from "@/app/lessons/[slug]/route";
import { Journey } from "@/components/Journey";
import { loadLessons } from "@/lib/content/lessons";
import { STATIONS, V1_STATION_IDS } from "@/lib/map/stations";
import { INITIAL_PROGRESS, useProgress } from "@/lib/progress/store";

const all = loadLessons();
const written = Object.keys(all).map(Number);
const ctx = (slug: string) => ({ params: Promise.resolve({ slug }) }) as never;

describe("/lessons/<slug> route", () => {
  it("pre-builds one JSON file per written lesson", () => {
    expect(generateStaticParams().map((p) => p.slug)).toEqual(
      STATIONS.filter((s) => written.includes(s.id)).map((s) => s.slug),
    );
  });

  it("returns the lesson, or 404 for a station without one", async () => {
    const ok = await GET(new Request("http://x"), ctx("prd"));
    expect((await ok.json()).sections).toHaveLength(8);
    expect((await GET(new Request("http://x"), ctx("git"))).status).toBe(404);
  });
});

describe("lessons load on demand", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    localStorage.clear();
    useProgress.setState({ ...INITIAL_PROGRESS, onboardingSeen: true });
    fetchMock = vi.fn(async (url: string) => {
      const slug = url.split("/").pop();
      const lesson = Object.values(all).find((l) => l.slug === slug);
      return lesson ? new Response(JSON.stringify(lesson)) : new Response("{}", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  const renderHome = () =>
    render(
      <Journey lessons={{}} lessonIds={written} articles={[]} availableIds={V1_STATION_IDS}>
        <h1>The Art of SDLC</h1>
      </Journey>,
    );
  const astronaut = () => screen.getByTestId("astronaut");

  it("prefetches when the astronaut lands, then shows the lesson", async () => {
    renderHome();
    act(() => astronaut().focus());
    fireEvent.keyDown(astronaut(), { key: "ArrowRight" }); // lands on #2
    expect(fetchMock).toHaveBeenCalledWith("/lessons/prd");
    fireEvent.keyDown(astronaut(), { key: "Enter" });
    expect(await screen.findByRole("heading", { name: "What it is" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1); // the prefetch was reused
  });

  it("shows a loading state while station 1 loads", async () => {
    renderHome();
    act(() => astronaut().focus());
    fireEvent.keyDown(astronaut(), { key: "Enter" }); // station 1: not prefetched
    expect(screen.getByTestId("lesson-loading")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "What it is" })).toBeInTheDocument();
  });

  it("never requests a lesson that isn't written", () => {
    const unwritten = V1_STATION_IDS.find((id) => !written.includes(id))!;
    render(
      <Journey
        lessons={{}}
        lessonIds={written}
        articles={[]}
        availableIds={V1_STATION_IDS}
        routeStationId={unwritten}
      >
        <h1>The Art of SDLC</h1>
      </Journey>,
    );
    expect(screen.getByTestId("lesson-pending")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("offers a retry when loading fails", async () => {
    // Station 3: not fetched by earlier tests (requests are shared per page load).
    fetchMock.mockImplementationOnce(async () => new Response("{}", { status: 500 }));
    renderHome();
    act(() => astronaut().focus());
    fireEvent.keyDown(astronaut(), { key: "ArrowRight" });
    fireEvent.keyDown(astronaut(), { key: "ArrowRight" }); // lands on #3: the prefetch fails
    fireEvent.keyDown(astronaut(), { key: "Enter" });
    fireEvent.click(await screen.findByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("heading", { name: "What it is" })).toBeInTheDocument();
  });
});
