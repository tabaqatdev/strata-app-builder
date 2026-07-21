import { describe, it, expect } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { createStrataStore } from "@strata/state";
import { FeatureLayerDataSource } from "@strata/data-source";
import { RadialGauge } from "../../src/react/widgets/RadialGauge.js";

/** The value-arc is the second <path> (first is the track). */
function valueArcStroke(container: HTMLElement): string | null {
  const paths = container.querySelectorAll("path");
  return paths.length >= 2 ? paths[1].getAttribute("stroke") : null;
}

describe("RadialGauge", () => {
  it("shows the rounded value in the center readout", () => {
    const { container } = render(<RadialGauge value={62.4} />);
    expect(container.querySelector("text")!.textContent).toBe("62");
  });

  it("clamps out-of-range values to 0..100", () => {
    const { container: hi } = render(<RadialGauge value={140} />);
    expect(hi.querySelector("text")!.textContent).toBe("100");
    const { container: lo } = render(<RadialGauge value={-20} />);
    expect(lo.querySelector("text")!.textContent).toBe("0");
  });

  it("colors the arc green when higher-is-better and value clears the critical band", () => {
    const { container } = render(<RadialGauge value={80} thresholds={{ warn: 30, critical: 70 }} />);
    expect(valueArcStroke(container)).toContain("--strata-ok");
  });

  it("colors the arc red when a low value falls below the warn band", () => {
    const { container } = render(<RadialGauge value={10} thresholds={{ warn: 30, critical: 70 }} />);
    expect(valueArcStroke(container)).toContain("--strata-critical");
  });

  it("reverses the mapping under invertColors (higher is worse)", () => {
    const { container } = render(
      <RadialGauge value={80} invertColors thresholds={{ warn: 30, critical: 70 }} />,
    );
    expect(valueArcStroke(container)).toContain("--strata-critical");
  });

  it("computes its value live from a bound DataSource and updates on filter change (Phase 1)", async () => {
    const store = createStrataStore();
    store.getState().addLayer({ id: "cov", title: "Cov", layerType: "GeoJSON", source: { kind: "geojson" } });
    const rows = [
      { OBJECTID: 1, zone: "A", cov: 40 },
      { OBJECTID: 2, zone: "B", cov: 80 },
    ];
    const source = new FeatureLayerDataSource({ layerId: "cov", store, rows });

    const { container } = render(<RadialGauge source={source} stat={{ field: "cov", op: "avg" }} />);
    await waitFor(() => expect(container.querySelector("text")!.textContent).toBe("60")); // avg(40,80)

    store.getState().setDefinition("cov", "zone = 'B'");
    await waitFor(() => expect(container.querySelector("text")!.textContent).toBe("80"));
  });
});
