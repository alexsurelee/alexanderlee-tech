const aliases: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  py: "python",
  sh: "bash",
  shell: "bash",
  yml: "yaml",
  rs: "rust",
  tsx: "tsx",
  jsx: "jsx",
  txt: "text",
  plaintext: "text",
};
export function normalizeLanguage(language: string) {
  const value = language.trim().toLowerCase();
  return aliases[value] ?? value;
}
export function selectLanguage(
  options: string[],
  preferred?: string,
  fallback?: string,
) {
  const normalized = options.map(normalizeLanguage);
  const preferredIndex = preferred
    ? normalized.indexOf(normalizeLanguage(preferred))
    : -1;
  const fallbackIndex = fallback
    ? normalized.indexOf(normalizeLanguage(fallback))
    : -1;
  return preferredIndex >= 0 ? preferredIndex : Math.max(0, fallbackIndex);
}

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
