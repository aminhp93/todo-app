import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // Run serially to avoid port conflicts in integration tests
    singleFork: true,
    testTimeout: 15000,
  },
});
