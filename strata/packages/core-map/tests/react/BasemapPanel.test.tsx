import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createStrataStore } from "@strata/state";
import { BasemapPanel, buildBaseMap, previewTile } from "../../src/react/panels/BasemapPanel.js";

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

  it("is a radiogroup — a basemap is a choice of one, not a checklist", () => {
    const { container } = render(<BasemapPanel store={createStrataStore()} basemaps={OPTIONS} />);
    expect(container.querySelector('[role="radiogroup"]')).toBeTruthy();
    expect(container.querySelectorAll('[role="radio"]').length).toBe(OPTIONS.length);
  });

  it("always shows which basemap is in force, even before anything is chosen", () => {
    // The panel must never offer N options and tick none — that leaves no way to tell what you
    // are looking at.
    const { container } = render(<BasemapPanel store={createStrataStore()} basemaps={OPTIONS} />);
    expect(container.querySelectorAll('[role="radio"][aria-checked="true"]').length).toBe(1);
  });

  it("moves the tick to an explicit choice", () => {
    const { container } = render(<BasemapPanel store={createStrataStore()} basemaps={OPTIONS} />);
    fireEvent.click(screen.getByText("CARTO Positron"));
    const ticked = container.querySelector('[role="radio"][aria-checked="true"]') as HTMLElement;
    expect(ticked.dataset.basemap).toBe("positron");
  });

  it("offers Follow the theme when a themeMode is given, and it ticks with the map it chooses", () => {
    const themed = [
      { id: "light", title: "Light", templateUrl: "https://t/{z}/{x}/{y}.png", mode: "light" },
      { id: "dark", title: "Dark", templateUrl: "https://t/dark/{z}/{x}/{y}.png", mode: "dark" },
    ] as any;
    const { container } = render(
      <BasemapPanel store={createStrataStore()} basemaps={themed} themeMode="dark" />,
    );
    const ticked = [...container.querySelectorAll('[role="radio"][aria-checked="true"]')].map(
      (r) => (r as HTMLElement).dataset.basemap,
    );
    expect(ticked).toContain("auto");
    expect(ticked).toContain("dark"); // the map the theme is choosing, ticked as well
  });

  it("omits Follow the theme when there is no theme to follow", () => {
    const { container } = render(<BasemapPanel store={createStrataStore()} basemaps={OPTIONS} />);
    expect(container.querySelector('[data-basemap="auto"]')).toBeNull();
  });

  it("paints each raster row with that basemap's own tile for the current view", () => {
    const map = { getCenter: () => ({ lng: -119, lat: 36 }), getZoom: () => 8 };
    const { container } = render(
      <BasemapPanel store={createStrataStore()} basemaps={OPTIONS} map={map} />,
    );
    const thumb = container.querySelector('[data-basemap="osm"] div') as HTMLElement;
    expect(thumb.style.backgroundImage).toMatch(/^url\(["']?https:\/\/tile\/\d+\/\d+\/\d+\.png["']?\)$/);
  });

  it("states the keyless house rule on the panel", () => {
    render(<BasemapPanel store={createStrataStore()} basemaps={OPTIONS} />);
    expect(screen.getByText(/house rule, not an omission/)).toBeInTheDocument();
  });
});

describe("previewTile (pure)", () => {
  it("derives a tile covering the current view, clamped to a sane zoom", () => {
    expect(previewTile({ getCenter: () => ({ lng: 0, lat: 0 }), getZoom: () => 8 })).toEqual({
      z: 6,
      x: 32,
      y: 32,
    });
  });

  it("survives no map at all, and clamps beyond the poles", () => {
    expect(previewTile(undefined).z).toBeGreaterThanOrEqual(2);
    const t = previewTile({ getCenter: () => ({ lng: 0, lat: 89.9 }), getZoom: () => 20 });
    expect(Number.isFinite(t.y)).toBe(true);
    expect(t.z).toBeLessThanOrEqual(14);
  });
});

describe("BasemapPanel — the default library is the @strata/map-controls gallery", () => {
  it("renders the gallery (Recommended / More, a thumbnail and info tooltip per card) when no library is passed", () => {
    const { container } = render(<BasemapPanel store={createStrataStore()} themeMode="light" />);
    const gallery = container.querySelector("[data-strata-basemap-gallery]")!;
    expect(gallery.classList.contains("smc")).toBe(true);
    expect(gallery.querySelector('[data-section="recommended"]')).toBeTruthy();
    expect(gallery.querySelector('[data-section="more"]')).toBeTruthy();
    expect(gallery.querySelectorAll(".bm-card img").length).toBeGreaterThan(8);
    expect(gallery.querySelector(".bm-info")?.getAttribute("data-tip")).toBeTruthy();
    // following the theme in light mode ticks OpenStreetMap
    expect(gallery.querySelector('[data-base="__auto"]')?.getAttribute("aria-checked")).toBe("true");
    expect(gallery.querySelector('.bm-pick[aria-checked="true"]')?.getAttribute("data-base")).toBe("osm");
  });

  it("a card pick sets the store's basemap (and stops following the theme)", () => {
    const store = createStrataStore();
    const onApplyBasemap = vi.fn();
    const { container } = render(<BasemapPanel store={store} themeMode="light" onApplyBasemap={onApplyBasemap} />);
    fireEvent.click(container.querySelector('[data-base="esri-imagery"]')!);
    expect(store.getState().baseMap?.baseMapLayers[0].id).toBe("esri-imagery");
    expect(store.getState().baseMapFollowsTheme).toBe(false);
    expect(onApplyBasemap).toHaveBeenCalledOnce();
    expect(container.querySelector('.bm-pick[aria-checked="true"]')?.getAttribute("data-base")).toBe("esri-imagery");
  });

  it("ticks a legacy id in the store as its alias", () => {
    const store = createStrataStore();
    store.getState().setBaseMap({ title: "Old", baseMapLayers: [{ id: "openfreemap-dark", layerType: "VectorTileLayer", styleUrl: "https://tiles.openfreemap.org/styles/dark" }] });
    const { container } = render(<BasemapPanel store={store} />);
    expect(container.querySelector('.bm-pick[aria-checked="true"]')?.getAttribute("data-base")).toBe("osm-dark");
  });

  it("Manage switches to the editable row list", () => {
    const { container } = render(<BasemapPanel store={createStrataStore()} />);
    fireEvent.click(screen.getByText("Manage"));
    expect(container.querySelector("[data-strata-basemap-gallery]")).toBeNull();
    expect(container.querySelector('[role="radiogroup"] [data-basemap="osm"]')).toBeTruthy();
  });
});
