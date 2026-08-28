import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Vite HMR middleware integration", () => {
  it("reuses the Express HTTP server for WebSocket upgrades", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "server/_core/index.ts"),
      "utf8",
    );

    expect(source).toMatch(/middlewareMode:\s*true/);
    expect(source).toMatch(/hmr:\s*\{\s*server\s*\}/);
  });

  it("serves Vite output from dist/public beside the bundled server", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "server/_core/index.ts"),
      "utf8",
    );

    expect(source).toContain('path.resolve(__dirname, "public")');
    expect(source).not.toContain('path.resolve(__dirname, "..", "public")');
  });
});
