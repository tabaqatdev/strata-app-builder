import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import type { AppLayout } from "@strata/schema";
import { StrataApp } from "../../src/react/app/StrataApp.js";

describe("panel node", () => {
  it("renders a docked, titled panel with its children and collapses/expands", () => {
    const config: AppLayout = {
      pages: [
        {
          id: "p",
          root: {
            kind: "panel",
            dock: "left",
            title: "Layers",
            width: 280,
            children: [{ kind: "widget", widget: { type: "text", props: { content: "PANEL BODY" } } }],
          },
        },
      ],
    };
    const { container } = render(<StrataApp config={config} />);

    expect(screen.getByText("Layers")).toBeInTheDocument();
    expect(screen.getByText("PANEL BODY")).toBeInTheDocument();
    const panel = container.querySelector("[data-strata-panel]") as HTMLElement;
    expect(panel.getAttribute("data-strata-dock")).toBe("left");

    act(() => {
      fireEvent.click(screen.getByLabelText("Collapse"));
    });
    expect(screen.queryByText("PANEL BODY")).not.toBeInTheDocument(); // body hidden
    expect(screen.getByText("Layers")).toBeInTheDocument(); // header stays
    expect(screen.getByLabelText("Expand")).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByLabelText("Expand"));
    });
    expect(screen.getByText("PANEL BODY")).toBeInTheDocument();
  });

  it("respects collapsible:false (no toggle, always open)", () => {
    const config: AppLayout = {
      pages: [
        {
          id: "p",
          root: {
            kind: "panel",
            dock: "right",
            title: "Fixed",
            collapsible: false,
            children: [{ kind: "widget", widget: { type: "text", props: { content: "ALWAYS" } } }],
          },
        },
      ],
    };
    render(<StrataApp config={config} />);
    expect(screen.getByText("ALWAYS")).toBeInTheDocument();
    expect(screen.queryByLabelText("Collapse")).not.toBeInTheDocument();
  });
});
