interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function viewportBounds(win: Window & typeof globalThis): Bounds {
  const viewport = win.visualViewport;
  const left = viewport?.offsetLeft ?? 0;
  const top = viewport?.offsetTop ?? 0;

  return {
    left,
    top,
    right: left + (viewport?.width ?? win.innerWidth),
    bottom: top + (viewport?.height ?? win.innerHeight),
  };
}

function intersect(bounds: Bounds, clip: Bounds): Bounds {
  return {
    left: Math.max(bounds.left, clip.left),
    right: Math.min(bounds.right, clip.right),
    top: Math.max(bounds.top, clip.top),
    bottom: Math.min(bounds.bottom, clip.bottom),
  };
}

function isHidden(element: HTMLElement, style: CSSStyleDeclaration) {
  return element.hidden || style.display === 'none'
    || style.visibility === 'hidden' || style.opacity === '0';
}

function clipsChildren(style: CSSStyleDeclaration) {
  return /(hidden|clip|auto|scroll)/.test(
    style.overflow + style.overflowX + style.overflowY,
  );
}

/** Geometry ignores the dock overlay, but respects ancestor clipping. */
export function isFootnoteVisible(element: HTMLElement, win: Window & typeof globalThis) {
  const rect = element.getBoundingClientRect();
  let bounds = viewportBounds(win);

  for (let parent: HTMLElement | null = element; parent; parent = parent.parentElement) {
    const style = win.getComputedStyle(parent);
    if (isHidden(parent, style)) return false;
    if (parent !== element && clipsChildren(style)) {
      bounds = intersect(bounds, parent.getBoundingClientRect());
    }
  }

  return rect.width > 0 && rect.height > 0
    && rect.right > bounds.left && rect.left < bounds.right
    && rect.bottom > bounds.top && rect.top < bounds.bottom;
}
