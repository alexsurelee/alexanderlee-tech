import { svelte } from "@storybook-astro/framework/integrations";
import type { StorybookConfig } from "@storybook-astro/framework";

const config: StorybookConfig = {
  stories: ["../src/components/**/stories/*.stories.ts"],
  staticDirs: ["../public"],
  framework: {
    name: "@storybook-astro/framework",
    options: { integrations: [svelte()] },
  },
};

export default config;
