import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { resolve } from "node:path";
import { test } from "node:test";
import type { HookParameters } from "astro";

test("artefact additions and removals debounce a dev restart, unrelated edits do not", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { default: artefactsDev } = await import("../src/integrations/artefacts-dev.ts");
  const watcher = new EventEmitter();
  const httpServer = new EventEmitter();
  const restart = t.mock.fn(async () => {});
  const integration = artefactsDev();
  await integration.hooks["astro:server:setup"]!({
    server: { watcher, httpServer, restart },
    logger: { info() {}, error() {} },
  } as unknown as HookParameters<"astro:server:setup">);

  watcher.emit("add", resolve("public/other.html"));
  watcher.emit("add", resolve("public/artefacts-other/report.html"));
  watcher.emit("add", resolve("public/artefacts/chart.svg"));
  watcher.emit("change", resolve("public/artefacts/report.html"));
  t.mock.timers.tick(200);
  assert.equal(restart.mock.callCount(), 0);

  watcher.emit("add", resolve("public/artefacts/project/report.html"));
  t.mock.timers.tick(50);
  watcher.emit("unlink", resolve("public/artefacts/old.html"));
  t.mock.timers.tick(50);
  assert.equal(restart.mock.callCount(), 0);
  t.mock.timers.tick(100);
  assert.equal(restart.mock.callCount(), 1);
  await Promise.resolve();

  watcher.emit("add", resolve("public/artefacts/another.html"));
  httpServer.emit("close");
  t.mock.timers.tick(200);
  assert.equal(restart.mock.callCount(), 1);
  assert.equal(watcher.listenerCount("add"), 0);
  assert.equal(watcher.listenerCount("unlink"), 0);
});
