import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import type { AppLayout } from "@strata/schema";
import { StrataApp } from "../../src/react/app/StrataApp.js";

describe("stagger animation (Phase 7)", () => {
  it("wraps each child with an incrementally-delayed entrance", () => {
    const config: AppLayout = {
      pages: [
        {
          id: "p",
          root: {
            kind: "row",
            animate: "fly",
            animateOptions: { stagger: 80, duration: 300 },
            children: [
              { kind: "widget", widget: { type: "text", props: { content: "A" } } },
              { kind: "widget", widget: { type: "text", props: { content: "B" } } },
              { kind: "widget", widget: { type: "text", props: { content: "C" } } },
            ],
          },
        },
      ],
    };
    const { container } = render(<StrataApp config={config} />);
    const wraps = container.querySelectorAll('[data-animate="fly"]');
    expect(wraps.length).toBe(3); // one per child, not one for the whole box
    expect((wraps[0] as HTMLElement).style.transition).toContain("ease 0ms");
    expect((wraps[1] as HTMLElement).style.transition).toContain("ease 80ms");
    expect((wraps[2] as HTMLElement).style.transition).toContain("ease 160ms");
  });
});
