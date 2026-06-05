"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query. Defaults to `false` during SSR and the first
 * client render so markup matches the mobile-first collapsed nav.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onStoreChange);
      return () => media.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
