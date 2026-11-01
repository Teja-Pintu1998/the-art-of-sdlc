import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home page", () => {
  it("shows the product name as the main heading", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: "The Art of SDLC" })).toBeInTheDocument();
  });

  it("shows the landing tagline", () => {
    render(<Home />);
    expect(screen.getByText("npm install experience")).toBeInTheDocument();
  });
});
