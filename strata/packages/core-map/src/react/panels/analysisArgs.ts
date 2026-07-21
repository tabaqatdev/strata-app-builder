/**
 * Pure arg-mapping for the Analysis shell (no React) — maps the panel's generic inputs (a primary FC, an
 * optional secondary FC, a scalar param, a group field, a predicate) onto each spatial tool's named `run`
 * arguments. Kept separate from the component so it's unit-testable in Node.
 */

/** A structural view of a `@strata/processing` tool (structural to avoid a cross-package dep). */
export interface AnalysisTool {
  label: string;
  description?: string;
  run: (args: Record<string, unknown>) => unknown;
}

/** Which named args a tool's `run` expects, and how the panel's generic inputs fill them. */
export interface ToolArgSpec {
  primary: "fc" | "pointsFc" | "targetFc";
  secondary?: "mask" | "joinFc" | "refPointsFc" | "polygonsFc";
  param?: { key: "distanceKm" | "km" | "cellSizeKm"; label: string };
  field?: boolean;
  predicate?: boolean;
}

export const TOOL_ARGS: Record<string, ToolArgSpec> = {
  buffer: { primary: "fc", param: { key: "distanceKm", label: "Distance (km)" } },
  dissolve: { primary: "fc", field: true },
  centroids: { primary: "fc" },
  convexHull: { primary: "fc" },
  union: { primary: "fc" },
  clip: { primary: "fc", secondary: "mask" },
  difference: { primary: "fc", secondary: "mask" },
  intersect: { primary: "fc", secondary: "mask" },
  pointsWithin: { primary: "pointsFc", secondary: "polygonsFc" },
  withinDistance: { primary: "pointsFc", secondary: "refPointsFc", param: { key: "km", label: "Distance (km)" } },
  spatialJoin: { primary: "targetFc", secondary: "joinFc", predicate: true },
  hexbinDensity: { primary: "pointsFc", param: { key: "cellSizeKm", label: "Cell size (km)" } },
  hotspot: { primary: "pointsFc", param: { key: "cellSizeKm", label: "Cell size (km)" } },
};

export interface GenericInputs {
  input?: unknown;
  secondary?: unknown;
  param?: number;
  field?: string;
  predicate?: string;
}

/** Map the panel's generic inputs onto a tool's named `run` args. Unknown tools get `{ fc: input }`. */
export function buildToolArgs(toolId: string, g: GenericInputs): Record<string, unknown> {
  const spec = TOOL_ARGS[toolId];
  if (!spec) return { fc: g.input };
  const args: Record<string, unknown> = { [spec.primary]: g.input };
  if (spec.secondary && g.secondary !== undefined) args[spec.secondary] = g.secondary;
  if (spec.param && g.param !== undefined) args[spec.param.key] = g.param;
  if (spec.field && g.field) args.field = g.field;
  if (spec.predicate && g.predicate) args.predicate = g.predicate;
  return args;
}

/** Extract records to publish from a tool result (FeatureCollection → features; else the value in an array). */
export function resultRecords(result: unknown): unknown {
  if (result && typeof result === "object" && (result as { type?: string }).type === "FeatureCollection") {
    return (result as { features?: unknown[] }).features ?? [];
  }
  return Array.isArray(result) ? result : [result];
}
