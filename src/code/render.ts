import {
  codeToTokens,
  isSupportedLanguage,
  type Lang,
} from "@pierre/highlights";
import {
  githubDarkHighContrast,
  githubLightHighContrast,
} from "@pierre/highlights/themes";
import type { Element, ElementContent, Properties } from "hast";
import { normalizeLanguage, prepareSnippet } from "./model.ts";
const text = (value: string): ElementContent => ({ type: "text", value });
const el = (
  tagName: string,
  properties: Omit<Properties, "className"> & { className?: string },
  children: ElementContent[],
): Element => ({
  type: "element",
  tagName,
  properties: { ...properties, className: properties.className?.split(" ") },
  children,
});

export function renderSnippet(
  source: string,
  language = "text",
  meta = "",
): Element {
  const lang = normalizeLanguage(language);
  const title = /title="([^"]*)"/.exec(meta)?.[1] ?? lang;
  const { lines, copy } = prepareSnippet(source, meta);
  // Tokenize the complete snippet to retain multiline lexer state; annotate afterward.
  const tokens = isSupportedLanguage(lang)
    ? codeToTokens(lines.map((l) => l.text).join("\n"), {
        lang: lang as Lang,
        themes: {
          light: githubLightHighContrast,
          dark: githubDarkHighContrast,
        },
      }).tokens
    : lines.map((line) => [{ content: line.text }]);
  const rendered = lines.map((line, index) => {
    const indent =
      line.text.match(/^\s*/)?.[0].replaceAll("\t", "    ").length ?? 0;
    const content = (tokens[index] ?? []).map((token) =>
      el(
        "span",
        {
          style:
            "htmlStyle" in token
              ? Object.entries(token.htmlStyle ?? {})
                  .map(([key, value]) => `${key}:${value}`)
                  .join(";")
              : "",
        },
        [text(token.content)],
      ),
    );
    const marker =
      line.kind === "added" ? "+" : line.kind === "removed" ? "−" : " ";
    return el(
      "span",
      {
        className: `code-line ${line.kind}${line.highlighted ? " highlighted" : ""}`,
        style: `--indent:${Math.min(indent + 2, 16)}ch`,
      },
      [
        el("span", { className: "code-marker", "aria-hidden": "true" }, [
          text(marker),
        ]),
        ...(line.kind !== "context"
          ? [el("span", { className: "sr-only" }, [text(`${line.kind}: `)])]
          : []),
        ...content,
        ...(index < lines.length - 1 ? [text("\n")] : []),
      ],
    );
  });
  return el(
    "section",
    {
      className: "code-block",
      "data-code-block": "",
      "data-language": lang,
      "data-title": title,
      "data-code-source": encodeURIComponent(copy),
    },
    [
      el("div", { className: "code-toolbar" }, [
        el("span", { className: "code-title" }, [text(title)]),
        el("button", { type: "button", "data-code-copy": "", hidden: true }, [
          text("Copy"),
        ]),
        el(
          "span",
          { className: "sr-only", role: "status", "data-copy-status": "" },
          [],
        ),
      ]),
      el("pre", {}, [el("code", {}, rendered)]),
    ],
  );
}
