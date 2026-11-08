import { normalizeLanguage, selectLanguage } from "./model.ts";
const preferenceKey = "blog-code-language";
type Selection = {
  group: HTMLElement;
  panels: HTMLElement[];
  tabs: HTMLButtonElement[];
  select: (index: number) => void;
};
const states = new WeakMap<
  Document,
  { preferred?: string; groups: Selection[] }
>();

export function initCodeBlocks(
  document: Document,
  window: Window & typeof globalThis,
  copy = (value: string) => window.navigator.clipboard.writeText(value),
) {
  let state = states.get(document);
  if (!state) {
    let preferred: string | undefined;
    try {
      preferred = window.localStorage.getItem(preferenceKey) ?? undefined;
    } catch {
      /* Memory preference works without storage. */
    }
    state = { preferred, groups: [] };
    states.set(document, state);
  }
  const shared = state;
  shared.groups = shared.groups.filter((item) => item.group.isConnected);
  for (const group of document.querySelectorAll<HTMLElement>(
    "[data-code-group]:not([data-code-ready])",
  )) {
    const panels = Array.from(group.children).filter(
      (child): child is HTMLElement =>
        child instanceof window.HTMLElement &&
        child.hasAttribute("data-code-block"),
    );
    if (!panels.length) continue;
    const list = document.createElement("div");
    list.className = "code-tabs";
    list.setAttribute("role", "tablist");
    list.setAttribute(
      "aria-label",
      group.dataset.label ||
        (group.dataset.codeGroup === "language"
          ? "Code language"
          : "Example files"),
    );
    const id = `code-${window.crypto.randomUUID()}`;
    const tabs = panels.map((panel, index) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.id = `${id}-tab-${index}`;
      tab.textContent =
        panel.dataset.title || panel.dataset.language || `Snippet ${index + 1}`;
      panel.id = `${id}-panel-${index}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      panel.tabIndex = 0;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panel.id);
      list.append(tab);
      return tab;
    });
    let initialized = false;
    const select = (index: number) => {
      // Keep the largest visited panel height at this width, avoiding scroll jumps.
      if (initialized)
        group.style.minHeight = `${group.getBoundingClientRect().height}px`;
      panels.forEach((panel, i) => {
        panel.hidden = i !== index;
        tabs[i].tabIndex = i === index ? 0 : -1;
        tabs[i].setAttribute("aria-selected", String(i === index));
      });
      initialized = true;
    };
    const item = { group, panels, tabs, select };
    const choose = (index: number) => {
      if (group.dataset.codeGroup === "language") {
        shared.preferred = normalizeLanguage(
          panels[index].dataset.language || "text",
        );
        try {
          window.localStorage.setItem(preferenceKey, shared.preferred);
        } catch {
          /* Keep page synchronization functional. */
        }
        for (const other of shared.groups)
          if (other.group.dataset.codeGroup === "language")
            other.select(
              selectLanguage(
                other.panels.map((p) => p.dataset.language || "text"),
                shared.preferred,
                other.group.dataset.default,
              ),
            );
      } else select(index);
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => choose(index));
      tab.addEventListener("keydown", (event) => {
        let next: number;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft")
          next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        choose(next);
        tabs[next].focus();
        tabs[next].scrollIntoView?.({ block: "nearest", inline: "nearest" });
      });
    });
    group.prepend(list);
    shared.groups.push(item);
    select(
      selectLanguage(
        panels.map((p) => p.dataset.language || "text"),
        group.dataset.codeGroup === "language" ? shared.preferred : undefined,
        group.dataset.default,
      ),
    );
    group.dataset.codeReady = "";
  }
  for (const block of document.querySelectorAll<HTMLElement>(
    "[data-code-block]:not([data-copy-ready])",
  )) {
    const button = block.querySelector<HTMLButtonElement>("[data-code-copy]");
    const source = block.dataset.codeSource;
    const status = block.querySelector<HTMLElement>("[data-copy-status]");
    if (!button || source === undefined || !status) continue;
    button.hidden = false;
    button.addEventListener("click", async () => {
      try {
        await copy(decodeURIComponent(source));
        button.textContent = "Copied";
        status.textContent = "Copied to clipboard";
      } catch {
        button.textContent = "Retry";
        status.textContent =
          "Copy failed. Select the code and copy it manually, or retry.";
      }
      window.setTimeout(() => {
        button.textContent = "Copy";
        status.textContent = "";
      }, 3000);
    });
    block.dataset.copyReady = "";
  }
}
