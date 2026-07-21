import { describe, it, expect } from "vitest";
import type { AppLayout } from "@strata/schema";
import {
  getNode,
  updateWidget,
  updateContainer,
  moveChild,
  removeNode,
  setTheme,
  findWidgetPath,
  outline,
} from "../src/editModel.js";

function layout(): AppLayout {
  return {
    pages: [
      {
        id: "p",
        root: {
          kind: "column",
          gap: 12,
          children: [
            { kind: "widget", widget: { id: "map", type: "map", props: { layerIds: ["a"] } } },
            {
              kind: "row",
              children: [
                { kind: "widget", widget: { id: "chart", type: "chart", dataSource: { layerId: "a" } } },
                { kind: "widget", widget: { id: "table", type: "table" } },
              ],
            },
          ],
        },
      },
    ],
  };
}

describe("editModel — node paths", () => {
  it("getNode traverses child-index paths", () => {
    const l = layout();
    expect(getNode(l.pages[0], [])!.kind).toBe("column");
    expect((getNode(l.pages[0], [0]) as any).widget.id).toBe("map");
    expect((getNode(l.pages[0], [1, 1]) as any).widget.id).toBe("table");
    expect(getNode(l.pages[0], [9])).toBeNull();
  });

  it("findWidgetPath locates a widget by id, outline lists the tree", () => {
    const l = layout();
    expect(findWidgetPath(l.pages[0], "table")).toEqual([1, 1]);
    expect(findWidgetPath(l.pages[0], "nope")).toBeNull();
    const o = outline(l.pages[0]);
    expect(o[0].label).toBe("column");
    expect(o.some((e) => e.label === "chart #chart")).toBe(true);
  });
});

describe("editModel — immutable edits", () => {
  it("updateWidget patches props/dataSource without mutating the input", () => {
    const l = layout();
    const next = updateWidget(l, "p", [1, 0], { props: { kind: "bar" }, dataSource: { where: "POP>1" } });
    // original untouched
    expect((getNode(l.pages[0], [1, 0]) as any).widget.props).toBeUndefined();
    const w = (getNode(next.pages[0], [1, 0]) as any).widget;
    expect(w.props).toEqual({ kind: "bar" });
    expect(w.dataSource).toEqual({ layerId: "a", where: "POP>1" }); // merged
  });

  it("updateContainer patches gap/columns/mode preserving children+kind", () => {
    const next = updateContainer(layout(), "p", [1], { gap: 4, mode: "fixed" });
    const row = getNode(next.pages[0], [1]) as any;
    expect(row.kind).toBe("row");
    expect(row.gap).toBe(4);
    expect(row.mode).toBe("fixed");
    expect(row.children).toHaveLength(2);
  });

  it("moveChild reorders children", () => {
    const next = moveChild(layout(), "p", [1], 0, 1);
    const row = getNode(next.pages[0], [1]) as any;
    expect(row.children.map((c: any) => c.widget.id)).toEqual(["table", "chart"]);
  });

  it("removeNode drops the node at a path", () => {
    const next = removeNode(layout(), "p", [1, 0]);
    const row = getNode(next.pages[0], [1]) as any;
    expect(row.children.map((c: any) => c.widget.id)).toEqual(["table"]);
  });

  it("setTheme replaces the theme token map", () => {
    const next = setTheme(layout(), { "--strata-accent": "#fff" });
    expect(next.theme).toEqual({ "--strata-accent": "#fff" });
  });
});
