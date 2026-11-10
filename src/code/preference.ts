import { writable, type Subscriber, type Writable } from "svelte/store";
import { normalizeLanguage } from "./language";

const key = "blog-code-language";
let browserStore: Writable<string | undefined> | undefined;

/** Created only in the browser; its value survives periods without subscribers. */
function preference() {
  if (!browserStore) {
    let saved: string | undefined;
    try {
      saved = window.localStorage.getItem(key) ?? undefined;
    } catch {
      // Storage denial still allows document-local synchronization.
    }
    browserStore = writable(saved);
  }
  return browserStore;
}

export const preferredLanguage = {
  subscribe(run: Subscriber<string | undefined>, invalidate?: () => void) {
    if (typeof window === "undefined") {
      run(undefined);
      return () => {};
    }
    return preference().subscribe(run, invalidate);
  },
  set(language: string) {
    const value = normalizeLanguage(language);
    preference().set(value);
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // The store remains authoritative when storage is unavailable.
    }
  },
};
