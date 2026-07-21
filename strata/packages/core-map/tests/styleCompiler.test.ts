import { describe, it, expect } from "vitest";
import { compile, scaleToZoom, compileLabels } from "../src/engine/styleCompiler.js";

const PT2PX = 4 / 3;

describe("compile — simple renderer", () => {
  it("compiles a simple fill symbol to fill + outline paint", () => {
    const res = compile({
      type: "simple",
      symbol: {
        type: "esriSFS",
        color: [255, 0, 0, 128],
        outline: { color: [0, 0, 0, 255], width: 2 },
      },
    });
    expect(res.patches.fill["fill-color"]).toBe(`rgba(255,0,0,${128 / 255})`);
    expect(res.patches.outline["line-color"]).toBe("rgba(0,0,0,1)");
    expect(res.patches.outline["line-width"]).toBe(2 * PT2PX);
    expect(res.warnings).toEqual([]);
  });

  it("uses default grey outline when fill has no outline", () => {
    const res = compile({
      type: "simple",
      symbol: { type: "simple-fill", color: [10, 20, 30] },
    });
    // color with no alpha defaults to 255
    expect(res.patches.fill["fill-color"]).toBe("rgba(10,20,30,1)");
    expect(res.patches.outline["line-color"]).toBe("rgba(110,110,110,1)");
    expect(res.patches.outline["line-width"]).toBe(1);
  });

  it("warns on non-solid fill style but still renders", () => {
    const res = compile({
      type: "simple",
      symbol: { type: "esriSFS", color: [1, 2, 3, 255], style: "esriSFSDiagonalCross" },
    });
    expect(res.patches.fill["fill-color"]).toBe("rgba(1,2,3,1)");
    expect(res.warnings.some((w) => /not fully supported/.test(w))).toBe(true);
  });

  it("compiles a simple line symbol (pt -> px width) and dash", () => {
    const res = compile({
      type: "simple",
      symbol: { type: "esriSLS", color: [0, 128, 255, 255], width: 3, style: "esriSLSDash" },
    });
    expect(res.patches.line["line-color"]).toBe("rgba(0,128,255,1)");
    expect(res.patches.line["line-width"]).toBe(3 * PT2PX);
    expect(res.patches.line["line-dasharray"]).toEqual([2, 2]);
  });

  it("defaults line width to 1.5pt when missing", () => {
    const res = compile({
      type: "simple",
      symbol: { type: "simple-line", color: [0, 0, 0, 255] },
    });
    expect(res.patches.line["line-width"]).toBe(1.5 * PT2PX);
  });

  it("compiles a marker symbol to circle paint (radius = size/2 in px)", () => {
    const res = compile({
      type: "simple",
      symbol: {
        type: "esriSMS",
        color: [255, 255, 0, 255],
        size: 12,
        outline: { color: [0, 0, 0, 255], width: 1 },
      },
    });
    expect(res.patches.circle["circle-color"]).toBe("rgba(255,255,0,1)");
    expect(res.patches.circle["circle-radius"]).toBe((12 * PT2PX) / 2);
    expect(res.patches.circle["circle-stroke-color"]).toBe("rgba(0,0,0,1)");
    expect(res.patches.circle["circle-stroke-width"]).toBe(1 * PT2PX);
  });

  it("warns when marker style is not a circle", () => {
    const res = compile({
      type: "simple",
      symbol: { type: "esriSMS", color: [1, 1, 1, 255], size: 8, style: "esriSMSSquare" },
    });
    expect(res.warnings.some((w) => /approximated as circle/.test(w))).toBe(true);
  });

  it("compiles a picture-marker to an icon (imageData -> dataUri)", () => {
    const res = compile({
      type: "simple",
      symbol: {
        type: "esriPMS",
        imageData: "AAAA",
        contentType: "image/png",
        width: 24,
      },
    });
    expect(res.icon).toBeDefined();
    const icon = res.icon as any;
    expect(icon.dataUri).toBe("data:image/png;base64,AAAA");
    expect(icon.url).toBeUndefined();
    expect(icon.sizePx).toBe(24 * PT2PX);
  });
});

