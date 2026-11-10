<script lang="ts">
  import { onMount, tick } from "svelte";
  import {
    copyFootnote,
    readArticleFootnotes,
    type ArticleFootnoteElements,
  } from "../../footnotes/dom";
  import { selectVisibleFootnotes, type Footnote } from "../../footnotes/model";
  import { observeFootnotes } from "../../footnotes/observe";
  let { articleSelector = "[data-article-body]" }: { articleSelector?: string } =
    $props();
  let dock: HTMLElement;
  let notes = $state<Footnote[]>([]);
  let retained = $state(false);
  let href = $state<string | undefined>();
  let article: ArticleFootnoteElements;
  let alive = false;
  let refresh = () => {};
  const containers = new Map<string, HTMLLIElement>();
  function passive(node: HTMLLIElement, note: Footnote) {
    const clone = copyFootnote(
      article.content.get(note.id)!,
      "floating-footnote-",
    );
    node.id = clone.id;
    node.append(...clone.childNodes); // Svelte owns this keyed li; this action alone owns its passive children.
    containers.set(note.id, node);
    return {
      destroy() {
        containers.delete(note.id);
      },
    };
  }
  async function offset() {
    await tick();
    if (alive)
      document.documentElement.style.setProperty(
        "--footnote-offset",
        `${dock.hidden ? 0 : dock.getBoundingClientRect().height}px`,
      );
  }
  function navigate() {
    const heading = article?.section.querySelector<HTMLElement>("h2");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    refresh();
  }
  onMount(() => {
    if (!window.IntersectionObserver || !window.ResizeObserver || !window.MutationObserver) return;
    const body = document.querySelector<HTMLElement>(articleSelector);
    const found = body && readArticleFootnotes(body);
    if (!body || !found) return;
    article = found;
    alive = true;
    const heading = article.section.querySelector<HTMLElement>("h2");
    if (heading?.id) href = `#${heading.id}`;
    const observation = observeFootnotes(
      body,
      article,
      dock,
      window,
      ({ references, permanentSection }) => {
        const selected = selectVisibleFootnotes(
          article.model,
          references,
          permanentSection,
        );
        const focused = notes.filter((note) =>
          containers.get(note.id)?.contains(document.activeElement),
        );
        const ids = new Set([...selected, ...focused].map((note) => note.id));
        notes = article.model.notes.filter((note) => ids.has(note.id));
        retained = dock.contains(document.activeElement);
        void offset();
      },
      () => void offset(),
    );
    refresh = observation.refresh;
    return () => {
      alive = false;
      observation.dispose();
      document.documentElement.style.removeProperty("--footnote-offset");
    };
  });
</script>

<aside bind:this={dock} data-floating-footnotes hidden={!notes.length && !retained} aria-label="Footnotes on this screen">
 <div class="footnote-dock-inner">
  <a data-all-footnotes {href} onclick={navigate}>All footnotes</a>
  <ol data-floating-note-list>
   {#each notes as note (note.id)}<li value={note.number} use:passive={note}></li>{/each}
  </ol>
 </div>
</aside>
