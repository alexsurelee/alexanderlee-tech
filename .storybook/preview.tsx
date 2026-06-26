import type { Preview } from "@storybook/nextjs-vite";
import React from "react";
import { HotkeysProvider } from "@tanstack/react-hotkeys";
import "@/app/globals.css";
import { atkinson } from "@/app/fonts";

const fontClassName = atkinson.variable;

/** Mirror RootLayout: next/font variables must live on `html`, not just story wrappers. */
function applyFontVariables() {
  document.documentElement.classList.add(atkinson.variable);
  document.body.classList.add(atkinson.variable);
}

if (typeof document !== "undefined") {
  applyFontVariables();
}

const preview: Preview = {
  decorators: [
    (Story) => (
      <HotkeysProvider>
        <div className={fontClassName}>
          <Story />
        </div>
      </HotkeysProvider>
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
