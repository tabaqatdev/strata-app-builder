import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CartoPanel } from "../../src/react/panels/CartoPanel.js";

/** Structural store: CartoPanel only calls getState()/subscribe() and optional actions. */
function fakeStore(layers: any[]) {
  const setActiveLayer = vi.fn();
  const setVisibility = vi.fn();
  const state = { layers, activeLayerId: layers[0]?.id ?? null, setActiveLayer, setVisibility };
  return {
    store: { getState: () => state, subscribe: () => () => {} },
    setActiveLayer,
    setVisibility,
  };
}

const layers = [
  { id: "cities", title: "Cities", visibility: true },
  { id: "roads", title: "Roads", visibility: true },
];

describe("CartoPanel", () => {
  it("lists the store's layers", () => {
    const { store } = fakeStore(layers);
    render(<CartoPanel store={store} widgets={[]} />);
    expect(screen.getByText("Cities")).toBeInTheDocument();
    expect(screen.getByText("Roads")).toBeInTheDocument();
  });

  it("toggles layer visibility through the store", () => {
    const { store, setVisibility } = fakeStore(layers);
    const { container } = render(<CartoPanel store={store} widgets={[]} />);
    const checkbox = container.querySelector('input[type="checkbox"]')!;
    fireEvent.click(checkbox);
    expect(setVisibility).toHaveBeenCalled();
  });

  it("renders a category widget and cross-filters on a bar click", async () => {
    const { store } = fakeStore(layers);
    const onFilter = vi.fn();
    const bus = { emit: vi.fn() };
    const onQuery = vi.fn().mockResolvedValue([
      { label: "Urban", value: 12 },
      { label: "Rural", value: 5 },
    ]);

    render(
      <CartoPanel
        store={store}
        widgets={[{ id: "w1", kind: "category", layerId: "cities", field: "class" }]}
        onQuery={onQuery}
        onFilter={onFilter}
        bus={bus}
      />,
    );

    const urban = await screen.findByText("Urban");
    fireEvent.click(urban);

    expect(onFilter).toHaveBeenCalledWith("cities", expect.stringContaining("class"));
    await waitFor(() =>
      expect(bus.emit).toHaveBeenCalledWith(
        expect.objectContaining({ type: "categorySelect" }),
      ),
    );
  });

  it("adds a widget spec via the add-category button", () => {
    const { store } = fakeStore(layers);
    const onWidgetsChange = vi.fn();
    render(<CartoPanel store={store} widgets={[]} onWidgetsChange={onWidgetsChange} />);

    fireEvent.click(screen.getByText("+C"));
    expect(onWidgetsChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ kind: "category", layerId: "cities" })]),
    );
  });
});
