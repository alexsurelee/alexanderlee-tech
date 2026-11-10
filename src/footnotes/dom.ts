import type { ArticleFootnotes, FootnoteReference } from './model';

export interface ArticleFootnoteElements {
  model: ArticleFootnotes;
  section: HTMLElement;
  content: ReadonlyMap<string, HTMLLIElement>;
  markers: ReadonlyMap<string, HTMLElement>;
}

function fragmentTarget(link: Element): string | null {
  const href = link.getAttribute('href');
  if (!href?.startsWith('#')) return null;
  try {
    return decodeURIComponent(href.slice(1));
  } catch {
    return null;
  }
}

function readReferences(body: HTMLElement, section: HTMLElement) {
  return [...body.querySelectorAll<HTMLElement>('[data-footnote-ref]')]
    .filter(marker => marker.id && !section.contains(marker));
}

export function readArticleFootnotes(body: HTMLElement): ArticleFootnoteElements | null {
  const section = body.querySelector<HTMLElement>('[data-footnotes]');
  if (!section) return null;

  const items = [...section.querySelectorAll<HTMLLIElement>(':scope > ol > li[id]')];
  const content = new Map(items.map(item => [item.id, item]));
  const notes = items.map((item, index) => ({ id: item.id, number: index + 1 }));
  const markers = new Map<string, HTMLElement>();
  const references: FootnoteReference[] = [];

  for (const marker of readReferences(body, section)) {
    const noteId = fragmentTarget(marker);
    if (!noteId || !content.has(noteId)) return null;
    markers.set(marker.id, marker);
    references.push({ id: marker.id, noteId });
  }

  return references.length
    ? { model: { notes, references }, section, content, markers }
    : null;
}

const interactiveContent = [
  'script', 'style', '[aria-live]', '[role="status"]', 'button', 'input',
  'select', 'textarea', 'iframe', 'video', 'audio', '[role="tablist"]', 'astro-island',
].join(',');

const relationshipAttributes = [
  'aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-details', 'headers', 'for',
];

function removeInteractiveBehavior(element: Element) {
  for (const { name } of [...element.attributes]) {
    if (name.startsWith('data-code-') || name.startsWith('on') || name === 'autofocus') {
      element.removeAttribute(name);
    }
  }
}

function rewriteRelationships(element: Element, ids: ReadonlyMap<string, string>) {
  for (const attribute of relationshipAttributes) {
    const value = element.getAttribute(attribute);
    if (!value) continue;
    const targets = value.split(/\s+/).map(id => ids.get(id) ?? id);
    element.setAttribute(attribute, targets.join(' '));
  }

  // Return links deliberately retain their original article marker targets.
  if (element.hasAttribute('data-footnote-backref')) return;
  const target = fragmentTarget(element);
  if (target && ids.has(target)) element.setAttribute('href', '#' + ids.get(target));
}

/** Passive reading presentation; canonical content owns interactive state. */
export function copyFootnote(source: HTMLLIElement, prefix: string): HTMLLIElement {
  const clone = source.cloneNode(true) as HTMLLIElement;
  clone.querySelectorAll(interactiveContent).forEach(element => element.remove());

  const elements = [clone, ...clone.querySelectorAll<HTMLElement>('*')];
  const ids = new Map(
    elements.filter(element => element.id).map(element => [element.id, prefix + element.id]),
  );

  for (const element of elements) {
    if (element.id) element.id = ids.get(element.id)!;
    removeInteractiveBehavior(element);
    rewriteRelationships(element, ids);
  }
  return clone;
}
