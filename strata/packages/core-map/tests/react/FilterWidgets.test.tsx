import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ActionBus } from "@strata/actions";
import { FilterPanel, buildWhere, conditionSql } from "../../src/react/panels/FilterPanel.js";
import { DateFilter, buildDateWhere } from "../../src/react/panels/DateFilter.js";
import { FeatureInfoPanel } from "../../src/react/panels/FeatureInfoPanel.js";

const fields = [
  { name: "STATE", label: "State", type: "string" as const },
  { name: "POP", label: "Population", type: "number" as const },
];

describe("FilterPanel — query builder → filterChange", () => {
  it("conditionSql quotes by field type and handles contains/starts", () => {
    expect(conditionSql({ field: "STATE", operator: "=", value: "CA" }, fields)).toBe("STATE = 'CA'");
    expect(conditionSql({ field: "POP", operator: ">", value: "1000" }, fields)).toBe("POP > 1000");
    expect(conditionSql({ field: "STATE", operator: "contains", value: "ali" }, fields)).toBe("STATE LIKE '%ali%'");
    expect(conditionSql({ field: "STATE", operator: "=", value: "" }, fields)).toBe("");
  });

  it("buildWhere joins conditions with the combinator", () => {
    const where = buildWhere(
      [
        { field: "STATE", operator: "=", value: "CA" },
        { field: "POP", operator: ">=", value: "500" },
      ],
      "AND",
      fields,
    );
    expect(where).toBe("STATE = 'CA' AND POP >= 500");
    expect(buildWhere([{ field: "STATE", operator: "=", value: "" }], "AND", fields)).toBeNull();
  });

  it("emits filterChange on Apply and clears on Clear", () => {
    const bus = new ActionBus();
    const events: any[] = [];
    bus.on("filterChange", (t) => events.push(t.payload));
    render(<FilterPanel layerId="L" fields={fields} bus={bus} widgetId="flt" />);
    fireEvent.change(screen.getByLabelText("Value"), { target: { value: "CA" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(events.at(-1)).toEqual({ layerId: "L", where: "STATE = 'CA'" });
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(events.at(-1)).toEqual({ layerId: "L", where: null });
  });
});

describe("DateFilter — calendar → time definitionExpression", () => {
  it("buildDateWhere builds a BETWEEN-style clause", () => {
    expect(buildDateWhere("DATE", "2026-01-01", "2026-01-31")).toBe(
      "DATE >= TIMESTAMP '2026-01-01 00:00:00' AND DATE <= TIMESTAMP '2026-01-31 23:59:59'",
    );
    expect(buildDateWhere("DATE", "", "")).toBeNull();
  });

  it("emits filterChange for a range", () => {
    const bus = new ActionBus();
    const events: any[] = [];
    bus.on("filterChange", (t) => events.push(t.payload));
    render(<DateFilter layerId="L" field="DATE" dateMode="range" bus={bus} widgetId="dt" />);
    fireEvent.change(screen.getByLabelText("From"), { target: { value: "2026-01-01" } });
    fireEvent.change(screen.getByLabelText("To"), { target: { value: "2026-01-31" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(events.at(-1).where).toContain("DATE >= TIMESTAMP '2026-01-01");
    expect(events.at(-1).where).toContain("DATE <= TIMESTAMP '2026-01-31");
  });
});

describe("FeatureInfoPanel — docked detail", () => {
  it("renders the popup element model for a controlled feature", () => {
    render(
      <FeatureInfoPanel
        feature={{ layerId: "L", properties: { NAME: "Riyadh", POP: 7000000 }, popupInfo: { title: "{NAME}" } }}
      />,
    );
    expect(screen.getAllByText("Riyadh").length).toBeGreaterThan(0);
    expect(document.querySelector(".strata-feature-info")).toBeTruthy();
  });

  it("shows the empty message with no selection", () => {
    render(<FeatureInfoPanel feature={null} emptyText="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("resolves a bus featureSelect and renders the feature", async () => {
    const bus = new ActionBus();
    const onResolve = vi.fn(async () => ({ layerId: "L", properties: { NAME: "Jeddah" }, popupInfo: { title: "{NAME}" } }));
    render(<FeatureInfoPanel bus={bus} onResolve={onResolve} />);
    await act(async () => {
      bus.emit({ type: "featureSelect", source: "map", payload: { layerId: "L", oids: [5] } });
      await Promise.resolve();
    });
    expect(onResolve).toHaveBeenCalledWith("L", 5);
    expect(screen.getAllByText("Jeddah").length).toBeGreaterThan(0);
  });
});
