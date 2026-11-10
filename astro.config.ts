import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import remarkCode from "./src/code/markdown.server.ts";
import artefactsDev from "./src/integrations/artefacts-dev.ts";

// https://astro.build/config
export default defineConfig({
  site: "https://alexanderlee.tech",
  prefetch: true,
  integrations: [mdx(), sitemap(), artefactsDev()],
  markdown: {
    syntaxHighlight: false,
    processor: unified({ remarkPlugins: [remarkCode] }),
  },
});
