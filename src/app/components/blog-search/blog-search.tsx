"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTransitionRouter } from "@/app/lib/use-transition-router";
import clsx from "clsx";
import { Combobox, type ComboboxOption } from "@/app/components/combobox";
import { useOpenIntent } from "@/app/lib/use-open-intent";
import { usePresence } from "@/app/lib/use-presence";
import { formatPostDate, searchPosts, type Post } from "@/app/lib/posts";
import styles from "./blog-search.module.css";

function toOptions(posts: Post[]): ComboboxOption<Post>[] {
  return posts.map((post) => ({ id: post.slug, value: post }));
}

/** Grace period before a pointer-leave closes the panel, in milliseconds. */
const CLOSE_DELAY = 150;

export function BlogSearch({ current }: { current: boolean }) {
  const router = useTransitionRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const linkRef = useRef<HTMLAnchorElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { handlers, cancel } = useOpenIntent({ onOpen: () => setOpen(true) });
  const {
    ref: panelRef,
    mounted: panelMounted,
    state: panelState,
  } = usePresence<HTMLDivElement>(open);

  function clearCloseTimer() {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function close({ restoreFocus = false } = {}) {
    cancel();
    clearCloseTimer();
    setOpen(false);
    if (restoreFocus) {
      linkRef.current?.focus();
    }
  }

  function handlePointerEnter() {
    clearCloseTimer();
    handlers.onPointerEnter();
  }

  // Leaving the trigger/panel schedules a delayed close so brief excursions
  // (e.g. crossing into the panel) don't flicker it shut; re-entering cancels it.
  function handlePointerLeave() {
    cancel();
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      // Keep it open while the user is actively focused inside the panel;
      // focus-out and Escape still close it.
      if (!containerRef.current?.contains(document.activeElement)) {
        setOpen(false);
      }
    }, CLOSE_DELAY);
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        close();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
    // close is stable enough for this lifecycle; only `open` should re-bind.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const options = toOptions(searchPosts(query));

  function handleSelect(option: ComboboxOption<Post>) {
    close();
    router.push(`/blog/${option.value.slug}`);
  }

  function handleSubmit(submitted: string) {
    close();
    const trimmed = submitted.trim();
    router.push(trimmed ? `/blog?q=${encodeURIComponent(trimmed)}` : "/blog");
  }

  function handleContainerBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      close();
    }
  }

  return (
    <div
      ref={containerRef}
      className={styles.root}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onBlur={handleContainerBlur}
    >
      <Link
        ref={linkRef}
        href="/blog"
        className={clsx("navLink", styles.link)}
        data-current={current ? "" : undefined}
        aria-current={current ? "page" : undefined}
        onFocus={handlers.onFocus}
        onBlur={handlers.onBlur}
      >
        Blog
      </Link>

      {panelMounted ? (
        <div ref={panelRef} className={styles.panel} data-state={panelState}>
          <Combobox<Post>
            label="Search blog posts"
            placeholder="Search posts…"
            query={query}
            onQueryChange={setQuery}
            options={options}
            onSelect={handleSelect}
            onSubmit={handleSubmit}
            onClose={() => close({ restoreFocus: true })}
            autoFocus
            emptyState={<>No posts match “{query.trim()}”.</>}
            renderOption={(post) => (
              <>
                <span className={styles.optionTitle}>{post.title}</span>
                <span className={clsx("meta", styles.optionHint)}>
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                </span>
              </>
            )}
          />
        </div>
      ) : null}
    </div>
  );
}
