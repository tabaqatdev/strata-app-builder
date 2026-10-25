import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { createStrataStore } from "@strata/state";
import { Legend, legendRows, legendWhere } from "../../src/react/controls/Legend.js";
import { MapChrome } from "../../src/react/controls/MapChrome.js";
import * as basemapCatalog from "@strata/map-controls/basemaps";

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

/**
 * The map chrome: the standard cluster from `@strata/map-controls`, one drawer beside it, and a
 * basemap gallery whose radio ticks what is in force. (Converted from the pre-package chrome's
 * tests — same promises, the package's DOM.)
 */
describe("MapChrome", () => {
  const fakeMap = {
    zoomIn: vi.fn(), zoomOut: vi.fn(), on: vi.fn(), off: vi.fn(),
    getCenter: () => ({ lng: -119, lat: 36 }), getZoom: () => 8,
    // enough style surface for applyBaseMap (a pick without a store draws the basemap itself)
    getStyle: () => ({ sources: {}, layers: [] }), getLayer: () => undefined, getSource: () => undefined,
    addSource: vi.fn(), addLayer: vi.fn(),
  };
  const layers = [layer("blocks", "Census blocks", simple)];
  const acts = (c: HTMLElement) => [...c.querySelectorAll(".smc-ctl button[data-act]")].map((b) => (b as HTMLElement).dataset.act);
  const drawer = (c: HTMLElement) => c.querySelector(".smc-drawer") as HTMLElement;
  const openWhich = (c: HTMLElement) => (drawer(c).hidden ? null : drawer(c).dataset.which);

  it("renders the standard cluster, in order — zoom in · zoom out · home | layers · basemap · legend · full screen", () => {
    Object.defineProperty(document, "fullscreenEnabled", { value: true, configurable: true });
    try {
      const { container } = render(<MapChrome map={fakeMap} layers={layers} onFit={vi.fn()} onToggleLegend={vi.fn()} />);
      expect(acts(container)).toEqual(["zin", "zout", "fit", "layers", "base", "legend", "fullscreen"]);
      // Icons are inline SVG on currentColor — no external asset, no CSP problem.
      expect(container.querySelectorAll(".smc-ctl button svg").length).toBe(7);
    } finally {
      Object.defineProperty(document, "fullscreenEnabled", { value: undefined, configurable: true });
    }
  });

  it("zooms the map from the cluster", () => {
    const { container } = render(<MapChrome map={fakeMap} layers={layers} />);
    fireEvent.click(container.querySelector('[data-act="zin"]')!);
    expect(fakeMap.zoomIn).toHaveBeenCalled();
  });

  it("opens ONE drawer at a time, and the same button closes it", () => {
    const { container } = render(<MapChrome map={fakeMap} layers={layers} />);
    const layersBtn = container.querySelector('[data-act="layers"]')!;
    const baseBtn = container.querySelector('[data-act="base"]')!;

    fireEvent.click(layersBtn);
    expect(openWhich(container)).toBe("layers");
    fireEvent.click(baseBtn);
    expect(container.querySelectorAll(".smc-drawer").length).toBe(1); // never two
    expect(openWhich(container)).toBe("base");
    expect(baseBtn.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(baseBtn);
    expect(openWhich(container)).toBeNull();
  });

  it("the drawer opens BESIDE the cluster, never inside or over it", () => {
    const { container } = render(<MapChrome map={fakeMap} layers={layers} />);
    fireEvent.click(container.querySelector('[data-act="layers"]')!);
    const ctl = container.querySelector(".smc-ctl")!;
    // siblings in one `.smc` box: the stylesheet places the drawer at right:47px, beside the cluster
    expect(drawer(container).parentElement).toBe(ctl.parentElement);
    expect(ctl.contains(drawer(container))).toBe(false);
    expect(ctl.parentElement?.classList.contains("smc")).toBe(true);
  });

  it("the eye on a layer row toggles store visibility (each layer independently)", () => {
    const store = createStrataStore();
    store.getState().addLayer({ id: "blocks", title: "Census blocks", source: { kind: "geojson" } } as any);
    const { container } = render(<MapChrome map={fakeMap} store={store} layers={layers} />);
    fireEvent.click(container.querySelector('[data-act="layers"]')!);

    const eye = container.querySelector('[data-ll-id="blocks"] [data-ll-act="eye"]')!;
    expect(eye.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(eye);
    expect(store.getState().layers[0].visibility).toBe(false);
    expect(container.querySelector('[data-ll-id="blocks"]')?.classList.contains("off")).toBe(true);
  });

  it("a layer row shows EVERY class it draws in, not just the first", () => {
    // One swatch off a uniqueValue renderer names one of its colours and implies the layer is that
    // colour — so the row carries the whole set, and its legend lists every class.
    const { container } = render(<MapChrome map={fakeMap} layers={[layer("zones", "Zones", uniqueValue)]} />);
    fireEvent.click(container.querySelector('[data-act="layers"]')!);
    expect(container.querySelectorAll('[data-ll-id="zones"] .ll-swatch .ll-dots i').length).toBe(3);
    const legend = container.querySelector('[data-ll-id="zones"] .ll-legend')!;
    expect([...legend.querySelectorAll("li")].map((li) => li.textContent)).toEqual(["Class A", "Class B", "Other"]);
  });

  it("basemap cards are RADIOS, never checkboxes — and Follow the theme is a switch", () => {
    const { container } = render(<MapChrome map={fakeMap} layers={layers} themeMode="light" />);
    fireEvent.click(container.querySelector('[data-act="base"]')!);

    const radios = [...container.querySelectorAll('[role="radiogroup"] .bm-pick[role="radio"]')];
    expect(radios.length).toBe(basemapCatalog.BASEMAPS.length);
    expect(container.querySelector('[data-base="__auto"]')?.getAttribute("role")).toBe("switch");
  });

  it("ticks the EFFECTIVE basemap under Follow the theme — the switch AND one card, never none", () => {
    const { container } = render(<MapChrome map={fakeMap} layers={layers} themeMode="light" />);
    fireEvent.click(container.querySelector('[data-act="base"]')!);

    // "Follow the theme" says HOW the choice is made; it does not stop there being a choice.
    expect(container.querySelector('[data-base="__auto"]')?.getAttribute("aria-checked")).toBe("true");
    const ticked = [...container.querySelectorAll('.bm-pick[aria-checked="true"]')].map((r) => (r as HTMLElement).dataset.base);
    expect(ticked).toEqual(["osm"]);
  });

  it("an explicit pick takes over from the theme — then exactly one card ticks", () => {
    const { container } = render(<MapChrome map={fakeMap} layers={layers} themeMode="light" />);
    fireEvent.click(container.querySelector('[data-act="base"]')!);
    fireEvent.click(container.querySelector('[data-base="esri-topo"]')!);

    const ticked = [...container.querySelectorAll('.bm-pick[aria-checked="true"]')].map((r) => (r as HTMLElement).dataset.base);
    expect(ticked).toEqual(["esri-topo"]);
    expect(container.querySelector('[data-base="__auto"]')?.getAttribute("aria-checked")).toBe("false");
  });

  it("every basemap card carries a thumbnail and an info tooltip with its description", () => {
    const { container } = render(<MapChrome map={fakeMap} layers={layers} />);
    fireEvent.click(container.querySelector('[data-act="base"]')!);
    const cards = [...container.querySelectorAll(".bm-card")];
    expect(cards.length).toBe(basemapCatalog.BASEMAPS.length);
    for (const card of cards) {
      const id = (card.querySelector(".bm-pick") as HTMLElement).dataset.base!;
      expect(card.querySelector("img")?.getAttribute("src")).toMatch(new RegExp(`${id}\\.png$`));
      expect(card.querySelector(".bm-info")?.getAttribute("data-tip")).toBe(basemapCatalog.basemapById(id)!.description);
    }
  });

  it("offers only keyless basemaps — every card is a catalog entry on the host allow-list", () => {
    const { container } = render(<MapChrome map={fakeMap} layers={layers} />);
    fireEvent.click(container.querySelector('[data-act="base"]')!);
    for (const b of container.querySelectorAll(".bm-pick")) {
      const entry = basemapCatalog.basemapById((b as HTMLElement).dataset.base)!;
      for (const u of basemapCatalog.basemapUrls(entry)) {
        expect(u).toMatch(basemapCatalog.BASEMAP_HOSTS);
        expect(u).not.toMatch(basemapCatalog.BASEMAP_DENY);
      }
    }
  });

  it("L / B / G / F drive the cluster, and Esc closes the drawer", () => {
    const onToggleLegend = vi.fn();
    const onFit = vi.fn();
    const { container } = render(
      <MapChrome map={fakeMap} layers={layers} onToggleLegend={onToggleLegend} onFit={onFit} />,
    );

    fireEvent.keyDown(window, { key: "l" });
    expect(openWhich(container)).toBe("layers");
    fireEvent.keyDown(window, { key: "b" });
    expect(openWhich(container)).toBe("base");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(openWhich(container)).toBeNull();

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
    expect(openWhich(container)).toBeNull();
    input.remove();
  });
});
