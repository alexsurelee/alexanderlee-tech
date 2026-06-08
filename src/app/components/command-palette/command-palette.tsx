"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useTransitionRouter } from "@/app/lib/use-transition-router";
import { runViewTransition } from "@/app/lib/run-view-transition";
import clsx from "clsx";
import { useCombobox, type ComboboxOption } from "@/app/components/combobox";
import { formatPostDate, type Post } from "@/app/lib/posts";
import { useFocusTrap, useScrollLock } from "@/app/lib/use-modal";
import {
  buildPaletteOptions,
  type PaletteItem,
  type PaletteRoute,
} from "./build-palette-options";
import styles from "./command-palette.module.css";

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  /** Element to restore focus to when the palette closes. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  /**
   * Plays the open animation on mount. Set false for keyboard-initiated opens
   * (e.g. Cmd/Ctrl-K) so the palette appears instantly.
   */
  animateEnter?: boolean;
};

function resultCountLabel(count: number): string {
  if (count === 0) return "No results";
  return `${count} result${count === 1 ? "" : "s"}`;
}

function emptyStateText(query: string): string {
  const trimmed = query.trim();
  if (trimmed === "") return "No pages or posts to show.";
  return `No results for “${trimmed}”.`;
}

export function CommandPalette({
  open,
  onClose,
  returnFocusRef,
  animateEnter = true,
}: CommandPaletteProps) {
  const router = useTransitionRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const canUseDom = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const { routes, posts, flat } = buildPaletteOptions(query);

  useScrollLock(open);
  useFocusTrap(open, panelRef);

  function close({ restoreFocus = false } = {}) {
    setQuery("");
    runViewTransition(() => onClose());
    if (restoreFocus) {
      returnFocusRef?.current?.focus();
    }
  }

  function handleSelect(option: ComboboxOption<PaletteItem>) {
    close();
    if (option.value.kind === "route") {
      router.push(option.value.route.href);
      return;
    }
    router.push(`/blog/${option.value.post.slug}`);
  }

  function handleSubmit(submitted: string) {
    close();
    const trimmed = submitted.trim();
    router.push(trimmed ? `/blog?q=${encodeURIComponent(trimmed)}` : "/blog");
  }

  const { activeIndex, getInputProps, getListboxProps, getOptionProps } =
    useCombobox<PaletteItem>({
      query,
      onQueryChange: setQuery,
      options: flat,
      onSelect: handleSelect,
      onSubmit: handleSubmit,
      onClose: () => close({ restoreFocus: true }),
    });

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  if (!open || !canUseDom) {
    return null;
  }

  const inputProps = getInputProps();
  const listboxProps = getListboxProps();
  const hasResults = flat.length > 0;

  function renderRouteOption(route: PaletteRoute, index: number) {
    const active = index === activeIndex;
    return (
      <li
        key={`route-${route.href}`}
        {...getOptionProps(index)}
        className={clsx(
          styles.option,
          styles.optionRoute,
          active && styles.optionActive,
        )}
        data-active={active ? "" : undefined}
      >
        {route.label}
      </li>
    );
  }

  function renderPostOption(post: Post, index: number) {
    const globalIndex = routes.length + index;
    const active = globalIndex === activeIndex;
    return (
      <li
        key={`post-${post.slug}`}
        {...getOptionProps(globalIndex)}
        className={clsx(
          styles.option,
          styles.optionPost,
          active && styles.optionActive,
        )}
        data-active={active ? "" : undefined}
      >
        <span className={styles.optionTitle}>{post.title}</span>
        <span className={clsx("meta", styles.optionHint)}>
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
        </span>
      </li>
    );
  }

  return createPortal(
    <div
      className={styles.overlay}
      data-animate={animateEnter}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          close({ restoreFocus: true });
        }
      }}
    >
      <div
        ref={panelRef}
        id="command-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        className={styles.commandPalette}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <p className={clsx("sectionLabel", styles.headerLabel)}>Menu</p>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close menu"
            onClick={() => close({ restoreFocus: true })}
          >
            Close
          </button>
        </div>

        <input
          {...inputProps}
          ref={inputRef}
          type="search"
          className={styles.input}
          aria-label="Search pages and blog posts"
          placeholder="Search pages and posts…"
          autoComplete="off"
          spellCheck={false}
        />

        {hasResults ? (
          <ul {...listboxProps} className={styles.listbox}>
            {routes.length > 0 ? (
              <>
                <li
                  role="presentation"
                  aria-hidden="true"
                  className={clsx("sectionLabel", styles.groupLabel)}
                >
                  Pages
                </li>
                {routes.map((option, index) =>
                  renderRouteOption(option.value, index),
                )}
              </>
            ) : null}

            {posts.length > 0 ? (
              <>
                <li
                  role="presentation"
                  aria-hidden="true"
                  className={clsx("sectionLabel", styles.groupLabel)}
                >
                  Blog posts
                </li>
                {posts.map((option, index) =>
                  renderPostOption(option.value, index),
                )}
              </>
            ) : null}
          </ul>
        ) : (
          <div className={styles.empty} role="presentation">
            {emptyStateText(query)}
          </div>
        )}

        <div role="status" aria-live="polite" className={styles.srOnly}>
          {resultCountLabel(flat.length)}
        </div>
      </div>
    </div>,
    document.body,
  );
}
