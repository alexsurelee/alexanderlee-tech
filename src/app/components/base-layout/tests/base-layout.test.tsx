import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { BaseLayout } from "../base-layout";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("BaseLayout", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders children in the main landmark", () => {
    render(
      <BaseLayout>
        <p>Page content</p>
      </BaseLayout>,
    );

    expect(screen.getByRole("main")).toContainElement(
      screen.getByText("Page content"),
    );
  });

  it("renders a home link to the root path", () => {
    render(<BaseLayout>content</BaseLayout>);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders the logo in the home link", () => {
    render(<BaseLayout>content</BaseLayout>);

    expect(screen.getByRole("img", { name: "Home" })).toHaveAttribute(
      "src",
      expect.stringContaining("logo-small.svg"),
    );
  });

  it("renders the site title as a decorative heading", () => {
    render(<BaseLayout>content</BaseLayout>);

    expect(
      screen.getByRole("heading", { level: 1, hidden: true }),
    ).toHaveTextContent("lee.computer");
  });

  it("marks layout gutters as decorative", () => {
    const { container } = render(<BaseLayout>content</BaseLayout>);

    const gutters = [
      ...container.querySelectorAll('[aria-hidden="true"]'),
    ].filter(
      (el) =>
        el.className.includes("leftGutter") ||
        el.className.includes("rightGutter"),
    );
    expect(gutters).toHaveLength(2);
  });
});
