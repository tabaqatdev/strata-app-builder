import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import type { AppLayout } from "@strata/schema";
import { ActionBus } from "@strata/actions";
import { StrataApp } from "../../src/react/app/StrataApp.js";

describe("views autoPlay (Phase 7)", () => {
  it("auto-advances the views on the interval, emits viewChange, and loops", () => {
    vi.useFakeTimers();
    try {
      const seen: string[] = [];
      const bus = new ActionBus();
      bus.on<{ viewId: string }>("viewChange", (t) => seen.push(t.payload.viewId));

      const config: AppLayout = {
        pages: [
          {
            id: "p",
            root: {
              kind: "views",
              nav: "slides",
              autoPlay: { intervalMs: 1000 },
              views: [
                { id: "v1", title: "One", content: { kind: "widget", widget: { type: "text", props: { content: "VIEW ONE" } } } },
                { id: "v2", title: "Two", content: { kind: "widget", widget: { type: "text", props: { content: "VIEW TWO" } } } },
              ],
            },
          },
        ],
      };

      render(<StrataApp config={config} bus={bus} />);
      expect(screen.getByText("VIEW ONE")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText("VIEW TWO")).toBeInTheDocument();
      expect(seen).toContain("v2");

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText("VIEW ONE")).toBeInTheDocument(); // looped back
    } finally {
      vi.useRealTimers();
    }
  });
});
