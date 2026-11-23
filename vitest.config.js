import { defineConfig } from "vitest/config";

// Kept separate from vite.config.js: tests for the pure logic modules need
// neither the Tailwind/React plugins nor the single-file build.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.{js,jsx}"],
  },
});
