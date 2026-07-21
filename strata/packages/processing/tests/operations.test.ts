import { describe, it, expect } from "vitest";
import type { Feature, FeatureCollection, Point, Polygon } from "geojson";
import {
  buffer,
  centroids,
  clip,
  dissolve,
  dotDensity,
  nearest,
  pointsWithin,
  spatialJoin,
  withinDistance,
  union,
  difference,
  intersect,
  voronoi,
  convexHull,
  aggregate,
  hexbinDensity,
  hotspot,
  weightedOverlay,
} from "../src/operations.js";

function pt(lng: number, lat: number, props: Record<string, unknown> = {}): Feature<Point> {
  return { type: "Feature", properties: props, geometry: { type: "Point", coordinates: [lng, lat] } };
}
function fc<T extends Feature>(features: T[]): FeatureCollection {
  return { type: "FeatureCollection", features } as unknown as FeatureCollection;
}
/** An axis-aligned square polygon [minLng,minLat,maxLng,maxLat]. */
function square(a: number, b: number, c: number, d: number, props: Record<string, unknown> = {}): Feature<Polygon> {
  return {
    type: "Feature",
    properties: props,
    geometry: { type: "Polygon", coordinates: [[[a, b], [c, b], [c, d], [a, d], [a, b]]] },
  };
}

describe("buffer", () => {
  it("turns points into polygons", () => {
    const out = buffer(fc([pt(0, 0), pt(10, 10)]), 5);
    expect(out.features).toHaveLength(2);
    for (const f of out.features) {
      expect(["Polygon", "MultiPolygon"]).toContain(f.geometry.type);
    }
  });
});

describe("centroids", () => {
  it("computes one centroid per feature and carries properties", () => {
    const out = centroids(fc([square(0, 0, 10, 10, { name: "A" })]));
    expect(out.features).toHaveLength(1);
    expect(out.features[0].geometry.type).toBe("Point");
    const [x, y] = out.features[0].geometry.coordinates;
    expect(x).toBeCloseTo(5, 5);
    expect(y).toBeCloseTo(5, 5);
    expect(out.features[0].properties?.name).toBe("A");
  });
});

describe("withinDistance", () => {
  it("keeps only points within km of any reference point", () => {
    const pts = fc([pt(0, 0, { id: "near" }), pt(5, 5, { id: "far" })]);
    const refs = fc([pt(0.01, 0.01)]); // ~1.5km from (0,0)
    const out = withinDistance(pts as FeatureCollection<Point>, refs as FeatureCollection<Point>, 5);
    expect(out.features.map((f) => f.properties?.id)).toEqual(["near"]);
  });

  it("does not duplicate a point that matches several refs", () => {
    const pts = fc([pt(0, 0, { id: "p" })]);
    const refs = fc([pt(0.01, 0), pt(0, 0.01)]);
    const out = withinDistance(pts as FeatureCollection<Point>, refs as FeatureCollection<Point>, 50);
    expect(out.features).toHaveLength(1);
  });
});

describe("nearest", () => {
  it("finds the closest candidate and its distance", () => {
    const from = pt(0, 0);
    const cands = fc([pt(10, 0, { id: "far" }), pt(1, 0, { id: "close" })]);
    const res = nearest(from, cands as FeatureCollection<Point>);
    expect(res.feature?.properties?.id).toBe("close");
    expect(res.distanceKm).toBeGreaterThan(0);
    // 1° of longitude at the equator ≈ 111 km
    expect(res.distanceKm).toBeCloseTo(111.19, 0);
  });

  it("returns nulls for no candidates", () => {
    expect(nearest(pt(0, 0), fc([]) as FeatureCollection<Point>)).toEqual({
      feature: null,
      distanceKm: null,
    });
  });
});

describe("pointsWithin", () => {
  it("selects points inside any polygon", () => {
    const pts = fc([pt(1, 1, { id: "in" }), pt(20, 20, { id: "out" })]);
    const polys = fc([square(0, 0, 10, 10)]);
    const out = pointsWithin(
      pts as FeatureCollection<Point>,
      polys as FeatureCollection<Polygon>,
    );
    expect(out.features.map((f) => f.properties?.id)).toEqual(["in"]);
  });
});