describe("compile — uniqueValue renderer", () => {
  it("builds a match expression keyed on to-string(get(field1))", () => {
    const res = compile({
      type: "uniqueValue",
      field1: "STATE",
      uniqueValueInfos: [
        { value: "CA", symbol: { type: "esriSFS", color: [255, 0, 0, 255] } },
        { value: "NY", symbol: { type: "esriSFS", color: [0, 255, 0, 255] } },
      ],
      defaultSymbol: { type: "esriSFS", color: [128, 128, 128, 255] },
    });
    expect(res.fields).toEqual(["STATE"]);
    expect(res.patches.fill["fill-color"]).toEqual([
      "match",
      ["to-string", ["coalesce", ["get", "STATE"], ["get", "state"]]],
      "CA",
      "rgba(255,0,0,1)",
      "NY",
      "rgba(0,255,0,1)",
      "rgba(128,128,128,1)",
    ]);
  });

  it("accepts `field` as an alias for field1", () => {
    const res = compile({
      type: "uniqueValue",
      field: "CAT",
      uniqueValueInfos: [{ value: "a", symbol: { type: "esriSFS", color: [1, 2, 3, 255] } }],
    });
    expect(res.fields).toEqual(["CAT"]);
    // With no defaultSymbol, the fallback color() of an empty symbol is transparent.
    expect(res.patches.fill["fill-color"]).toEqual([
      "match",
      ["to-string", ["coalesce", ["get", "CAT"], ["get", "cat"]]],
      "a",
      "rgba(1,2,3,1)",
      "rgba(0,0,0,0)",
    ]);
  });

  it("warns when field1 is missing", () => {
    const res = compile({ type: "uniqueValue", uniqueValueInfos: [] });
    expect(res.warnings.some((w) => /no field1/.test(w))).toBe(true);
  });

  it("supports multi-field unique-value with a concatenated match key", () => {
    const res = compile({
      type: "uniqueValue",
      field1: "ECONOMY",
      field2: "INCOME",
      fieldDelimiter: ", ",
      uniqueValueInfos: [
        { value: "Developed, High", symbol: { type: "esriSFS", color: [10, 20, 30, 255] } },
        { value: ["Developing", "Low"], symbol: { type: "esriSFS", color: [40, 50, 60, 255] } },
      ],
      defaultSymbol: { type: "esriSFS", color: [0, 0, 0, 255] },
    });
    expect(res.fields).toEqual(["ECONOMY", "INCOME"]);
    expect(res.patches.fill["fill-color"]).toEqual([
      "match",
      [
        "concat",
        ["to-string", ["coalesce", ["get", "ECONOMY"], ["get", "economy"]]],
        ", ",
        ["to-string", ["coalesce", ["get", "INCOME"], ["get", "income"]]],
      ],
      "Developed, High",
      "rgba(10,20,30,1)",
      "Developing, Low", // array value joined on the same delimiter
      "rgba(40,50,60,1)",
      "rgba(0,0,0,1)",
    ]);
  });

  it("drives the match input from an Arcade valueExpression", () => {
    const res = compile({
      type: "uniqueValue",
      valueExpression: 'Iif($feature.POP > 1000, "big", "small")',
      uniqueValueInfos: [
        { value: "big", symbol: { type: "esriSFS", color: [1, 0, 0, 255] } },
        { value: "small", symbol: { type: "esriSFS", color: [0, 0, 1, 255] } },
      ],
      defaultSymbol: { type: "esriSFS", color: [9, 9, 9, 255] },
    });
    expect(res.fields).toEqual(["POP"]);
    expect(res.patches.fill["fill-color"]).toEqual([
      "match",
      ["to-string", ["case", [">", ["coalesce", ["get", "POP"], ["get", "pop"]], 1000], "big", "small"]],
      "big",
      "rgba(1,0,0,1)",
      "small",
      "rgba(0,0,1,1)",
      "rgba(9,9,9,1)",
    ]);
    expect(res.warnings).toEqual([]);
  });
});

