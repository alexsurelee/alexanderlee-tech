import { expect, test, vi } from "vitest";
import { mount, tick, unmount } from "svelte";
import FloatingFootnotes from "./FloatingFootnotes.svelte";
test("waits for complete observation, retains the focused keyed note and disposes stale callbacks", async () => {
  document.body.innerHTML =
    '<article data-article-body><a id="r" href="#n" data-footnote-ref>1</a><a id="r2" href="#n2" data-footnote-ref>2</a><section data-footnotes><h2 id="h">Footnotes</h2><ol><li id="n"><a href="https://example.com">Source</a></li><li id="n2"><a href="https://example.org">Second</a></li></ol></section></article>';
  let callback!: IntersectionObserverCallback;
  const disconnect = vi.fn();
  let resizeCallback!: ResizeObserverCallback;
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
      constructor(cb: ResizeObserverCallback) {
        resizeCallback = cb;
      }
      observe() {}
      disconnect = disconnect;
    },
  );
  const marker = document.querySelector("#r")!;
  const marker2 = document.querySelector("#r2")!;
  let marker2Visible = false;
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
  marker2.getBoundingClientRect = () => rect(marker2Visible);
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
    expect(dock.hidden).toBe(true);
    await observe([marker2]);
    expect(dock.hidden).toBe(false);
    // Resizing the dock updates its offset without rescanning article markers.
    const markerRect = vi.spyOn(marker, "getBoundingClientRect");
    vi.spyOn(dock, "getBoundingClientRect").mockReturnValue({
      ...rect(true),
      height: 180,
    });
    resizeCallback([], {} as ResizeObserver);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await tick();
    expect(
      document.documentElement.style.getPropertyValue("--footnote-offset"),
    ).toBe("180px");

    expect(markerRect).not.toHaveBeenCalled();
    const link = dock.querySelector<HTMLAnchorElement>("li a")!;
    link.focus();
    markerVisible = false;
    marker2Visible = true;
    await observe([]);
    expect(
      [...dock.querySelectorAll<HTMLLIElement>("[data-floating-note]")].map(
        (node) => node.value,
      ),
    ).toEqual([1, 2]);
    expect(dock.querySelector("li a")).toBe(link);
    sectionVisible = true;
    await observe([]);
    expect(dock.querySelector("li a")).toBe(link);
    expect(dock.hidden).toBe(false);
    link.blur();
    await tick();
    expect(dock.hidden).toBe(true);
  } finally {
    await unmount(c);
  }
  await observe([]);
  resizeCallback([], {} as ResizeObserver);
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
