import type { Root, Code } from "mdast";
import { renderSnippet } from "./render.ts";

/** Preserve fences as structured HAST, including in MDX component children. */
export default function remarkCode() {
  return (tree: Root) => {
    function walk(node: { type: string; children?: unknown[] }) {
      if (node.type === "code") {
        const code = node as Code;
        const rendered = renderSnippet(
          code.value,
          code.lang ?? "text",
          code.meta ?? "",
        );
        Object.assign(node, {
          type: "paragraph",
          children: [],
          data: {
            hName: rendered.tagName,
            hProperties: rendered.properties,
            hChildren: rendered.children,
          },
        });
      }
      for (const child of node.children ?? [])
        walk(child as Parameters<typeof walk>[0]);
    }
    walk(tree);
  };
}
