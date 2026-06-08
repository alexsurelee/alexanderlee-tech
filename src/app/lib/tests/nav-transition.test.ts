import { describe, expect, it } from "vitest";
import { getNavTransitionType, navTransitionClass } from "../nav-transition";

describe("getNavTransitionType", () => {
  it("slides forward from the blog index into a post", () => {
    expect(getNavTransitionType("/blog", "/blog/hello-world")).toBe("forward");
  });

  it("slides back from a post to the blog index", () => {
    expect(getNavTransitionType("/blog/hello-world", "/blog")).toBe("back");
  });

  it("slides forward between two posts", () => {
    expect(getNavTransitionType("/blog/a", "/blog/b")).toBe("forward");
  });

  it("fades between top-level sections", () => {
    expect(getNavTransitionType("/", "/uses")).toBe("fade");
    expect(getNavTransitionType("/blog", "/uses")).toBe("fade");
    expect(getNavTransitionType("/uses", "/")).toBe("fade");
  });
});

describe("navTransitionClass", () => {
  it("maps fade to nav-fade and directional types to nav-*", () => {
    expect(navTransitionClass("fade")).toBe("nav-fade");
    expect(navTransitionClass("forward")).toBe("nav-forward");
    expect(navTransitionClass("back")).toBe("nav-back");
  });
});
