import { isAbsolute, relative, resolve, sep } from "node:path";
import type { AstroIntegration } from "astro";

/** Refresh getStaticPaths() when the set of public HTML documents changes. */
export default function artefactsDev(): AstroIntegration {
  return {
    name: "artefacts-dev",
    hooks: {
      "astro:server:setup": ({ server, logger }) => {
        const directory = resolve("public/artefacts");
        let timer: ReturnType<typeof setTimeout> | undefined;
        let restarting = false;

        const onFile = (file: string) => {
          const path = relative(directory, file);
          if (isAbsolute(path) || path === ".." || path.startsWith(`..${sep}`) || !path.endsWith(".html") || restarting) return;

          clearTimeout(timer);
          timer = setTimeout(() => {
            restarting = true;
            logger.info("Artefacts added or removed. Restarting dev server…");
            void server.restart().catch((error: unknown) => {
              restarting = false;
              logger.error(`Could not restart dev server: ${String(error)}`);
            });
          }, 150);
        };

        // Vite already watches public/ recursively. Content edits use its normal reload.
        server.watcher.on("add", onFile);
        server.watcher.on("unlink", onFile);
        server.httpServer?.once("close", () => {
          clearTimeout(timer);
          server.watcher.off("add", onFile);
          server.watcher.off("unlink", onFile);
        });
      },
    },
  };
}
