import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import type { AppLayout } from "@strata/schema";
import type { ActionBus } from "@strata/actions";
import { StrataApp } from "../../src/react/app/StrataApp.js";
import { mergeRegistry } from "../../src/react/app/registry.js";
import { useOutputData } from "../../src/react/app/interactivity.js";

/** A widget that emits a categorySelect trigger tagged with its own widget id. */
function Emitter(props: { bus: ActionBus; widgetId: string; layerId: string; value: string }) {
  return (
    <button
      onClick={() =>
        props.bus.emit({
          type: "categorySelect",
          source: props.widgetId,
          payload: { layerId: props.layerId, field: "CAT", value: props.value },
        })
      }
    >
      pick
    </button>
  );
}

/** A widget that consumes another widget's output (W2). */
function Consumer(props: { dataSource?: { fromWidget?: string } }) {
  const out = useOutputData(props.dataSource?.fromWidget);
  const rows = (out?.records as unknown[]) ?? [];
  return <div data-testid="consumer">rows:{rows.length}</div>;
}

/** A widget that publishes records to the output registry when clicked. */
function Producer(props: { outputs: any; widgetId: string }) {
  return (
    <button onClick={() => props.outputs.publish({ widgetId: props.widgetId, records: [1, 2, 3] })}>
      publish
    </button>
  );
}

describe("StrataApp — WIF wiring (W1 + W2)", () => {
  it("wires declarative connections: a category click filters the target layer via the store", () => {
    const setDefinition = vi.fn();
    const store = { getState: () => ({ setDefinition, setActiveLayer: vi.fn(), setSelection: vi.fn() }) };
    const registry = mergeRegistry({ emitter: Emitter as any });
    const config: AppLayout = {
      pages: [{ id: "p", root: { kind: "widget", widget: { id: "chart", type: "emitter", props: { layerId: "L", value: "A" } } } }],
      connections: [{ from: "chart", trigger: "categorySelect", to: "map", action: "filter", options: { layerId: "L" } }],
    };
    render(<StrataApp config={config} registry={registry} context={{ store }} />);
    fireEvent.click(screen.getByText("pick"));
    expect(setDefinition).toHaveBeenCalledWith("L", "CAT = 'A'");
  });

  it("showHide action removes a widget from the tree", () => {
    const registry = mergeRegistry({ emitter: Emitter as any, marker: (() => <div>MARKER</div>) as any });
    const config: AppLayout = {
      pages: [
        {
          id: "p",
          root: {
            kind: "column",
            children: [
              { kind: "widget", widget: { id: "chart", type: "emitter", props: { layerId: "L", value: "A" } } },
              { kind: "widget", widget: { id: "panel", type: "marker" } },
            ],
          },
        },
      ],
      connections: [{ from: "chart", trigger: "categorySelect", to: "panel", action: "showHide", options: { hidden: true } }],
    };
    render(<StrataApp config={config} registry={registry} />);
    expect(screen.getByText("MARKER")).toBeTruthy();
    act(() => {
      fireEvent.click(screen.getByText("pick"));
    });
    expect(screen.queryByText("MARKER")).toBeNull();
  });

  it("output data sources: a consumer bound via fromWidget re-renders on publish", () => {
    const registry = mergeRegistry({ producer: Producer as any, consumer: Consumer as any });
    const config: AppLayout = {
      pages: [
        {
          id: "p",
          root: {
            kind: "column",
            children: [
              { kind: "widget", widget: { id: "q", type: "producer" } },
              { kind: "widget", widget: { id: "tbl", type: "consumer", dataSource: { fromWidget: "q" } } },
            ],
          },
        },
      ],
    };
    render(<StrataApp config={config} registry={registry} />);
    expect(screen.getByTestId("consumer").textContent).toBe("rows:0");
    act(() => {
      fireEvent.click(screen.getByText("publish"));
    });
    expect(screen.getByTestId("consumer").textContent).toBe("rows:3");
  });

  it("Phase 2: a button's buttonClick drives the navigate action to switch pages", () => {
    const config: AppLayout = {
      pages: [
        {
          id: "p1",
          root: {
            kind: "column",
            children: [
              { kind: "widget", widget: { id: "go", type: "button", props: { label: "Go" } } },
              { kind: "widget", widget: { type: "text", props: { content: "PAGE ONE" } } },
            ],
          },
        },
        { id: "p2", root: { kind: "widget", widget: { type: "text", props: { content: "PAGE TWO" } } } },
      ],
      connections: [{ from: "go", trigger: "buttonClick", action: "navigate", options: { pageId: "p2" } }],
    };
    render(<StrataApp config={config} />);
    expect(screen.getByText("PAGE ONE")).toBeInTheDocument();
    act(() => {
      fireEvent.click(screen.getByText("Go"));
    });
    expect(screen.getByText("PAGE TWO")).toBeInTheDocument();
  });

  it("Phase 6: a structured theme compiles to CSS vars + an injected scoped stylesheet", () => {
    const config: AppLayout = {
      pages: [{ id: "p", root: { kind: "widget", widget: { type: "text", props: { content: "hi" } } } }],
      theme: { mode: "dark", colors: { primary: "#2b6cb0", danger: "#e11d48" } },
    };
    const { container } = render(<StrataApp config={config} />);
    const root = container.querySelector("[data-strata-app]") as HTMLElement;
    expect(root.style.getPropertyValue("--strata-primary")).toBe("#2b6cb0");
    expect(root.style.getPropertyValue("--strata-accent")).toBe("#2b6cb0"); // legacy alias
    expect(root.style.getPropertyValue("--strata-critical")).toBe("#e11d48");
    const style = container.querySelector("style");
    expect(style?.textContent).toContain(":hover");
    expect(style?.textContent).toContain("prefers-reduced-motion");
  });

  it("still applies a flat theme map verbatim (back-compat)", () => {
    const config: AppLayout = {
      pages: [{ id: "p", root: { kind: "widget", widget: { type: "text", props: { content: "hi" } } } }],
      theme: { "--strata-accent": "#123456" },
    };
    const { container } = render(<StrataApp config={config} />);
    const root = container.querySelector("[data-strata-app]") as HTMLElement;
    expect(root.style.getPropertyValue("--strata-accent")).toBe("#123456");
    expect(container.querySelector("style")).toBeNull(); // no compiled stylesheet for a flat map
  });
});
