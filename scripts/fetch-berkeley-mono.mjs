import { join } from "node:path";
import { get } from "@vercel/blob";
import { runFetchBerkeleyMono } from "./fetch-berkeley-mono/lib.mjs";

const fontDir = join(process.cwd(), "public/fonts/berkeley-mono");

runFetchBerkeleyMono({
  fontDir,
  env: process.env,
  getBlob: get,
}).catch((err) => {
  console.error(
    `fetch-berkeley-mono: ${err instanceof Error ? err.message : String(err)}`,
  );
  process.exit(1);
});
