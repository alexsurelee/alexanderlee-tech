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
import { normalizeLanguage, prepareSnippet } from "./model.ts";
import type { Snippet } from "./snippets.ts";

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
