import { describe, expect, it } from "vitest";
import {
  buildPaletteOptions,
  paletteRoutes,
} from "../build-palette-options";
import { navRoutes } from "@/app/lib/routes";
import { searchPosts } from "@/app/lib/posts";

describe("buildPaletteOptions", () => {
  it("includes Home and every nav route for an empty query", () => {
    const { routes } = buildPaletteOptions("");

    expect(routes.map((option) => option.value.label)).toEqual(
      paletteRoutes.map((route) => route.label),
    );
  });

  it("orders flat options as pages then blog posts", () => {
    const { flat, routes, posts } = buildPaletteOptions("");

    expect(flat).toHaveLength(routes.length + posts.length);
    expect(flat.slice(0, routes.length).every((o) => o.value.kind === "route")).toBe(
      true,
    );
    expect(flat.slice(routes.length).every((o) => o.value.kind === "post")).toBe(
      true,
    );
  });

  it("filters routes by label and ranks posts via searchPosts", () => {
    const query = "react";
    const { routes, posts } = buildPaletteOptions(query);

    expect(routes.map((option) => option.value.label)).not.toContain("Uses");
    expect(posts.map((option) => option.value.slug)).toEqual(
      searchPosts(query).map((post) => post.slug),
    );
  });

  it("keeps nav routes discoverable when the query matches a page label", () => {
    const { routes } = buildPaletteOptions("blog");

    expect(routes.some((option) => option.value.href === "/blog")).toBe(true);
    expect(routes.some((option) => option.value.href === navRoutes[1].href)).toBe(
      false,
    );
  });
});
