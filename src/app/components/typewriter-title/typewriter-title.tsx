"use client";

import { useEffect, useSyncExternalStore } from "react";
import styles from "./typewriter-title.module.css";
import clsx from "clsx";

export const INTRO_KEY = "hasSeenIntro";

type IntroState = "pending" | "animate" | "skip";

function subscribe() {
  return () => {};
}

function getIntroSnapshot(): IntroState {
  try {
    if (sessionStorage.getItem(INTRO_KEY) === "true") {
      return "skip";
    }
    return "animate";
  } catch {
    return "skip";
  }
}

function getServerIntroSnapshot(): IntroState {
  return "pending";
}

export function TypewriterTitle({
  className,
  ...props
}: React.HTMLProps<HTMLDivElement>) {
  const introState = useSyncExternalStore(
    subscribe,
    getIntroSnapshot,
    getServerIntroSnapshot,
  );

  useEffect(() => {
    if (introState !== "animate") {
      return;
    }

    try {
      sessionStorage.setItem(INTRO_KEY, "true");
    } catch {
      // Private browsing or disabled storage — intro still runs once this session.
    }
  }, [introState]);

  return (
    <div
      className={clsx(styles.titleWrapper, className)}
      data-intro={introState}
      {...props}
    >
      <h1 className={styles.title}>
        <span className={styles.titleText}>alexanderlee.tech</span>
      </h1>
    </div>
  );
}
