import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createStrataStore } from "@strata/state";
import { FeatureLayerDataSource } from "@strata/data-source";
import { QueryPanel } from "../../src/react/panels/QueryPanel.js";

const rows = [
  { OBJECTID: 1, zone: "A", pop: 100 },
  { OBJECTID: 2, zone: "B", pop: 200 },
  { OBJECTID: 3, zone: "A", pop: 300 },
];

describe("QueryPanel", () => {
  it("runs the where against a bound source and publishes the result rows as an output", async () => {
    const store = createStrataStore();
    store.getState().addLayer({ id: "parcels", title: "P", layerType: "GeoJSON", source: { kind: "geojson" } });
    const source = new FeatureLayerDataSource({ layerId: "parcels", store, rows });
    const publish = vi.fn();

    render(
      <QueryPanel
        fields={[{ name: "zone", type: "string" }, { name: "pop", type: "number" }]}
        source={source}
        outputs={{ publish }}
        widgetId="q1"
        layerId="parcels"
      />,
    );

    fireEvent.change(screen.getByLabelText("Value"), { target: { value: "A" } });
    fireEvent.click(screen.getByText("Run"));

    await waitFor(() => expect(publish).toHaveBeenCalled());
    const arg = publish.mock.calls[0][0];
    expect(arg.widgetId).toBe("q1");
    expect(arg.layerId).toBe("parcels");
    expect((arg.records as unknown[]).length).toBe(2); // zone = 'A' → OBJECTID 1 and 3
    await screen.findByText("2 results");
  });

  it("falls back to onQuery when no source is bound, passing the built where", async () => {
    const onQuery = vi.fn(async (where: string | null) => ({ rows: where ? [{ OBJECTID: 9 }] : [] }));
    render(<QueryPanel fields={[{ name: "pop", type: "number" }]} onQuery={onQuery} widgetId="q2" />);
    fireEvent.change(screen.getByLabelText("Value"), { target: { value: "150" } });
    fireEvent.click(screen.getByText("Run"));
    await waitFor(() => expect(onQuery).toHaveBeenCalledWith("pop = 150"));
    await screen.findByText("1 result");
  });
});
