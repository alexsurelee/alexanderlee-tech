import { normalizeLanguage } from "./language";
const key = "blog-code-language";
type StorageHost = {
  readonly localStorage: Pick<Storage, "getItem" | "setItem">;
};

function createLanguagePreference(host: StorageHost) {
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
let preference: ReturnType<typeof createLanguagePreference> | undefined;
/** Lazy browser-only state survives island remounts, including denied storage. */
export function languagePreference() {
  return (preference ??= createLanguagePreference(window));
}
