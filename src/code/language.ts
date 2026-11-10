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
