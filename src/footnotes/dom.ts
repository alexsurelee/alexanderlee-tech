import type { ArticleFootnotes, FootnoteReference } from './model';
export function readArticleFootnotes(body: HTMLElement) {
 const section = body.querySelector<HTMLElement>('[data-footnotes]');
 if (!section) return null;
 const content = new Map<string, HTMLLIElement>();
 const notes = Array.from(section.querySelectorAll<HTMLLIElement>(':scope > ol > li[id]')).map((node, index) => {
  content.set(node.id, node);
  return { id: node.id, number: index + 1 };
 });
 const markers = new Map<string, HTMLElement>();
 const references: FootnoteReference[] = [];
 for (const marker of body.querySelectorAll<HTMLElement>('[data-footnote-ref]')) {
  if (section.contains(marker) || !marker.id) continue;
  let noteId: string;
  try { noteId = decodeURIComponent((marker.getAttribute('href') ?? '').slice(1)); } catch { return null; }
  if (!content.has(noteId)) return null;
  markers.set(marker.id, marker);
  references.push({ id: marker.id, noteId });
 }
 const model: ArticleFootnotes = { notes, references };
 return references.length ? { model, section, content, markers } : null;
}
// Copy only a passive reading presentation; canonical content owns interactive state.
export function copyFootnote(source: HTMLLIElement, prefix: string): HTMLLIElement {
 const clone = source.cloneNode(true) as HTMLLIElement;
 clone.querySelectorAll('script,style,[aria-live],[role="status"],button,input,select,textarea,iframe,video,audio,[role="tablist"]').forEach(node => node.remove());
 clone.querySelectorAll('astro-island').forEach(node => node.remove());
 const elements = [clone, ...clone.querySelectorAll<HTMLElement>('*')];
 const ids = new Map(elements.filter(node => node.id).map(node => [node.id, prefix + node.id]));
 for (const node of elements) {
  if (node.id) node.id = ids.get(node.id)!;
  for (const attribute of Array.from(node.attributes)) {
   if (/^data-code-/.test(attribute.name)) node.removeAttribute(attribute.name);
   if (attribute.name.startsWith('on') || attribute.name === 'autofocus') node.removeAttribute(attribute.name);
  }
  for (const attribute of ['aria-labelledby','aria-describedby','aria-controls','aria-details','headers','for']) {
   const value = node.getAttribute(attribute);
   if (value) node.setAttribute(attribute, value.split(/\s+/).map(id => ids.get(id) ?? id).join(' '));
  }
  const href = node.getAttribute('href');
  if (href?.startsWith('#') && !node.hasAttribute('data-footnote-backref')) {
   const id = decodeURIComponent(href.slice(1));
   if (ids.has(id)) node.setAttribute('href', '#' + ids.get(id));
  }
 }
 return clone;
}
