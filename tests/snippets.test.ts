import { test } from "node:test";
import assert from "node:assert/strict";
import {
  extractCodeParts,
  getGroupSnippets,
} from "../src/code/markdown.server.ts";
const snippet = {
  source: "<script>literal</script>\n  x",
  language: "ts",
  meta: 'title="example.ts"',
};
const marker = `<pre data-code-snippet="${encodeURIComponent(JSON.stringify(snippet))}"><code>&lt;script&gt;literal&lt;/script&gt;\n  x</code></pre>`;
test("content adapter extracts raw snippet data while retaining surrounding HTML exactly", () => {
  const before = '<aside class="custom">Before &amp; <strong>after</strong>';
  const after = '</aside><script type="module">const x = "<tag>";</script>';
  assert.deepEqual(extractCodeParts(before + marker + after), [
    { html: before },
    { snippet },
    { html: after },
  ]);
  assert.deepEqual(extractCodeParts("<pre><code>ordinary</code></pre>"), [
    { html: "<pre><code>ordinary</code></pre>" },
  ]);
});
test("groups accept fences and whitespace, and reject silently losing author content", () => {
  assert.deepEqual(getGroupSnippets(`\n${marker}\n${marker}\n`), [
    snippet,
    snippet,
  ]);
  assert.throws(
    () => getGroupSnippets(`<p>Unexpected prose</p>${marker}`),
    /only code fences/,
  );
});
