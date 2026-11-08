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
export function prepareSnippet(source: string, meta: string) {
  const diff = /(?:^|\s)diff(?:\s|$)/.test(meta);
  const highlighted = new Set<number>();
  const range = /highlight="([\d,\s-]+)"/.exec(meta)?.[1] ?? "";
  for (const part of range.split(",")) {
    const [start, end = start] = part.trim().split("-").map(Number);
    for (let i = start; i <= Math.min(end, source.split("\n").length); i++)
      highlighted.add(i);
  }
  const lines = source.split("\n").map((text, index) => ({
    text: diff && /^[ +\-]/.test(text) ? text.slice(1) : text,
    kind:
      diff && text.startsWith("+")
        ? "added"
        : diff && text.startsWith("-")
          ? "removed"
          : "context",
    highlighted: highlighted.has(index + 1),
  }));
  return {
    lines,
    copy: diff
      ? lines
          .filter((line) => line.kind !== "removed")
          .map((line) => line.text)
          .join("\n")
      : source,
  };
}
