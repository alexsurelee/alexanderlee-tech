import { test } from "node:test";
import assert from "node:assert/strict";
import {
  prepareSnippet,
  normalizeLanguage,
  selectLanguage,
} from "../src/code/model.ts";

test("copy keeps whitespace and logical lines, diff copy keeps resulting source", () => {
  assert.equal(
    prepareSnippet("\tlong line  \n\n", "").copy,
    "\tlong line  \n\n",
  );
  const diff = prepareSnippet(
    " const x = 1;\n-old();\n+new();\n",
    'diff highlight="1,3"',
  );
  assert.equal(diff.copy, "const x = 1;\nnew();\n");
  assert.deepEqual(
    diff.lines.map((l) => l.kind),
    ["context", "removed", "added", "context"],
  );
  assert.equal(diff.lines[2].highlighted, true);
});
test("language aliases and fallback never replace the preferred language", () => {
  assert.equal(normalizeLanguage("ts"), "typescript");
  assert.equal(normalizeLanguage("py"), "python");
  assert.equal(selectLanguage(["ts", "python"], "typescript", "python"), 0);
  assert.equal(selectLanguage(["json", "py"], "typescript", "python"), 1);
  assert.equal(selectLanguage(["json", "py"], "rust"), 0);
});

import { highlightSnippet } from "../src/code/highlight.ts";
test("highlighting returns presentation data without owning component markup", () => {
  const snippet = highlightSnippet({
    source: 'const value = "<safe>";\n-old();\n+new();',
    language: "ts",
    meta: 'diff highlight="1" title="handler.ts"',
  });
  assert.equal(snippet.language, "typescript");
  assert.equal(snippet.title, "handler.ts");
  assert.equal(snippet.copy, 'const value = "<safe>";\nnew();');
  assert.deepEqual(
    snippet.lines.map((line) => line.kind),
    ["context", "removed", "added"],
  );
  assert.equal(snippet.lines[0].highlighted, true);
  assert.match(JSON.stringify(snippet.lines[0].tokens), /--hls-dark/);
  const plain = highlightSnippet({
    source: "<script>literal</script>",
    language: "unknown",
  });
  assert.equal(plain.lines[0].tokens[0].content, "<script>literal</script>");
});

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { toHtml } from "hast-util-to-html";
import remarkCode from "../src/code/remark-code.ts";
import { readFile } from "node:fs/promises";
test("ordinary Markdown fences use the shared renderer through the actual transform", async () => {
  const source = await readFile(
    new URL("./fixtures/code-blocks.md", import.meta.url),
    "utf8",
  );
  const processor = unified()
    .use(remarkParse)
    .use(remarkCode)
    .use(remarkRehype);
  const html = toHtml(await processor.run(processor.parse(source)));
  const { extractCodeParts } = await import("../src/code/snippets.ts");
  const snippets = extractCodeParts(html).filter((part) => "snippet" in part);
  assert.deepEqual(snippets, [
    {
      snippet: {
        source: "const markdown = true;",
        language: "ts",
        meta: 'highlight="1"',
      },
    },
  ]);
  assert.match(html, /<pre data-code-snippet=/);
  assert.doesNotMatch(html, /astro-code|shiki|<pre><section/);
});
