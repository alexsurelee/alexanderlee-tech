import { fromHtml } from "hast-util-from-html";
import type { Root, RootContent } from "hast";
import type { Root as MarkdownRoot, Code } from "mdast";
import type { Snippet } from "./snippets.server.ts";

export type CodePart = { html: string } | { snippet: Snippet };

/** Read only fence placeholders. Preserve all other HTML byte-for-byte. */
export function extractCodeParts(html: string): CodePart[] {
  if (!html.includes("data-code-snippet")) return [{ html }];
  const parts: CodePart[] = [];
  let offset = 0;
  function visit(node: Root | RootContent) {
    if (
      node.type === "element" &&
      node.tagName === "pre" &&
      typeof node.properties.dataCodeSnippet === "string"
    ) {
      const start = node.position?.start.offset;
      const end = node.position?.end.offset;
      if (start === undefined || end === undefined)
        throw Error("Missing code fence source position");
      const snippet: unknown = JSON.parse(
        decodeURIComponent(node.properties.dataCodeSnippet),
      );
      if (
        !snippet ||
        typeof snippet !== "object" ||
        !("source" in snippet) ||
        typeof snippet.source !== "string" ||
        ("language" in snippet && typeof snippet.language !== "string") ||
        ("meta" in snippet && typeof snippet.meta !== "string")
      )
        throw Error("Invalid code fence data");
      if (start > offset) parts.push({ html: html.slice(offset, start) });
      parts.push({ snippet: snippet as Snippet });
      offset = end;
      return;
    }
    if ("children" in node) node.children.forEach(visit);
  }
  visit(fromHtml(html, { fragment: true }));
  if (offset < html.length) parts.push({ html: html.slice(offset) });
  return parts;
}
export function getGroupSnippets(html: string): Snippet[] {
  return extractCodeParts(html).flatMap((part) => {
    if ("snippet" in part) return [part.snippet];
    if (part.html.trim())
      throw Error("Code tab groups accept only code fences and whitespace");
    return [];
  });
}

/** Carry ordinary fences into the Astro rendering boundary as source data. */
export default function remarkCode() {
  return (tree: MarkdownRoot) => {
    function walk(node: { type: string; children?: unknown[] }) {
      if (node.type === "code") {
        const code = node as Code;
        const snippet: Snippet = {
          source: code.value,
          language: code.lang ?? "text",
          meta: code.meta ?? "",
        };
        Object.assign(node, {
          type: "paragraph",
          children: [],
          data: {
            hName: "pre",
            hProperties: {
              "data-code-snippet": encodeURIComponent(JSON.stringify(snippet)),
            },
            hChildren: [
              {
                type: "element",
                tagName: "code",
                properties: {},
                children: [{ type: "text", value: code.value }],
              },
            ],
          },
        });
      }
      for (const child of node.children ?? [])
        walk(child as Parameters<typeof walk>[0]);
    }
    walk(tree);
  };
}
