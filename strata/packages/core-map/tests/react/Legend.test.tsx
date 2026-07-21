import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Legend, legendRows } from "../../src/react/controls/Legend.js";

/** Build a minimal OperationalLayer carrying an ESRI renderer. */
function layer(id: string, title: string, renderer: any, visibility = true): any {
  return { id, title, visibility, layerDefinition: { drawingInfo: { renderer } } };
}

const simple = {
  type: "simple",
  label: "Parcels",
  symbol: { type: "esriSFS", color: [255, 0, 0, 128] },
};

const uniqueValue = {
  type: "uniqueValue",
  uniqueValueInfos: [
    { value: "A", label: "Class A", symbol: { type: "esriSFS", color: [0, 255, 0, 255] } },
    { value: "B", label: "Class B", symbol: { type: "esriSFS", color: [0, 0, 255, 255] } },
  ],
  defaultSymbol: { type: "esriSFS", color: [100, 100, 100, 255] },
  defaultLabel: "Other",
};

describe("legendRows (pure)", () => {
  it("returns a single row for a simple renderer, coercing ESRI color to rgba", () => {
    const rows = legendRows(layer("l1", "Parcels", simple));
    expect(rows).toHaveLength(1);
    expect(rows[0].label).toBe("Parcels");
    // alpha is 128/255 (unrounded), i.e. ~0.502 — mirrors the style compiler's coercion.
    expect(rows[0].swatch).toMatch(/^rgba\(255,0,0,0\.50/);
  });

  it("returns one row per unique value plus the default", () => {
    const rows = legendRows(layer("l2", "Zones", uniqueValue));
    expect(rows.map((r) => r.label)).toEqual(["Class A", "Class B", "Other"]);
  });

  it("returns one row per class break", () => {
    const rows = legendRows(
      layer("l3", "Density", {
        type: "classBreaks",
        classBreakInfos: [
          { classMaxValue: 10, label: "Low", symbol: { color: [1, 2, 3, 255] } },
          { classMaxValue: 20, label: "High", symbol: { color: [4, 5, 6, 255] } },
        ],
      }),
    );
    expect(rows.map((r) => r.label)).toEqual(["Low", "High"]);
  });

  it("returns [] for a layer with no renderer", () => {
    expect(legendRows({ id: "x", title: "x" } as any)).toEqual([]);
  });
});

describe("Legend (component)", () => {
  it("renders a group title and a row per class", () => {
    render(<Legend layers={[layer("l2", "Zones", uniqueValue)]} />);
    expect(screen.getByText("Zones")).toBeInTheDocument();
    expect(screen.getByText("Class A")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("hides non-visible layers by default and returns null when nothing is left", () => {
    const { container } = render(
      <Legend layers={[layer("l1", "Hidden", simple, false)]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("includes hidden layers when visibleOnly is false", () => {
    render(<Legend layers={[layer("l1", "Hidden", simple, false)]} visibleOnly={false} />);
    expect(screen.getByText("Hidden")).toBeInTheDocument();
  });
});
