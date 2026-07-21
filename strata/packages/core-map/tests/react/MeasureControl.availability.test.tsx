import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { createStrataStore } from "@strata/state";

// Force the optional Terra Draw peer to be "absent".
vi.mock("../../src/react/controls/terraDraw.js", () => ({ loadTerraDraw: () => Promise.resolve(null) }));

import { MeasureControl } from "../../src/react/controls/MeasureControl.js";
import { SketchControl } from "../../src/react/controls/SketchControl.js";

const stubMap = () => ({ getCanvas: () => ({ style: {} as Record<string, string> }) });

describe("Measure/Sketch controls hide when optional peers are absent", () => {
  it("MeasureControl renders nothing once the probe finds no terra-draw", async () => {
    const { container } = render(<MeasureControl store={createStrataStore()} map={stubMap()} maplibregl={{}} />);
    await waitFor(() => expect(container.querySelector("button")).toBeNull());
  });

  it("SketchControl renders nothing once the probe finds no terra-draw", async () => {
    const { container } = render(<SketchControl store={createStrataStore()} map={stubMap()} maplibregl={{}} />);
    await waitFor(() => expect(container.querySelector("button")).toBeNull());
  });
});
