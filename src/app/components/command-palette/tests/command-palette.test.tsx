import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useRef, useState } from "react";
import { CommandPalette } from "../command-palette";
import { paletteRoutes } from "../build-palette-options";
import { searchPosts } from "@/app/lib/posts";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("@/app/lib/use-transition-router", () => ({
  useTransitionRouter: () => ({ push }),
}));

async function flushExit() {
  await act(async () => {
    await Promise.resolve();
  });
}

function Harness({
  initiallyOpen = true,
  withReturnFocus = false,
}: {
  initiallyOpen?: boolean;
  withReturnFocus?: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={triggerRef} type="button">
        Menu
      </button>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        returnFocusRef={withReturnFocus ? triggerRef : undefined}
      />
    </>
  );
}

describe("CommandPalette", () => {
  beforeEach(() => {
    push.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("lists pages and blog posts in grouped sections", () => {
    render(<Harness />);

    expect(screen.getByText("Pages")).toBeInTheDocument();
    expect(screen.getByText("Blog posts")).toBeInTheDocument();

    for (const route of paletteRoutes) {
      expect(screen.getByRole("option", { name: route.label })).toBeInTheDocument();
    }

    const firstPost = searchPosts("")[0];
    expect(screen.getByText(firstPost.title)).toBeInTheDocument();
  });

  it("navigates to a route when selected by keyboard", () => {
    render(<Harness />);

    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(push).toHaveBeenCalledWith(paletteRoutes[0].href);
  });

  it("navigates to a blog post after moving past the page options", () => {
    render(<Harness />);

    const input = screen.getByRole("combobox");
    for (let i = 0; i <= paletteRoutes.length; i++) {
      fireEvent.keyDown(input, { key: "ArrowDown" });
    }
    fireEvent.keyDown(input, { key: "Enter" });

    const firstPost = searchPosts("")[0];
    expect(push).toHaveBeenCalledWith(`/blog/${firstPost.slug}`);
  });

  it("filters pages and posts as the user types", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByRole("combobox"), "uses");

    expect(screen.getByRole("option", { name: "Uses" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Home" })).not.toBeInTheDocument();
    expect(screen.queryByText("Blog posts")).not.toBeInTheDocument();
  });

  it("closes on Escape and restores focus to the trigger", async () => {
    render(<Harness withReturnFocus />);

    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });
    await flushExit();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Menu" })).toHaveFocus();
  });

  it("closes on backdrop interaction and restores focus to the trigger", async () => {
    render(<Harness withReturnFocus />);

    const overlay = screen.getByRole("dialog").parentElement as HTMLElement;
    fireEvent.mouseDown(overlay);
    await flushExit();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Menu" })).toHaveFocus();
  });

  it("closes via the close button and restores focus to the trigger", async () => {
    render(<Harness withReturnFocus />);

    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
    await flushExit();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Menu" })).toHaveFocus();
  });

  it("announces the result count politely", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const status = screen.getByRole("status");
    const total = paletteRoutes.length + searchPosts("").length;
    expect(status).toHaveTextContent(`${total} results`);

    await user.type(screen.getByRole("combobox"), "uses");
    expect(status).toHaveTextContent("1 result");
  });

  it("locks background scroll while open", () => {
    render(<Harness />);

    expect(document.body.style.overflow).toBe("hidden");

    cleanup();
    expect(document.body.style.overflow).toBe("");
  });
});
