import { expect, test } from "vitest";
import { mount, unmount, tick } from "svelte";
import CodeExample from "./CodeExample.svelte";
test("denied storage synchronizes in memory across remounts and unavailable fallbacks preserve preference", async () => {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get() {
      throw Error("denied");
    },
  });
  const snippets = (languages: string[]) =>
    languages.map((language) => ({
      language,
      title: language,
      copy: language,
      lines: [],
    }));
  const targets: HTMLElement[] = [];
  const components: ReturnType<typeof mount>[] = [];
  async function add(languages: string[], fallback?: string) {
    const target = document.createElement("div");
    document.body.append(target);
    targets.push(target);
    components.push(
      mount(CodeExample, {
        target,
        props: {
          kind: "language",
          id: `group-${targets.length}`,
          label: "Languages",
          snippets: snippets(languages),
          defaultLanguage: fallback,
        },
      }),
    );
    await tick();
    return target;
  }
  try {
    const a = await add(["ts", "py"]);
    const b = await add(["typescript", "python"]);
    a.querySelectorAll<HTMLButtonElement>("[role=tab]")[1].click();
    await tick();
    expect(b.querySelector("[aria-selected=true]")?.textContent).toBe("python");
    await unmount(components.shift()!);
    await unmount(components.shift()!);
    const fallback = await add(["json", "rust"], "rust");
    expect(fallback.querySelector("[aria-selected=true]")?.textContent).toBe(
      "rust",
    );
    const remount = await add(["typescript", "python"]);
    expect(remount.querySelector("[aria-selected=true]")?.textContent).toBe(
      "python",
    );
  } finally {
    for (const c of components) await unmount(c);
    targets.forEach((target) => target.remove());
  }
});
