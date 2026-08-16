import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createStrataStore } from "@strata/state";
import { FeatureLayerDataSource } from "@strata/data-source";
import { AttributeTablePanel, toGeoJson } from "../../src/react/panels/AttributeTablePanel.js";

const rows = [
  { OBJECTID: 1, name: "Alpha", pop: 100 },
  { OBJECTID: 2, name: "Bravo", pop: 200 },
  { OBJECTID: 3, name: "Charlie", pop: 300 },
];

describe("AttributeTablePanel", () => {
  it("renders inferred columns and a row count", () => {
    render(<AttributeTablePanel rows={rows} />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
  });

  it("applies field aliases to the column headers", () => {
    render(<AttributeTablePanel rows={rows} fieldAliases={{ pop: "Population" }} />);
    expect(screen.getByText(/Population/)).toBeInTheDocument();
  });

  it("calls onRowSelect and emits a rowSelect trigger on the bus for a numeric OID", () => {
    const onRowSelect = vi.fn();
    const bus = { emit: vi.fn() };
    render(
      <AttributeTablePanel rows={rows} layerId="cities" onRowSelect={onRowSelect} bus={bus} />,
    );

    fireEvent.click(screen.getByText("Bravo"));
    expect(onRowSelect).toHaveBeenCalledWith(2);
    expect(bus.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "rowSelect",
        payload: expect.objectContaining({ layerId: "cities", oids: [2] }),
      }),
    );
  });

  it("filters rows via a per-column filter input", () => {
    render(<AttributeTablePanel rows={rows} columns={["OBJECTID", "name", "pop"]} />);
    const nameFilter = screen.getAllByPlaceholderText("Filter…")[1];
    fireEvent.change(nameFilter, { target: { value: "alp" } });

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Bravo")).not.toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });
});

describe("AttributeTablePanel — #5 table depth", () => {
  it("toGeoJson builds a FeatureCollection with geometry from the accessor", () => {
    const gj = JSON.parse(
      toGeoJson(["OBJECTID", "name"], rows, (r) => ({ type: "Point", coordinates: [Number(r.pop) / 100, 0] })),
    );
    expect(gj.type).toBe("FeatureCollection");
    expect(gj.features).toHaveLength(3);
    expect(gj.features[0].properties).toEqual({ OBJECTID: 1, name: "Alpha" });
    expect(gj.features[1].geometry).toEqual({ type: "Point", coordinates: [2, 0] });
  });

  it("toGeoJson yields null geometry when no accessor is given", () => {
    const gj = JSON.parse(toGeoJson(["name"], rows));
    expect(gj.features[0].geometry).toBeNull();
  });

  it("renders a GeoJSON export button and triggers a download", () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    // jsdom lacks the object-URL APIs; stub them so download() runs.
    (URL as any).createObjectURL = vi.fn(() => "blob:x");
    (URL as any).revokeObjectURL = vi.fn();
    render(<AttributeTablePanel rows={rows} />);
    fireEvent.click(screen.getByRole("button", { name: "GeoJSON" }));
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("shows server pager controls and calls onPageChange with the next offset", () => {
    const onPageChange = vi.fn();
    render(
      <AttributeTablePanel
        rows={rows}
        page={{ offset: 0, pageSize: 3, total: 9 }}
        onPageChange={onPageChange}
      />,
    );
    expect(screen.getByText(/of 9/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "‹ Prev" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Next ›" }));
    expect(onPageChange).toHaveBeenCalledWith(3, 3);
  });

  it("windows rows past the virtualization threshold (renders far fewer than all)", () => {
    const many = Array.from({ length: 500 }, (_, i) => ({ OBJECTID: i, name: `row${i}` }));
    const { container } = render(<AttributeTablePanel rows={many} virtualize viewportHeight={400} />);
    // data rows only (exclude the aria-hidden spacer rows)
    const dataRows = [...container.querySelectorAll("tbody tr")].filter((tr) => !tr.hasAttribute("aria-hidden"));
    expect(dataRows.length).toBeGreaterThan(0);
    expect(dataRows.length).toBeLessThan(60); // a window, not all 500
  });

  it("renders a bound source's filtered view and selects into the source on row click (Phase 1)", async () => {
    const store = createStrataStore();
    store.getState().addLayer({ id: "parcels", title: "P", layerType: "GeoJSON", source: { kind: "geojson" } });
    const source = new FeatureLayerDataSource({ layerId: "parcels", store, rows });

    render(<AttributeTablePanel source={source} layerId="parcels" />); // no `rows` prop → rows come from the source
    expect(screen.getByText("Alpha")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Bravo"));
    expect(source.getSelection()).toEqual({ layerId: "parcels", oids: [2] });

    store.getState().setDefinition("parcels", "pop >= 250");
    await waitFor(() => {
      expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
      expect(screen.getByText("Charlie")).toBeInTheDocument();
    });
  });

  it("a row adopts the record — fly there and open its popup", () => {
    const bus = { emit: vi.fn() };
    render(<AttributeTablePanel rows={rows} layerId="cities" bus={bus} />);

    fireEvent.click(screen.getByText("Bravo"));
    expect(bus.emit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: "rowSelect",
        payload: { layerId: "cities", oids: [2], zoom: true, popup: true },
      }),
    );
    // The adopted row is marked, so the table shows WHICH record the map flew to.
    expect(screen.getByText("Bravo").closest("tr")).toHaveAttribute("aria-selected", "true");
  });

  it("clicking the same row again RELEASES it — empty oids, no zoom, popup closed", () => {
    const bus = { emit: vi.fn() };
    render(<AttributeTablePanel rows={rows} layerId="cities" bus={bus} />);

    fireEvent.click(screen.getByText("Bravo"));
    fireEvent.click(screen.getByText("Bravo"));

    expect(bus.emit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: "rowSelect",
        payload: { layerId: "cities", oids: [], zoom: false, popup: false },
      }),
    );
    expect(screen.getByText("Bravo").closest("tr")).toHaveAttribute("aria-selected", "false");
  });

  it("moves the selection when a DIFFERENT row is clicked (one record at a time)", () => {
    const bus = { emit: vi.fn() };
    render(<AttributeTablePanel rows={rows} layerId="cities" bus={bus} />);

    fireEvent.click(screen.getByText("Bravo"));
    fireEvent.click(screen.getByText("Charlie"));

    expect(bus.emit).toHaveBeenLastCalledWith(
      expect.objectContaining({ payload: expect.objectContaining({ oids: [3], popup: true }) }),
    );
    expect(screen.getByText("Bravo").closest("tr")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByText("Charlie").closest("tr")).toHaveAttribute("aria-selected", "true");
  });

  it("releases the bound source's selection too, so linked widgets un-filter", () => {
    const store = createStrataStore();
    const source = new FeatureLayerDataSource({ id: "parcels", layerId: "parcels", store, rows });
    render(<AttributeTablePanel source={source} layerId="parcels" />);

    fireEvent.click(screen.getByText("Bravo"));
    expect(source.getSelection()).toEqual({ layerId: "parcels", oids: [2] });
    fireEvent.click(screen.getByText("Bravo"));
    expect(source.getSelection()).toEqual({ layerId: "parcels", oids: [] });
  });
});
