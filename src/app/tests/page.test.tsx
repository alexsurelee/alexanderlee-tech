import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../page";

describe("Home", () => {
  it("renders welcome content in the main landmark", () => {
    render(<Page />);

    expect(screen.getByRole("main")).toHaveTextContent("Welcome👋");
  });
});
