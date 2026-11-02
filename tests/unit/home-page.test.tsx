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

  it("shows the space map with locked and available stations", () => {
    render(<Home />);
    expect(screen.getByTestId("space-map")).toBeInTheDocument();
    expect(screen.getAllByTestId("planet")).toHaveLength(42);
    expect(screen.getAllByText(/\(coming soon\)/)).toHaveLength(42 - 14);
  });
});
