import { test } from "node:test";
import assert from "node:assert/strict";
import { Window as HappyWindow } from "happy-dom";
import { selectVisibleFootnotes } from "../src/footnotes/model.ts";
import { readArticleFootnotes, copyFootnote } from "../src/footnotes/dom.ts";

test("selection preserves numbers, deduplicates repeated references and yields to permanent notes", () => {
  const article = {
    notes: [
      { id: "a", number: 2 },
      { id: "b", number: 7 },
    ],
    references: [
      { id: "r1", noteId: "a" },
      { id: "r2", noteId: "a" },
      { id: "r3", noteId: "b" },
    ],
  };
  assert.deepEqual(
    selectVisibleFootnotes(article, new Set(["r2", "r3"]), false).map(
      (n) => n.number,
    ),
    [2, 7],
  );
  assert.deepEqual(
    selectVisibleFootnotes(article, new Set(["r1", "r2"]), false).map(
      (n) => n.number,
    ),
    [2],
  );
  assert.deepEqual(selectVisibleFootnotes(article, new Set(["r1"]), true), []);
  assert.deepEqual(selectVisibleFootnotes(article, new Set(), false), []);
});
test("adapter resolves semantic anchors and copies passive content with unique IDs", () => {
  const window = new HappyWindow();
  window.document.body.innerHTML =
    '<article><a id="r" data-footnote-ref href="#note">1</a><section data-footnotes><h2 id="label">Footnotes</h2><ol><li id="note"><p id="p">Rich <em>text</em><a href="#p" aria-describedby="p">link</a><a data-footnote-backref href="#r">return</a><button>Copy</button></p></li></ol></section></article>';
  const article = readArticleFootnotes(
    window.document.querySelector("article")! as unknown as HTMLElement,
  )!;
  assert.equal(article.model.references.length, 1);
  const copy = copyFootnote(article.content.get("note")!, "floating-");
  assert.equal(copy.id, "floating-note");
  assert.equal(copy.querySelector("button"), null);
  assert.equal(copy.querySelector("em")?.textContent, "text");
  assert.equal(
    copy.querySelector("[aria-describedby]")?.getAttribute("aria-describedby"),
    "floating-p",
  );
  assert.equal(
    copy.querySelector("[data-footnote-backref]")?.getAttribute("href"),
    "#r",
  );
  window.happyDOM.abort();
});

import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import remarkCode from "../src/code/markdown.server.ts";
import { readFile } from "node:fs/promises";
test("installed Markdown pipeline retains rich footnotes and parser edge-case behavior", async () => {
  const processor = await createMarkdownProcessor({
    remarkPlugins: [remarkCode],
    syntaxHighlight: false,
  });
  const result = await processor.render(
    await readFile(new URL("./fixtures/footnotes.md", import.meta.url), "utf8"),
  );
  const window = new HappyWindow();
  window.document.body.innerHTML = result.code;
  const data = readArticleFootnotes(
    window.document.body as unknown as HTMLElement,
  )!;
  assert.deepEqual(
    data.model.references.map((ref) => ref.noteId),
    [data.model.notes[0].id, data.model.notes[0].id, data.model.notes[1].id],
  );
  assert.match(result.code, /Another paragraph/);
  assert.match(result.code, /<em>Book<\/em>/);
  assert.match(result.code, /\[\^missing\]/);
  assert.doesNotMatch(
    result.code,
    /This should not appear|Duplicate definition/,
  );
  assert.equal(
    window.document.querySelectorAll("[data-footnote-backref]").length,
    3,
  );
  await window.happyDOM.abort();
});

test("passive code copies cannot initialize duplicate code controllers or live regions", async () => {
  const window = new HappyWindow();
  window.document.body.innerHTML =
    '<ol><li id="n"><section data-code-block data-code-source="raw"><span role="status" aria-live="polite">Copied</span><pre><code>example</code></pre></section><astro-island><button>Interactive</button></astro-island></li></ol>';
  const copy = copyFootnote(
    window.document.querySelector("li")! as unknown as HTMLLIElement,
    "dock-",
  );
  assert.equal(
    copy.hasAttribute("data-code-block") ||
      !!copy.querySelector("[data-code-block]"),
    false,
  );
  assert.equal(!!copy.querySelector("[aria-live]"), false);
  assert.equal(copy.querySelector("astro-island"), null);
  assert.equal(copy.querySelector("code")?.textContent, "example");
  await window.happyDOM.abort();
});

test("passive copies unwrap only code islands and reveal every labeled panel", async () => {
  const window = new HappyWindow();
  window.document.body.innerHTML =
    '<li id="n"><astro-island component-url="/CodeExample.js"><div data-code-example data-code-ready style="min-height:400px"><div role="tablist"><button id="tab">TS</button></div><section class="code-block" role="tabpanel" aria-labelledby="tab" hidden><div class="code-title">TS</div><pre><code>literal</code></pre></section></div></astro-island><astro-island><p>unrelated</p></astro-island></li>';
  const copy = copyFootnote(
    window.document.querySelector("li")! as unknown as HTMLLIElement,
    "dock-",
  );
  assert.equal(copy.querySelector("code")?.textContent, "literal");
  assert.equal(
    copy.querySelector(
      '[hidden], [role="tabpanel"], [aria-labelledby], astro-island, button, [data-code-ready]',
    ),
    null,
  );
  assert.doesNotMatch(copy.textContent ?? "", /unrelated/);
  await window.happyDOM.abort();
});

import { isFootnoteVisible } from "../src/footnotes/visibility";
test("visibility excludes hidden and clipped references and accepts any positive section area", async () => {
  const window = new HappyWindow();
  window.document.body.innerHTML = "<div><a>marker</a></div>";
  const parent = window.document.querySelector("div")!;
  const marker = window.document.querySelector("a")!;
  const bounds = (top: number, bottom: number) =>
    new window.DOMRect(10, top, 10, bottom - top);
  marker.getBoundingClientRect = () => bounds(10, 20);
  const visible = () =>
    isFootnoteVisible(
      marker as unknown as HTMLElement,
      window as unknown as Window & typeof globalThis,
    );
  assert.equal(visible(), true);
  parent.hidden = true;
  assert.equal(visible(), false);
  parent.hidden = false;
  parent.style.overflow = "hidden";
  parent.getBoundingClientRect = () => bounds(30, 40);
  assert.equal(visible(), false);
  parent.style.overflow = "visible";
  marker.getBoundingClientRect = () => bounds(-10, 0.01);
  assert.equal(visible(), true);
  marker.getBoundingClientRect = () => bounds(-10, 0);
  assert.equal(visible(), false);
  await window.happyDOM.abort();
});

test("passive copies remove links to IDs deleted with interactive content", async () => {
  const window = new HappyWindow();
  window.document.body.innerHTML =
    '<li id="note"><button id="control">control</button><a href="#control">gone</a><a href="#note">kept</a></li>';
  const copy = copyFootnote(
    window.document.querySelector("li")! as unknown as HTMLLIElement,
    "dock-",
  );
  assert.equal(copy.querySelectorAll("a")[0].hasAttribute("href"), false);
  assert.equal(
    copy.querySelectorAll("a")[1].getAttribute("href"),
    "#dock-note",
  );
  await window.happyDOM.abort();
});
