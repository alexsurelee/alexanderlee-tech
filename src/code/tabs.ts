import { selectLanguage, type LanguagePreference } from "./language.ts";

/** Own one Astro-rendered tab group and its browser lifecycle. */
export class CodeTabsController {
  private readonly tabs: HTMLButtonElement[];
  private readonly panels: HTMLElement[];
  private readonly list: HTMLElement | null;
  private readonly languages: string[];
  private readonly isLanguageGroup: boolean;
  private unsubscribe = () => {};
  private initialized = false;
  private disposed = false;

  constructor(
    private readonly group: HTMLElement,
    private readonly preference: LanguagePreference,
  ) {
    this.tabs = Array.from(
      group.querySelectorAll<HTMLButtonElement>("[role=tab]"),
    );
    this.panels = Array.from(
      group.querySelectorAll<HTMLElement>(":scope > [data-code-block]"),
    );
    this.list = group.querySelector<HTMLElement>("[role=tablist]");
    this.languages = this.panels.map(
      (panel) => panel.dataset.language || "text",
    );
    this.isLanguageGroup = group.dataset.codeGroup === "language";
    if (
      !this.list ||
      !this.panels.length ||
      this.tabs.length !== this.panels.length
    )
      return;

    if (this.isLanguageGroup)
      this.unsubscribe = preference.subscribe(this.sync);
    this.sync(this.isLanguageGroup ? preference.get() : undefined);
    this.list.hidden = false;
    this.list.addEventListener("click", this.onClick);
    this.list.addEventListener("keydown", this.onKeydown);
    group.dataset.codeReady = "";
  }

  /** Return to readable, noninteractive fallback and release all subscriptions. */
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.unsubscribe();
    this.list?.removeEventListener("click", this.onClick);
    this.list?.removeEventListener("keydown", this.onKeydown);
    if (!this.initialized) return;
    this.list!.hidden = true;
    this.group.style.removeProperty("min-height");
    delete this.group.dataset.codeReady;
    this.panels.forEach((panel) => {
      panel.hidden = false;
      panel.removeAttribute("role");
      panel.removeAttribute("tabindex");
    });
    this.tabs.forEach((tab) => {
      tab.tabIndex = -1;
      tab.setAttribute("aria-selected", "false");
    });
  }

  private select(index: number) {
    if (this.disposed) return;
    if (this.initialized)
      this.group.style.minHeight = `${this.group.getBoundingClientRect().height}px`;
    this.panels.forEach((panel, i) => {
      panel.hidden = i !== index;
      panel.setAttribute("role", "tabpanel");
      panel.tabIndex = 0;
      this.tabs[i].tabIndex = i === index ? 0 : -1;
      this.tabs[i].setAttribute("aria-selected", String(i === index));
    });
    this.initialized = true;
  }

  private readonly sync = (language?: string) => {
    this.select(
      selectLanguage(this.languages, language, this.group.dataset.default),
    );
  };

  private choose(index: number) {
    if (this.isLanguageGroup) this.preference.set(this.languages[index]);
    else this.select(index);
  }

  private readonly onClick = (event: Event) => {
    const tab = (event.target as Element).closest<HTMLButtonElement>(
      "[role=tab]",
    );
    const index = tab ? this.tabs.indexOf(tab) : -1;
    if (index >= 0) this.choose(index);
  };

  private readonly onKeydown = (event: KeyboardEvent) => {
    const index = this.tabs.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    const positions: Record<string, number> = {
      ArrowRight: (index + 1) % this.tabs.length,
      ArrowLeft: (index + this.tabs.length - 1) % this.tabs.length,
      Home: 0,
      End: this.tabs.length - 1,
    };
    const next = positions[event.key];
    if (next === undefined) return;
    event.preventDefault();
    this.choose(next);
    this.tabs[next].focus();
    this.tabs[next].scrollIntoView?.({ block: "nearest", inline: "nearest" });
  };
}
