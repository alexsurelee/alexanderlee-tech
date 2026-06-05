import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { Navbar } from "../navbar";
import { navRoutes } from "@/app/lib/routes";

let mockPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Navbar", () => {
  beforeEach(() => {
    mockPathname = "/";
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("exposes a labelled navigation landmark", () => {
    render(<Navbar />);

    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();
  });

  it("renders the logo home link to the root path", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders every configured route as a link with the correct href", () => {
    render(<Navbar />);

    for (const route of navRoutes) {
      expect(screen.getByRole("link", { name: route.label })).toHaveAttribute(
        "href",
        route.href,
      );
    }
  });

  it("orders the tab sequence as logo then routes", () => {
    render(<Navbar />);

    const links = screen.getAllByRole("link").map((link) => link.textContent);
    expect(links[0]).toContain("alexanderlee.tech");
    expect(links.slice(1)).toEqual(navRoutes.map((route) => route.label));
  });

  it("marks the active section with aria-current on an exact match", () => {
    mockPathname = "/blog";
    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Uses" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("keeps the section active on nested routes", () => {
    mockPathname = "/blog/some-post";
    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marks no route active on the home page", () => {
    mockPathname = "/";
    render(<Navbar />);

    const nav = screen.getByRole("navigation", { name: "Primary" });
    const current = within(nav)
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(current).toHaveLength(0);
  });
});
