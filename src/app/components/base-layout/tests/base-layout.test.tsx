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

    const homeLink = screen.getByRole("link", { name: "Home" });
    const logo = homeLink.querySelector("img");

    expect(logo).toHaveAttribute(
      "src",
      expect.stringContaining("logo-small.svg"),
    );
  });

  it("renders the site name in the home link", () => {
    render(<BaseLayout>content</BaseLayout>);

    expect(screen.getByRole("link", { name: "Home" })).toHaveTextContent(
      "lee.computer",
    );
  });

  it("renders no gutters by default", () => {
    const { container } = render(<BaseLayout>content</BaseLayout>);

    expect(container.querySelector('[class*="leftGutter"]')).toBeNull();
    expect(container.querySelector('[class*="rightGutter"]')).toBeNull();
  });

  it("renders gutters when left and right slots are provided", () => {
    render(
      <BaseLayout left={<p>Left pane</p>} right={<p>Right pane</p>}>
        content
      </BaseLayout>,
    );

    expect(screen.getByText("Left pane")).toBeInTheDocument();
    expect(screen.getByText("Right pane")).toBeInTheDocument();
  });
});
