import { expect, describe, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../page";

describe("Home", () => {
  it("renders a heading", () => {
    render(<Page />);

    expect(screen.getByRole("heading", { level: 1 })).toBeDefined();
  });
});
