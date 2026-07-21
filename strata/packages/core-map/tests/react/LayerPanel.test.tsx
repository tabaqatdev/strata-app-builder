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
