import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import {
  NearMe,
  AddDataWidget,
  WeightedOverlayPanel,
  ElevationProfile,
  terrariumToElevation,
} from "../../src/react/widgets/AnalysisWidgets.js";

describe("NearMe", () => {
  it("locates, searches, and lists results", async () => {
    const onSearch = vi.fn(async () => [{ label: "Hospital A", distanceKm: 1.2 }]);
    const onLocate = vi.fn(async () => [10, 20] as [number, number]);
    render(<NearMe onSearch={onSearch} onLocate={onLocate} defaultKm={3} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Find near me/ }));
    });
    await waitFor(() => expect(screen.getByText(/Hospital A/)).toBeInTheDocument());
    expect(onLocate).toHaveBeenCalled();
    expect(onSearch).toHaveBeenCalledWith([10, 20], 3);
  });
});

describe("AddDataWidget", () => {
  it("infers arcgis-feature vs geojson from the URL", () => {
    const onAddLayer = vi.fn();
    render(<AddDataWidget onAddLayer={onAddLayer} />);
    const input = screen.getByLabelText("Data URL");
    fireEvent.change(input, { target: { value: "https://x/rest/services/Y/FeatureServer/0" } });
    fireEvent.click(screen.getByRole("button", { name: "Add layer" }));
    expect(onAddLayer).toHaveBeenCalledWith(expect.objectContaining({ kind: "arcgis-feature" }));

    fireEvent.change(input, { target: { value: "https://x/data/cities.geojson" } });
    fireEvent.click(screen.getByRole("button", { name: "Add layer" }));
    expect(onAddLayer).toHaveBeenLastCalledWith(expect.objectContaining({ kind: "geojson", title: "cities.geojson" }));
  });
});

describe("WeightedOverlayPanel", () => {
  it("shows normalized weight percentages and applies", () => {
    const onApply = vi.fn();
    render(
      <WeightedOverlayPanel
        criteria={[
          { field: "slope", label: "Slope", weight: 3 },
          { field: "roads", label: "Roads", weight: 1 },
        ]}
        onApply={onApply}
      />,
    );
    // 3/(3+1) = 75%
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Compute suitability" }));
    expect(onApply).toHaveBeenCalledWith([
      { field: "slope", label: "Slope", weight: 3 },
      { field: "roads", label: "Roads", weight: 1 },
    ]);
  });
});

describe("ElevationProfile", () => {
  it("terrariumToElevation decodes RGB to metres", () => {
    // (128*256 + 0 + 0/256) - 32768 = 0
    expect(terrariumToElevation(128, 0, 0)).toBe(0);
    expect(terrariumToElevation(129, 0, 0)).toBe(256);
  });

  it("renders a profile chart + gain summary", () => {
    render(
      <ElevationProfile
        samples={[
          { distanceKm: 0, elevation: 100 },
          { distanceKm: 1, elevation: 150 },
          { distanceKm: 2, elevation: 120 },
        ]}
      />,
    );
    expect(document.querySelector("svg")).toBeTruthy();
    expect(screen.getByText(/\+50 m gain/)).toBeInTheDocument();
  });

  it("shows a hint with no samples", () => {
    render(<ElevationProfile samples={[]} />);
    expect(screen.getByText(/Draw a line/)).toBeInTheDocument();
  });
});
