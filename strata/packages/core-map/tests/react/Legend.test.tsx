import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { createStrataStore } from "@strata/state";
import { Legend, legendRows, legendWhere } from "../../src/react/controls/Legend.js";
import { MapChrome } from "../../src/react/controls/MapChrome.js";

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

/**
 * The legend must agree with the map. Two ways it used to disagree: it was handed a static array it
 * could never re-read, and it silently dropped any layer it could not break into classes.
 */
describe("Legend — reflects what is actually on the map", () => {
  /** Add a layer to a store, carrying an optional renderer. */
  function seed(store: any, id: string, title: string, renderer?: any): void {
    store.getState().addLayer({
      id,
      title,
      source: { kind: "geojson" },
      visibility: true,
      ...(renderer ? { layerDefinition: { drawingInfo: { renderer } } } : {}),
    } as any);
  }

  it("reads the store's layers when given no `layers` prop", () => {
    const store = createStrataStore();
    seed(store, "zones", "Zones", uniqueValue);
    render(<Legend store={store} />);
    expect(screen.getByText("Zones")).toBeInTheDocument();
    expect(screen.getByText("Class A")).toBeInTheDocument();
  });

  it("drops a layer from the legend the moment the layer panel hides it", () => {
    const store = createStrataStore();
    seed(store, "zones", "Zones", uniqueValue);
    seed(store, "roads", "Roads", simple);
    render(<Legend store={store} />);
    expect(screen.getByText("Roads")).toBeInTheDocument();

    // Exactly what the layer panel / map-controls drawer calls.
    act(() => store.getState().setVisibility("roads", false));
    expect(screen.queryByText("Roads")).not.toBeInTheDocument();
    expect(screen.getByText("Zones")).toBeInTheDocument();

    act(() => store.getState().setVisibility("roads", true));
    expect(screen.getByText("Roads")).toBeInTheDocument();
  });

  it("lists a layer that has no renderer — it is on the map, so it is in the legend", () => {
    // The service owns the symbology (or the renderer has no discrete classes). An absent row here
    // reads as an absent layer, which is the more expensive lie.
    render(<Legend layers={[{ id: "sat", title: "Imagery", visibility: true } as any]} />);
    expect(screen.getByText("Imagery")).toBeInTheDocument();
  });

  it("renders the stand-in row as a caption — it has no classes to filter", () => {
    render(<Legend layers={[{ id: "sat", title: "Imagery", visibility: true } as any]} />);
    expect(screen.queryByRole("button", { name: /Imagery/ })).not.toBeInTheDocument();
  });

  it("still renders nothing when there are no visible layers at all", () => {
    const { container } = render(<Legend layers={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("includeUnstyled={false} restores the strict symbology-key reading", () => {
    const { container } = render(
      <Legend layers={[{ id: "sat", title: "Imagery", visibility: true } as any]} includeUnstyled={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("an explicit `layers` prop still outranks the store", () => {
    const store = createStrataStore();
    seed(store, "zones", "Zones", uniqueValue);
    render(<Legend store={store} layers={[layer("only", "Only this", simple)]} />);
    expect(screen.getByText("Only this")).toBeInTheDocument();
    expect(screen.queryByText("Zones")).not.toBeInTheDocument();
  });
});

/** The legend as a control surface: click hides · shift-click isolates · Esc clears. */
describe("Legend — interactive", () => {
  const zones = layer("zones", "Zones", { ...uniqueValue, field: "CLASS" });

  it("builds a NOT IN filter when a class is hidden, and applies it in place", () => {
    const store = createStrataStore();
    store.getState().addLayer({ id: "zones", title: "Zones", source: { kind: "geojson" } } as any);
    render(<Legend layers={[zones]} store={store} />);

    fireEvent.click(screen.getByRole("button", { name: /Class A/ }));
    expect(store.getState().layers[0].layerDefinition?.definitionExpression).toBe("CLASS NOT IN ('A')");
  });

  it("shift-click isolates one class — an IN filter, and it replaces any hides", () => {
    const onFilterChange = vi.fn();
    render(<Legend layers={[zones]} onFilterChange={onFilterChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Class A/ }));
    fireEvent.click(screen.getByRole("button", { name: /Class B/ }), { shiftKey: true });

    expect(onFilterChange).toHaveBeenLastCalledWith({
      layerId: "zones",
      hidden: [],
      isolated: "Class B",
      where: "CLASS IN ('B')",
    });
  });

  it("shift-clicking the isolated class again releases it", () => {
    const onFilterChange = vi.fn();
    render(<Legend layers={[zones]} onFilterChange={onFilterChange} />);
    const rowA = screen.getByRole("button", { name: /Class A/ });

    fireEvent.click(rowA, { shiftKey: true });
    fireEvent.click(rowA, { shiftKey: true });
    expect(onFilterChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ isolated: null, where: null }),
    );
  });

  it("Esc clears every legend filter", () => {
    const onFilterChange = vi.fn();
    render(<Legend layers={[zones]} onFilterChange={onFilterChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Class A/ }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onFilterChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ hidden: [], isolated: null, where: null }),
    );
  });

  it("keeps the denominator visible — a filtered count must never read as the whole", () => {
    render(<Legend layers={[zones]} counts={{ "Class A": { n: 8340, total: 12728 } }} />);
    expect(screen.getByText("8,340")).toBeInTheDocument();
    expect(screen.getByText(/of 12,728/)).toBeInTheDocument();
  });

  it("says in words that isolating changes the map, not the reading", () => {
    render(<Legend layers={[zones]} />);
    expect(screen.getByText(/changes the map/)).toBeInTheDocument();
  });

  it("renders a static caption when interactive={false}", () => {
    render(<Legend layers={[zones]} interactive={false} />);
    expect(screen.queryByRole("button", { name: /Class A/ })).not.toBeInTheDocument();
    expect(screen.getByText("Class A")).toBeInTheDocument();
  });

  it("emits categorySelect so other widgets can follow the legend", () => {
    const bus = { emit: vi.fn() };
    render(<Legend layers={[zones]} bus={bus} />);
    fireEvent.click(screen.getByRole("button", { name: /Class B/ }), { shiftKey: true });
    expect(bus.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "categorySelect",
        payload: expect.objectContaining({ layerId: "zones", field: "CLASS", values: ["Class B"] }),
      }),
    );
  });

  it("classBreaks isolate becomes a real range predicate", () => {
    const breaks = layer("d", "Density", {
      type: "classBreaks",
      field: "POP",
      classBreakInfos: [
        { classMinValue: 0, classMaxValue: 10, label: "Low", symbol: { color: [1, 2, 3, 255] } },
        { classMinValue: 10, classMaxValue: 99, label: "High", symbol: { color: [4, 5, 6, 255] } },
      ],
    });
    expect(legendWhere(breaks, [], "High")).toBe("(POP >= 10 AND POP <= 99)");
    expect(legendWhere(breaks, ["Low"], null)).toBe("NOT (POP >= 0 AND POP <= 10)");
  });

  it("refuses to filter a renderer that classifies on no single field", () => {
    // A legend cannot honestly filter what it cannot name — better no filter than the wrong rows.
    expect(legendWhere(layer("s", "Parcels", simple), ["Parcels"], null)).toBeNull();
  });
});

/** The map chrome: one cluster, one drawer, and a basemap radio that ticks what is in force. */
describe("MapChrome", () => {
  const fakeMap = { zoomIn: vi.fn(), zoomOut: vi.fn(), getCenter: () => ({ lng: -119, lat: 36 }), getZoom: () => 8 };
  const layers = [layer("blocks", "Census blocks", simple)];

  it("renders the six-glyph cluster with MapLibre's own zoom replaced", () => {
    const { container } = render(<MapChrome map={fakeMap} layers={layers} onFit={vi.fn()} onToggleLegend={vi.fn()} />);
    const keys = [...container.querySelectorAll("button[data-key]")].map((b) => (b as HTMLElement).dataset.key);
    expect(keys).toEqual(["zin", "zout", "fit", "layers", "basemap", "legend"]);
    // Icons are inline SVG on currentColor — no external asset, no CSP problem.
    expect(container.querySelectorAll(".mapctl svg").length).toBe(6);
  });

  it("zooms the map from the cluster", () => {
    const { container } = render(<MapChrome map={fakeMap} layers={layers} />);
    fireEvent.click(container.querySelector('button[data-key="zin"]')!);
    expect(fakeMap.zoomIn).toHaveBeenCalled();
  });

  it("opens ONE drawer at a time, and the same button closes it", () => {
    const { container } = render(<MapChrome map={fakeMap} layers={layers} />);
    const layersBtn = container.querySelector('button[data-key="layers"]')!;
    const baseBtn = container.querySelector('button[data-key="basemap"]')!;

    fireEvent.click(layersBtn);
    expect(container.querySelector(".drawer")?.getAttribute("data-which")).toBe("layers");
    fireEvent.click(baseBtn);
    expect(container.querySelectorAll(".drawer").length).toBe(1); // never two
    expect(container.querySelector(".drawer")?.getAttribute("data-which")).toBe("basemap");
    fireEvent.click(baseBtn);
    expect(container.querySelector(".drawer")).toBeNull();
  });

  it("the drawer opens BESIDE the cluster, never over it", () => {
    const { container } = render(<MapChrome map={fakeMap} layers={layers} />);
    fireEvent.click(container.querySelector('button[data-key="layers"]')!);
    expect(container.querySelector(".mapctl")?.getAttribute("data-side")).toBe("right");
    expect(container.querySelector(".drawer")?.getAttribute("data-side")).toBe("right");
  });

  it("layer rows are checkboxes (multi-select) and toggle store visibility", () => {
    const store = createStrataStore();
    store.getState().addLayer({ id: "blocks", title: "Census blocks", source: { kind: "geojson" } } as any);
    const { container } = render(<MapChrome map={fakeMap} store={store} layers={layers} />);
    fireEvent.click(container.querySelector('button[data-key="layers"]')!);

    const row = container.querySelector('.opt[data-layer="blocks"]')!;
    expect(row.querySelector(".box")?.classList.contains("round")).toBe(false); // square = multi-select
    fireEvent.click(row);
    expect(store.getState().layers[0].visibility).toBe(false);
  });

  it("a layer row shows EVERY class it draws in, not just the first", () => {
    // One swatch off a uniqueValue renderer names one of its colours and implies the layer is that
    // colour — so the row carries the whole set (past the cap, a +N).
    const { container } = render(
      <MapChrome map={fakeMap} layers={[layer("zones", "Zones", uniqueValue)]} />,
    );
    fireEvent.click(container.querySelector('button[data-key="layers"]')!);
    const swatches = container.querySelectorAll('.opt[data-layer="zones"] .sw2');
    expect(swatches.length).toBe(3); // Class A · Class B · Other
  });

  it("basemap rows are RADIOS, never checkboxes", () => {
    const { container } = render(<MapChrome map={fakeMap} layers={layers} themeMode="light" />);
    fireEvent.click(container.querySelector('button[data-key="basemap"]')!);

    const radios = [...container.querySelectorAll('.opt[role="radio"]')];
    expect(radios.length).toBeGreaterThan(1);
    // Round box = exactly one basemap is in force. A square box would promise multi-select.
    expect(radios.every((r) => r.querySelector(".box")?.classList.contains("round"))).toBe(true);
  });

  it("ticks the EFFECTIVE basemap under Follow the theme — both rows, never none", () => {
    const { container } = render(<MapChrome map={fakeMap} layers={layers} themeMode="light" />);
    fireEvent.click(container.querySelector('button[data-key="basemap"]')!);

    const ticked = [...container.querySelectorAll('.opt[role="radio"][aria-checked="true"]')].map(
      (r) => (r as HTMLElement).dataset.basemap,
    );
    // "Follow the theme" says HOW the choice is made; it does not stop there being a choice. An
    // id-only test ticked nothing here, so the drawer offered five options with none selected and
    // no way to tell which basemap you were looking at.
    expect(ticked).toContain("auto");
    expect(ticked.filter((id) => id !== "auto")).toHaveLength(1);
  });

  it("an explicit pick takes over from the theme — then exactly one row ticks", () => {
    const { container } = render(<MapChrome map={fakeMap} layers={layers} themeMode="light" />);
    fireEvent.click(container.querySelector('button[data-key="basemap"]')!);

    const rows = [...container.querySelectorAll('.opt[role="radio"]')] as HTMLElement[];
    const pick = rows.find((r) => r.dataset.basemap && r.dataset.basemap !== "auto")!;
    fireEvent.click(pick);

    const ticked = [...container.querySelectorAll('.opt[role="radio"][aria-checked="true"]')].map(
      (r) => (r as HTMLElement).dataset.basemap,
    );
    expect(ticked).toEqual([pick.dataset.basemap]);
  });

  it("every basemap row carries a preview — a live tile (raster) or the style's own colours (vector)", async () => {
    // Since 2026-09-01 the gallery leads with VECTOR presets, which have no tile to preview: their
    // ground is assembled by the renderer. So a vector row reads the style's own background / road
    // / water out of the style document. What must never appear is a row with no preview at all —
    // a wall of identical grey boxes is the failure a live preview exists to prevent, and it is
    // what a raster-only check would have started reporting as green the day the default changed.
    const style = {
      layers: [
        { id: "background", type: "background", paint: { "background-color": "#f2f3f0" } },
        { id: "water", type: "fill", paint: { "fill-color": "#c2c8ca" } },
        { id: "road_major", type: "line", paint: { "line-color": "#8a929a" } },
      ],
    };
    const fetchSpy = vi
      .spyOn(globalThis, "fetch" as any)
      .mockResolvedValue({ ok: true, json: async () => style } as any);
    try {
      const { container } = render(<MapChrome map={fakeMap} layers={layers} />);
      fireEvent.click(container.querySelector('button[data-key="basemap"]')!);

      const thumbs = () => [...container.querySelectorAll(".opt .thumb")] as HTMLElement[];
      await waitFor(() =>
        expect(thumbs().every((t) => t.style.backgroundImage !== "")).toBe(true),
      );

      const backgrounds = thumbs().map((t) => t.style.backgroundImage);
      // a raster row paints its own tile — a colour swatch cannot tell Positron from Voyager
      expect(backgrounds.some((b) => /^url\(/.test(b))).toBe(true);
      // a vector row paints the ground/road/water its style declares
      expect(backgrounds.some((b) => /linear-gradient/.test(b))).toBe(true);
      // and the style document is what supplied them, fetched once per style URL
      expect(fetchSpy).toHaveBeenCalled();
      expect(backgrounds.some((b) => b.includes("rgb(242, 243, 240)") || b.includes("#f2f3f0"))).toBe(true);
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("states the keyless house rule rather than silently omitting providers", () => {
    const { container } = render(<MapChrome map={fakeMap} layers={layers} />);
    fireEvent.click(container.querySelector('button[data-key="basemap"]')!);
    expect(screen.getByText(/house rule, not an omission/)).toBeInTheDocument();
  });

  it("L / B / G / F drive the cluster, and Esc closes the drawer", () => {
    const onToggleLegend = vi.fn();
    const onFit = vi.fn();
    const { container } = render(
      <MapChrome map={fakeMap} layers={layers} onToggleLegend={onToggleLegend} onFit={onFit} />,
    );

    fireEvent.keyDown(window, { key: "l" });
    expect(container.querySelector(".drawer")?.getAttribute("data-which")).toBe("layers");
    fireEvent.keyDown(window, { key: "b" });
    expect(container.querySelector(".drawer")?.getAttribute("data-which")).toBe("basemap");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(container.querySelector(".drawer")).toBeNull();

    fireEvent.keyDown(window, { key: "g" });
    expect(onToggleLegend).toHaveBeenCalledWith(false);
    fireEvent.keyDown(window, { key: "f" });
    expect(onFit).toHaveBeenCalled();
  });

  it("does not steal keystrokes from an input", () => {
    const { container } = render(<MapChrome map={fakeMap} layers={layers} />);
    const input = document.createElement("input");
    document.body.appendChild(input);
    fireEvent.keyDown(input, { key: "l" });
    expect(container.querySelector(".drawer")).toBeNull();
    input.remove();
  });
});
