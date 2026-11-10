<script lang="ts">
  import { onMount } from "svelte";
  import {
    copyFootnote,
    readArticleFootnotes,
    type ArticleFootnoteElements,
  } from "../../../footnotes/dom";
  import { selectVisibleFootnotes, type Footnote } from "../../../footnotes/model";
  import { observeFootnotes } from "../../../footnotes/observe";

  let { articleSelector = "[data-article-body]" }: { articleSelector?: string } =
    $props();
  let dock: HTMLElement;
  let article = $state.raw<ArticleFootnoteElements>();
  let selectedIds = $state<string[]>([]);
  let focus = $state<{ noteId?: string }>();
  const notes = $derived(
    article?.model.notes.filter(
      (note) => selectedIds.includes(note.id) || note.id === focus?.noteId,
    ) ?? [],
  );
  const heading = $derived(article?.section.querySelector<HTMLElement>("h2"));

  function passive(node: HTMLLIElement, note: Footnote) {
    const clone = copyFootnote(
      article!.content.get(note.id)!,
      "floating-footnote-",
    );
    node.id = clone.id;
    // Svelte owns the keyed container; this action alone owns its passive children.
    node.append(...clone.childNodes);
  }
  function trackFocus(event: FocusEvent) {
    const target = event.type === "focusout" ? event.relatedTarget : event.target;
    const inside = target instanceof Element && dock.contains(target);
    focus = inside
      ? { noteId: target.closest<HTMLElement>("[data-floating-note]")?.dataset.floatingNote }
      : undefined;
  }
  function updateOffset(visible: boolean) {
    document.documentElement.style.setProperty(
      "--footnote-offset",
      `${visible ? dock.getBoundingClientRect().height : 0}px`,
    );
  }
  $effect(() => {
    // Effects run after the keyed notes and hidden attribute have been rendered.
    if (article) updateOffset(notes.length > 0 || focus !== undefined);
  });
  function navigate() {
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }
  onMount(() => {
    if (
      !window.IntersectionObserver ||
      !window.ResizeObserver ||
      !window.MutationObserver
    )
      return;
    const body = document.querySelector<HTMLElement>(articleSelector);
    const found = body && readArticleFootnotes(body);
    if (!body || !found) return;
    article = found;
    const stopObserving = observeFootnotes(
      body,
      found,
      window,
      ({ references, permanentSection }) => {
        selectedIds = selectVisibleFootnotes(
          found.model,
          references,
          permanentSection,
        ).map((note) => note.id);
      },
    );
    let active = true;
    const resize = new ResizeObserver(() => {
      if (active) updateOffset(!dock.hidden);
    });
    resize.observe(dock);
    return () => {
      active = false;
      stopObserving();
      resize.disconnect();
      document.documentElement.style.removeProperty("--footnote-offset");
    };
  });
</script>

<aside bind:this={dock} data-floating-footnotes hidden={!notes.length && !focus} aria-label="Footnotes on this screen" onfocusin={trackFocus} onfocusout={trackFocus}>
 <div class="footnote-dock-inner">
  <a data-all-footnotes href={heading?.id ? `#${heading.id}` : undefined} onclick={navigate}>All footnotes</a>
  <ol data-floating-note-list>
   {#each notes as note (note.id)}<li value={note.number} data-floating-note={note.id} use:passive={note}></li>{/each}
  </ol>
 </div>
</aside>
