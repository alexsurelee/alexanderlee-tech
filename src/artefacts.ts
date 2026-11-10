import { readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";

/** Build-time catalogue; documents themselves are served unchanged from public/. */
export async function getArtefacts(directory: string) {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  const paths = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => relative(directory, join(entry.parentPath, entry.name)).split(sep).join("/"))
    .sort();

  if (paths.includes("index.html")) {
    throw new Error("public/artefacts/index.html is reserved for the artefacts catalogue.");
  }

  return paths.map((path) => ({
    path,
    href: `/artefacts/${path.split("/").map(encodeURIComponent).join("/")}`,
  }));
}
