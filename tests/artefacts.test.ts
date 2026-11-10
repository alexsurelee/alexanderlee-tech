import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

test("discovers HTML documents recursively with stable, encoded public links", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "artefacts-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "project"));
  await writeFile(join(root, "z-report.html"), "<h1>Report</h1>");
  await writeFile(join(root, "project", "a & b.html"), "<h1>Comparison</h1>");
  await writeFile(join(root, "project", "chart.svg"), "<svg></svg>");
  await writeFile(join(root, ".gitkeep"), "");

  const { getArtefacts } = await import("../src/artefacts.ts");
  assert.deepEqual(await getArtefacts(root), [
    { path: "project/a & b.html", href: "/artefacts/project/a%20%26%20b.html" },
    { path: "z-report.html", href: "/artefacts/z-report.html" },
  ]);
});

test("an empty directory produces an empty catalogue", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "artefacts-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const { getArtefacts } = await import("../src/artefacts.ts");
  assert.deepEqual(await getArtefacts(root), []);
});

test("reserves the root index.html for the browsable catalogue", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "artefacts-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, "index.html"), "<h1>Collision</h1>");
  const { getArtefacts } = await import("../src/artefacts.ts");
  await assert.rejects(getArtefacts(root), /index\.html is reserved/);
});
