import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  symlink,
  rm,
  cp,
  realpath,
} from "node:fs/promises";
import { resolve, join, relative } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { Window } from "happy-dom";
import { copyFootnote } from "../src/footnotes/dom";

test("Astro builds Markdown and MDX through BlogPost and CodeContent with native footnote relationships", async () => {
  const root = await realpath(await mkdtemp(resolve(".footnotes-test-")));
  try {
    await mkdir(join(root, "src/pages"), { recursive: true });
    for (const directory of [
      "layouts",
      "components",
      "styles",
      "code",
      "footnotes",
      "assets",
    ])
      await cp(resolve("src", directory), join(root, "src", directory), {
        recursive: true,
      });
    await rm(join(root, "src/components/footnotes/FootnoteExamples.astro"));
    await rm(
      join(root, "src/components/footnotes/FootnoteExamples.stories.ts"),
    );
    await cp(resolve("src/consts.ts"), join(root, "src/consts.ts"));
    await cp(resolve("public/fonts"), join(root, "public/fonts"), {
      recursive: true,
    });
    await cp(resolve("tests/fixtures"), join(root, "tests/fixtures"), {
      recursive: true,
    });
    await symlink(resolve("node_modules"), join(root, "node_modules"));
    await writeFile(
      join(root, "astro.config.ts"),
      `import config from '${resolve("astro.config.ts")}'; export default { ...config, srcDir: new URL('./src/', import.meta.url).pathname, outDir: new URL('./dist/', import.meta.url).pathname, cacheDir: new URL('./cache/', import.meta.url).pathname };`,
    );
    const layout = [
      "---",
      "import BlogPost from './BlogPost.astro';",
      "---",
      '<BlogPost title="Footnotes" description="Fixture" status="draft" createdDate={new Date("2026-11-10")}><slot /></BlogPost>',
    ].join("\n");
    await writeFile(join(root, "src/layouts/Fixture.astro"), layout);
    const header = `---\nlayout: ../layouts/Fixture.astro\ntitle: Footnote fixture\ndescription: Integration fixture\ncreatedDate: 2026-11-10\n---\n`;
    for (const ext of ["md", "mdx"]) {
      const source = await readFile(
        new URL(`./fixtures/footnotes.${ext}`, import.meta.url),
        "utf8",
      );
      await writeFile(
        join(root, "src/pages", `notes.${ext === "md" ? "md" : "mdx"}`),
        header + source,
      );
      // Use distinct routes.
      if (ext === "md")
        await writeFile(join(root, "src/pages/markdown.md"), header + source);
    }
    await rm(join(root, "src/pages/notes.md"));
    await writeFile(
      join(root, "src/pages/code.astro"),
      `---
import CodeContent from '../components/code/CodeContent.astro';
import Fixture from '../../tests/fixtures/code-blocks.mdx';
import Markdown from '../../tests/fixtures/code-blocks.md';
import BaseHead from '../components/BaseHead.astro';
import '../styles/code.css';
---
<html lang="en"><head><BaseHead title="Code fixture" description="Test" /></head><body><CodeContent><Markdown /><Fixture /></CodeContent><a href="/markdown/">Footnotes</a></body></html>`,
    );
    await writeFile(
      join(root, "src/pages/plain.md"),
      header + "No footnotes here.",
    );
    await promisify(execFile)(
      "pnpm",
      [
        "exec",
        "astro",
        "build",
        "--config",
        relative(process.cwd(), join(root, "astro.config.ts")),
      ],
      { cwd: process.cwd(), maxBuffer: 4_000_000 },
    );
    for (const route of ["markdown", "notes"]) {
      const html = await readFile(
        join(root, "dist", route, "index.html"),
        "utf8",
      );
      const window = new Window();
      window.document.body.innerHTML = html;
      const doc = window.document;
      assert.equal(
        doc.querySelectorAll("[data-article-body] [data-footnotes]").length,
        1,
      );
      assert.equal(doc.querySelectorAll("[data-footnote-ref]").length, 3);
      assert.ok(
        doc.querySelector(
          "[data-footnotes] astro-island [data-code-block] pre code",
        ),
      );
      const note = doc.querySelector(
        "[data-footnotes] li",
      )! as unknown as HTMLLIElement;
      for (const hydrated of [false, true]) {
        if (hydrated) {
          note
            .querySelectorAll("astro-island")
            .forEach((island) => island.removeAttribute("ssr"));
          note
            .querySelectorAll(".code-block")
            .forEach((panel) => panel.setAttribute("hidden", ""));
        }
        const clone = copyFootnote(note, "passive-");
        assert.ok(clone.querySelector("pre code"));
        assert.equal(
          clone.querySelectorAll(".code-block").length,
          note.querySelectorAll(".code-block").length,
        );
        assert.equal(
          clone.querySelector(
            'astro-island, button, [role="status"], [aria-live], [hidden]',
          ),
          null,
        );
        for (const element of clone.querySelectorAll(
          "[aria-labelledby], [aria-describedby]",
        )) {
          for (const id of (
            element.getAttribute("aria-labelledby") ??
            element.getAttribute("aria-describedby")!
          ).split(" "))
            assert.ok(clone.querySelector(`[id="${id}"]`));
        }
      }
      const ids = [...doc.querySelectorAll("[id]")].map((node) => node.id);
      assert.equal(new Set(ids).size, ids.length);
      for (const link of doc.querySelectorAll(
        "[data-footnote-ref], [data-footnote-backref]",
      )) {
        assert.ok(
          doc.getElementById(
            decodeURIComponent(link.getAttribute("href")!.slice(1)),
          ),
        );
      }
      assert.equal(
        doc.querySelector("[data-floating-footnotes]")?.hasAttribute("hidden"),
        true,
      );
      await window.happyDOM.abort();
    }
    const code = await readFile(join(root, "dist/code/index.html"), "utf8");
    const window = new Window();
    window.document.body.innerHTML = code;
    const doc = window.document;
    assert.equal(doc.querySelectorAll('astro-island[client="load"]').length, 7);
    assert.equal(doc.querySelectorAll(".code-block[hidden]").length, 0);
    assert.ok(
      [...doc.querySelectorAll('[role="tablist"], [data-code-copy]')].every(
        (node) => node.hasAttribute("hidden"),
      ),
    );
    const ids = [...doc.querySelectorAll("[id]")].map((node) => node.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.match(code, /This must be displayed literally/);
    await window.happyDOM.abort();
    if (process.env.CUTOVER_FIXTURE_DIR)
      await cp(join(root, "dist"), process.env.CUTOVER_FIXTURE_DIR, {
        recursive: true,
      });
    const plain = await readFile(join(root, "dist/plain/index.html"), "utf8");
    assert.doesNotMatch(plain, /data-footnote-ref/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
