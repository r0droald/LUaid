import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { transform } from "esbuild";

export default defineConfig({
  plugins: [
    {
      name: "treat-js-as-jsx",
      async transform(code, id) {
        if (!/src\/.*\.js$/.test(id)) return;
        const result = await transform(code, {
          loader: "jsx",
          jsx: "automatic",
        });
        return { code: result.code, map: result.map };
      },
    },
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.js"],
  },
});
