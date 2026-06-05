import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { BaseLayout } from "../base-layout";

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

    const main = screen.getByRole("main");
    const content = screen.getByText("Page content");
    expect(main.contains(content)).toBe(true);
  });

  it("renders a home link to the root path", () => {
    render(<BaseLayout>content</BaseLayout>);

    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink.getAttribute("href")).toBe("/");
  });

  it("renders the logo in the home link", () => {
    render(<BaseLayout>content</BaseLayout>);

    const logo = screen.getByRole("img", { name: "Home" });
    expect(logo.getAttribute("src")).toContain("logo-small.svg");
  });

  it("renders the site title as a decorative heading", () => {
    render(<BaseLayout>content</BaseLayout>);

    const title = screen.getByRole("heading", {
      level: 1,
      hidden: true,
    });
    expect(title.textContent).toBe("alexanderlee.tech");
  });

  it("marks layout gutters as decorative", () => {
    const { container } = render(<BaseLayout>content</BaseLayout>);

    const gutters = [...container.querySelectorAll('[aria-hidden="true"]')].filter(
      (el) =>
        el.className.includes("leftGutter") ||
        el.className.includes("rightGutter"),
    );
    expect(gutters).toHaveLength(2);
  });
});
