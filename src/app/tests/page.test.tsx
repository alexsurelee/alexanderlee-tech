import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Home", () => {
  it("renders welcome content as the page heading", () => {
    render(<Page />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Welcome👋" }),
    ).toBeInTheDocument();
  });
});
