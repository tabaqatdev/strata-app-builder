import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createStrataStore } from "@strata/state";
import { MeasureControl } from "../../src/react/controls/MeasureControl.js";

/** MeasureControl only touches `map.getCanvas().style.cursor` and `maplibregl` (lazy path). */
function stubMap() {
  return { getCanvas: () => ({ style: {} as Record<string, string> }) };
}

describe("MeasureControl", () => {
  it("renders distance and area buttons", () => {
    render(<MeasureControl store={createStrataStore()} map={stubMap()} maplibregl={{}} />);
    expect(screen.getByTitle("Measure distance")).toBeInTheDocument();
    expect(screen.getByTitle("Measure area")).toBeInTheDocument();
  });

  it("reverts the store to identify mode on unmount", () => {
    const store = createStrataStore();
    store.getState().setInteractionMode("measure");
    const spy = vi.spyOn(store.getState(), "setInteractionMode");

    const { unmount } = render(
      <MeasureControl store={store} map={stubMap()} maplibregl={{}} />,
    );
    unmount();

    expect(spy).toHaveBeenCalledWith("identify");
    expect(store.getState().interactionMode).toBe("identify");
  });
});
