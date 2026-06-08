"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type PresenceState = "open" | "closing";

type Presence<T extends HTMLElement> = {
  /** Attach to the animated element so its exit animation can be awaited. */
  ref: RefObject<T | null>;
  /** Render the element while it is open or animating out. */
  mounted: boolean;
  /** Drives enter vs. exit animations; expose as a `data-state` attribute. */
  state: PresenceState;
};

/**
 * Keeps an element mounted long enough to finish its exit animation after `open`
 * turns false, then unmounts it. If the element has no running animation — e.g.
 * reduced-motion users, or environments without the Web Animations API — it
 * unmounts on the next tick, so the element can never get stuck mounted.
 *
 * Pair `state` with CSS keyframes keyed on `[data-state]` and attach `ref` to
 * that same element.
 */
export function usePresence<T extends HTMLElement>(open: boolean): Presence<T> {
  const [mounted, setMounted] = useState(open);
  const ref = useRef<T>(null);

  // Mount synchronously on open (during render, not in an effect) so the enter
  // animation plays from the first committed frame.
  if (open && !mounted) {
    setMounted(true);
  }

  useEffect(() => {
    if (open || !mounted) return;

    const animations = ref.current?.getAnimations?.() ?? [];
    let active = true;
    // Resolves immediately when there are no animations, so a closing element
    // without motion still unmounts promptly.
    void Promise.allSettled(
      animations.map((animation) => animation.finished),
    ).then(() => {
      if (active) {
        setMounted(false);
      }
    });

    return () => {
      active = false;
    };
  }, [open, mounted]);

  return { ref, mounted, state: open ? "open" : "closing" };
}
