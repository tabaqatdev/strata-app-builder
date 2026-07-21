import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import type { AppLayout } from "@strata/schema";
import { StrataApp } from "../../src/react/app/StrataApp.js";
import { mergeRegistry } from "../../src/react/app/registry.js";

const marker = (label: string) => (() => <div>{label}</div>) as any;

describe("StrataApp — Section/Views (#8)", () => {
  it("renders tabs and switches the shown view; applies a view's mapState to the store", () => {
    const setView = vi.fn();
    const setDefinition = vi.fn();
    const store = { getState: () => ({ setView, setDefinition, setActiveLayer: vi.fn() }) };
    const registry = mergeRegistry({ a: marker("VIEW-A"), b: marker("VIEW-B") });
    const config: AppLayout = {
      pages: [
        {
          id: "p",
          root: {
            kind: "views",
            nav: "tabs",
            views: [
              { id: "va", title: "A", content: { kind: "widget", widget: { type: "a" } }, mapState: { viewpoint: { center: [10, 20], zoom: 5 } } },
              { id: "vb", title: "B", content: { kind: "widget", widget: { type: "b" } }, mapState: { definitionExpression: { L: "X=1" } } },
            ],
          } as any,
        },
      ],
    };
    render(<StrataApp config={config} registry={registry} context={{ store }} />);
    // first view shown + its mapState applied on mount
    expect(screen.getByText("VIEW-A")).toBeInTheDocument();
    expect(setView).toHaveBeenCalledWith({ center: [10, 20], zoom: 5 });
    // switch to view B
    fireEvent.click(screen.getByRole("tab", { name: "B" }));
    expect(screen.getByText("VIEW-B")).toBeInTheDocument();
    expect(setDefinition).toHaveBeenCalledWith("L", "X=1");
  });

  it("slides nav shows a prev/next stepper", () => {
    const registry = mergeRegistry({ a: marker("S1"), b: marker("S2") });
    const config: AppLayout = {
      pages: [
        {
          id: "p",
          root: {
            kind: "views",
            nav: "slides",
            views: [
              { id: "s1", title: "One", content: { kind: "widget", widget: { type: "a" } } },
              { id: "s2", title: "Two", content: { kind: "widget", widget: { type: "b" } } },
            ],
          } as any,
        },
      ],
    };
    render(<StrataApp config={config} registry={registry} />);
    expect(screen.getByText("S1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "›" }));
    expect(screen.getByText("S2")).toBeInTheDocument();
  });
});

describe("StrataApp — accordion + flow-row + animate", () => {
  it("accordion toggles child sections (first open by default)", () => {
    const registry = mergeRegistry({ a: marker("PANEL-A"), b: marker("PANEL-B") });
    const config: AppLayout = {
      pages: [
        {
          id: "p",
          root: {
            kind: "accordion",
            titles: ["First", "Second"],
            children: [
              { kind: "widget", widget: { type: "a" } },
              { kind: "widget", widget: { type: "b" } },
            ],
          },
        },
      ],
    };
    render(<StrataApp config={config} registry={registry} />);
    expect(screen.getByText("PANEL-A")).toBeInTheDocument(); // first open
    expect(screen.queryByText("PANEL-B")).toBeNull(); // second collapsed
    fireEvent.click(screen.getByRole("button", { name: /Second/ }));
    expect(screen.getByText("PANEL-B")).toBeInTheDocument();
  });

  it("flow-row wraps its children (flex-wrap)", () => {
    const registry = mergeRegistry({ a: marker("X") });
    const config: AppLayout = {
      pages: [{ id: "p", root: { kind: "flow-row", children: [{ kind: "widget", widget: { type: "a" } }] } }],
    };
    const { container } = render(<StrataApp config={config} registry={registry} />);
    const flow = [...container.querySelectorAll("div")].find((d) => d.style.flexWrap === "wrap");
    expect(flow).toBeTruthy();
  });

  it("animate wraps content with a data-animate attribute", () => {
    const registry = mergeRegistry({ a: marker("X") });
    const config: AppLayout = {
      pages: [{ id: "p", root: { kind: "column", animate: "fade", children: [{ kind: "widget", widget: { type: "a" } }] } }],
    };
    const { container } = render(<StrataApp config={config} registry={registry} />);
    expect(container.querySelector('[data-animate="fade"]')).toBeTruthy();
  });
});
