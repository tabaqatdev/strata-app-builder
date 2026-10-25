import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // The controls run against a small stub DOM + stub map (tests/map-controls.test.ts) — no jsdom:
    // the assertions read the exact HTML the module writes, through one tiny parser.
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
