import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { AppLayout } from "@strata/schema";
import { StrataApp } from "../../src/react/app/StrataApp.js";

describe("splitter container", () => {
  it("renders panes with an equal initial split and a draggable divider between them", () => {
    const config: AppLayout = {
      pages: [
        {
          id: "p",
          root: {
            kind: "splitter",
            orientation: "h",
            children: [
              { kind: "widget", widget: { type: "text", props: { content: "LEFT" } } },
              { kind: "widget", widget: { type: "text", props: { content: "RIGHT" } } },
            ],
          },
        },
      ],
    };
    const { container } = render(<StrataApp config={config} />);

    expect(screen.getByText("LEFT")).toBeInTheDocument();
    expect(screen.getByText("RIGHT")).toBeInTheDocument();

    const splitter = container.querySelector("[data-strata-splitter]") as HTMLElement;
    expect(splitter).toBeTruthy();
    // one divider for two panes
    expect(container.querySelectorAll("[data-strata-splitter-handle]").length).toBe(1);
    // first pane got a 50% flex-basis (equal split)
    const firstPane = splitter.children[0] as HTMLElement;
    expect(firstPane.style.flexBasis).toBe("50%");
  });

  it("honors explicit sizes", () => {
    const config: AppLayout = {
      pages: [
        {
          id: "p",
          root: {
            kind: "splitter",
            sizes: [30, 70],
            children: [
              { kind: "widget", widget: { type: "text", props: { content: "A" } } },
              { kind: "widget", widget: { type: "text", props: { content: "B" } } },
            ],
          },
        },
      ],
    };
    const { container } = render(<StrataApp config={config} />);
    const splitter = container.querySelector("[data-strata-splitter]") as HTMLElement;
    expect((splitter.children[0] as HTMLElement).style.flexBasis).toBe("30%");
  });
});