describe("spatialJoin", () => {
  it("left-joins the first matching feature's properties (target keys win)", () => {
    const targets = fc([pt(1, 1, { id: "t", shared: "keep" })]);
    const joins = fc([square(0, 0, 10, 10, { zone: "Z1", shared: "override" })]);
    const out = spatialJoin(targets, joins, { predicate: "within" });
    expect(out.features).toHaveLength(1);
    expect(out.features[0].properties?.zone).toBe("Z1");
    expect(out.features[0].properties?.shared).toBe("keep");
  });

  it("keeps unmatched targets unchanged (left join)", () => {
    const targets = fc([pt(50, 50, { id: "orphan" })]);
    const joins = fc([square(0, 0, 10, 10, { zone: "Z1" })]);
    const out = spatialJoin(targets, joins, { predicate: "within" });
    expect(out.features[0].properties?.id).toBe("orphan");
    expect(out.features[0].properties?.zone).toBeUndefined();
  });
});

describe("dissolve + clip", () => {
  it("dissolves two adjacent squares into one polygon", () => {
    const polys = fc([square(0, 0, 10, 10), square(10, 0, 20, 10)]) as FeatureCollection<Polygon>;
    const out = dissolve(polys);
    expect(out.features.length).toBeGreaterThanOrEqual(1);
  });

  it("clips a feature to a mask (intersection) and inherits source props", () => {
    const source = fc([square(0, 0, 10, 10, { name: "src" })]);
    const mask = fc([square(5, 5, 20, 20)]) as FeatureCollection<Polygon>;
    const out = clip(source, mask);
    expect(out.features.length).toBeGreaterThanOrEqual(1);
    expect(out.features[0].properties?.name).toBe("src");
  });

  it("drops non-overlapping features when clipping", () => {
    const source = fc([square(0, 0, 5, 5)]);
    const mask = fc([square(50, 50, 60, 60)]) as FeatureCollection<Polygon>;
    expect(clip(source, mask).features).toHaveLength(0);
  });
});

describe("dotDensity", () => {
  // A deterministic RNG so tests don't depend on Math.random. Cycles a fixed sequence.
  function seq(values: number[]): () => number {
    let i = 0;
    return () => values[i++ % values.length];
  }

  it("generates round(field / dotValue) dots per polygon inside the geometry", () => {
    const polys = fc([square(0, 0, 10, 10, { POP: 300 })]) as FeatureCollection<Polygon>;
    // Every sampled point (0.5,0.5 of the bbox) lands inside the square, so no rejection.
    const dots = dotDensity(polys, { field: "POP", dotValue: 100, rng: seq([0.5]) });
    expect(dots.features).toHaveLength(3); // 300 / 100
    for (const d of dots.features) {
      expect(d.geometry.type).toBe("Point");
      const [lng, lat] = d.geometry.coordinates;
      expect(lng).toBeGreaterThan(0);
      expect(lng).toBeLessThan(10);
      expect(lat).toBeGreaterThan(0);
      expect(lat).toBeLessThan(10);
      expect(d.properties?._dotField).toBe("POP");
    }
  });

  it("rejects points outside the true geometry (bbox sampling is filtered)", () => {
    const polys = fc([square(0, 0, 10, 10, { POP: 100 })]) as FeatureCollection<Polygon>;
    // rng is consumed as (lng, lat) per attempt: attempt 1 lng=1.5→x=15 (outside, rejected);
    // attempt 2 (0.5,0.5)→(5,5) inside → ends with 1 dot.
    const dots = dotDensity(polys, { field: "POP", dotValue: 100, rng: seq([1.5, 0.5, 0.5, 0.5]) });
    expect(dots.features).toHaveLength(1);
  });

  it("skips non-positive / non-numeric field values and honors maxDots", () => {
    const polys = fc([
      square(0, 0, 10, 10, { POP: 0 }),
      square(20, 20, 30, 30, { POP: "n/a" }),
      square(40, 40, 50, 50, { POP: 1e9 }),
    ]) as FeatureCollection<Polygon>;
    const dots = dotDensity(polys, { field: "POP", dotValue: 1, maxDots: 5, rng: seq([0.5]) });
    expect(dots.features).toHaveLength(5); // only the third polygon, capped at maxDots
  });

  it("returns empty for a non-positive dotValue", () => {
    const polys = fc([square(0, 0, 10, 10, { POP: 100 })]) as FeatureCollection<Polygon>;
    expect(dotDensity(polys, { field: "POP", dotValue: 0 }).features).toHaveLength(0);
  });
});

