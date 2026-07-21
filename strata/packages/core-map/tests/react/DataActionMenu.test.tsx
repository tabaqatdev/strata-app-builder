import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ActionBus } from "@strata/actions";
import { DataActionMenu } from "../../src/react/panels/DataActionMenu.js";

describe("DataActionMenu (WIF W3)", () => {
  it("renders default actions for a controlled selection and dispatches through the bus", () => {
    const bus = new ActionBus();
    const emitted: any[] = [];
    bus.on("featureSelect", (t) => t.source === "data-action" && emitted.push(t.payload));
    render(<DataActionMenu bus={bus} selection={{ layerId: "L", oids: [1, 2] }} />);
    fireEvent.click(screen.getByRole("menuitem", { name: /Zoom to/ }));
    expect(emitted).toEqual([{ layerId: "L", oids: [1, 2], zoom: true }]);
  });

  it("hides when there is no selection", () => {
    const bus = new ActionBus();
    const { container } = render(<DataActionMenu bus={bus} selection={null} />);
    expect(container.querySelector('[role="menu"]')).toBeNull();
  });

  it("auto-tracks featureSelect from the bus when uncontrolled", () => {
    const bus = new ActionBus();
    render(<DataActionMenu bus={bus} />);
    // nothing selected yet → menu hidden
    expect(screen.queryByRole("menu")).toBeNull();
    act(() => {
      bus.emit({ type: "featureSelect", source: "map", payload: { layerId: "L", oids: [9] } });
    });
    expect(screen.getByRole("menu")).toBeTruthy();
    // clear hides it again
    act(() => {
      bus.emit({ type: "clear", source: "map", payload: {} });
    });
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("accepts custom actions and calls onAction", () => {
    const bus = new ActionBus();
    const run = vi.fn();
    const onAction = vi.fn();
    render(
      <DataActionMenu
        bus={bus}
        selection={{ layerId: "L", oids: [1] }}
        actions={[{ id: "report", label: "Make report", run }]}
        onAction={onAction}
      />,
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Make report" }));
    expect(run).toHaveBeenCalledOnce();
    expect(onAction).toHaveBeenCalledWith("report");
  });
});
