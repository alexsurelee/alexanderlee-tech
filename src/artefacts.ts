import { readdir } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

/** Build-time catalogue; documents themselves are served unchanged from public/. */
export async function getArtefacts(directory = resolve("public/artefacts")) {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  const paths = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => relative(directory, join(entry.parentPath, entry.name)).split(sep).join("/"))
    .sort();

  if (paths.includes("index.html")) {
    throw new Error("public/artefacts/index.html is reserved for the artefacts catalogue.");
  }
  if (entries.some((entry) => relative(directory, join(entry.parentPath, entry.name)) === "view")) {
    throw new Error("public/artefacts/view is reserved for generated viewer pages.");
  }

  return paths.map((path) => {
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    return {
      path,
      href: `/artefacts/view/${encodedPath.slice(0, -5)}/`,
      sourceHref: `/artefacts/${encodedPath}`,
    };
  });
}
