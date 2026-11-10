import type { ArticleFootnoteElements } from './dom';
import { isFootnoteVisible } from './visibility';

interface FootnoteVisibility {
  references: ReadonlySet<string>;
  permanentSection: boolean;
}

/** Observers and events share one frame; the first complete observation gates rendering. */
export function observeFootnotes(
  body: HTMLElement,
  article: ArticleFootnoteElements,
  dock: HTMLElement,
  win: Window & typeof globalThis,
  onVisibility: (visibility: FootnoteVisibility) => void,
  onResize: () => void,
) {
  const document = body.ownerDocument;
  const observed = [...article.markers.values(), article.section];
  const seen = new Set<Element>();
  let disposed = false;
  let frame = 0;

  function update() {
    frame = 0;
    if (disposed || seen.size < observed.length) return;

    const references = new Set(
      [...article.markers]
        .filter(([, marker]) => isFootnoteVisible(marker, win))
        .map(([id]) => id),
    );
    onVisibility({
      references,
      permanentSection: isFootnoteVisible(article.section, win),
    });
  }

  function refresh() {
    if (!disposed && !frame) frame = win.requestAnimationFrame(update);
  }

  const intersection = new win.IntersectionObserver(entries => {
    if (disposed) return;
    entries.forEach(entry => seen.add(entry.target));
    refresh();
  }, { threshold: [0, 0.0001] });

  const resize = new win.ResizeObserver(() => {
    if (disposed) return;
    onResize();
    refresh();
  });

  const mutations = new win.MutationObserver(refresh);
  observed.forEach(element => intersection.observe(element));
  resize.observe(dock);
  mutations.observe(body, {
    subtree: true,
    attributes: true,
    attributeFilter: ['hidden', 'class', 'style', 'open'],
  });

  // Known-marker geometry is measured on demand, never by a polling loop.
  const events: readonly [EventTarget, string, boolean][] = [
    [dock, 'focusout', false],
    [win, 'resize', false],
    [document, 'scroll', true],
    ...(win.visualViewport ? [
      [win.visualViewport, 'resize', false],
      [win.visualViewport, 'scroll', false],
    ] as [EventTarget, string, boolean][] : []),
  ];
  events.forEach(([target, event, capture]) =>
    target.addEventListener(event, refresh, capture),
  );

  return {
    refresh,
    dispose() {
      disposed = true;
      win.cancelAnimationFrame(frame);
      intersection.disconnect();
      resize.disconnect();
      mutations.disconnect();
      events.forEach(([target, event, capture]) =>
        target.removeEventListener(event, refresh, capture),
      );
    },
  };
}
