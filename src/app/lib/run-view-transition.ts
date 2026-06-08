import { flushSync } from "react-dom";

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Runs a DOM update inside the browser View Transition API when supported. */
export function runViewTransition(
  update: () => void,
): ViewTransition | undefined {
  if (
    prefersReducedMotion() ||
    typeof document === "undefined" ||
    !document.startViewTransition
  ) {
    update();
    return undefined;
  }

  return document.startViewTransition(() => {
    flushSync(update);
  });
}
