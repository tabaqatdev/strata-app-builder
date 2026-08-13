import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import type { AppLayout, ContainerNode } from "@strata/schema";
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

/**
 * Resize. Pointer events are dispatched as MouseEvents typed `pointerdown`/`pointermove` — jsdom has no
 * `PointerEvent` constructor, and the handlers read `clientX`/`clientY` off the native event either way.
 */
describe("panel node resize", () => {
  const panelConfig = (node: Partial<ContainerNode>): AppLayout => ({
    pages: [
      {
        id: "p",
        root: {
          kind: "panel",
          dock: "left",
          title: "Layers",
          width: 280,
          children: [{ kind: "widget", widget: { type: "text", props: { content: "BODY" } } }],
          ...node,
        } as ContainerNode,
      },
    ],
  });

  const panelEl = (c: HTMLElement): HTMLElement => c.querySelector("[data-strata-panel]") as HTMLElement;
  const gripEl = (c: HTMLElement): HTMLElement =>
    c.querySelector("[data-strata-panel-resize]") as HTMLElement;

  function pointer(target: Element | Window, type: string, x: number, y: number): void {
    const ev = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
    act(() => {
      target.dispatchEvent(ev);
    });
  }

  it("is resizable by default, with the grip on the edge facing the content", () => {
    const { container } = render(<StrataApp config={panelConfig({})} />);
    const grip = gripEl(container);
    expect(grip).toBeTruthy();
    expect(grip.getAttribute("role")).toBe("separator");
    expect(grip.getAttribute("aria-label")).toBe("Resize Layers");
    expect(grip.dataset.strataPanelResize).toBe("x"); // left dock → width
    expect(grip.style.right).toBe("0px"); // left dock → grip on the right edge
  });

  it("drags a left-docked panel wider, and a right-docked one the other way", () => {
    const left = render(<StrataApp config={panelConfig({})} />);
    pointer(gripEl(left.container), "pointerdown", 0, 0);
    pointer(window, "pointermove", 60, 0);
    expect(panelEl(left.container).style.width).toBe("340px");
    pointer(window, "pointerup", 60, 0);
    left.unmount();

    // A right-docked panel's grip is on its LEFT edge: dragging left grows it.
    const right = render(<StrataApp config={panelConfig({ dock: "right" })} />);
    expect(gripEl(right.container).style.left).toBe("0px");
    pointer(gripEl(right.container), "pointerdown", 0, 0);
    pointer(window, "pointermove", -60, 0);
    expect(panelEl(right.container).style.width).toBe("340px");
    pointer(window, "pointerup", -60, 0);
  });

  it("drives height, not width, on a top/bottom dock", () => {
    const { container } = render(<StrataApp config={panelConfig({ dock: "bottom" })} />);
    const grip = gripEl(container);
    expect(grip.dataset.strataPanelResize).toBe("y");
    expect(grip.style.top).toBe("0px"); // bottom dock → grip on the top edge
    pointer(grip, "pointerdown", 0, 0);
    pointer(window, "pointermove", 0, -40); // dragging up grows a bottom-docked panel
    expect(panelEl(container).style.height).toBe("320px");
  });

  it("clamps to minWidth/maxWidth", () => {
    const { container } = render(<StrataApp config={panelConfig({ minWidth: 200, maxWidth: 400 })} />);
    const grip = gripEl(container);
    pointer(grip, "pointerdown", 0, 0);
    pointer(window, "pointermove", 5000, 0);
    expect(panelEl(container).style.width).toBe("400px");
    pointer(window, "pointermove", -5000, 0);
    expect(panelEl(container).style.width).toBe("200px");
  });

  it("resizes from the keyboard", () => {
    const { container } = render(<StrataApp config={panelConfig({})} />);
    const grip = gripEl(container);
    fireEvent.keyDown(grip, { key: "ArrowRight" });
    expect(panelEl(container).style.width).toBe("296px");
    fireEvent.keyDown(grip, { key: "ArrowRight", shiftKey: true });
    expect(panelEl(container).style.width).toBe("344px");
    fireEvent.keyDown(grip, { key: "ArrowLeft" });
    expect(panelEl(container).style.width).toBe("328px");
  });

  it("has no grip when locked, and none while collapsed (there is no size to drag)", () => {
    const locked = render(<StrataApp config={panelConfig({ resizable: false })} />);
    expect(locked.container.querySelector("[data-strata-panel-resize]")).toBeNull();
    locked.unmount();

    const { container } = render(<StrataApp config={panelConfig({})} />);
    expect(gripEl(container)).toBeTruthy();
    act(() => {
      fireEvent.click(screen.getByLabelText("Collapse"));
    });
    expect(container.querySelector("[data-strata-panel-resize]")).toBeNull();
  });
});
