import type { Preview } from "@storybook/nextjs-vite";
import React from "react";
import clsx from "clsx";
import "@/app/globals.css";
import { atkinson, monaspace } from "@/app/fonts";

const fontClassName = clsx(atkinson.variable, monaspace.variable);

/** Mirror RootLayout: next/font variables must live on `html`, not just story wrappers. */
function applyFontVariables() {
  document.documentElement.classList.add(
    atkinson.variable,
    monaspace.variable,
  );
  document.body.classList.add(atkinson.variable, monaspace.variable);
}

if (typeof document !== "undefined") {
  applyFontVariables();
}

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className={fontClassName}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
