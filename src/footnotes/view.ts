import { copyFootnote, type ArticleFootnoteElements } from './dom';
import type { Footnote } from './model';

/** Owns the dock's keyed children and the focus-preservation exception. */
export function createFootnoteView(
  dock: HTMLElement,
  list: HTMLOListElement,
  article: ArticleFootnoteElements,
) {
  const document = dock.ownerDocument;
  const nodes = new Map<string, HTMLLIElement>();

  function removeUnselectedNotes(selected: readonly Footnote[]) {
    const wanted = new Set(selected.map(note => note.id));

    for (const [id, node] of nodes) {
      if (wanted.has(id) || node.contains(document.activeElement)) continue;
      node.remove();
      nodes.delete(id);
    }
  }

  function insertNote(note: Footnote) {
    if (nodes.has(note.id)) return;

    const node = copyFootnote(article.content.get(note.id)!, 'floating-footnote-');
    node.value = note.number;
    const next = Array.from(list.children).find(
      child => (child as HTMLLIElement).value > note.number,
    );

    list.insertBefore(node, next ?? null);
    nodes.set(note.id, node);
  }

  return {
    render(selected: readonly Footnote[]) {
      removeUnselectedNotes(selected);
      selected.forEach(insertNote);
      dock.hidden = nodes.size === 0 && !dock.contains(document.activeElement);
    },

    focusPermanentHeading() {
      const heading = article.section.querySelector<HTMLElement>('h2');
      if (!heading) return;
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    },

    syncScrollOffset() {
      const height = dock.hidden ? 0 : dock.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--footnote-offset', height + 'px');
    },

    dispose() {
      dock.hidden = true;
      list.replaceChildren();
      nodes.clear();
      document.documentElement.style.removeProperty('--footnote-offset');
    },
  };
}
