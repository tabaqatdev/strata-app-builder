import { describe, it, expect } from "vitest";
import {
  legendHtml,
  scalebarSvg,
  northArrowSvg,
  niceRound,
  printLayoutCss,
  composePrintHtml,
  composeAtlasHtml,
  featureReportHtml,
} from "../src/compose.js";
import { buildShareUrl, parseShareUrl, buildEmbedSnippet } from "../src/share.js";
import { metresPerPixel } from "../src/index.js";

describe("legendHtml (#6)", () => {
  it("renders a swatch per unique value with labels", () => {
    const html = legendHtml([
      {
        title: "Land use",
        renderer: {
          type: "uniqueValue",
          uniqueValueInfos: [
            { value: "R", label: "Residential", symbol: { color: [255, 0, 0, 255] } },
            { value: "C", label: "Commercial", symbol: { color: [0, 0, 255, 255] } },
          ],
        },
      },
    ]);
    expect(html).toContain("Land use");
    expect(html).toContain("Residential");
    expect(html).toContain("rgba(255,0,0,1)");
    expect(html).toContain("rgba(0,0,255,1)");
  });

  it("renders a single swatch for a simple renderer", () => {
    const html = legendHtml([{ title: "Rivers", renderer: { type: "simple", symbol: { color: [0, 128, 255, 255] } } }]);
    expect(html).toContain("Rivers");
    expect(html).toContain("rgba(0,128,255,1)");
  });
});

describe("scalebar / north-arrow (#6)", () => {
  it("niceRound snaps to 1/2/5 × 10ⁿ", () => {
    expect(niceRound(1234)).toBe(1000);
    expect(niceRound(3400)).toBe(2000);
    expect(niceRound(8000)).toBe(5000);
  });
  it("scalebarSvg labels km past 1000 m", () => {
    expect(scalebarSvg(1500)).toContain("1 km");
    expect(scalebarSvg(300)).toContain("200 m");
  });
  it("northArrowSvg draws an N", () => {
    expect(northArrowSvg()).toContain(">N<");
  });
  it("metresPerPixel decreases as zoom increases", () => {
    expect(metresPerPixel(0, 10)).toBeGreaterThan(metresPerPixel(0, 14));
  });
});

describe("print layouts + composition (#6)", () => {
  it("printLayoutCss sets @page size + orientation", () => {
    expect(printLayoutCss({ size: "a4", orientation: "landscape" })).toContain("size:a4 landscape");
  });
  it("composePrintHtml includes title, image, legend, scalebar, north-arrow, attribution", () => {
    const html = composePrintHtml({
      title: "My map",
      image: "data:image/png;base64,AAA",
      legend: "<div>LEG</div>",
      scalebar: "<svg>SCALE</svg>",
      northArrow: "<svg>ARROW</svg>",
      attribution: "© OSM",
      layout: { size: "letter", orientation: "portrait" },
    });
    expect(html).toContain("<h1>My map</h1>");
    expect(html).toContain("data:image/png;base64,AAA");
    expect(html).toContain("LEG");
    expect(html).toContain("SCALE");
    expect(html).toContain("ARROW");
    expect(html).toContain("© OSM");
  });
  it("composeAtlasHtml page-breaks between features", () => {
    const html = composeAtlasHtml([
      { title: "District 1", image: "d1" },
      { title: "District 2", image: "d2" },
    ]);
    expect(html).toContain("District 1");
    expect(html).toContain("District 2");
    expect(html).toContain("page-break-before:always");
  });
});

describe("featureReportHtml (Feature Report)", () => {
  it("renders attributes, a map inset, and a chart", () => {
    const html = featureReportHtml(
      { NAME: "Parcel 7", AREA: 1200, JAN: 3, FEB: 5 },
      { title: "Parcel report", mapImage: "data:x", chartFields: ["JAN", "FEB"], fields: [{ name: "NAME", label: "Name" }, { name: "AREA", label: "Area" }] },
    );
    expect(html).toContain("Parcel report");
    expect(html).toContain("Parcel 7");
    expect(html).toContain("Name");
    expect(html).toContain('src="data:x"');
    expect(html).toContain("<rect"); // chart bars
  });
});

describe("share URL builder (Share widget)", () => {
  it("round-trips state through the URL", () => {
    const state = {
      center: [46.6753, 24.7136] as [number, number],
      zoom: 11,
      basemap: "carto-dark-gl",
      active: "parcels",
      filters: { parcels: "POP > 1000" },
    };
    const url = buildShareUrl("https://app.example/map", state);
    expect(url).toContain("c=46.6753%2C24.7136");
    expect(url).toContain("b=carto-dark-gl");
    const back = parseShareUrl(url);
    expect(back).toEqual(state);
  });

  it("clears stale share params on re-share and preserves other query params", () => {
    const first = buildShareUrl("https://app.example/map?keep=1", { zoom: 5 });
    const second = buildShareUrl(first, { zoom: 9 });
    expect(second).toContain("keep=1");
    expect((second.match(/z=/g) || []).length).toBe(1);
    expect(parseShareUrl(second).zoom).toBe(9);
  });

  it("buildEmbedSnippet wraps the url in an iframe", () => {
    const snip = buildEmbedSnippet("https://app.example/map?z=5", { height: 600 });
    expect(snip).toContain('<iframe src="https://app.example/map?z=5"');
    expect(snip).toContain('height="600px"');
  });
});
