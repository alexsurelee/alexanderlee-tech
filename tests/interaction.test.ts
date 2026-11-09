import { test } from "node:test";
import assert from "node:assert/strict";
import { Window as HappyWindow } from "happy-dom";
import { initCodeBlocks } from "../src/code/client.ts";

function fixture(
  blocked = false,
  copyOverride?: (value: string) => Promise<void>,
) {
  const window = new HappyWindow({ url: "https://example.test" });
  const document = window.document as unknown as Document;
  const group = (kind: string, langs: string[], fallback = "") =>
    `<div data-code-group="${kind}" data-default="${fallback}"><div role="tablist" hidden>${langs.map((lang, index) => `<button role="tab" aria-controls="${kind}-${langs.join("-")}-${index}" id="tab-${kind}-${langs.join("-")}-${index}">${lang}</button>`).join("")}</div>${langs.map((lang, index) => `<section id="${kind}-${langs.join("-")}-${index}" aria-labelledby="tab-${kind}-${langs.join("-")}-${index}" data-code-block data-language="${lang}" data-title="${lang}" data-code-source="${encodeURIComponent(`  ${lang}\n`)}"><div class="code-toolbar"><span class="code-title">${lang}</span><button data-code-copy hidden>Copy</button><span data-copy-status></span></div><pre><code>${lang}</code></pre><template data-code-source>  ${lang}\n</template></section>`).join("")}</div>`;
  document.body.innerHTML =
    group("language", ["ts", "py"]) +
    group("language", ["typescript", "python"]) +
    group("language", ["json", "rust"], "rust") +
    group("file", ["ts", "py"]);
  if (blocked)
    Object.defineProperty(window, "localStorage", {
      get() {
        throw Error("blocked");
      },
    });
  let copied = "";
  const originalTab = document.querySelector("[role=tab]");
  initCodeBlocks(
    document as unknown as Document,
    window as unknown as Window & typeof globalThis,
    copyOverride ??
      (async (value) => {
        copied = value;
      }),
  );
  assert.ok(
    document.querySelector("[role=tab]") === originalTab,
    "controller must reuse server-rendered tab buttons",
  );
  return { document, window, copied: () => copied };
}
test("language synchronization, fallbacks, persistence, local files and keyboard focus", async () => {
  const { document, window, copied } = fixture();
  const groups = [...document.querySelectorAll("[data-code-group]")];
  const tabs = (i: number) => [
    ...groups[i].querySelectorAll<HTMLButtonElement>("[role=tab]"),
  ];
  tabs(0)[1].click();
  assert.equal(tabs(1)[1].getAttribute("aria-selected"), "true");
  assert.equal(tabs(2)[1].getAttribute("aria-selected"), "true");
  assert.equal(tabs(3)[0].getAttribute("aria-selected"), "true");
  assert.equal(window.localStorage.getItem("blog-code-language"), "python");
  tabs(3)[1].click();
  assert.equal(window.localStorage.getItem("blog-code-language"), "python");
  tabs(0)[1].focus();
  tabs(1)[0].click();
  assert.equal(document.activeElement, tabs(0)[1]);
  tabs(0)[0].dispatchEvent(
    new window.KeyboardEvent("keydown", {
      key: "End",
      bubbles: true,
    }) as unknown as KeyboardEvent,
  );
  assert.equal(document.activeElement, tabs(0)[1]);
  const active = groups[0].querySelector("[role=tabpanel]:not([hidden])")!;
  (active.querySelector("[data-code-copy]") as HTMLButtonElement).click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(copied(), "  py\n");
  assert.equal(
    active.querySelector("[data-copy-status]")?.textContent,
    "Copied to clipboard",
  );
  initCodeBlocks(
    document as unknown as Document,
    window as unknown as Window & typeof globalThis,
  );
  assert.equal(groups[0].querySelectorAll("[role=tab]").length, 2);
});
test("blocked storage still permits synchronization", () => {
  const { document } = fixture(true);
  const tabs = document.querySelectorAll<HTMLButtonElement>("[role=tab]");
  tabs[1].click();
  assert.equal(tabs[3].getAttribute("aria-selected"), "true");
});
test("reload applies saved aliases without replacing unavailable preference, copy failure is announced", async () => {
  const { document, window } = fixture();
  window.localStorage.setItem("blog-code-language", "py");
  const next = document.implementation.createHTMLDocument();
  next.body.innerHTML = document.body.innerHTML
    .replaceAll('data-code-ready=""', "")
    .replaceAll('data-copy-ready=""', "");

  initCodeBlocks(
    next,
    window as unknown as Window & typeof globalThis,
    async () => {
      throw Error("denied");
    },
  );
  const groups = next.querySelectorAll("[data-code-group]");
  assert.equal(
    groups[0].querySelector("[aria-selected=true]")?.textContent,
    "py",
  );
  assert.equal(
    groups[2].querySelector("[aria-selected=true]")?.textContent,
    "rust",
  );
  assert.equal(window.localStorage.getItem("blog-code-language"), "py");
  (
    groups[0].querySelector(
      "[role=tabpanel]:not([hidden]) [data-code-copy]",
    ) as HTMLButtonElement
  ).click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.match(groups[0].textContent ?? "", /Copy failed/);
});

