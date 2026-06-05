import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BlogSearch } from "../blog-search";
import { searchPosts } from "@/app/lib/posts";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push }),
}));

const DELAY = 120;
const CLOSE_DELAY = 150;

function getRoot(container: HTMLElement): HTMLElement {
  return container.firstElementChild as HTMLElement;
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe("BlogSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    push.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders the Blog item as a link to /blog", () => {
    render(<BlogSearch current={false} />);

    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute(
      "href",
      "/blog",
    );
  });

  it("marks the link active via aria-current when current", () => {
    render(<BlogSearch current />);

    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("opens the search panel after the hover-intent delay", () => {
    const { container } = render(<BlogSearch current={false} />);

    fireEvent.pointerEnter(getRoot(container));
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();

    advance(DELAY);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("does not open on incidental hover that leaves before the delay", () => {
    const { container } = render(<BlogSearch current={false} />);
    const root = getRoot(container);

    fireEvent.pointerEnter(root);
    advance(DELAY - 20);
    fireEvent.pointerLeave(root);
    advance(DELAY);

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("opens on sustained keyboard focus of the Blog link", () => {
    render(<BlogSearch current={false} />);

    fireEvent.focus(screen.getByRole("link", { name: "Blog" }));
    advance(DELAY);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("auto-focuses the input and shows all posts when opened", () => {
    const { container } = render(<BlogSearch current={false} />);

    fireEvent.pointerEnter(getRoot(container));
    advance(DELAY);

    const input = screen.getByRole("combobox");
    expect(input).toHaveFocus();
    expect(screen.getAllByRole("option")).toHaveLength(searchPosts("").length);
  });

  it("navigates to a post when a result is selected by keyboard", () => {
    const { container } = render(<BlogSearch current={false} />);
    fireEvent.pointerEnter(getRoot(container));
    advance(DELAY);

    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    const firstPost = searchPosts("")[0];
    expect(push).toHaveBeenCalledWith(`/blog/${firstPost.slug}`);
  });

  it("navigates to a post when a result is clicked", () => {
    const { container } = render(<BlogSearch current={false} />);
    fireEvent.pointerEnter(getRoot(container));
    advance(DELAY);

    const firstPost = searchPosts("")[0];
    fireEvent.click(screen.getByText(firstPost.title));

    expect(push).toHaveBeenCalledWith(`/blog/${firstPost.slug}`);
  });

  it("submits to the /blog results page on Enter with no active option", () => {
    const { container } = render(<BlogSearch current={false} />);
    fireEvent.pointerEnter(getRoot(container));
    advance(DELAY);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "react" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(push).toHaveBeenCalledWith("/blog?q=react");
  });

  it("closes on Escape and restores focus to the Blog link", () => {
    const { container } = render(<BlogSearch current={false} />);
    fireEvent.pointerEnter(getRoot(container));
    advance(DELAY);

    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Blog" })).toHaveFocus();
  });

  it("keeps the panel open on pointer-leave while the input is focused", () => {
    const { container } = render(<BlogSearch current={false} />);
    const root = getRoot(container);
    fireEvent.pointerEnter(root);
    advance(DELAY);
    expect(screen.getByRole("combobox")).toHaveFocus();

    fireEvent.pointerLeave(root);
    advance(CLOSE_DELAY + 10);

    // Focus lives inside the panel, so a mouse-leave alone must not dismiss it;
    // Escape / outside-click / tabbing away are the deliberate exits.
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("closes on an outside pointer interaction", () => {
    const { container } = render(<BlogSearch current={false} />);
    fireEvent.pointerEnter(getRoot(container));
    advance(DELAY);
    expect(screen.getByRole("combobox")).toBeInTheDocument();

    fireEvent.pointerDown(document.body);

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});
