import { normalizeLanguage } from "./model.ts";
const key = "blog-code-language";
type StorageHost = {
  readonly localStorage: Pick<Storage, "getItem" | "setItem">;
};

export function createLanguagePreference(host: StorageHost) {
  let value: string | undefined;
  const listeners = new Set<(language: string) => void>();
  try {
    value = host.localStorage.getItem(key) ?? undefined;
  } catch {
    /* Use page memory when storage is blocked. */
  }
  return {
    get: () => value,
    set(language: string) {
      value = normalizeLanguage(language);
      try {
        host.localStorage.setItem(key, value);
      } catch {
        /* Synchronization still works in memory. */
      }
      for (const listener of listeners) listener(value);
    },
    subscribe(listener: (language: string) => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
export type LanguagePreference = ReturnType<typeof createLanguagePreference>;
