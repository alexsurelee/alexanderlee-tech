import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, readdir, writeFile, rm } from "node:fs/promises";
import { promisify } from "node:util";
import { before, test } from "node:test";
import { Window } from "happy-dom";
import { getArtefacts } from "../src/artefacts.ts";

before(async () => {
  const draft = "src/content/blog/draft-visibility-fixture.md";
  const published = "src/content/blog/published-visibility-fixture.mdx";
  const created: string[] = [];
  try {
    await writeFile(draft, '---\ntitle: Draft visibility fixture\ndescription: Hidden draft\nstatus: draft\ncreatedDate: "2026-01-01"\n---\nSecret draft body sentinel.\n', { flag: "wx" });
    created.push(draft);
    await writeFile(published, '---\ntitle: Published visibility fixture\ndescription: Visible post\nstatus: published\ncreatedDate: "2026-01-01"\npublishedDate: "2026-02-01"\n---\nPublic body sentinel.\n', { flag: "wx" });
    created.push(published);
    await promisify(execFile)("pnpm", ["build"], { timeout: 60_000 });
  } finally {
    await Promise.all(created.map((file) => rm(file, { force: true })));
  }
});

test("built artefact catalogue and viewer pages tell crawlers not to index them", async () => {
  const routes = ["/artefacts/", ...(await getArtefacts()).map((artefact) => artefact.href)];
  const window = new Window();
  for (const route of routes) {
    window.document.head.innerHTML = await readFile(`dist${route}index.html`, "utf8");
    assert.equal(window.document.querySelector('meta[name="robots"]')?.getAttribute("content"), "noindex", route);
  }
  window.document.head.innerHTML = await readFile("dist/index.html", "utf8");
  assert.equal(window.document.querySelector('meta[name="robots"]'), null);
});

test("generated sitemaps exclude artefacts and retain ordinary site pages", async () => {
  const files = (await readdir("dist")).filter((name) => /^sitemap-\d+\.xml$/.test(name));
  assert.ok(files.length > 0);
  const xml = (await Promise.all(files.map((file) => readFile(`dist/${file}`, "utf8")))).join("");
  assert.doesNotMatch(xml, /<loc>[^<]*\/artefacts(?:\/|<)/);
  assert.match(xml, /<loc>https:\/\/alexanderlee\.tech\/blog\//);
});


test("drafts have no generated route and are absent from public indexes", async () => {
  await assert.rejects(readFile("dist/blog/draft-visibility-fixture/index.html"), { code: "ENOENT" });
  const files = ["blog/index.html", "rss.xml",
    ...(await readdir("dist")).filter((name) => /^sitemap-\d+\.xml$/.test(name))];
  for (const file of files) {
    const content = await readFile(`dist/${file}`, "utf8");
    assert.doesNotMatch(content, /draft-visibility-fixture|Draft visibility fixture|Secret draft body sentinel/, file);
    assert.match(content, /published-visibility-fixture/, file);
  }
  const page = await readFile("dist/blog/published-visibility-fixture/index.html", "utf8");
  assert.match(page, /Public body sentinel/);
  assert.match(page, /2026-02-01/);
});
