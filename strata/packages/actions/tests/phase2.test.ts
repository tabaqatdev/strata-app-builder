import { describe, it, expect, vi } from "vitest";
import {
  ActionBus,
  wireConnections,
  defaultDispatchers,
  TimerSource,
  connectSourceToBus,
  type Connection,
} from "../src/index.js";

describe("Phase 2 — new actions via defaultDispatchers", () => {
  function harness() {
    const bus = new ActionBus();
    const calls: Record<string, unknown> = {};
    const dispatch = defaultDispatchers({
      bus,
      onNavigate: (t) => (calls.navigate = t),
      onRefresh: (t) => (calls.refresh = t),
      onSelectByGeometry: (a) => (calls.selectByGeometry = a),
      onUpdateRecord: (a) => (calls.updateRecord = a),
    });
    return { bus, calls, dispatch };
  }

  it("buttonClick → navigate passes page/view/url options", () => {
    const { bus, calls, dispatch } = harness();
    const conns: Connection[] = [
      { from: "btn", trigger: "buttonClick", to: "app", action: "navigate", options: { pageId: "p2" } },
    ];
    wireConnections(bus, conns, dispatch);
    bus.emit({ type: "buttonClick", source: "btn", payload: {} });
    expect(calls.navigate).toEqual({ pageId: "p2", viewId: undefined, url: undefined });
  });

  it("countChange → refresh falls back widgetId to connection.to", () => {
    const { bus, calls, dispatch } = harness();
    wireConnections(bus, [{ from: "src", trigger: "countChange", to: "tbl", action: "refresh" }], dispatch);
    bus.emit({ type: "countChange", source: "src", payload: { sourceId: "src", count: 3 } });
    expect(calls.refresh).toEqual({ sourceId: undefined, widgetId: "tbl" });
  });

  it("sketchComplete → selectByGeometry forwards the trigger geometry + options", () => {
    const { bus, calls, dispatch } = harness();
    wireConnections(
      bus,
      [{ from: "sk", trigger: "sketchComplete", action: "selectByGeometry", options: { sourceId: "parcels" } }],
      dispatch,
    );
    const geometry = { type: "Polygon", coordinates: [] };
    bus.emit({ type: "sketchComplete", source: "sk", payload: { geometry } });
    expect(calls.selectByGeometry).toEqual({ sourceId: "parcels", geometry, predicate: undefined });
  });

  it("updateRecord forwards options.edits", () => {
    const { bus, calls, dispatch } = harness();
    wireConnections(
      bus,
      [{ from: "form", trigger: "buttonClick", action: "updateRecord", options: { sourceId: "parcels", edits: { OBJECTID: 1, status: "done" } } }],
      dispatch,
    );
    bus.emit({ type: "buttonClick", source: "form", payload: {} });
    expect(calls.updateRecord).toEqual({ sourceId: "parcels", edits: { OBJECTID: 1, status: "done" } });
  });
});

describe("Phase 2 — TimerSource", () => {
  it("emits a timer trigger with an incrementing tick each interval, and stops cleanly", () => {
    vi.useFakeTimers();
    try {
      const bus = new ActionBus();
      const ticks: number[] = [];
      bus.on<{ tick: number }>("timer", (t) => ticks.push(t.payload.tick));
      const timer = new TimerSource(bus, 1000, "t1");
      timer.start();
      vi.advanceTimersByTime(3000);
      expect(ticks).toEqual([1, 2, 3]);
      timer.stop();
      vi.advanceTimersByTime(2000);
      expect(ticks).toEqual([1, 2, 3]); // no more after stop
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("Phase 2 — connectSourceToBus", () => {
  it("bridges a source's countChange into a bus countChange trigger, ignoring other events", () => {
    const bus = new ActionBus();
    const got: Array<{ sourceId: string; count: number }> = [];
    bus.on<{ sourceId: string; count: number }>("countChange", (t) => got.push(t.payload));

    const subs = new Set<(e: { type: string; count?: number }) => void>();
    const source = { id: "parcels", subscribe: (fn: (e: { type: string; count?: number }) => void) => { subs.add(fn); return () => subs.delete(fn); } };
    const off = connectSourceToBus(source, bus);

    subs.forEach((fn) => fn({ type: "refresh" })); // ignored
    subs.forEach((fn) => fn({ type: "countChange", count: 5 }));
    expect(got).toEqual([{ sourceId: "parcels", count: 5 }]);
    off();
  });
});
