import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import remarkCode from "./src/code/remark-code.ts";

// https://astro.build/config
export default defineConfig({
  site: "https://alexanderlee.tech",
  integrations: [mdx(), sitemap()],
  markdown: {
    syntaxHighlight: false,
    processor: unified({ remarkPlugins: [remarkCode] }),
  },
});
