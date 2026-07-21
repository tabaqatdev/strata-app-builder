import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { AppLayout } from "@strata/schema";
import { StrataApp } from "../../src/react/app/StrataApp.js";
import { MapRegistry } from "../../src/react/app/interactivity.js";

describe("MapRegistry", () => {
  it("registers, gets by id and by default (first), and notifies subscribers", () => {
    const r = new MapRegistry();
    const seen = vi.fn();
    const off = r.subscribe(seen);
    r.register("m1", { tag: "one" });
    r.register("m2", { tag: "two" });
    expect(r.get("m1")).toEqual({ tag: "one" });
    expect(r.get()).toEqual({ tag: "one" }); // default = first registered
    expect(seen).toHaveBeenCalled();
    r.unregister("m1");
    off();
    expect(r.get("m1")).toBeUndefined();
  });
});

describe("map-tool widgets", () => {
  it("render a placeholder until their target map is registered", () => {
    const config: AppLayout = { pages: [{ id: "p", root: { kind: "widget", widget: { type: "measure" } } }] };
    render(<StrataApp config={config} />);
    expect(screen.getByText(/Measure/)).toBeInTheDocument(); // "Measure — connecting to map…"
  });

  it("search widget queries the injected provider and lists results", async () => {
    const provider = { search: vi.fn(async () => [{ label: "Cairo, Egypt", lng: 31.2, lat: 30.0 }]) };
    const config: AppLayout = {
      pages: [{ id: "p", root: { kind: "widget", widget: { type: "search", props: { provider } } } }],
    };
    render(<StrataApp config={config} />);
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "Cairo" } });
    fireEvent.click(screen.getByText("Go"));
    await screen.findByText("Cairo, Egypt");
    expect(provider.search).toHaveBeenCalledWith("Cairo", { limit: 5 });
  });
});