test("page disposal restores readable fallback, removes listeners, and allows reinitialization", async () => {
  const runtime = await import("../src/code/client.ts");
  assert.equal(typeof runtime.disposeCodeBlocks, "function");
  const { document, window } = fixture(true);
  const tabs = [...document.querySelectorAll<HTMLButtonElement>("[role=tab]")];
  tabs[1].click();
  runtime.disposeCodeBlocks(document);
  runtime.disposeCodeBlocks(document);
  assert.equal(
    document.querySelectorAll("[data-code-block][hidden]").length,
    0,
  );
  assert.ok(
    [...document.querySelectorAll<HTMLElement>("[role=tablist]")].every(
      (list) => list.hidden,
    ),
  );
  tabs[0].click(); // Disposed controls cannot change the in-memory preference.
  runtime.initCodeBlocks(
    document,
    window as unknown as Window & typeof globalThis,
  );
  assert.equal(tabs[1].getAttribute("aria-selected"), "true");
  assert.equal(tabs[3].getAttribute("aria-selected"), "true");
});

test("detached groups unsubscribe and can be reinserted without duplicate listeners", () => {
  const { document, window } = fixture();
  const detached = document.querySelector<HTMLElement>("[data-code-group]")!;
  const tab = detached.querySelectorAll<HTMLButtonElement>("[role=tab]")[1];
  detached.remove();
  initCodeBlocks(document, window as unknown as Window & typeof globalThis);
  tab.click();
  assert.equal(window.localStorage.getItem("blog-code-language"), null);
  document.querySelectorAll<HTMLButtonElement>("[role=tab]")[1].click();
  assert.equal(tab.getAttribute("aria-selected"), "false");
  document.body.prepend(detached);
  initCodeBlocks(document, window as unknown as Window & typeof globalThis);
  initCodeBlocks(document, window as unknown as Window & typeof globalThis);
  assert.equal(tab.getAttribute("aria-selected"), "true");
  assert.equal(detached.querySelectorAll("[role=tab]").length, 2);
  const storage = window.localStorage;
  let writes = 0;
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: (key: string) => storage.getItem(key),
      setItem: (key: string, value: string) => {
        writes++;
        storage.setItem(key, value);
      },
    },
  });
  tab.click();
  assert.equal(
    writes,
    1,
    "one click must produce one preference update after repeated initialization",
  );
});

test("a pending copy cannot update a disposed component", async () => {
  const runtime = await import("../src/code/client.ts");
  assert.equal(typeof runtime.disposeCodeBlocks, "function");
  let finish!: () => void;
  const { document } = fixture(
    false,
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const button = document.querySelector<HTMLButtonElement>("[data-code-copy]")!;
  const status = document.querySelector<HTMLElement>("[data-copy-status]")!;
  button.click();
  runtime.disposeCodeBlocks(document);
  finish();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(button.textContent, "Copy");
  assert.equal(status.textContent, "");
  assert.equal(button.hidden, true);
});
