/**
 * toMapLibre — compile an Arcade-subset AST to a MapLibre expression (for renderer `valueExpression`).
 *
 * Returns `null` when the AST uses a construct with no faithful MapLibre analogue (e.g. `Decode` with
 * non-literal keys) — the caller then falls back to computing a virtual field at load time. No silent
 * wrong answers: every fall-back is reported through `warnings`.
 *
 * `getField` lets the caller inject case-tolerant field access (core-map wraps fields in a `coalesce`
 * over case variants); by default a plain `["get", name]` is emitted.
 */

import type { Node } from "./ast.js";

export type MapLibreExpr = unknown;
type FieldGetter = (name: string) => MapLibreExpr;

const defaultGetField: FieldGetter = (name) => ["get", name];

export interface ToMapLibreResult {
  expression: MapLibreExpr | null;
  warnings: string[];
}

export function toMapLibre(node: Node, getField: FieldGetter = defaultGetField): ToMapLibreResult {
  const warnings: string[] = [];

  function isLiteral(n: Node): boolean {
    return n.kind === "number" || n.kind === "string" || n.kind === "bool";
  }

  function visit(n: Node): MapLibreExpr | null {
    switch (n.kind) {
      case "number":
      case "string":
      case "bool":
        return n.value;
      case "field":
        return getField(n.name);
      case "unary": {
        const a = visit(n.arg);
        if (a === null) return null;
        if (n.op === "-") return ["*", -1, a];
        return ["!", a];
      }
      case "logical": {
        const l = visit(n.left);
        const r = visit(n.right);
        if (l === null || r === null) return null;
        return [n.op === "&&" ? "all" : "any", l, r];
      }
      case "binary": {
        const l = visit(n.left);
        const r = visit(n.right);
        if (l === null || r === null) return null;
        return [n.op, l, r];
      }
      case "call":
        return visitCall(n.name, n.args);
    }
  }

  function visitCall(name: string, args: Node[]): MapLibreExpr | null {
    const parts = args.map(visit);
    if (parts.some((p) => p === null)) return null;

    switch (name) {
      case "iif":
        return ["case", parts[0], parts[1], parts[2]];
      case "when": {
        // When(c1, r1, ..., default) → ["case", c1, r1, ..., default]
        if (args.length % 2 !== 1) {
          warnings.push("When() without a default has no MapLibre equivalent");
          return null;
        }
        return ["case", ...parts];
      }
      case "decode": {
        // Decode(value, k1, v1, ..., default) → ["match", value, k1, v1, ..., default]
        // MapLibre `match` labels must be literals.
        const keysAreLiterals = args.slice(1, args.length - 1).every((a, i) => (i % 2 === 0 ? isLiteral(a) : true));
        if (args.length % 2 !== 0 || !keysAreLiterals) {
          warnings.push("Decode() with non-literal keys cannot compile to MapLibre match");
          return null;
        }
        return ["match", ...parts];
      }
      case "round": {
        const digits = args.length > 1 && args[1].kind === "number" ? args[1].value : 0;
        if (digits === 0) return ["round", parts[0]];
        const f = Math.pow(10, digits);
        return ["/", ["round", ["*", parts[0], f]], f];
      }
      case "floor":
        return ["floor", parts[0]];
      case "ceil":
        return ["ceil", parts[0]];
      case "abs":
        return ["abs", parts[0]];
      case "sqrt":
        return ["sqrt", parts[0]];
      case "pow":
        return ["^", parts[0], parts[1]];
      case "text":
        return ["to-string", parts[0]];
      case "upper":
        return ["upcase", ["to-string", parts[0]]];
      case "lower":
        return ["downcase", ["to-string", parts[0]]];
      case "concat":
      case "concatenate":
        return ["concat", ...parts.map((p) => ["to-string", p])];
      default:
        warnings.push(`Arcade function '${name}()' has no MapLibre equivalent`);
        return null;
    }
  }

  const expression = visit(node);
  return { expression, warnings };
}
