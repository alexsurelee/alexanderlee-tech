import { selectLanguage } from "./model.ts";
import type { LanguagePreference } from "./language-preference.ts";

/** Enhance the controls declared by CodeTabs.astro; never build UI here. */
export function enhanceCodeTabs(
  group: HTMLElement,
  preference: LanguagePreference,
) {
  const tabs = Array.from(
    group.querySelectorAll<HTMLButtonElement>("[role=tab]"),
  );
  const panels = Array.from(
    group.querySelectorAll<HTMLElement>(":scope > [data-code-block]"),
  );
  const list = group.querySelector<HTMLElement>("[role=tablist]");
  if (!list || !panels.length || tabs.length !== panels.length) return () => {};
  const languages = panels.map((panel) => panel.dataset.language || "text");
  const isLanguageGroup = group.dataset.codeGroup === "language";
  let initialized = false;
  const select = (index: number) => {
    if (initialized)
      group.style.minHeight = `${group.getBoundingClientRect().height}px`;
    panels.forEach((panel, i) => {
      panel.hidden = i !== index;
      panel.setAttribute("role", "tabpanel");
      panel.tabIndex = 0;
      tabs[i].tabIndex = i === index ? 0 : -1;
      tabs[i].setAttribute("aria-selected", String(i === index));
    });
    initialized = true;
  };
  const sync = (language?: string) =>
    select(selectLanguage(languages, language, group.dataset.default));
  const unsubscribe = isLanguageGroup ? preference.subscribe(sync) : () => {};
  const choose = (index: number) =>
    isLanguageGroup ? preference.set(languages[index]) : select(index);
  const onClick = (event: Event) => {
    const tab = (event.target as Element).closest<HTMLButtonElement>(
      "[role=tab]",
    );
    const index = tab ? tabs.indexOf(tab) : -1;
    if (index >= 0) choose(index);
  };
  const onKeydown = (event: KeyboardEvent) => {
    const index = tabs.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    const positions: Record<string, number> = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index + tabs.length - 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    const next = positions[event.key];
    if (next === undefined) return;
    event.preventDefault();
    choose(next);
    tabs[next].focus();
    tabs[next].scrollIntoView?.({ block: "nearest", inline: "nearest" });
  };
  sync(isLanguageGroup ? preference.get() : undefined);
  list.hidden = false;
  list.addEventListener("click", onClick);
  list.addEventListener("keydown", onKeydown);
  group.dataset.codeReady = "";
  return () => {
    unsubscribe();
    list.removeEventListener("click", onClick);
    list.removeEventListener("keydown", onKeydown);
  };
}
