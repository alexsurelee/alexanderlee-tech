import {
  createLanguagePreference,
  type LanguagePreference,
} from "./language.ts";
import { CodeTabsController } from "./tabs.ts";

type PageState = {
  preference: LanguagePreference;
  groups: Map<HTMLElement, CodeTabsController>;
  copies: Map<HTMLElement, () => void>;
};
const pages = new WeakMap<Document, PageState>();

/** Wire controllers to the server-rendered components, reusing existing instances. */
export function initCodeBlocks(
  document: Document,
  window: Window & typeof globalThis,
  copy = (value: string) => window.navigator.clipboard.writeText(value),
) {
  let state = pages.get(document);
  if (!state) {
    state = {
      preference: createLanguagePreference(window),
      groups: new Map(),
      copies: new Map(),
    };
    pages.set(document, state);
  }
  for (const [group, controller] of state.groups)
    if (!group.isConnected) {
      controller.dispose();
      state.groups.delete(group);
    }
  for (const [block, dispose] of state.copies)
    if (!block.isConnected) {
      dispose();
      state.copies.delete(block);
    }
  for (const group of document.querySelectorAll<HTMLElement>(
    "[data-code-group]",
  )) {
    if (!state.groups.has(group))
      state.groups.set(group, new CodeTabsController(group, state.preference));
  }
  for (const block of document.querySelectorAll<HTMLElement>(
    "[data-code-block]",
  )) {
    if (!state.copies.has(block)) {
      const dispose = enhanceCopyButton(block, copy, window);
      if (dispose) state.copies.set(block, dispose);
    }
  }
}

/** Keep the page's in-memory preference across Astro swaps, even without storage. */
export function disposeCodeBlocks(document: Document) {
  const state = pages.get(document);
  if (!state) return;
  for (const controller of state.groups.values()) controller.dispose();
  for (const dispose of state.copies.values()) dispose();
  state.groups.clear();
  state.copies.clear();
}

function enhanceCopyButton(
  block: HTMLElement,
  copy: (value: string) => Promise<void>,
  window: Window & typeof globalThis,
) {
  const button = block.querySelector<HTMLButtonElement>("[data-code-copy]");
  const status = block.querySelector<HTMLElement>("[data-copy-status]");
  const source = block.dataset.codeSource;
  if (!button || !status || source === undefined) return;
  let reset: number | undefined;
  let disposed = false;
  const onClick = async () => {
    window.clearTimeout(reset);
    try {
      await copy(decodeURIComponent(source));
      if (disposed) return;
      button.textContent = "Copied";
      status.textContent = "Copied to clipboard";
    } catch {
      if (disposed) return;
      button.textContent = "Retry";
      status.textContent =
        "Copy failed. Select the code and copy it manually, or retry.";
    }
    reset = window.setTimeout(() => {
      button.textContent = "Copy";
      status.textContent = "";
    }, 3000);
  };
  button.hidden = false;
  button.addEventListener("click", onClick);
  block.dataset.copyReady = "";
  return () => {
    disposed = true;
    window.clearTimeout(reset);
    button.removeEventListener("click", onClick);
    button.hidden = true;
    button.textContent = "Copy";
    status.textContent = "";
    delete block.dataset.copyReady;
  };
}
