/**
 * @strata/arcade — an explicitly-scoped Arcade-subset evaluator.
 *
 * Covers the common ~80% of ESRI Arcade: `$feature.FIELD` / `$feature["FIELD"]`, arithmetic
 * (`+ - * / %`), string concat / `Text()` / `Concatenate()`, `When()` / `Iif()` / `Decode()`,
 * `Round()` (+ `Floor/Ceil/Abs/Sqrt/Pow/Upper/Lower/DefaultValue`), and comparison / logical operators.
 *
 * Two consumers:
 *   - **renderers** call {@link transpileArcade} and use `.expression` (a MapLibre expression) when it
 *     is non-null; otherwise they compute a virtual field at load time using `.evaluate(attrs)`.
 *   - **popups** call {@link transpileArcade} and use `.evaluate(attrs)` to get a computed scalar.
 *
 * Anything outside the subset (unsupported function, non-literal `Decode` key, parse error) leaves
 * `.expression` null and records a message in `.warnings` — never a silent wrong answer.
 */

import { parse } from "./parser.js";
import { evaluate, type Attributes } from "./evaluate.js";
import { toMapLibre, type MapLibreExpr } from "./toMapLibre.js";
import type { Node } from "./ast.js";

export { parse } from "./parser.js";
export { evaluate } from "./evaluate.js";
export { toMapLibre } from "./toMapLibre.js";
export { tokenize } from "./lexer.js";
export type { Attributes } from "./evaluate.js";
export type { MapLibreExpr, ToMapLibreResult } from "./toMapLibre.js";
export type * from "./ast.js";

export interface TranspileResult {
  /** The parsed AST, or null when the source could not be parsed. */
  ast: Node | null;
  /** Field names referenced (`$feature.X`), de-duplicated — drives lean `outFields` fetching. */
  fields: string[];
  /** A MapLibre expression when the subset allows one, else null (caller computes a virtual field). */
  expression: MapLibreExpr | null;
  /** Compute the scalar value for a feature's attributes; returns undefined if parsing failed. */
  evaluate: (attrs: Attributes) => unknown;
  /** Non-fatal notes: parse failures and constructs with no MapLibre analogue. */
  warnings: string[];
}

/** Collect every `$feature` field referenced by an AST. */
function collectFields(node: Node, out: Set<string>): void {
  switch (node.kind) {
    case "field":
      out.add(node.name);
      return;
    case "unary":
      collectFields(node.arg, out);
      return;
    case "binary":
    case "logical":
      collectFields(node.left, out);
      collectFields(node.right, out);
      return;
    case "call":
      node.args.forEach((a) => collectFields(a, out));
      return;
    default:
      return;
  }
}

/**
 * Parse an Arcade-subset source once and expose both a MapLibre expression (when representable) and a
 * scalar evaluator. A `getField` hook lets renderers inject case-tolerant field access.
 */
export function transpileArcade(
  source: string,
  getField?: (name: string) => MapLibreExpr
): TranspileResult {
  let ast: Node | null = null;
  const warnings: string[] = [];
  try {
    ast = parse(source);
  } catch (err) {
    warnings.push(`Arcade parse failed: ${(err as Error).message}`);
    return {
      ast: null,
      fields: [],
      expression: null,
      evaluate: () => undefined,
      warnings,
    };
  }

  const fieldSet = new Set<string>();
  collectFields(ast, fieldSet);

  const { expression, warnings: mlWarnings } = toMapLibre(ast, getField);
  warnings.push(...mlWarnings);

  const parsed = ast;
  return {
    ast: parsed,
    fields: Array.from(fieldSet),
    expression,
    evaluate: (attrs: Attributes) => evaluate(parsed, attrs),
    warnings,
  };
}
