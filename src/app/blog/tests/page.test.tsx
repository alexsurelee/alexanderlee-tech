import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import BlogPage from "../page";
import { posts, searchPosts } from "@/app/lib/posts";

vi.mock("next/navigation", () => ({
  usePathname: () => "/blog",
  useRouter: () => ({ push: vi.fn() }),
}));

async function renderBlog(searchParams: { q?: string | string[] }) {
  render(await BlogPage({ searchParams: Promise.resolve(searchParams) }));
}

describe("BlogPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("lists every post when there is no query", async () => {
    await renderBlog({});

    for (const post of posts) {
      expect(
        screen.getByRole("link", { name: post.title }),
      ).toHaveAttribute("href", `/blog/${post.slug}`);
    }
  });

  it("orders the unfiltered list by recency", async () => {
    await renderBlog({});

    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    const expected = searchPosts("").map((post) => post.title);
    expect(headings).toEqual(expected);
  });

  it("shows only the ranked results for a matching query", async () => {
    await renderBlog({ q: "react" });

    const expected = searchPosts("react");
    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    expect(headings).toEqual(expected.map((post) => post.title));
    expect(headings.length).toBeLessThan(posts.length);
  });

  it("reports the result count for a query", async () => {
    await renderBlog({ q: "react" });

    const count = searchPosts("react").length;
    expect(
      screen.getByText(new RegExp(`${count} results for`)),
    ).toBeInTheDocument();
  });

  it("renders an unambiguous empty state for a no-match query", async () => {
    await renderBlog({ q: "kubernetes-service-mesh" });

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/no posts match/i);
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
  });

  it("uses the first value when the query param repeats", async () => {
    await renderBlog({ q: ["react", "css"] });

    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    expect(headings).toEqual(searchPosts("react").map((post) => post.title));
  });
});
