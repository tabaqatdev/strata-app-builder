import { describe, it, expect, vi } from "vitest";
import { PluginManager } from "../src/manager.js";
import { basemapPlugin } from "../src/basemapPlugin.js";
import type { StrataAppAPI, StrataPlugin } from "../src/types.js";

function fakeApp(initialBasemap: unknown = null): StrataAppAPI & { _basemap: unknown } {
  const app: any = {
    _basemap: initialBasemap,
    setBaseMap: vi.fn((bm: unknown) => {
      app._basemap = bm;
    }),
    addOperationalLayer: vi.fn(() => "id"),
    removeLayer: vi.fn(),
    setRenderer: vi.fn(),
    setPopup: vi.fn(),
    fitBounds: vi.fn(),
    getStore: () => ({ getState: () => ({ baseMap: app._basemap }) }),
  };
  return app;
}

function stubPlugin(id: string, over: Partial<StrataPlugin> = {}): StrataPlugin {
  return {
    id,
    name: id,
    version: "1.0.0",
    activate: vi.fn(),
    deactivate: vi.fn(),
    ...over,
  };
}

describe("PluginManager", () => {
  it("registers and lists plugins in registration order", () => {
    const pm = new PluginManager();
    pm.register(stubPlugin("a")).register(stubPlugin("b"));
    expect(pm.list().map((p) => p.id)).toEqual(["a", "b"]);
  });

  it("registerAll adds many; last registration wins per id", () => {
    const pm = new PluginManager();
    const first = stubPlugin("dup", { name: "first" });
    const second = stubPlugin("dup", { name: "second" });
    pm.registerAll([first, second]);
    expect(pm.list()).toHaveLength(1);
    expect(pm.list()[0].name).toBe("second");
  });

  it("activates a plugin once and reports isActive", () => {
    const pm = new PluginManager();
    const p = stubPlugin("a");
    pm.register(p);
    const app = fakeApp();
    expect(pm.activate("a", app)).toBe(true);
    expect(pm.isActive("a")).toBe(true);
    // second activate is a no-op success and does not call activate() again
    expect(pm.activate("a", app)).toBe(true);
    expect(p.activate).toHaveBeenCalledTimes(1);
  });

  it("returns false for an unknown plugin id", () => {
    expect(new PluginManager().activate("missing", fakeApp())).toBe(false);
  });

  it("honors a false veto from activate()", () => {
    const pm = new PluginManager();
    pm.register(stubPlugin("veto", { activate: () => false }));
    expect(pm.activate("veto", fakeApp())).toBe(false);
    expect(pm.isActive("veto")).toBe(false);
  });

  it("catches a throwing activate() and reports failure", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const pm = new PluginManager();
    pm.register(stubPlugin("boom", { activate: () => { throw new Error("nope"); } }));
    expect(pm.activate("boom", fakeApp())).toBe(false);
    expect(pm.isActive("boom")).toBe(false);
    spy.mockRestore();
  });

  it("deactivates an active plugin and is a no-op otherwise", () => {
    const pm = new PluginManager();
    const p = stubPlugin("a");
    pm.register(p);
    const app = fakeApp();
    pm.activate("a", app);
    pm.deactivate("a", app);
    expect(p.deactivate).toHaveBeenCalledTimes(1);
    expect(pm.isActive("a")).toBe(false);
    // deactivating again does nothing
    pm.deactivate("a", app);
    expect(p.deactivate).toHaveBeenCalledTimes(1);
  });

  it("activateDefaults activates only activeByDefault plugins", () => {
    const pm = new PluginManager();
    pm.register(stubPlugin("on", { activeByDefault: true }));
    pm.register(stubPlugin("off"));
    const activated = pm.activateDefaults(fakeApp());
    expect(activated).toEqual(["on"]);
  });
});

describe("basemapPlugin", () => {
  it("has a stable identity and is active by default", () => {
    const p = basemapPlugin();
    expect(p.id).toBe("strata.basemap");
    expect(p.activeByDefault).toBe(true);
  });

  it("sets the configured basemap on activation", () => {
    const bm = { title: "Imagery", baseMapLayers: [] };
    const p = basemapPlugin({ basemap: bm });
    const app = fakeApp();
    p.activate(app);
    expect(app.setBaseMap).toHaveBeenCalledWith(bm);
  });

  it("restores the previous basemap on deactivate", () => {
    const prev = { title: "Was", baseMapLayers: [] };
    const p = basemapPlugin({ basemap: { title: "New", baseMapLayers: [] } });
    const app = fakeApp(prev);
    p.activate(app);
    p.deactivate(app);
    expect(app._basemap).toEqual(prev);
  });

  it("round-trips its basemap through project state", () => {
    const p = basemapPlugin({ basemap: { title: "A", baseMapLayers: [] } });
    expect(p.getProjectState?.()).toEqual({ basemap: { title: "A", baseMapLayers: [] } });
    const app = fakeApp();
    p.applyProjectState?.(app, { basemap: { title: "Restored", baseMapLayers: [] } });
    expect(app.setBaseMap).toHaveBeenCalledWith({ title: "Restored", baseMapLayers: [] });
  });
});
