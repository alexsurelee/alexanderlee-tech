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

import { renderSnippet } from "../src/code/render.ts";
test("build-time renderer emits dual-theme tokens, decorations and safe plain text", () => {
  const block = renderSnippet(
    'const value = "<safe>";\n-old();\n+new();',
    "ts",
    'diff highlight="1" title="handler.ts"',
  );
  const json = JSON.stringify(block);
  assert.match(json, /--hls-dark/);
  assert.match(json, /code-line","added/);
  assert.match(json, /code-line","removed/);
  assert.match(json, /highlighted/);
  assert.equal(block.properties["data-language"], "typescript");
  const plain = JSON.stringify(
    renderSnippet("<script>literal</script>", "unknown-language", ""),
  );
  assert.match(plain, /"type":"text","value":"<script>literal<\/script>"/);
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
  assert.match(html, /data-code-block/);
  assert.match(html, /--hls-dark/);
  assert.match(html, /data-code-source="const%20markdown%20%3D%20true%3B"/);
  assert.doesNotMatch(html, /astro-code|shiki|<pre><section/);
});
