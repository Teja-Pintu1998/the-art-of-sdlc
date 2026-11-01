import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import StationPage, { generateMetadata, generateStaticParams } from "@/app/station/[slug]/page";

const props = (slug: string) => ({ params: Promise.resolve({ slug }) }) as never;

describe("/station/[slug] (AOS-4.3)", () => {
  it("pre-builds a page for every station", () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(42);
    expect(params[0]).toEqual({ slug: "problem-statement" });
  });

  it("gives each station its own title and description", async () => {
    expect(await generateMetadata(props("problem-statement"))).toEqual({
      title: "Problem statement / business case · The Art of SDLC",
      description: expect.stringContaining("Agree on the problem"),
    });
  });

  it("opens the map with the station's panel open", async () => {
    render(await StationPage(props("problem-statement")));
    expect(screen.getByRole("dialog")).toHaveTextContent("#1 Problem statement");
    expect(screen.getByRole("heading", { level: 1, name: "The Art of SDLC" })).toBeInTheDocument();
  });

  it("is a 404 for an unknown station", async () => {
    await expect(StationPage(props("nope"))).rejects.toThrow();
    await expect(generateMetadata(props("nope"))).rejects.toThrow();
  });
});
