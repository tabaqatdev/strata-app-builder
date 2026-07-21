import { describe, it, expect } from "vitest";
import { renderPopup, chartSvg, renderAttachments, renderRelated } from "../src/engine/popups.js";

describe("renderPopup — default (no popupInfo)", () => {
  it("renders every property as a labelled table row", () => {
    const html = renderPopup({ NAME: "Riyadh", POP: 7000000 });
    expect(html).toContain("strata-popup");
    expect(html).toContain("NAME");
    expect(html).toContain("Riyadh");
    expect(html).toContain("POP");
    expect(html).toContain("7000000");
  });
});

describe("renderPopup — with popupInfo", () => {
  it("substitutes {FIELD} tokens in the title", () => {
    const html = renderPopup({ NAME: "Jeddah" }, { title: "City: {NAME}" });
    expect(html).toContain("<strong>City: Jeddah</strong>");
  });

  it("honors fieldInfos order, labels, and visibility", () => {
    const html = renderPopup(
      { NAME: "X", SECRET: "hide", POP: 5 },
      {
        fieldInfos: [
          { fieldName: "NAME", label: "Name" },
          { fieldName: "SECRET", label: "Secret", visible: false },
          { fieldName: "POP", label: "Population" },
        ],
      },
    );
    expect(html).toContain("Name");
    expect(html).toContain("Population");
    expect(html).not.toContain("Secret");
    expect(html).not.toContain("hide");
  });

  it("applies a number format (digit separator + fixed places)", () => {
    const html = renderPopup(
      { POP: 1234567.5 },
      { fieldInfos: [{ fieldName: "POP", label: "Population", format: { digitSeparator: true, places: 0 } }] },
    );
    // grouped, zero decimals → "1,234,568"
    expect(html).toContain("1,234,568");
  });

  it("escapes HTML in values (XSS-safe)", () => {
    const html = renderPopup({ NAME: "<img src=x onerror=alert(1)>" });
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });

  it("renders an empty string for null/undefined values", () => {
    const html = renderPopup({ A: null, B: undefined }, { fieldInfos: [{ fieldName: "A", label: "A" }] });
    expect(html).toContain("<td");
  });

  it("resolves fields case-insensitively (ArcGIS MapServer lowercases geojson keys)", () => {
    // popupInfo uses the service's canonical (upper) case; the MapServer f=geojson feature is lowercased.
    const html = renderPopup(
      { name: "Sutter Roseville", address: "1 Medical Plaza", city: "Roseville" },
      {
        title: "{NAME}",
        fieldInfos: [
          { fieldName: "NAME", label: "Facility" },
          { fieldName: "ADDRESS", label: "Address" },
          { fieldName: "CITY", label: "City" },
        ],
      },
    );
    expect(html).toContain("<strong>Sutter Roseville</strong>");
    expect(html).toContain("Sutter Roseville");
    expect(html).toContain("1 Medical Plaza");
    expect(html).toContain("Roseville");
  });

  it("prefers an exact-case key over a case-insensitive match", () => {
    const html = renderPopup(
      { Name: "exact", name: "lower" },
      { fieldInfos: [{ fieldName: "Name", label: "Name" }] },
    );
    expect(html).toContain("exact");
    expect(html).not.toContain(">lower<");
  });
});

describe("renderPopup — Arcade expressionInfos (#4)", () => {
  it("evaluates an expression and shows it via an expression/<name> fieldInfo", () => {
    const html = renderPopup(
      { GDP: 2000, POP: 1000 },
      {
        expressionInfos: [{ name: "percap", title: "GDP per capita", expression: "$feature.GDP / $feature.POP" }],
        fieldInfos: [{ fieldName: "expression/percap" }],
      },
    );
    expect(html).toContain("GDP per capita");
    expect(html).toContain(">2<"); // 2000 / 1000
  });

  it("substitutes {expression/<name>} tokens in the title", () => {
    const html = renderPopup(
      { GDP: 300, POP: 3 },
      {
        title: "Density: {expression/d}",
        expressionInfos: [{ name: "d", expression: "Round($feature.GDP / $feature.POP, 0)" }],
      },
    );
    expect(html).toContain("<strong>Density: 100</strong>");
  });
});

describe("renderPopup — description template (#4)", () => {
  it("renders a description with escaped field values and preserved template HTML", () => {
    const html = renderPopup(
      { NAME: "A & B", POP: 1234 },
      { description: "<p>Name: {NAME}, pop {POP}</p>", fieldInfos: [{ fieldName: "POP", format: { digitSeparator: true } }] },
    );
    expect(html).toContain("<p>Name: A &amp; B, pop 1,234</p>");
    // description replaces the field table
    expect(html).not.toContain("<table>");
  });
});

describe("renderPopup — mediaInfos (#4)", () => {
  it("renders an image with a token-substituted sourceURL", () => {
    const html = renderPopup(
      { PHOTO: "abc123" },
      { mediaInfos: [{ type: "image", title: "Site photo", value: { sourceURL: "https://cdn/pics/{PHOTO}.jpg" } }] },
    );
    expect(html).toContain('src="https://cdn/pics/abc123.jpg"');
    expect(html).toContain("Site photo");
  });

  it("renders a bar chart SVG of the feature's fields", () => {
    const html = renderPopup(
      { JAN: 10, FEB: 20, MAR: 5 },
      { mediaInfos: [{ type: "barchart", value: { fields: ["JAN", "FEB", "MAR"] } }] },
    );
    expect(html).toContain("<svg");
    expect(html).toContain("<rect"); // three bars
    expect((html.match(/<rect/g) || []).length).toBe(3);
  });

  it("renders placeholders for attachments and related records", () => {
    const html = renderPopup(
      { OBJECTID: 1 },
      { showAttachments: true, relatedRecords: { relationshipId: 0 } },
    );
    expect(html).toContain("data-strata-attachments");
    expect(html).toContain("data-strata-related");
  });
});

describe("chartSvg / renderAttachments / renderRelated (#4 helpers)", () => {
  it("chartSvg pie renders a slice per positive value with a legend", () => {
    const svg = chartSvg("pie", ["a", "b"], [3, 1]);
    expect((svg.match(/<path/g) || []).length).toBe(2);
    expect(svg).toContain("a");
  });

  it("renderAttachments shows image thumbnails and file links", () => {
    const html = renderAttachments([
      { id: 1, name: "photo.jpg", contentType: "image/jpeg", url: "http://x/1" },
      { id: 2, name: "report.pdf", contentType: "application/pdf", url: "http://x/2" },
    ]);
    expect(html).toContain("<img");
    expect(html).toContain("report.pdf");
    expect(html).toContain('href="http://x/2"');
  });

  it("renderRelated builds a nested table from arcgis relatedRecordGroups", () => {
    const html = renderRelated(
      { relatedRecordGroups: [{ relatedRecords: [{ attributes: { PERMIT: "P1", YEAR: 2020 } }] }] },
      "Permits",
    );
    expect(html).toContain("Permits");
    expect(html).toContain("PERMIT");
    expect(html).toContain("P1");
  });

  it("renderRelated also accepts a GeoJSON-shaped result", () => {
    const html = renderRelated({ features: [{ properties: { A: 1 } }] });
    expect(html).toContain("A");
    expect(html).toContain(">1<");
  });
});
