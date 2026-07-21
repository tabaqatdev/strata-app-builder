import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createStrataStore } from "@strata/state";
import { BasemapPanel, buildBaseMap } from "../../src/react/panels/BasemapPanel.js";

const OPTIONS = [
  { id: "osm", title: "OpenStreetMap", templateUrl: "https://tile/{z}/{x}/{y}.png" },
  { id: "positron", title: "CARTO Positron", style: "https://cdn/positron.json" },
];

describe("buildBaseMap (pure)", () => {
  it("produces a vector (style) basemap when an option has a style URL", () => {
    const bm = buildBaseMap(OPTIONS[1]);
    expect(JSON.stringify(bm)).toContain("positron.json");
  });

  it("produces a raster (tiled) basemap when an option has a templateUrl", () => {
    const bm = buildBaseMap(OPTIONS[0]) as any;
    expect(JSON.stringify(bm)).toContain("{z}/{x}/{y}");
  });
});

describe("BasemapPanel", () => {
  it("lists each basemap option", () => {
    render(<BasemapPanel store={createStrataStore()} basemaps={OPTIONS} />);
    expect(screen.getByText("OpenStreetMap")).toBeInTheDocument();
    expect(screen.getByText("CARTO Positron")).toBeInTheDocument();
  });

  it("applies a basemap to the store and calls onApplyBasemap when a row is clicked", () => {
    const store = createStrataStore();
    const onApplyBasemap = vi.fn();
    render(<BasemapPanel store={store} basemaps={OPTIONS} onApplyBasemap={onApplyBasemap} />);

    fireEvent.click(screen.getByText("CARTO Positron"));
    expect(store.getState().baseMap).not.toBeNull();
    expect(onApplyBasemap).toHaveBeenCalledOnce();
  });
});
