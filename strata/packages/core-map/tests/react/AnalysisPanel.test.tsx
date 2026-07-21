import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AnalysisPanel } from "../../src/react/panels/AnalysisPanel.js";

describe("AnalysisPanel", () => {
  it("runs the selected tool with mapped args and publishes the result features", async () => {
    const run = vi.fn(() => ({ type: "FeatureCollection", features: [{}, {}] }));
    const registry = { buffer: { label: "Buffer", description: "", run } };
    const publish = vi.fn();
    const input = { type: "FeatureCollection", features: [{ x: 1 }] };

    render(
      <AnalysisPanel registry={registry} tools={["buffer"]} input={input} outputs={{ publish }} widgetId="an" />,
    );

    fireEvent.change(screen.getByLabelText("Distance (km)"), { target: { value: "5" } });
    fireEvent.click(screen.getByText("Run"));

    await waitFor(() => expect(run).toHaveBeenCalled());
    const args = run.mock.calls[0][0] as Record<string, unknown>;
    expect(args.fc).toEqual(input);
    expect(args.distanceKm).toBe(5);

    await waitFor(() => expect(publish).toHaveBeenCalled());
    const published = publish.mock.calls[0][0];
    expect(published.widgetId).toBe("an");
    expect((published.records as unknown[]).length).toBe(2);
    await screen.findByText("2 features");
  });
});
