export type Route = {
  label: string;
  href: string;
};

export const navRoutes: Route[] = [
  { label: "Blog", href: "/blog" },
  { label: "Uses", href: "/uses" },
];

export const homeRoute: Route = { label: "Home", href: "/" };

export function isRouteActive(pathname: string, href: string): boolean {
  // Home matches only its exact path; section routes also match nested paths
  // (e.g. /blog stays active on /blog/my-post).
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
