import {
  codeToTokens,
  isSupportedLanguage,
  type Lang,
  type ThemedToken,
} from "@pierre/highlights";
import {
  githubDarkHighContrast,
  githubLightHighContrast,
} from "@pierre/highlights/themes";
import { normalizeLanguage } from "./language.ts";

export interface Snippet {
  source: string;
  language?: string;
  meta?: string;
}

/** Build-time presentation data; UI structure belongs to Astro components. */
export function highlightSnippet({
  source,
  language = "text",
  meta = "",
}: Snippet) {
  const lang = normalizeLanguage(language);
  const { lines, copy } = prepareSnippet(source, meta);
  const tokens: ThemedToken[][] = isSupportedLanguage(lang)
    ? codeToTokens(lines.map((line) => line.text).join("\n"), {
        lang: lang as Lang,
        themes: {
          light: githubLightHighContrast,
          dark: githubDarkHighContrast,
        },
      }).tokens
    : lines.map((line) => [{ content: line.text, offset: 0 }]);
  return {
    language: lang,
    title: /title="([^"]*)"/.exec(meta)?.[1] ?? lang,
    copy,
    lines: lines.map((line, index) => ({
      ...line,
      indent: Math.min(
        (line.text.match(/^\s*/)?.[0].replaceAll("\t", "    ").length ?? 0) + 2,
        16,
      ),
      tokens: (tokens[index] ?? []).map((token) => ({
        content: token.content,
        style: Object.entries(token.htmlStyle ?? {})
          .map(([key, value]) => `${key}:${value}`)
          .join(";"),
      })),
    })),
  };
}
export type HighlightedSnippet = ReturnType<typeof highlightSnippet>;
export type HighlightedLine = HighlightedSnippet["lines"][number];

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