describe("compile — classBreaks renderer", () => {
  it("builds a step expression using previous classMaxValue thresholds", () => {
    const res = compile({
      type: "classBreaks",
      field: "POP",
      classBreakInfos: [
        { classMaxValue: 100, symbol: { type: "esriSFS", color: [0, 0, 255, 255] } },
        { classMaxValue: 200, symbol: { type: "esriSFS", color: [0, 255, 0, 255] } },
        { classMaxValue: 300, symbol: { type: "esriSFS", color: [255, 0, 0, 255] } },
      ],
    });
    expect(res.fields).toEqual(["POP"]);
    expect(res.patches.fill["fill-color"]).toEqual([
      "step",
      ["to-number", ["coalesce", ["get", "POP"], ["get", "pop"]]],
      "rgba(0,0,255,1)",
      100,
      "rgba(0,255,0,1)",
      200,
      "rgba(255,0,0,1)",
    ]);
  });

  it("sorts class break infos by classMaxValue before building steps", () => {
    const res = compile({
      type: "classBreaks",
      field: "V",
      classBreakInfos: [
        { classMaxValue: 200, symbol: { type: "esriSFS", color: [0, 255, 0, 255] } },
        { classMaxValue: 100, symbol: { type: "esriSFS", color: [0, 0, 255, 255] } },
      ],
    });
    expect(res.patches.fill["fill-color"]).toEqual([
      "step",
      ["to-number", ["coalesce", ["get", "V"], ["get", "v"]]],
      "rgba(0,0,255,1)",
      100,
      "rgba(0,255,0,1)",
    ]);
  });

  it("warns when no field is provided", () => {
    const res = compile({ type: "classBreaks", classBreakInfos: [] });
    expect(res.warnings.some((w) => /no field/.test(w))).toBe(true);
  });
});

describe("compile — heatmap renderer", () => {
  it("injects a ratio-0 transparent stop when none is present", () => {
    const res = compile({
      type: "heatmap",
      colorStops: [
        { ratio: 0.5, color: [255, 255, 0, 255] },
        { ratio: 1, color: [255, 0, 0, 255] },
      ],
      blurRadius: 15,
      opacity: 0.8,
    });
    const hc = res.heatmap!["heatmap-color"] as any[];
    expect(hc[0]).toBe("interpolate");
    expect(hc[1]).toEqual(["linear"]);
    expect(hc[2]).toEqual(["heatmap-density"]);
    // First stop must be ratio 0 and transparent.
    expect(hc[3]).toBe(0);
    expect(hc[4]).toBe("rgba(0,0,0,0)");
    expect(res.heatmap!["heatmap-radius"]).toBe(15 * PT2PX);
    expect(res.heatmap!["heatmap-opacity"]).toBe(0.8);
  });

  it("keeps an existing ratio-0 stop instead of adding another", () => {
    const res = compile({
      type: "heatmap",
      colorStops: [
        { ratio: 0, color: [0, 0, 255, 0] },
        { ratio: 1, color: [255, 0, 0, 255] },
      ],
    });
    const hc = res.heatmap!["heatmap-color"] as any[];
    // stops start at index 3: ratio, color pairs. Only one ratio-0 entry.
    const ratios = hc.slice(3).filter((_, i) => i % 2 === 0);
    expect(ratios.filter((r) => r === 0).length).toBe(1);
    // default opacity is 1
    expect(res.heatmap!["heatmap-opacity"]).toBe(1);
    // default blurRadius -> px(undefined, 10)
    expect(res.heatmap!["heatmap-radius"]).toBe(10 * PT2PX);
  });

  it("applies field weighting via heatmap-weight (no longer a warning)", () => {
    const res = compile({
      type: "heatmap",
      field: "MAG",
      colorStops: [{ ratio: 1, color: [255, 0, 0, 255] }],
    });
    expect(res.heatmap!["heatmap-weight"]).toBeTruthy();
    expect(res.fields).toContain("MAG");
    expect(res.warnings.some((w) => /field weighting/.test(w))).toBe(false);
  });
});

describe("compile — visual variables", () => {
  it("applies a color visual variable as an interpolate expression", () => {
    const res = compile({
      type: "simple",
      symbol: { type: "esriSFS", color: [0, 0, 0, 255] },
      visualVariables: [
        {
          type: "colorInfo",
          field: "TEMP",
          stops: [
            { value: 0, color: [0, 0, 255, 255] },
            { value: 100, color: [255, 0, 0, 255] },
          ],
        },
      ],
    });
    expect(res.fields).toContain("TEMP");
    const expected = [
      "interpolate",
      ["linear"],
      ["to-number", ["coalesce", ["get", "TEMP"], ["get", "temp"]]],
      0,
      "rgba(0,0,255,1)",
      100,
      "rgba(255,0,0,1)",
    ];
    expect(res.patches.fill["fill-color"]).toEqual(expected);
    expect(res.patches.line["line-color"]).toEqual(expected);
    expect(res.patches.circle["circle-color"]).toEqual(expected);
  });

  it("applies a size visual variable to circle-radius and line-width", () => {
    const res = compile({
      type: "simple",
      symbol: { type: "esriSMS", color: [0, 0, 0, 255], size: 8 },
      visualVariables: [
        {
          type: "sizeInfo",
          field: "SIZE",
          stops: [
            { value: 0, size: 4 },
            { value: 10, size: 20 },
          ],
        },
      ],
    });
    expect(res.fields).toContain("SIZE");
    expect(res.patches.circle["circle-radius"]).toEqual([
      "interpolate",
      ["linear"],
      ["to-number", ["coalesce", ["get", "SIZE"], ["get", "size"]]],
      0,
      (4 * PT2PX) / 2,
      10,
      (20 * PT2PX) / 2,
    ]);
    expect(res.patches.line["line-width"]).toEqual([
      "interpolate",
      ["linear"],
      ["to-number", ["coalesce", ["get", "SIZE"], ["get", "size"]]],
      0,
      4 * PT2PX,
      10,
      20 * PT2PX,
    ]);
  });
});

