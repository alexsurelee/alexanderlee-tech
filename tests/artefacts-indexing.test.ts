import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import { promisify } from "node:util";
import { before, test } from "node:test";
import { Window } from "happy-dom";
import { getArtefacts } from "../src/artefacts.ts";

before(async () => {
  await promisify(execFile)("pnpm", ["build"], { timeout: 60_000 });
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
