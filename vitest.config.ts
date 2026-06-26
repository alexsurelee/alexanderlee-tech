import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    environmentMatchGlobs: [["scripts/**", "node"]],
    globals: false,
    setupFiles: ["./vitest-setup.ts"],
  },
  resolve: { tsconfigPaths: true },
});
