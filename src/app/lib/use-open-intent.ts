"use client";

import { useCallback, useEffect, useRef } from "react";

type UseOpenIntentParams = {
  /** Debounce before an intent commits to opening, in milliseconds. */
  delay?: number;
  onOpen: () => void;
};

type OpenIntentHandlers = {
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
};

type UseOpenIntent = {
  /** Spread onto the trigger element to arm hover and long-focus intent. */
  handlers: OpenIntentHandlers;
  /** Cancels a pending intent without opening. */
  cancel: () => void;
};

const DEFAULT_DELAY = 120;

/**
 * Turns incidental pointer hover and sustained keyboard focus into a debounced
 * "open" intent: it fires `onOpen` only after the trigger has been hovered or
 * focused continuously for `delay`, and cancels if the pointer leaves or focus
 * moves away first. This is the hover-intent / "long focus" affordance.
 */
export function useOpenIntent({
  delay = DEFAULT_DELAY,
  onOpen,
}: UseOpenIntentParams): UseOpenIntent {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onOpenRef = useRef(onOpen);

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const arm = useCallback(() => {
    cancel();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onOpenRef.current();
    }, delay);
  }, [cancel, delay]);

  useEffect(() => cancel, [cancel]);

  return {
    handlers: {
      onPointerEnter: arm,
      onPointerLeave: cancel,
      onFocus: arm,
      onBlur: cancel,
    },
    cancel,
  };
}
