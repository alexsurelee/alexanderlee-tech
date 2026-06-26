import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
  type RenderOptions,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type { ReactElement } from "react";
import { AppHotkeysProvider } from "@/app/components/hotkeys-provider";
import { Navbar } from "../navbar";
import { navRoutes } from "@/app/lib/routes";
import { mockMatchMedia } from "@/app/lib/tests/mock-match-media";
import { pressModK } from "@/app/lib/tests/press-mod-k";

let mockPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: vi.fn() }),
}));

function renderNavbar(ui: ReactElement = <Navbar />, options?: RenderOptions) {
  return render(<AppHotkeysProvider>{ui}</AppHotkeysProvider>, options);
}

describe("Navbar", () => {
  beforeEach(() => {
    mockPathname = "/";
    sessionStorage.clear();
    mockMatchMedia(true);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("exposes a labelled navigation landmark", () => {
    renderNavbar();

    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();
  });

  it("renders the logo home link to the root path", () => {
    renderNavbar();

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders every configured route as a link with the correct href", () => {
    renderNavbar();

    for (const route of navRoutes) {
      expect(screen.getByRole("link", { name: route.label })).toHaveAttribute(
        "href",
        route.href,
      );
    }
  });

  it("orders the tab sequence as logo then routes on wide viewports", () => {
    renderNavbar();

    const links = screen.getAllByRole("link").map((link) => link.textContent);
    expect(links[0]).toContain("lee.computer");
    expect(links.slice(1)).toEqual(navRoutes.map((route) => route.label));
  });

  it("marks the active section with aria-current on an exact match", () => {
    mockPathname = "/blog";
    renderNavbar();

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
    renderNavbar();

    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marks no route active on the home page", () => {
    mockPathname = "/";
    renderNavbar();

    const nav = screen.getByRole("navigation", { name: "Primary" });
    const current = within(nav)
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(current).toHaveLength(0);
  });

  it("shows a menu trigger instead of route links on narrow viewports", async () => {
    mockMatchMedia(false);
    renderNavbar();

    await waitFor(() => {
      expect(screen.getByRole("navigation")).toHaveAttribute(
        "data-layout",
        "narrow",
      );
    });
    expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument();
  });

  it("opens the command palette from the menu trigger", async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole("button", { name: "Menu" }));

    expect(
      screen.getByRole("dialog", { name: "Command menu" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Pages")).toBeInTheDocument();
  });

  it("opens the command palette on Cmd+K on wide viewports", async () => {
    mockMatchMedia(true);
    const user = userEvent.setup();
    renderNavbar();

    await waitFor(() => {
      expect(screen.getByRole("navigation")).toHaveAttribute(
        "data-layout",
        "wide",
      );
    });

    await pressModK(user);

    expect(
      screen.getByRole("dialog", { name: "Command menu" }),
    ).toBeInTheDocument();
  });

  it("does not open the command palette on Cmd+K while typing in an input", async () => {
    mockMatchMedia(true);
    const user = userEvent.setup();
    renderNavbar(
      <>
        <Navbar />
        <input aria-label="Notes" />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByRole("navigation")).toHaveAttribute(
        "data-layout",
        "wide",
      );
    });

    await user.click(screen.getByRole("textbox", { name: "Notes" }));
    await pressModK(user);

    expect(
      screen.queryByRole("dialog", { name: "Command menu" }),
    ).not.toBeInTheDocument();
  });
});
