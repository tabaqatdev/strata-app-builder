import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createStrataStore } from "@strata/state";
import { LayerPanel } from "../../src/react/panels/LayerPanel.js";
import { layer } from "./_fakes.js";

function storeWith(...ids: string[]) {
  const store = createStrataStore();
  ids.forEach((id) => store.getState().addLayer(layer(id, { title: id })));
  return store;
}

describe("LayerPanel", () => {
  it("renders a row per layer and the empty state when there are none", () => {
    const { rerender } = render(<LayerPanel store={createStrataStore()} />);
    expect(screen.getByText("No layers in this map.")).toBeInTheDocument();

    rerender(<LayerPanel store={storeWith("Roads", "Parcels")} />);
    expect(screen.getByText("Roads")).toBeInTheDocument();
    expect(screen.getByText("Parcels")).toBeInTheDocument();
  });

  it("drives store.setVisibility from the visibility toggle", () => {
    const store = storeWith("Roads");
    const spy = vi.spyOn(store.getState(), "setVisibility");
    render(<LayerPanel store={store} />);

    fireEvent.click(screen.getByLabelText("Toggle Roads"));
    expect(spy).toHaveBeenCalledWith("Roads", false);
    expect(store.getState().layers[0].visibility).toBe(false);
  });

  it("sets the active layer when a row is clicked", () => {
    const store = storeWith("Roads", "Parcels");
    render(<LayerPanel store={store} />);

    fireEvent.click(screen.getByText("Parcels"));
    expect(store.getState().activeLayerId).toBe("Parcels");
  });

  it("removes a layer via the row context menu", () => {
    const store = storeWith("Roads", "Parcels");
    render(<LayerPanel store={store} />);

    // Rows are one line now: open the ⋯ menu for Roads, then click "Remove layer".
    fireEvent.click(screen.getByLabelText("Actions for Roads"));
    fireEvent.click(screen.getByText("Remove layer"));
    expect(store.getState().layers.map((l) => l.id)).toEqual(["Parcels"]);
  });

  it("opens the Filter editor via onFilter when provided", () => {
    const store = storeWith("Roads");
    const onFilter = vi.fn();
    render(<LayerPanel store={store} onFilter={onFilter} />);

    fireEvent.click(screen.getByLabelText("Actions for Roads"));
    fireEvent.click(screen.getByText("Filter…"));
    expect(onFilter).toHaveBeenCalledWith("Roads");
  });
});

/**
 * A layer list that cannot tell you what a layer looks like sends the reader to the legend to work
 * out which of five polygon layers is the blue one. The swatches come from the same `legendRows()`
 * the Legend reads, so the two surfaces cannot disagree.
 */
describe("LayerPanel — symbology", () => {
  const withRenderer = (id: string, renderer: any) =>
    layer(id, { layerDefinition: { drawingInfo: { renderer } } } as any);

  function storeOf(...layers: any[]) {
    const store = createStrataStore();
    layers.forEach((l) => store.getState().addLayer(l));
    return store;
  }

  it("shows the layer's own colour, not a generic layer glyph", () => {
    const store = storeOf(
      withRenderer("Roads", { type: "simple", symbol: { type: "esriSLS", color: [255, 0, 0, 255] } }),
    );
    const { container } = render(<LayerPanel store={store} />);
    const swatch = container.querySelector('[data-strata-symbology="Roads"] span') as HTMLElement;
    expect(swatch).toBeTruthy();
    // jsdom normalizes a fully-opaque rgba() to rgb().
    expect(swatch.style.background).toBe("rgb(255, 0, 0)");
  });

  it("expands the full class list for a multi-class renderer", () => {
    const store = storeOf(
      withRenderer("Zones", {
        type: "uniqueValue",
        field: "CLASS",
        uniqueValueInfos: [
          { value: "A", label: "Residential", symbol: { color: [0, 255, 0, 255] } },
          { value: "B", label: "Commercial", symbol: { color: [0, 0, 255, 255] } },
        ],
      }),
    );
    render(<LayerPanel store={store} />);
    expect(screen.queryByText("Residential")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Show the 2 symbology classes for Zones/));
    expect(screen.getByText("Residential")).toBeInTheDocument();
    expect(screen.getByText("Commercial")).toBeInTheDocument();
  });

  it("offers no expander for a single-class renderer — there is nothing to open", () => {
    const store = storeOf(withRenderer("Roads", { type: "simple", symbol: { color: [1, 2, 3, 255] } }));
    render(<LayerPanel store={store} />);
    expect(screen.queryByLabelText(/symbology classes/)).not.toBeInTheDocument();
  });

  it("still shows a neutral swatch for a layer whose service owns the symbology", () => {
    const store = storeOf(layer("Imagery"));
    const { container } = render(<LayerPanel store={store} />);
    expect(container.querySelector('[data-strata-symbology="Imagery"] span')).toBeTruthy();
  });
});
