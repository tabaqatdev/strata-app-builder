import { describe, it, expect, vi } from "vitest";
import {
  ActionBus,
  categoryWhere,
  rangeWhere,
  connectBusToStore,
  type CategorySelectPayload,
  type FilterChangePayload,
} from "../src/index.js";

describe("ActionBus", () => {
  it("delivers a trigger to subscribers of its type", () => {
    const bus = new ActionBus();
    const seen: unknown[] = [];
    bus.on("categorySelect", (t) => seen.push(t.payload));
    bus.emit({ type: "categorySelect", payload: { hi: 1 } });
    expect(seen).toEqual([{ hi: 1 }]);
  });

  it("delivers every trigger to a wildcard subscriber", () => {
    const bus = new ActionBus();
    const types: string[] = [];
    bus.on("*", (t) => types.push(t.type));
    bus.emit({ type: "rowSelect", payload: {} });
    bus.emit({ type: "clear", payload: {} });
    expect(types).toEqual(["rowSelect", "clear"]);
  });

  it("unsubscribes via the returned function and via off()", () => {
    const bus = new ActionBus();
    const fn = vi.fn();
    const off = bus.on("clear", fn);
    off();
    bus.emit({ type: "clear", payload: {} });
    expect(fn).not.toHaveBeenCalled();

    const fn2 = vi.fn();
    bus.on("clear", fn2);
    bus.off("clear", fn2);
    bus.emit({ type: "clear", payload: {} });
    expect(fn2).not.toHaveBeenCalled();
  });

  it("clear() drops all handlers", () => {
    const bus = new ActionBus();
    const fn = vi.fn();
    bus.on("*", fn);
    bus.clear();
    bus.emit({ type: "x", payload: {} });
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("categoryWhere", () => {
  it("builds an equality clause", () => {
    expect(categoryWhere("INCOME_GRP", "High income")).toBe("INCOME_GRP = 'High income'");
  });
  it("escapes single quotes (SQL-injection-safe)", () => {
    expect(categoryWhere("NAME", "Côte d'Ivoire")).toBe("NAME = 'Côte d''Ivoire'");
  });
  it("returns null to clear", () => {
    expect(categoryWhere("f", null)).toBeNull();
  });
});

describe("rangeWhere", () => {
  it("builds a two-sided range", () => {
    expect(rangeWhere("POP", 100, 500)).toBe("POP >= 100 AND POP <= 500");
  });
  it("supports open bounds", () => {
    expect(rangeWhere("POP", 100, null)).toBe("POP >= 100");
    expect(rangeWhere("POP", null, 500)).toBe("POP <= 500");
  });
  it("returns null when both bounds are open", () => {
    expect(rangeWhere("POP", null, null)).toBeNull();
  });
});

describe("connectBusToStore", () => {
  function fakeStore() {
    const state = {
      setActiveLayer: vi.fn(),
      setSelection: vi.fn(),
    };
    return { getState: () => state, state };
  }

  it("categorySelect → onFilter + setActiveLayer + re-emits filterChange", () => {
    const bus = new ActionBus();
    const store = fakeStore();
    const onFilter = vi.fn();
    const filterChanges: FilterChangePayload[] = [];
    bus.on<FilterChangePayload>("filterChange", (t) => filterChanges.push(t.payload));

    connectBusToStore(bus, store, { onFilter });
    bus.emit<CategorySelectPayload>({
      type: "categorySelect",
      payload: { layerId: "countries", field: "INCOME_GRP", value: "High income" },
    });

    expect(onFilter).toHaveBeenCalledWith("countries", "INCOME_GRP = 'High income'");
    expect(store.state.setActiveLayer).toHaveBeenCalledWith("countries");
    expect(filterChanges).toEqual([{ layerId: "countries", where: "INCOME_GRP = 'High income'" }]);
  });

  it("rangeSelect → filters with a range clause", () => {
    const bus = new ActionBus();
    const store = fakeStore();
    const onFilter = vi.fn();
    connectBusToStore(bus, store, { onFilter });
    bus.emit({ type: "rangeSelect", payload: { layerId: "c", field: "POP", min: 1, max: 9 } });
    expect(onFilter).toHaveBeenCalledWith("c", "POP >= 1 AND POP <= 9");
  });

  it("rowSelect + featureSelect → setSelection + onSelect", () => {
    const bus = new ActionBus();
    const store = fakeStore();
    const onSelect = vi.fn();
    connectBusToStore(bus, store, { onSelect });
    bus.emit({ type: "rowSelect", payload: { layerId: "c", oids: [7], zoom: true } });
    expect(store.state.setSelection).toHaveBeenCalledWith({ layerId: "c", oids: [7] });
    expect(onSelect).toHaveBeenCalledWith("c", [7], true);
  });

  it("clear → setSelection(null)", () => {
    const bus = new ActionBus();
    const store = fakeStore();
    connectBusToStore(bus, store);
    bus.emit({ type: "clear", payload: {} });
    expect(store.state.setSelection).toHaveBeenCalledWith(null);
  });

  it("teardown detaches all handlers", () => {
    const bus = new ActionBus();
    const store = fakeStore();
    const onFilter = vi.fn();
    const teardown = connectBusToStore(bus, store, { onFilter });
    teardown();
    bus.emit({ type: "categorySelect", payload: { layerId: "c", field: "f", value: "v" } });
    expect(onFilter).not.toHaveBeenCalled();
  });
});

describe("whereFromTrigger", () => {
  it("derives a where from category / range / brush / filterChange / clear", async () => {
    const { whereFromTrigger } = await import("../src/index.js");
    expect(whereFromTrigger({ type: "categorySelect", payload: { layerId: "l", field: "CAT", value: "A" } })).toBe(
      "CAT = 'A'",
    );
    expect(whereFromTrigger({ type: "rangeSelect", payload: { layerId: "l", field: "POP", min: 10, max: 20 } })).toBe(
      "POP >= 10 AND POP <= 20",
    );
    expect(whereFromTrigger({ type: "brush", payload: { layerId: "l", field: "POP", min: null, max: 5 } })).toBe(
      "POP <= 5",
    );
    expect(whereFromTrigger({ type: "filterChange", payload: { layerId: "l", where: "X=1" } })).toBe("X=1");
    expect(whereFromTrigger({ type: "clear", payload: {} })).toBeNull();
    expect(whereFromTrigger({ type: "chartClick", payload: {} })).toBeUndefined();
  });
});

describe("wireConnections", () => {
  it("dispatches the action when the emitter matches `from`, ignoring other sources", async () => {
    const { ActionBus, wireConnections } = await import("../src/index.js");
    const bus = new ActionBus();
    const calls: any[] = [];
    const teardown = wireConnections(
      bus,
      [{ from: "chart1", trigger: "categorySelect", to: "map1", action: "filter", options: { k: 1 } }],
      { filter: ({ connection, trigger }) => calls.push({ to: connection.to, value: (trigger.payload as any).value }) },
    );
    // matching source fires
    bus.emit({ type: "categorySelect", source: "chart1", payload: { layerId: "l", field: "f", value: "A" } });
    // different source is ignored
    bus.emit({ type: "categorySelect", source: "other", payload: { layerId: "l", field: "f", value: "B" } });
    expect(calls).toEqual([{ to: "map1", value: "A" }]);
    teardown();
    bus.emit({ type: "categorySelect", source: "chart1", payload: { layerId: "l", field: "f", value: "C" } });
    expect(calls).toHaveLength(1);
  });

  it("no-ops for an action with no registered dispatcher", async () => {
    const { ActionBus, wireConnections } = await import("../src/index.js");
    const bus = new ActionBus();
    expect(() =>
      wireConnections(bus, [{ from: "a", trigger: "clear", action: "message" }], {}),
    ).not.toThrow();
    expect(() => bus.emit({ type: "clear", source: "a", payload: {} })).not.toThrow();
  });

  it("fires for a connection with no `from` filter regardless of source", async () => {
    const { ActionBus, wireConnections } = await import("../src/index.js");
    const bus = new ActionBus();
    let n = 0;
    wireConnections(bus, [{ from: "", trigger: "extentChange", action: "showStatistics" }], {
      showStatistics: () => n++,
    });
    bus.emit({ type: "extentChange", source: "anything", payload: { bbox: [0, 0, 1, 1] } });
    expect(n).toBe(1);
  });
});

describe("defaultDispatchers", () => {
  it("filter applies the derived where to the target layer via the store and re-emits filterChange", async () => {
    const { ActionBus, wireConnections, defaultDispatchers } = await import("../src/index.js");
    const bus = new ActionBus();
    const setDefinition = vi.fn();
    const store = { getState: () => ({ setDefinition }) };
    const filterChanges: any[] = [];
    bus.on("filterChange", (t) => filterChanges.push(t));
    wireConnections(
      bus,
      [{ from: "chart", trigger: "categorySelect", to: "map", action: "filter", options: { layerId: "L" } }],
      defaultDispatchers({ store, bus }),
    );
    bus.emit({ type: "categorySelect", source: "chart", payload: { layerId: "L", field: "CAT", value: "A" } });
    expect(setDefinition).toHaveBeenCalledWith("L", "CAT = 'A'");
    expect(filterChanges.at(-1).source).toBe("wif");
  });

  it("zoomTo sets the store selection and re-emits featureSelect with zoom", async () => {
    const { ActionBus, wireConnections, defaultDispatchers } = await import("../src/index.js");
    const bus = new ActionBus();
    const setSelection = vi.fn();
    const store = { getState: () => ({ setSelection }) };
    const seen: any[] = [];
    bus.on("featureSelect", (t) => t.source === "wif" && seen.push(t.payload));
    wireConnections(
      bus,
      [{ from: "list", trigger: "rowSelect", action: "zoomTo", options: { layerId: "L" } }],
      defaultDispatchers({ store, bus }),
    );
    bus.emit({ type: "rowSelect", source: "list", payload: { layerId: "L", oids: [7] } });
    expect(setSelection).toHaveBeenCalledWith({ layerId: "L", oids: [7] });
    expect(seen).toEqual([{ layerId: "L", oids: [7], zoom: true }]);
  });

  it("showHide, setUrlParam, and message run their host effects", async () => {
    const { ActionBus, wireConnections, defaultDispatchers } = await import("../src/index.js");
    const bus = new ActionBus();
    const setHidden = vi.fn();
    const setUrlParam = vi.fn();
    const onMessage = vi.fn();
    wireConnections(
      bus,
      [
        { from: "btn", trigger: "clear", to: "panel", action: "showHide", options: { hidden: true } },
        { from: "cat", trigger: "categorySelect", action: "setUrlParam", options: { param: "cat" } },
        { from: "cat", trigger: "categorySelect", action: "message", options: { text: "picked" } },
      ],
      defaultDispatchers({ bus, setHidden, setUrlParam, onMessage }),
    );
    bus.emit({ type: "clear", source: "btn", payload: {} });
    bus.emit({ type: "categorySelect", source: "cat", payload: { layerId: "L", field: "f", value: "X" } });
    expect(setHidden).toHaveBeenCalledWith("panel", true);
    expect(setUrlParam).toHaveBeenCalledWith("cat", "X");
    expect(onMessage).toHaveBeenCalledWith({ text: "picked", level: "info" });
  });
});

describe("OutputRegistry (W2 output data sources)", () => {
  it("publishes records under a widget id and notifies subscribers + get()", async () => {
    const { OutputRegistry } = await import("../src/index.js");
    const outputs = new OutputRegistry();
    const seen: any[] = [];
    const off = outputs.subscribe("chart", (p) => seen.push(p.records));
    outputs.publish({ widgetId: "chart", records: [{ a: 1 }], layerId: "L" });
    expect(seen).toEqual([[{ a: 1 }]]);
    expect(outputs.get("chart")?.layerId).toBe("L");
    off();
    outputs.publish({ widgetId: "chart", records: [] });
    expect(seen).toHaveLength(1); // unsubscribed
  });

  it("subscribeAll receives every widget's output", async () => {
    const { OutputRegistry } = await import("../src/index.js");
    const outputs = new OutputRegistry();
    const ids: string[] = [];
    outputs.subscribeAll((p) => ids.push(p.widgetId));
    outputs.publish({ widgetId: "a", records: [] });
    outputs.publish({ widgetId: "b", records: [] });
    expect(ids).toEqual(["a", "b"]);
  });

  it("connectOutputToBus re-emits publishes as recordsChange triggers", async () => {
    const { OutputRegistry, ActionBus, connectOutputToBus } = await import("../src/index.js");
    const outputs = new OutputRegistry();
    const bus = new ActionBus();
    const got: any[] = [];
    bus.on("recordsChange", (t) => got.push({ source: t.source, records: (t.payload as any).records }));
    connectOutputToBus(outputs, bus);
    outputs.publish({ widgetId: "q", records: [{ x: 1 }] });
    expect(got).toEqual([{ source: "q", records: [{ x: 1 }] }]);
  });
});

describe("data actions (W3)", () => {
  it("default actions emit canonical triggers tagged source:data-action", async () => {
    const { ActionBus, defaultDataActions, dataActionRegistry } = await import("../src/index.js");
    const bus = new ActionBus();
    const reg = dataActionRegistry();
    const events: any[] = [];
    bus.on("*", (t) => events.push({ type: t.type, source: t.source, payload: t.payload }));
    const selection = { layerId: "L", oids: [3, 4] };
    reg["zoom"].run({ bus, selection });
    reg["flash"].run({ bus, selection });
    reg["clear"].run({ bus, selection });
    expect(events[0]).toEqual({ type: "featureSelect", source: "data-action", payload: { layerId: "L", oids: [3, 4], zoom: true } });
    expect(events[1].type).toBe("flash");
    expect(events[2].type).toBe("clear");
    // registry includes all default ids
    expect(defaultDataActions.every((a) => reg[a.id])).toBe(true);
  });

  it("dataActionRegistry lets an app add/override an action", async () => {
    const { dataActionRegistry } = await import("../src/index.js");
    const custom = { id: "zoom", label: "Fly to", run: () => {} };
    const reg = dataActionRegistry([custom, { id: "report", label: "Report", run: () => {} }]);
    expect(reg["zoom"].label).toBe("Fly to"); // overridden
    expect(reg["report"]).toBeTruthy(); // added
  });
});