describe("compile — unsupported inputs", () => {
  it("warns when no renderer is provided", () => {
    const res = compile(null);
    expect(res.warnings.some((w) => /no renderer provided/.test(w))).toBe(true);
    expect(res.fields).toEqual([]);
  });

  it("warns on an unsupported renderer type", () => {
    const res = compile({ type: "predominance" });
    expect(res.warnings.some((w) => /not supported/.test(w))).toBe(true);
  });

  it("directs dotDensity to the author-time expander and styles the dot symbol", () => {
    const res = compile({
      type: "dotDensity",
      dotValue: 100,
      dotSize: 3,
      referenceScale: 0,
      attributes: [{ field: "POP", color: [200, 40, 40, 255] }],
    });
    expect(res.warnings.some((w) => /dotDensity.*expand|@strata\/processing/i.test(w))).toBe(true);
    // The derived point layer renders as circles.
    expect(res.patches.circle["circle-color"]).toBe("rgba(200,40,40,1)");
  });

  it("compiles a supported Arcade valueExpression on classBreaks", () => {
    const res = compile({
      type: "classBreaks",
      valueExpression: "$feature.POP / $feature.AREA",
      classBreakInfos: [
        { classMaxValue: 50, symbol: { type: "esriSFS", color: [1, 1, 1, 255] } },
        { classMaxValue: 100, symbol: { type: "esriSFS", color: [2, 2, 2, 255] } },
      ],
    });
    expect(res.fields.sort()).toEqual(["AREA", "POP"]);
    expect(res.patches.fill["fill-color"]).toEqual([
      "step",
      ["to-number", ["/", ["coalesce", ["get", "POP"], ["get", "pop"]], ["coalesce", ["get", "AREA"], ["get", "area"]]]],
      "rgba(1,1,1,1)",
      50,
      "rgba(2,2,2,1)",
    ]);
  });

  it("falls back with a warning when the Arcade valueExpression is outside the subset", () => {
    const res = compile({
      type: "uniqueValue",
      valueExpression: "Sin($feature.POP)",
      uniqueValueInfos: [{ value: "x", symbol: { type: "esriSFS", color: [1, 1, 1, 255] } }],
    });
    expect(res.warnings.some((w) => /outside the supported subset/.test(w))).toBe(true);
    // Falls back to the default symbol: no match emitted.
    expect(res.patches.fill["fill-color"]).toBeUndefined();
  });
});

describe("scaleToZoom", () => {
  it("converts an ESRI scale to a MapLibre zoom", () => {
    // At scale == the constant, zoom is 0.
    expect(scaleToZoom(591657527.591555)).toBeCloseTo(0, 6);
    // Halving the scale increases zoom by 1.
    expect(scaleToZoom(591657527.591555 / 2)).toBeCloseTo(1, 6);
  });
});

