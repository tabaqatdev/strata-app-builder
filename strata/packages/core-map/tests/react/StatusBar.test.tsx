import { describe, it, expect } from "vitest";
import { act } from "react";
import { render } from "@testing-library/react";
import { StatusBar } from "../../src/react/controls/StatusBar.js";
import { fakeMap } from "./_fakes.js";

function bar(container: HTMLElement) {
  return container.querySelector("[data-strata-statusbar]") as HTMLElement;
}

describe("StatusBar", () => {
  it("renders zoom, CRS, and a placeholder coordinate before any mouse move", () => {
    const { container } = render(<StatusBar map={fakeMap({ zoom: 4.5 })} />);
    const text = bar(container).textContent!;
    expect(text).toContain("z 4.50");
    expect(text).toContain("EPSG:4326");
    expect(text).toContain("—, —");
  });

  it("updates the coordinate readout on mousemove", () => {
    const map = fakeMap({ zoom: 4.5 });
    const { container } = render(<StatusBar map={map} precision={2} />);

    act(() => {
      map.__emit("mousemove", { lngLat: { lng: -73.9, lat: 40.7 } });
    });
    expect(bar(container).textContent).toContain("-73.90, 40.70");
  });

  it("honors the crs prop", () => {
    const { container } = render(<StatusBar map={fakeMap()} crs="EPSG:3857" />);
    expect(bar(container).textContent).toContain("EPSG:3857");
  });
});
