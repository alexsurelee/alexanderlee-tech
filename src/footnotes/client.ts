import { readArticleFootnotes } from './dom';
import { selectVisibleFootnotes } from './model';
import { observeFootnotes } from './observe';
import { createFootnoteView } from './view';

const controllers = new WeakMap<Document, () => void>();

export function disposeFootnotes(document: Document) {
  controllers.get(document)?.();
  controllers.delete(document);
}

export function initFootnotes(document: Document, win: Window & typeof globalThis) {
  if (controllers.has(document) || !win.IntersectionObserver || !win.ResizeObserver) return;

  const body = document.querySelector<HTMLElement>('[data-article-body]');
  const dock = document.querySelector<HTMLElement>('[data-floating-footnotes]');
  const list = dock?.querySelector<HTMLOListElement>('[data-floating-note-list]');
  const allNotes = dock?.querySelector<HTMLAnchorElement>('[data-all-footnotes]');
  const article = body && readArticleFootnotes(body);
  if (!body || !article || !dock || !list || !allNotes) return;

  const view = createFootnoteView(dock, list, article);
  const observation = observeFootnotes(
    body, article, dock, win,
    ({ references, permanentSection }) => {
      view.render(selectVisibleFootnotes(article.model, references, permanentSection));
    },
    () => view.syncScrollOffset(),
  );

  const heading = article.section.querySelector<HTMLElement>('h2');
  if (heading?.id) allNotes.href = '#' + heading.id;

  const navigateToNotes = () => {
    view.focusPermanentHeading();
    observation.refresh();
  };
  allNotes.addEventListener('click', navigateToNotes);

  controllers.set(document, () => {
    observation.dispose();
    view.dispose();
    allNotes.removeEventListener('click', navigateToNotes);
  });
}
