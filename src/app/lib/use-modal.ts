"use client";

import { useEffect, type RefObject } from "react";

/** Prevents background scroll while a modal overlay is open. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => !element.hasAttribute("disabled") && element.tabIndex !== -1,
  );
}

function focusLastElement(focusable: HTMLElement[]) {
  focusable[focusable.length - 1]?.focus();
}

function focusFirstElement(focusable: HTMLElement[]) {
  focusable[0]?.focus();
}

function handleTabForward(
  event: KeyboardEvent,
  focusable: HTMLElement[],
) {
  const last = focusable[focusable.length - 1];
  const activeElement = document.activeElement;
  if (activeElement !== last) return;

  event.preventDefault();
  focusFirstElement(focusable);
}

function handleTabBackward(
  event: KeyboardEvent,
  container: HTMLElement,
  focusable: HTMLElement[],
) {
  const first = focusable[0];
  const activeElement = document.activeElement as HTMLElement | null;
  if (activeElement !== first && container.contains(activeElement)) return;

  event.preventDefault();
  focusLastElement(focusable);
}

/** Keeps Tab / Shift+Tab cycling within `containerRef` while active. */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!active) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const container = containerRef.current;
      if (!container) return;

      const focusable = getFocusableElements(container);
      if (focusable.length === 0) return;

      if (event.shiftKey) {
        handleTabBackward(event, container, focusable);
      } else {
        handleTabForward(event, focusable);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, containerRef]);
}