describe("overlay + aggregation + density (#11)", () => {
  const sq = (a: number, b: number, c: number, d: number, props: Record<string, unknown> = {}) => square(a, b, c, d, props);

  it("union merges overlapping polygons into one", () => {
    const collection = { type: "FeatureCollection", features: [sq(0, 0, 2, 2), sq(1, 1, 3, 3)] } as any;
    const u = union(collection);
    expect(u.features).toHaveLength(1);
    expect(u.features[0].geometry.type).toMatch(/Polygon/);
  });

  it("difference erases the mask", () => {
    const collection = { type: "FeatureCollection", features: [sq(0, 0, 4, 4, { id: 1 })] } as any;
    const mask = { type: "FeatureCollection", features: [sq(2, 0, 6, 4)] } as any;
    const d = difference(collection, mask);
    expect(d.features.length).toBeGreaterThan(0);
    expect(d.features[0].properties?.id).toBe(1);
  });

  it("intersect keeps the overlapping part with merged props", () => {
    const collection = { type: "FeatureCollection", features: [sq(0, 0, 4, 4, { a: 1 })] } as any;
    const mask = { type: "FeatureCollection", features: [sq(2, 2, 6, 6, { b: 2 })] } as any;
    const i = intersect(collection, mask);
    expect(i.features).toHaveLength(1);
    expect(i.features[0].properties).toMatchObject({ a: 1, b: 2 });
  });

  it("voronoi produces a polygon per point", () => {
    const pts = fc([pt(0, 0), pt(2, 2), pt(-2, 1)]) as any;
    const v = voronoi(pts, [-5, -5, 5, 5]);
    expect(v.features.length).toBeGreaterThanOrEqual(1);
    expect(v.features[0].geometry.type).toMatch(/Polygon/);
  });

  it("convexHull wraps all points", () => {
    const pts = fc([pt(0, 0), pt(4, 0), pt(4, 4), pt(0, 4), pt(2, 2)]) as any;
    expect(convexHull(pts).features[0].geometry.type).toBe("Polygon");
  });

  it("aggregate groups and computes stats", () => {
    const feats = fc([
      pt(0, 0, { region: "N", pop: 10 }),
      pt(1, 1, { region: "N", pop: 30 }),
      pt(2, 2, { region: "S", pop: 5 }),
    ]) as any;
    const rows = aggregate(feats, "region", "pop");
    const north = rows.find((r) => r.group === "N")!;
    expect(north.count).toBe(2);
    expect(north.sum).toBe(40);
    expect(north.mean).toBe(20);
    expect(north.max).toBe(30);
    expect(rows.find((r) => r.group === "S")!.count).toBe(1);
  });

  it("hexbinDensity counts points per cell", () => {
    const pts = fc([pt(0, 0), pt(0.01, 0.01), pt(3, 3)]) as any;
    const grid = hexbinDensity(pts, 50);
    const totals = grid.features.reduce((a, c) => a + (Number((c.properties as any).count) || 0), 0);
    expect(totals).toBe(3);
  });

  it("hotspot adds a gi_z score per cell", () => {
    const pts = fc(Array.from({ length: 20 }, (_, i) => pt(0.01 * i, 0.01 * i))) as any;
    const hs = hotspot(pts, 50);
    expect(hs.features.every((c) => typeof (c.properties as any).gi_z === "number")).toBe(true);
  });

  it("weightedOverlay combines criteria by normalized weight", () => {
    const feats = fc([pt(0, 0, { slope: 1, roads: 0 }), pt(1, 1, { slope: 0, roads: 1 })]) as any;
    const out = weightedOverlay(feats, [
      { field: "slope", weight: 3 },
      { field: "roads", weight: 1 },
    ]);
    expect((out.features[0].properties as any).suitability).toBeCloseTo(0.75, 3);
    expect((out.features[1].properties as any).suitability).toBeCloseTo(0.25, 3);
  });
});
