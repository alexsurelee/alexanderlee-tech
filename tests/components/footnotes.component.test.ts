import { expect, test, vi } from "vitest";
import { mount, tick, unmount } from "svelte";
import FloatingFootnotes from "../../src/components/footnotes/FloatingFootnotes.svelte";
test("waits for complete observation, retains the focused keyed note and disposes stale callbacks", async () => {
  document.body.innerHTML =
    '<article data-article-body><a id="r" href="#n" data-footnote-ref>1</a><section data-footnotes><h2 id="h">Footnotes</h2><ol><li id="n"><a href="https://example.com">Source</a></li></ol></section></article>';
  let callback!: IntersectionObserverCallback;
  const disconnect = vi.fn();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe() {}
      disconnect = disconnect;
    },
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect = disconnect;
    },
  );
  const marker = document.querySelector("#r")!;
  const section = document.querySelector("section")!;
  let markerVisible = true;
  let sectionVisible = false;
  const rect = (shown: boolean) =>
    ({
      left: 10,
      right: 20,
      top: shown ? 10 : -20,
      bottom: shown ? 20 : -10,
      width: 10,
      height: 10,
    }) as DOMRect;
  marker.getBoundingClientRect = () => rect(markerVisible);
  section.getBoundingClientRect = () => rect(sectionVisible);
  const target = document.createElement("div");
  document.body.append(target);
  const c = mount(FloatingFootnotes, { target });
  await tick();
  const dock = target.querySelector("aside")!;
  const observe = async (targets: Element[]) => {
    callback(
      targets.map((target) => ({ target })) as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await tick();
  };
  try {
    expect(dock.hidden).toBe(true);
    await observe([marker]);
    expect(dock.hidden).toBe(true);
    await observe([section]);
    expect(dock.hidden).toBe(false);
    const link = dock.querySelector<HTMLAnchorElement>("li a")!;
    link.focus();
    markerVisible = false;
    sectionVisible = true;
    await observe([]);
    expect(dock.querySelector("li a")).toBe(link);
    expect(dock.hidden).toBe(false);
    link.blur();
    await observe([]);
    expect(dock.hidden).toBe(true);
  } finally {
    await unmount(c);
  }
  await observe([]);
  expect(target.querySelector("aside")).toBe(null);
  expect(disconnect).toHaveBeenCalledTimes(2);
  expect(
    document.documentElement.style.getPropertyValue("--footnote-offset"),
  ).toBe("");
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});
test("unsupported observers leave native notes intact and the dock hidden", async () => {
  document.body.innerHTML =
    '<article data-article-body><a id="r" href="#n" data-footnote-ref>1</a><section data-footnotes><ol><li id="n">Native note</li></ol></section></article>';
  vi.stubGlobal("MutationObserver", undefined);
  const target = document.createElement("div");
  document.body.append(target);
  const c = mount(FloatingFootnotes, { target });
  try {
    await tick();
    expect(target.querySelector("aside")?.hidden).toBe(true);
    expect(document.getElementById("n")?.textContent).toBe("Native note");
  } finally {
    await unmount(c);
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  }
});
