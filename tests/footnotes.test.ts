import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window as HappyWindow } from 'happy-dom';
import { selectVisibleFootnotes } from '../src/footnotes/model.ts';
import { readArticleFootnotes, copyFootnote } from '../src/footnotes/dom.ts';

test('selection preserves numbers, deduplicates repeated references and yields to permanent notes', () => {
 const article = { notes: [{ id: 'a', number: 2 }, { id: 'b', number: 7 }], references: [{ id: 'r1', noteId: 'a' }, { id: 'r2', noteId: 'a' }, { id: 'r3', noteId: 'b' }] };
 assert.deepEqual(selectVisibleFootnotes(article, new Set(['r2','r3']), false).map(n => n.number), [2,7]);
 assert.deepEqual(selectVisibleFootnotes(article, new Set(['r1','r2']), false).map(n => n.number), [2]);
 assert.deepEqual(selectVisibleFootnotes(article, new Set(['r1']), true), []);
 assert.deepEqual(selectVisibleFootnotes(article, new Set(), false), []);
});
test('adapter resolves semantic anchors and copies passive content with unique IDs', () => {
 const window = new HappyWindow();
 window.document.body.innerHTML = '<article><a id="r" data-footnote-ref href="#note">1</a><section data-footnotes><h2 id="label">Footnotes</h2><ol><li id="note"><p id="p">Rich <em>text</em><a href="#p" aria-describedby="p">link</a><a data-footnote-backref href="#r">return</a><button>Copy</button></p></li></ol></section></article>';
 const article = readArticleFootnotes(window.document.querySelector('article')! as unknown as HTMLElement)!;
 assert.equal(article.model.references.length, 1);
 const copy = copyFootnote(article.content.get('note')!, 'floating-');
 assert.equal(copy.id, 'floating-note');
 assert.equal(copy.querySelector('button'), null);
 assert.equal(copy.querySelector('em')?.textContent, 'text');
 assert.equal(copy.querySelector('[aria-describedby]')?.getAttribute('aria-describedby'), 'floating-p');
 assert.equal(copy.querySelector('[data-footnote-backref]')?.getAttribute('href'), '#r');
 window.happyDOM.abort();
});

import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkCode from '../src/code/markdown.server.ts';
import { readFile } from 'node:fs/promises';
test('installed Markdown pipeline retains rich footnotes and parser edge-case behavior', async () => {
 const processor = await createMarkdownProcessor({ remarkPlugins: [remarkCode], syntaxHighlight: false });
 const result = await processor.render(await readFile(new URL('./fixtures/footnotes.md', import.meta.url), 'utf8'));
 const window = new HappyWindow();
 window.document.body.innerHTML = result.code;
 const data = readArticleFootnotes(window.document.body as unknown as HTMLElement)!;
 assert.deepEqual(data.model.references.map(ref => ref.noteId), [data.model.notes[0].id, data.model.notes[0].id, data.model.notes[1].id]);
 assert.match(result.code, /Another paragraph/);
 assert.match(result.code, /<em>Book<\/em>/);
 assert.match(result.code, /\[\^missing\]/);
 assert.doesNotMatch(result.code, /This should not appear|Duplicate definition/);
 assert.equal(window.document.querySelectorAll('[data-footnote-backref]').length, 3);
 await window.happyDOM.abort();
});

import { initFootnotes, disposeFootnotes } from '../src/footnotes/client.ts';
test('controller waits for initial observations, preserves focus and disposes stale callbacks', async () => {
 const window = new HappyWindow();
 const doc = window.document;
 doc.body.innerHTML = '<article data-article-body><a id="r" href="#n" data-footnote-ref>1</a><section data-footnotes><h2 id="h">Footnotes</h2><ol><li id="n"><a href="https://example.com">Source</a></li></ol></section></article><aside data-floating-footnotes hidden><a data-all-footnotes>All footnotes</a><ol data-floating-note-list></ol></aside>';
 let callback: IntersectionObserverCallback;
 let count = 0;
 class Observer {
  constructor(cb: IntersectionObserverCallback) { callback = cb; count++; }
  observe() {}
  disconnect() {}
 }
 Object.defineProperty(window, 'IntersectionObserver', { value: Observer });
 Object.defineProperty(window, 'ResizeObserver', { value: class { observe() {} disconnect() {} } });
 const marker = doc.querySelector('#r')!;
 const section = doc.querySelector('section')!;
 let markerVisible = true;
 let sectionVisible = false;
 const rect = (shown: boolean) => ({ left: 10, right: 20, top: shown ? 10 : -20, bottom: shown ? 20 : -10, width: 10, height: 10 });
 marker.getBoundingClientRect = () => rect(markerVisible) as ReturnType<typeof marker.getBoundingClientRect>;
 section.getBoundingClientRect = () => rect(sectionVisible) as ReturnType<typeof section.getBoundingClientRect>;
 const tick = async () => { await new Promise(resolve => setTimeout(resolve, 35)); };
 initFootnotes(doc as unknown as Document, window as unknown as Window & typeof globalThis);
 initFootnotes(doc as unknown as Document, window as unknown as Window & typeof globalThis);
 assert.equal(count, 1);
 const dock = doc.querySelector('aside')!;
 assert.equal(dock.hidden, true);
 callback!([{ target: marker }, { target: section }] as unknown as IntersectionObserverEntry[], {} as IntersectionObserver);
 await tick();
 assert.equal(dock.hidden, false);
 const link = dock.querySelector('li a')!;
 (link as unknown as HTMLElement).focus();
 markerVisible = false; sectionVisible = true;
 callback!([] , {} as IntersectionObserver);
 await tick();
 assert.equal(dock.hidden, false);
 (link as unknown as HTMLElement).blur();
 await tick();
 assert.equal(dock.hidden, true);
 disposeFootnotes(doc as unknown as Document);
 callback!([], {} as IntersectionObserver);
 await tick();
 assert.equal(dock.querySelectorAll('li').length, 0);
 await window.happyDOM.abort();
});

test('passive code copies cannot initialize duplicate code controllers or live regions', async () => {
 const window = new HappyWindow();
 window.document.body.innerHTML = '<ol><li id="n"><section data-code-block data-code-source="raw"><span role="status" aria-live="polite">Copied</span><pre><code>example</code></pre></section><astro-island><button>Interactive</button></astro-island></li></ol>';
 const copy = copyFootnote(window.document.querySelector('li')! as unknown as HTMLLIElement, 'dock-');
 assert.equal(copy.hasAttribute('data-code-block') || !!copy.querySelector('[data-code-block]'), false);
 assert.equal(!!copy.querySelector('[aria-live]'), false);
 assert.equal(copy.querySelector('astro-island'), null);
 assert.equal(copy.querySelector('code')?.textContent, 'example');
 await window.happyDOM.abort();
});
