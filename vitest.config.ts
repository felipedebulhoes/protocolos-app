import { defineConfig } from "vitest/config";
import path from "path";

// Dedicated Vitest config so tests in server/ and shared/ are discovered.
// (The main vite.config.ts sets root to ./client for the dev server.)
export default defineConfig({
  test: {
    root: path.resolve(import.meta.dirname),
    include: ["server/**/*.{test,spec}.ts", "shared/**/*.{test,spec}.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
});
