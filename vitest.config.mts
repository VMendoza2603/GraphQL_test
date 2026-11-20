import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/env.ts"],
    testTimeout: 60000,
    hookTimeout: 120000,
  },
});
