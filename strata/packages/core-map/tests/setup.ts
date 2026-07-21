/**
 * Vitest setup — registers @testing-library/jest-dom matchers (toBeInTheDocument,
 * toHaveTextContent, …) and auto-cleans the DOM after each test. Runs for every
 * test file; harmless for the Node logic suites (no DOM is touched there).
 */
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
