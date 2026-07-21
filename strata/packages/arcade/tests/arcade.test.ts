import { describe, it, expect } from "vitest";
import { transpileArcade, parse, evaluate } from "../src/index.js";

describe("lexer / parser", () => {
  it("parses $feature.FIELD and bracket access identically", () => {
    const a = parse("$feature.POP");
    const b = parse('$feature["POP"]');
    expect(a).toEqual({ kind: "field", name: "POP" });
    expect(b).toEqual({ kind: "field", name: "POP" });
  });

  it("respects arithmetic precedence", () => {
    const ast = parse("$feature.A + $feature.B * 2");
    expect(ast).toEqual({
      kind: "binary",
      op: "+",
      left: { kind: "field", name: "A" },
      right: {
        kind: "binary",
        op: "*",
        left: { kind: "field", name: "B" },
        right: { kind: "number", value: 2 },
      },
    });
  });

  it("throws on a bare unsupported identifier", () => {
    expect(() => parse("SomeVar")).toThrow();
  });
});

describe("evaluate (scalar, for popups)", () => {
  const attrs = { GDP: 2000, POP: 1000, CONTINENT: "Asia", NAME: "Testland" };

  it("computes arithmetic (GDP per capita)", () => {
    const r = transpileArcade("$feature.GDP / $feature.POP");
    expect(r.evaluate(attrs)).toBe(2);
    expect(r.fields.sort()).toEqual(["GDP", "POP"]);
  });

  it("Round(n, digits)", () => {
    expect(transpileArcade("Round($feature.GDP / $feature.POP, 1)").evaluate({ GDP: 100, POP: 3 })).toBe(33.3);
  });

  it("Iif / comparison", () => {
    const r = transpileArcade('Iif($feature.POP > 500, "big", "small")');
    expect(r.evaluate(attrs)).toBe("big");
    expect(r.evaluate({ POP: 10 })).toBe("small");
  });

  it("When with default", () => {
    const src = 'When($feature.POP > 5000, "huge", $feature.POP > 500, "big", "small")';
    expect(transpileArcade(src).evaluate({ POP: 1000 })).toBe("big");
    expect(transpileArcade(src).evaluate({ POP: 10 })).toBe("small");
  });

  it("Decode", () => {
    const src = 'Decode($feature.CONTINENT, "Asia", 1, "Europe", 2, 0)';
    expect(transpileArcade(src).evaluate(attrs)).toBe(1);
    expect(transpileArcade(src).evaluate({ CONTINENT: "Africa" })).toBe(0);
  });

  it("string concat with Text()", () => {
    const src = '$feature.NAME + " (" + Text($feature.POP) + ")"';
    expect(transpileArcade(src).evaluate(attrs)).toBe("Testland (1000)");
  });

  it("case-tolerant field lookup", () => {
    expect(transpileArcade("$feature.POP").evaluate({ pop: 42 })).toBe(42);
  });

  it("unsupported function has no MapLibre expression and warns", () => {
    // `Sin` parses fine (call node) but has no MapLibre analogue in the subset.
    const r = transpileArcade("Sin($feature.X)");
    expect(r.expression).toBeNull();
    expect(r.warnings.join(" ")).toMatch(/no MapLibre equivalent|unsupported/i);
  });
});

describe("toMapLibre (expression, for renderers)", () => {
  it("compiles arithmetic to a MapLibre expression", () => {
    const r = transpileArcade("$feature.GDP / $feature.POP");
    expect(r.expression).toEqual(["/", ["get", "GDP"], ["get", "POP"]]);
  });

  it("uses an injected case-tolerant field getter", () => {
    const r = transpileArcade("$feature.POP * 2", (name) => ["coalesce", ["get", name], ["get", name.toLowerCase()]]);
    expect(r.expression).toEqual(["*", ["coalesce", ["get", "POP"], ["get", "pop"]], 2]);
  });

  it("compiles Iif to case", () => {
    const r = transpileArcade('Iif($feature.POP > 500, "big", "small")');
    expect(r.expression).toEqual(["case", [">", ["get", "POP"], 500], "big", "small"]);
  });

  it("compiles Decode with literal keys to match", () => {
    const r = transpileArcade('Decode($feature.C, "a", 1, "b", 2, 0)');
    expect(r.expression).toEqual(["match", ["get", "C"], "a", 1, "b", 2, 0]);
  });

  it("Round(n,1) becomes a scaled round expression", () => {
    const r = transpileArcade("Round($feature.X, 1)");
    expect(r.expression).toEqual(["/", ["round", ["*", ["get", "X"], 10]], 10]);
  });

  it("falls back (null) for Decode with a non-literal key", () => {
    const r = transpileArcade("Decode($feature.C, $feature.K, 1, 0)");
    expect(r.expression).toBeNull();
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it("MapLibre and scalar paths agree on a numeric expression", () => {
    const attrs = { X: 10, Y: 4 };
    const r = transpileArcade("($feature.X - $feature.Y) * 2");
    // scalar
    expect(r.evaluate(attrs)).toBe(12);
    // structural expression
    expect(r.expression).toEqual(["*", ["-", ["get", "X"], ["get", "Y"]], 2]);
  });
});
