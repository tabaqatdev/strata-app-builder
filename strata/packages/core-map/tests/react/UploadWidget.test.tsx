import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UploadWidget } from "../../src/react/widgets/UploadWidget.js";
import { defaultWidgetRegistry } from "../../src/react/app/registry.js";

/**
 * `FileReader` is not implemented in the test environment's jsdom build in a way we can drive
 * deterministically, so it is replaced with a synchronous stand-in that yields the text we hand it.
 */
class StubFileReader {
  result: string | null = null;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  readAsText(file: { __text?: string }): void {
    this.result = file.__text ?? "";
    this.onload?.();
  }
}

const fileOf = (name: string, text: string): File => {
  const f = new File([text], name, { type: "text/csv" });
  (f as unknown as { __text: string }).__text = text;
  return f;
};

const drop = (input: HTMLElement, file: File): void => {
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  fireEvent.change(input);
};

const CSV = [
  "Property Name,Owner Name,Latitude,Longitude,Rent",
  "Tower,A Person,34.05,-118.24,1200",
  "Annexe,Another Person,34.06,-118.25,900",
].join("\n");

beforeEach(() => {
  vi.stubGlobal("FileReader", StubFileReader);
});

describe("UploadWidget", () => {
  it("is registered as the `upload` widget type", () => {
    expect(defaultWidgetRegistry.upload).toBe(UploadWidget);
  });

  it("reads a CSV, guesses the mapping and publishes placed features", async () => {
    const publish = vi.fn();
    render(<UploadWidget widgetId="est" outputs={{ publish }} />);
    drop(screen.getByLabelText("Data file"), fileOf("estate.csv", CSV));

    await waitFor(() => expect(publish).toHaveBeenCalled());
    const fc = publish.mock.calls[0][0].records as {
      features: Array<{ geometry: { coordinates: [number, number] } | null; properties: Record<string, unknown> }>;
    };
    expect(publish.mock.calls[0][0].widgetId).toBe("est");
    expect(fc.features).toHaveLength(2);
    expect(fc.features[0].geometry?.coordinates).toEqual([-118.24, 34.05]);
    expect(screen.getByLabelText("Latitude")).toHaveValue("Latitude");
    expect(screen.getByLabelText("Name")).toHaveValue("Property Name");
  });

  it("drops the owner column and names it on screen before anything is published", async () => {
    const publish = vi.fn();
    render(<UploadWidget outputs={{ publish }} />);
    drop(screen.getByLabelText("Data file"), fileOf("estate.csv", CSV));

    await waitFor(() => expect(screen.getByText(/Dropped as personal data:/)).toBeTruthy());
    expect(screen.getByText(/Owner Name/)).toBeTruthy();
    const fc = publish.mock.calls[0][0].records as { features: Array<{ properties: Record<string, unknown> }> };
    expect(fc.features[0].properties).not.toHaveProperty("Owner Name");
    expect(fc.features[0].properties.Rent).toBe(1200);
  });

  it("keeps a denied column when it is explicitly allowed", async () => {
    const publish = vi.fn();
    render(<UploadWidget outputs={{ publish }} allowIdentityFields={["Owner Name"]} />);
    drop(screen.getByLabelText("Data file"), fileOf("estate.csv", CSV));

    await waitFor(() => expect(publish).toHaveBeenCalled());
    const fc = publish.mock.calls[0][0].records as { features: Array<{ properties: Record<string, unknown> }> };
    expect(fc.features[0].properties["Owner Name"]).toBe("A Person");
  });

  it("reports the counts it can and cannot place", async () => {
    const csv = ["Name,Latitude,Longitude,Address", "A,34,-118,", "B,,,1 Main St", "C,,,"].join("\n");
    render(<UploadWidget />);
    drop(screen.getByLabelText("Data file"), fileOf("mixed.csv", csv));

    await waitFor(() => expect(screen.getByText(/1 placed/)).toBeTruthy());
    expect(screen.getByText(/1 need an address lookup/)).toBeTruthy();
    expect(screen.getByText(/1 cannot be placed/)).toBeTruthy();
  });

  it("re-publishes and reports the change when the reader corrects a role", async () => {
    const publish = vi.fn();
    const onMappingChange = vi.fn();
    const csv = ["Name,alpha,beta", "A,34,-118"].join("\n");
    render(<UploadWidget outputs={{ publish }} onMappingChange={onMappingChange} />);
    drop(screen.getByLabelText("Data file"), fileOf("odd.csv", csv));

    await waitFor(() => expect(publish).toHaveBeenCalledTimes(1));
    let fc = publish.mock.calls[0][0].records as { features: Array<{ geometry: unknown }> };
    expect(fc.features[0].geometry).toBeNull();

    fireEvent.change(screen.getByLabelText("Latitude"), { target: { value: "alpha" } });
    fireEvent.change(screen.getByLabelText("Longitude"), { target: { value: "beta" } });

    await waitFor(() => expect(publish).toHaveBeenCalledTimes(3));
    fc = publish.mock.calls[2][0].records as { features: Array<{ geometry: { coordinates: number[] } | null }> };
    expect(fc.features[0].geometry?.coordinates).toEqual([-118, 34]);
    expect(onMappingChange).toHaveBeenLastCalledWith(expect.objectContaining({ lat: "alpha", lon: "beta" }));
  });

  it("reuses a saved mapping when it still fits the file", async () => {
    const csv = ["Name,alpha,beta", "A,34,-118"].join("\n");
    const publish = vi.fn();
    render(<UploadWidget outputs={{ publish }} mapping={{ lat: "alpha", lon: "beta", label: "Name" }} />);
    drop(screen.getByLabelText("Data file"), fileOf("odd.csv", csv));

    await waitFor(() => expect(publish).toHaveBeenCalled());
    const fc = publish.mock.calls[0][0].records as { features: Array<{ geometry: { coordinates: number[] } | null }> };
    expect(fc.features[0].geometry?.coordinates).toEqual([-118, 34]);
  });

  it("falls back to guessing when a saved mapping names a column the file lacks", async () => {
    render(<UploadWidget mapping={{ lat: "missing", lon: "gone" }} />);
    drop(screen.getByLabelText("Data file"), fileOf("estate.csv", CSV));
    await waitFor(() => expect(screen.getByLabelText("Latitude")).toHaveValue("Latitude"));
  });

  it("offers a lookup only when there are addresses and a geocoder, and reports the result", async () => {
    const csv = ["Name,Address", "A,1 Main St"].join("\n");
    const geocode = vi.fn(async () => ({ lon: -118, lat: 34 }));
    const publish = vi.fn();
    render(<UploadWidget outputs={{ publish }} geocode={geocode} geocodeDelayMs={0} />);
    drop(screen.getByLabelText("Data file"), fileOf("addr.csv", csv));

    const btn = await screen.findByText("Look up 1 addresses");
    fireEvent.click(btn);

    await waitFor(() => expect(screen.getByText(/Placed 1 of 1/)).toBeTruthy());
    expect(geocode).toHaveBeenCalledWith("1 Main St");
    const last = publish.mock.calls[publish.mock.calls.length - 1][0].records as {
      features: Array<{ geometry: { coordinates: number[] } | null }>;
    };
    expect(last.features[0].geometry?.coordinates).toEqual([-118, 34]);
  });

  it("does not offer a lookup without a geocoder", async () => {
    const csv = ["Name,Address", "A,1 Main St"].join("\n");
    render(<UploadWidget />);
    drop(screen.getByLabelText("Data file"), fileOf("addr.csv", csv));
    await waitFor(() => expect(screen.getByText(/1 need an address lookup/)).toBeTruthy());
    expect(screen.queryByText(/Look up/)).toBeNull();
  });

  it("explains an unreadable file instead of showing an empty table", async () => {
    render(<UploadWidget />);
    drop(screen.getByLabelText("Data file"), fileOf("broken.geojson", "{ not json"));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/could not be read/));
  });

  it("explains a file that parses to no rows", async () => {
    render(<UploadWidget />);
    drop(screen.getByLabelText("Data file"), fileOf("empty.csv", "Name,Rent"));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/produced no rows/));
  });

  it("truncates the preview and says how many rows it did not show", async () => {
    const rows = ["Name,Latitude,Longitude", ...Array.from({ length: 8 }, (_, i) => `A${i},34,-118`)].join("\n");
    render(<UploadWidget previewRows={3} />);
    drop(screen.getByLabelText("Data file"), fileOf("many.csv", rows));
    await waitFor(() => expect(screen.getByText("+5 more rows")).toBeTruthy());
  });

  it("says the file does not leave the browser", () => {
    render(<UploadWidget />);
    expect(screen.getByText(/stays in this browser/)).toBeTruthy();
  });
});
