import { readArticleFootnotes, copyFootnote } from './dom';
import { selectVisibleFootnotes } from './model';

const controllers = new WeakMap<Document, () => void>();
export function disposeFootnotes(doc: Document) { controllers.get(doc)?.(); controllers.delete(doc); }
export function initFootnotes(doc: Document, win: Window & typeof globalThis) {
 if (controllers.has(doc) || !win.IntersectionObserver || !win.ResizeObserver) return;
 const body = doc.querySelector<HTMLElement>('[data-article-body]');
 const dock = doc.querySelector<HTMLElement>('[data-floating-footnotes]');
 const list = dock?.querySelector<HTMLOListElement>('[data-floating-note-list]');
 const article = body && readArticleFootnotes(body);
 if (!article || !dock || !list) return;
 let disposed = false;
 let frame = 0;
 const nodes = new Map<string, HTMLLIElement>();
 const seen = new Set<Element>();
 const observed = [...article.markers.values(), article.section];
 const all = dock.querySelector<HTMLAnchorElement>('[data-all-footnotes]')!;
 const heading = article.section.querySelector<HTMLElement>('h2');
 if (heading?.id) all.href = '#' + heading.id;
 // Geometry deliberately ignores the dock overlay, but respects ancestor clipping.
 function visible(element: HTMLElement) {
  let rect = element.getBoundingClientRect();
  const viewport = win.visualViewport;
  let left = viewport?.offsetLeft ?? 0, top = viewport?.offsetTop ?? 0;
  let right = left + (viewport?.width ?? win.innerWidth), bottom = top + (viewport?.height ?? win.innerHeight);
  for (let parent: HTMLElement | null = element; parent; parent = parent.parentElement) {
   const style = win.getComputedStyle(parent);
   if (parent.hidden || style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
   if (parent !== element && /(hidden|clip|auto|scroll)/.test(style.overflow + style.overflowX + style.overflowY)) {
    const clip = parent.getBoundingClientRect();
    left = Math.max(left, clip.left); right = Math.min(right, clip.right);
    top = Math.max(top, clip.top); bottom = Math.min(bottom, clip.bottom);
   }
  }
  return rect.right > left && rect.left < right && rect.bottom > top && rect.top < bottom && rect.width > 0 && rect.height > 0;
 }
 function update() {
  frame = 0;
  if (disposed || seen.size < observed.length) return;
  const visibleRefs = new Set([...article!.markers].filter(([, node]) => visible(node)).map(([id]) => id));
  const selected = selectVisibleFootnotes(article!.model, visibleRefs, visible(article!.section));
  const wanted = new Set(selected.map(note => note.id));
  for (const [id, node] of nodes) {
   if (!wanted.has(id) && !node.contains(doc.activeElement)) { node.remove(); nodes.delete(id); }
  }
  for (const note of selected) {
   if (nodes.has(note.id)) continue;
   const node = copyFootnote(article!.content.get(note.id)!, 'floating-footnote-');
   node.value = note.number;
   nodes.set(note.id, node);
  }
  // Reordering only new entries avoids disrupting focused links.
  for (const note of article!.model.notes) {
   const node = nodes.get(note.id);
   if (node && node.parentElement !== list) {
    const next = Array.from(list!.children).find(child => (child as HTMLLIElement).value > note.number);
    list!.insertBefore(node, next ?? null);
   }
  }
  dock!.hidden = nodes.size === 0 && !dock!.contains(doc.activeElement);
 }
 function schedule() { if (!disposed && !frame) frame = win.requestAnimationFrame(update); }
 const observer = new win.IntersectionObserver(entries => {
  if (disposed) return;
  entries.forEach(entry => seen.add(entry.target));
  schedule();
 }, { threshold: [0, 0.0001] });
 observed.forEach(node => observer.observe(node));
 const resize = new win.ResizeObserver(() => {
  doc.documentElement.style.setProperty('--footnote-offset', dock.hidden ? '0px' : dock.getBoundingClientRect().height + 'px');
  schedule();
 });
 resize.observe(dock);
 const mutations = new win.MutationObserver(schedule);
 mutations.observe(body!, { subtree: true, attributes: true, attributeFilter: ['hidden','class','style','open'] });
 const focusout = () => schedule();
 const goToAll = () => {
  if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  schedule();
 };
 dock.addEventListener('focusout', focusout);
 all.addEventListener('click', goToAll);
 win.addEventListener('resize', schedule);
 // Scroll events are coalesced and measure only known markers, never reparse the document.
 doc.addEventListener('scroll', schedule, true);
 win.visualViewport?.addEventListener('resize', schedule);
 win.visualViewport?.addEventListener('scroll', schedule);
 controllers.set(doc, () => {
  disposed = true;
  win.cancelAnimationFrame(frame);
  observer.disconnect(); resize.disconnect(); mutations.disconnect();
  dock.hidden = true; list.replaceChildren(); nodes.clear();
  dock.removeEventListener('focusout', focusout); all.removeEventListener('click', goToAll);
  win.removeEventListener('resize', schedule); doc.removeEventListener('scroll', schedule, true);
  win.visualViewport?.removeEventListener('resize', schedule); win.visualViewport?.removeEventListener('scroll', schedule);
  doc.documentElement.style.removeProperty('--footnote-offset');
 });
}
