export type NavTransitionType = "forward" | "back" | "fade";

/** Classifies route changes for directional page transitions. */
export function getNavTransitionType(
  from: string,
  to: string,
): NavTransitionType {
  if (from === "/blog" && to.startsWith("/blog/")) {
    return "forward";
  }

  if (from.startsWith("/blog/") && to === "/blog") {
    return "back";
  }

  if (from.startsWith("/blog/") && to.startsWith("/blog/")) {
    return "forward";
  }

  return "fade";
}

export function navTransitionClass(type: NavTransitionType): string {
  return type === "fade" ? "nav-fade" : `nav-${type}`;
}
