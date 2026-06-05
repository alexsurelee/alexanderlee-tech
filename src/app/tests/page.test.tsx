import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Home", () => {
  it("renders welcome content in the main landmark", () => {
    render(<Page />);

    expect(screen.getByRole("main")).toHaveTextContent("Welcome👋");
  });
});
