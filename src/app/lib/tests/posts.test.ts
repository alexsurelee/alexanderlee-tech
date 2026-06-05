import { describe, expect, it } from "vitest";
import { posts, searchPosts } from "../posts";

function isNonIncreasingByDate(results: { date: string }[]): boolean {
  for (let i = 1; i < results.length; i++) {
    if (results[i].date > results[i - 1].date) {
      return false;
    }
  }
  return true;
}

describe("searchPosts", () => {
  it("returns every post ordered by recency for an empty query", () => {
    const results = searchPosts("");

    expect(results).toHaveLength(posts.length);
    expect(isNonIncreasingByDate(results)).toBe(true);
  });

  it("treats a whitespace-only query like an empty query", () => {
    expect(searchPosts("   ")).toEqual(searchPosts(""));
  });

  it("matches case-insensitively", () => {
    expect(searchPosts("REACT")).toEqual(searchPosts("react"));
  });

  it("ranks title matches above summary/tag matches", () => {
    const results = searchPosts("react");
    const titleMatchSlugs = results
      .filter((post) => post.title.toLowerCase().includes("react"))
      .map((post) => post.slug);
    const nonTitleMatchSlugs = results
      .filter((post) => !post.title.toLowerCase().includes("react"))
      .map((post) => post.slug);

    const firstNonTitleIndex = results.findIndex(
      (post) => !post.title.toLowerCase().includes("react"),
    );
    const lastTitleIndex = results.reduce(
      (acc, post, index) =>
        post.title.toLowerCase().includes("react") ? index : acc,
      -1,
    );

    expect(titleMatchSlugs.length).toBeGreaterThan(0);
    expect(nonTitleMatchSlugs.length).toBeGreaterThan(0);
    expect(lastTitleIndex).toBeLessThan(firstNonTitleIndex);
  });

  it("breaks ties within a tier by recency", () => {
    const results = searchPosts("react");
    const titleMatches = results.filter((post) =>
      post.title.toLowerCase().includes("react"),
    );

    expect(isNonIncreasingByDate(titleMatches)).toBe(true);
  });

  it("matches against tags", () => {
    const minimalism = searchPosts("minimalism");

    expect(minimalism).toHaveLength(1);
    expect(minimalism[0].tags).toContain("minimalism");
  });

  it("returns an empty array when nothing matches", () => {
    expect(searchPosts("kubernetes-service-mesh")).toEqual([]);
  });
});