describe("compileLabels", () => {
  it("compiles a REST [FIELD] single-field expression", () => {
    const out = compileLabels([
      { labelExpression: "[NAME]", symbol: { type: "esriTS", color: [0, 0, 0, 255] } },
    ]);
    expect(out.fields).toEqual(["NAME"]);
    const layer = out.layers[0] as any;
    expect(layer.layout["text-field"]).toEqual(["to-string", ["coalesce", ["get", "NAME"], ["get", "name"]]]);
  });

  it("compiles a REST multi-field expression into concat", () => {
    const out = compileLabels([{ labelExpression: "[CITY][STATE]" }]);
    expect(out.fields).toEqual(["CITY", "STATE"]);
    const layer = out.layers[0] as any;
    expect(layer.layout["text-field"]).toEqual([
      "concat",
      ["to-string", ["coalesce", ["get", "CITY"], ["get", "city"]]],
      ["to-string", ["coalesce", ["get", "STATE"], ["get", "state"]]],
    ]);
  });

  it("compiles a single-field Arcade $feature.X expression", () => {
    const out = compileLabels([
      { labelExpressionInfo: { expression: "$feature.NAME" } },
    ]);
    expect(out.fields).toEqual(["NAME"]);
    const layer = out.layers[0] as any;
    expect(layer.layout["text-field"]).toEqual(["to-string", ["coalesce", ["get", "NAME"], ["get", "name"]]]);
  });

  it("approximates a complex Arcade expression as concat and warns", () => {
    const out = compileLabels([
      { labelExpressionInfo: { expression: '$feature.CITY + ", " + $feature["STATE"]' } },
    ]);
    expect(out.fields).toEqual(["CITY", "STATE"]);
    expect(out.warnings.some((w) => /complex Arcade/.test(w))).toBe(true);
    const layer = out.layers[0] as any;
    expect(layer.layout["text-field"]).toEqual([
      "concat",
      ["to-string", ["coalesce", ["get", "CITY"], ["get", "city"]]],
      ["to-string", ["coalesce", ["get", "STATE"], ["get", "state"]]],
    ]);
  });

  it("maps min/maxScale to max/minzoom respectively", () => {
    const out = compileLabels([
      { labelExpression: "[N]", minScale: 500000, maxScale: 5000 },
    ]);
    const layer = out.layers[0] as any;
    expect(layer.maxzoom).toBeCloseTo(scaleToZoom(500000), 6);
    expect(layer.minzoom).toBeCloseTo(scaleToZoom(5000), 6);
  });

  it("skips label classes without an expression", () => {
    const out = compileLabels([{ symbol: {} }]);
    expect(out.layers).toEqual([]);
  });
});

describe("compile — case-tolerant field lookup (MapServer f=geojson lowercases keys)", () => {
  it("uniqueValue field resolves through a case-tolerant coalesce", () => {
    const res = compile({
      type: "uniqueValue",
      field1: "HAZ_CLASS",
      uniqueValueInfos: [{ value: "High", symbol: { type: "esriSFS", color: [255, 0, 0, 255] } }],
    });
    const json = JSON.stringify(res.patches);
    expect(json).toContain("coalesce");
    expect(json).toContain("haz_class"); // the lowercased variant is present
    expect(json).toContain("HAZ_CLASS");
  });

  it("classBreaks field resolves through a case-tolerant coalesce", () => {
    const res = compile({
      type: "classBreaks",
      field: "POP_EST",
      classBreakInfos: [{ classMaxValue: 100, symbol: { type: "esriSFS", color: [0, 0, 255, 255] } }],
    });
    const json = JSON.stringify(res.patches);
    expect(json).toContain("coalesce");
    expect(json).toContain("pop_est");
  });

  it("labels resolve fields case-tolerantly", () => {
    const { layers } = compileLabels([{ labelExpression: "[NAME]" }] as any);
    expect(JSON.stringify(layers)).toContain("name");
  });
});

describe("compile — heatmap field weighting (#3)", () => {
  it("emits heatmap-weight from the field and lists the field", () => {
    const res = compile({
      type: "heatmap",
      field: "MAGNITUDE",
      colorStops: [{ ratio: 0, color: [0, 0, 0, 0] }, { ratio: 1, color: [255, 0, 0, 255] }],
      blurRadius: 12,
    });
    expect(res.heatmap).toBeTruthy();
    expect(JSON.stringify(res.heatmap!["heatmap-weight"])).toContain("MAGNITUDE");
    expect(res.fields).toContain("MAGNITUDE");
  });

  it("normalizes weight to [0..1] when maxPixelIntensity is given", () => {
    const res = compile({ type: "heatmap", field: "POP", maxPixelIntensity: 1000, colorStops: [{ ratio: 0.5, color: [1, 2, 3, 255] }] });
    const w = res.heatmap!["heatmap-weight"] as any[];
    expect(w[0]).toBe("interpolate");
    expect(JSON.stringify(w)).toContain("1000");
  });
});
