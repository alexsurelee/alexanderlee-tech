import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { INTRO_KEY, TypewriterTitle } from "../typewriter-title";

function getIntroWrapper(container: HTMLElement) {
  const wrapper = container.querySelector("[data-intro]");
  if (!wrapper) {
    throw new Error("Expected intro wrapper with data-intro attribute");
  }
  return wrapper;
}

describe("TypewriterTitle", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the site title", () => {
    render(<TypewriterTitle />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "lee.computer",
    );
  });

  it('uses data-intro="animate" on first visit', () => {
    const { container } = render(<TypewriterTitle />);

    expect(getIntroWrapper(container).getAttribute("data-intro")).toBe(
      "animate",
    );
  });

  it("persists intro seen flag after animate", async () => {
    render(<TypewriterTitle />);

    await waitFor(() => {
      expect(sessionStorage.getItem(INTRO_KEY)).toBe("true");
    });
  });

  it('uses data-intro="skip" when intro was already seen', () => {
    sessionStorage.setItem(INTRO_KEY, "true");

    const { container } = render(<TypewriterTitle />);

    expect(getIntroWrapper(container).getAttribute("data-intro")).toBe("skip");
  });
});
