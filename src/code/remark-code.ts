import type { Root, Code } from "mdast";
import type { Snippet } from "./snippets.ts";

/** Carry ordinary fences into the Astro rendering boundary as source data. */
export default function remarkCode() {
  return (tree: Root) => {
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
