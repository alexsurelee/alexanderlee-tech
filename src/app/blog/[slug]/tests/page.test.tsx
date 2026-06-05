import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import BlogPostPage from "../page";
import { posts } from "@/app/lib/posts";

vi.mock("next/navigation", () => ({
  usePathname: () => "/blog",
  useRouter: () => ({ push: vi.fn() }),
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

async function renderPost(slug: string) {
  render(await BlogPostPage({ params: Promise.resolve({ slug }) }));
}

describe("BlogPostPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the post addressed by slug", async () => {
    const post = posts[0];
    await renderPost(post.slug);

    expect(
      screen.getByRole("heading", { level: 1, name: post.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(post.summary)).toBeInTheDocument();
    for (const tag of post.tags) {
      expect(screen.getByText(tag)).toBeInTheDocument();
    }
  });

  it("calls notFound for an unknown slug", async () => {
    await expect(renderPost("does-not-exist")).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });
});
