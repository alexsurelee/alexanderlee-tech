import type { ComboboxOption } from "@/app/components/combobox";
import { homeRoute, navRoutes, type Route } from "@/app/lib/routes";
import { searchPosts, type Post } from "@/app/lib/posts";

export type PaletteRoute = Route;

export type PaletteItem =
  | { kind: "route"; route: PaletteRoute }
  | { kind: "post"; post: Post };

export type PaletteSections = {
  routes: ComboboxOption<PaletteRoute>[];
  posts: ComboboxOption<Post>[];
  /** Flat list in display order for keyboard navigation. */
  flat: ComboboxOption<PaletteItem>[];
};

/** Primary routes shown under "Pages" — Home first, then configured nav routes. */
export const paletteRoutes: PaletteRoute[] = [homeRoute, ...navRoutes];

function matchesRoute(route: PaletteRoute, query: string): boolean {
  if (query === "") return true;
  return route.label.toLowerCase().includes(query);
}

function toRouteOption(route: PaletteRoute): ComboboxOption<PaletteRoute> {
  return { id: `route:${route.href}`, value: route };
}

function toPostOption(post: Post): ComboboxOption<Post> {
  return { id: `post:${post.slug}`, value: post };
}

function toFlatOption(
  item: PaletteItem,
): ComboboxOption<PaletteItem> {
  if (item.kind === "route") {
    return { id: `route:${item.route.href}`, value: item };
  }
  return { id: `post:${item.post.slug}`, value: item };
}

/**
 * Builds grouped palette options from a search query: filtered pages first,
 * then ranked blog posts. The flat list preserves that order for keyboard nav.
 */
export function buildPaletteOptions(query: string): PaletteSections {
  const normalized = query.trim().toLowerCase();

  const routes = paletteRoutes
    .filter((route) => matchesRoute(route, normalized))
    .map(toRouteOption);

  const posts = searchPosts(query).map(toPostOption);

  const flat: ComboboxOption<PaletteItem>[] = [
    ...routes.map((option) =>
      toFlatOption({ kind: "route", route: option.value }),
    ),
    ...posts.map((option) =>
      toFlatOption({ kind: "post", post: option.value }),
    ),
  ];

  return { routes, posts, flat };
}
