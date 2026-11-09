import {
  createLanguagePreference,
  type LanguagePreference,
} from "./language-preference.ts";
import { enhanceCodeTabs } from "./tabs-controller.ts";
import { enhanceCopyButton } from "./copy-controller.ts";
type PageState = {
  preference: LanguagePreference;
  groups: Map<HTMLElement, () => void>;
};
const pages = new WeakMap<Document, PageState>();

/** Wire focused controllers to the server-rendered Astro components. */
export function initCodeBlocks(
  document: Document,
  window: Window & typeof globalThis,
  copy = (value: string) => window.navigator.clipboard.writeText(value),
) {
  let state = pages.get(document);
  if (!state) {
    state = { preference: createLanguagePreference(window), groups: new Map() };
    pages.set(document, state);
  }
  for (const [group, dispose] of state.groups)
    if (!group.isConnected) {
      dispose();
      state.groups.delete(group);
    }
  for (const group of document.querySelectorAll<HTMLElement>(
    "[data-code-group]",
  )) {
    if (!state.groups.has(group))
      state.groups.set(group, enhanceCodeTabs(group, state.preference));
  }
  for (const block of document.querySelectorAll<HTMLElement>(
    "[data-code-block]:not([data-copy-ready])",
  ))
    enhanceCopyButton(block, copy, window);
}
