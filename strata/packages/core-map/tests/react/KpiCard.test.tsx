import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createStrataStore } from "@strata/state";
import { FeatureLayerDataSource } from "@strata/data-source";
import { KpiCard } from "../../src/react/widgets/KpiCard.js";

const ROWS = [
  { OBJECTID: 1, zone: "A", pop: 100 },
  { OBJECTID: 2, zone: "A", pop: 200 },
  { OBJECTID: 3, zone: "B", pop: 300 },
];

describe("KpiCard", () => {
  it("renders label, value, and unit", () => {
    render(<KpiCard label="Area" value={42} unit="km²" />);
    expect(screen.getByText("Area")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("km²")).toBeInTheDocument();
  });

  it("shows an up-arrow delta chip with the absolute value for a positive delta", () => {
    render(<KpiCard label="Sales" value={100} delta={7} deltaLabel="vs last week" />);
    expect(screen.getByText("▲")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("vs last week")).toBeInTheDocument();
  });

  it("shows a down-arrow and the magnitude (not the sign) for a negative delta", () => {
    render(<KpiCard label="Sales" value={100} delta={-3} />);
    expect(screen.getByText("▼")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.queryByText("-3")).not.toBeInTheDocument();
  });

  it("omits the delta chip when delta is absent or NaN", () => {
    render(<KpiCard label="Sales" value={100} />);
    expect(screen.queryByText("▲")).not.toBeInTheDocument();
    expect(screen.queryByText("▼")).not.toBeInTheDocument();
  });

  it("computes its value live from a bound DataSource and updates on filter change (Phase 1)", async () => {
    const store = createStrataStore();
    store.getState().addLayer({ id: "parcels", title: "P", layerType: "GeoJSON", source: { kind: "geojson" } });
    const source = new FeatureLayerDataSource({ layerId: "parcels", store, rows: ROWS });

    render(<KpiCard label="Total pop" source={source} stat={{ field: "pop", op: "sum" }} />);
    await waitFor(() => expect(screen.getByText("600")).toBeInTheDocument()); // 100+200+300

    // Filtering the layer through the store recomputes the KPI with no connections wired.
    store.getState().setDefinition("parcels", "zone = 'A'");
    await waitFor(() => expect(screen.getByText("300")).toBeInTheDocument()); // 100+200
  });
});
