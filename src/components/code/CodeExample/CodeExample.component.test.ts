import { afterEach, expect, test, vi } from "vitest";
import { mount, unmount, tick } from "svelte";
import { fromStore, writable } from "svelte/store";
import CodeExample from "./CodeExample.svelte";
const components: ReturnType<typeof mount>[] = [];
afterEach(async () => {
  for (const c of components.splice(0)) await unmount(c);
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});
const snippets = ["typescript", "python"].map((language) => ({
  language,
  title: language,
  copy: `  ${language}\n`,
  lines: [
    {
      text: language,
      kind: "context" as const,
      highlighted: false,
      indent: 2,
      tokens: [{ content: language, style: "" }],
    },
  ],
}));
async function example(kind: "file" | "language" = "language") {
  const target = document.createElement("div");
  document.body.append(target);
  components.push(
    mount(CodeExample, {
      target,
      props: {
        kind,
        snippets,
        label: "Examples",
        id: `test-${components.length}`,
      },
    }),
  );
  await tick();
  return target;
}
test("language islands synchronize without stealing focus; files remain local and keys focus tabs", async () => {
  const a = await example();
  const b = await example();
  const files = await example("file");
  const tabs = (el: HTMLElement) => [
    ...el.querySelectorAll<HTMLButtonElement>("[role=tab]"),
  ];
  tabs(a)[0].focus();
  tabs(b)[1].click();
  await tick();
  expect(tabs(a)[1].getAttribute("aria-selected")).toBe("true");
  expect(document.activeElement).toBe(tabs(a)[0]);
  expect(tabs(files)[0].getAttribute("aria-selected")).toBe("true");
  tabs(a)[1].dispatchEvent(
    new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
  );
  await tick();
  expect(document.activeElement).toBe(tabs(a)[0]);
});
test("copy preserves exact text, announces rejection, and ignores older completions", async () => {
  const a = await example("file");
  const pending: { resolve: () => void; reject: () => void }[] = [];
  const copy = vi.fn(
    () =>
      new Promise<void>((resolve, reject) =>
        pending.push({ resolve, reject: () => reject(Error("denied")) }),
      ),
  );
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: copy },
  });
  const button = a.querySelector<HTMLButtonElement>("[data-code-copy]")!;
  button.click();
  button.click();
  pending[1].reject();
  await tick();
  await tick();
  expect(a.textContent).toContain("Copy failed");
  pending[0].resolve();
  await tick();
  await tick();
  expect(a.textContent).toContain("Copy failed");
  expect(copy).toHaveBeenCalledWith("  typescript\n");
});
test("copy status resets after three seconds; unmount cancels timers and pending completions", async () => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  try {
    const a = await example("file");
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => {} },
    });
    const button = a.querySelector<HTMLButtonElement>("[data-code-copy]")!;
    button.click();
    await tick();
    await tick();
    expect(button.textContent).toBe("Copied");
    vi.advanceTimersByTime(3000);
    await tick();
    expect(button.textContent).toBe("Copy");
    button.click();
    await tick();
    await tick();
    expect(vi.getTimerCount()).toBe(1);
    await unmount(components.pop()!);
    expect(vi.getTimerCount()).toBe(0);
    const b = await example("file");
    let finish!: () => void;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      },
    });
    b.querySelector<HTMLButtonElement>("[data-code-copy]")!.click();
    await unmount(components.pop()!);
    finish();
    await tick();
    await tick();
    expect(b.textContent).toBe("");
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
test("standalone examples escape token content and copy independently without tabs", async () => {
  const target = document.createElement("div");
  document.body.append(target);
  const snippet = {
    ...snippets[0],
    copy: "<script>literal</script>\n",
    lines: [
      {
        ...snippets[0].lines[0],
        tokens: [{ content: "<script>literal</script>", style: "" }],
      },
    ],
  };
  components.push(
    mount(CodeExample, {
      target,
      props: { kind: "standalone", snippet, id: "standalone" },
    }),
  );
  await tick();
  expect(target.querySelector("[role=tablist]")).toBe(null);
  expect(target.querySelector("script")).toBe(null);
  expect(target.querySelector("code")?.textContent).toContain(
    "<script>literal</script>",
  );
  expect(
    target.querySelector<HTMLButtonElement>("[data-code-copy]")?.hidden,
  ).toBe(false);
});

test("language selection is derived from the current options and default", async () => {
  const options = writable([snippets[0], snippets[1]]);
  const current = fromStore(options);
  const fallback = writable("python");
  const defaultLanguage = fromStore(fallback);
  const target = document.createElement("div");
  document.body.append(target);
  components.push(
    mount(CodeExample, {
      target,
      props: {
        kind: "language",
        id: "changing-options",
        label: "Languages",
        get defaultLanguage() {
          return defaultLanguage.current;
        },
        get snippets() {
          return current.current;
        },
      },
    }),
  );
  await tick();
  const selected = () =>
    target.querySelector("[aria-selected=true]")?.textContent;
  const language = selected();
  options.set([snippets[1], snippets[0]]);
  await tick();
  expect(selected()).toBe(language);
  // A now-unavailable preference falls back locally; changing options never saves it.
  const saved = window.localStorage.getItem("blog-code-language");
  options.set([{ ...snippets[0], language: "rust", title: "rust" }]);
  await tick();
  expect(selected()).toBe("rust");
  options.set([
    { ...snippets[0], language: "rust", title: "rust" },
    { ...snippets[0], language: "json", title: "json" },
  ]);
  fallback.set("json");
  await tick();
  expect(selected()).toBe("json");
  expect(window.localStorage.getItem("blog-code-language")).toBe(saved);
});
