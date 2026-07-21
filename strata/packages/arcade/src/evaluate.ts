/**
 * evaluate — interpret an Arcade-subset AST against a feature's attributes → a scalar value.
 * Used by popups (`expressionInfos`) where a concrete computed value is wanted, not a map expression.
 */

import type { Node } from "./ast.js";

export type Attributes = Record<string, unknown>;

/** Case-tolerant attribute lookup (ArcGIS GeoJSON responses may lower-case keys). */
function lookup(attrs: Attributes, name: string): unknown {
  if (name in attrs) return attrs[name];
  const lower = name.toLowerCase();
  for (const k of Object.keys(attrs)) {
    if (k.toLowerCase() === lower) return attrs[k];
  }
  return undefined;
}

function toNum(v: unknown): number {
  return typeof v === "number" ? v : Number(v);
}

function truthy(v: unknown): boolean {
  return v === true || (typeof v === "number" && v !== 0) || (typeof v === "string" && v.length > 0);
}

export function evaluate(node: Node, attrs: Attributes): unknown {
  switch (node.kind) {
    case "number":
    case "string":
    case "bool":
      return node.value;
    case "field":
      return lookup(attrs, node.name);
    case "unary": {
      const v = evaluate(node.arg, attrs);
      return node.op === "-" ? -toNum(v) : !truthy(v);
    }
    case "logical": {
      const l = evaluate(node.left, attrs);
      if (node.op === "&&") return truthy(l) ? truthy(evaluate(node.right, attrs)) : false;
      return truthy(l) ? true : truthy(evaluate(node.right, attrs));
    }
    case "binary": {
      const l = evaluate(node.left, attrs);
      const r = evaluate(node.right, attrs);
      switch (node.op) {
        case "+":
          // Arcade `+` concatenates when either side is a string.
          if (typeof l === "string" || typeof r === "string") return String(l ?? "") + String(r ?? "");
          return toNum(l) + toNum(r);
        case "-":
          return toNum(l) - toNum(r);
        case "*":
          return toNum(l) * toNum(r);
        case "/":
          return toNum(l) / toNum(r);
        case "%":
          return toNum(l) % toNum(r);
        case "<":
          return toNum(l) < toNum(r);
        case ">":
          return toNum(l) > toNum(r);
        case "<=":
          return toNum(l) <= toNum(r);
        case ">=":
          return toNum(l) >= toNum(r);
        case "==":
          return l === r;
        case "!=":
          return l !== r;
      }
      return undefined;
    }
    case "call":
      return evalCall(node.name, node.args, attrs);
  }
}

function evalCall(name: string, args: Node[], attrs: Attributes): unknown {
  const ev = (i: number) => evaluate(args[i], attrs);
  switch (name) {
    case "iif":
      return truthy(ev(0)) ? ev(1) : ev(2);
    case "when": {
      // When(c1, r1, c2, r2, ..., default) — odd arg count, last is default.
      for (let i = 0; i + 1 < args.length; i += 2) {
        if (truthy(ev(i))) return ev(i + 1);
      }
      return args.length % 2 === 1 ? ev(args.length - 1) : undefined;
    }
    case "decode": {
      // Decode(value, k1, v1, k2, v2, ..., default)
      const value = ev(0);
      for (let i = 1; i + 1 < args.length; i += 2) {
        if (ev(i) === value) return ev(i + 1);
      }
      return args.length % 2 === 0 ? ev(args.length - 1) : undefined;
    }
    case "round": {
      const n = toNum(ev(0));
      const digits = args.length > 1 ? toNum(ev(1)) : 0;
      const f = Math.pow(10, digits);
      return Math.round(n * f) / f;
    }
    case "floor":
      return Math.floor(toNum(ev(0)));
    case "ceil":
      return Math.ceil(toNum(ev(0)));
    case "abs":
      return Math.abs(toNum(ev(0)));
    case "sqrt":
      return Math.sqrt(toNum(ev(0)));
    case "pow":
      return Math.pow(toNum(ev(0)), toNum(ev(1)));
    case "text":
      return String(ev(0) ?? "");
    case "concatenate":
    case "concat": {
      // last string arg may be a separator in Arcade's Concatenate(arr, sep); here treat all as pieces.
      return args.map((_, i) => String(ev(i) ?? "")).join("");
    }
    case "upper":
      return String(ev(0) ?? "").toUpperCase();
    case "lower":
      return String(ev(0) ?? "").toLowerCase();
    case "defaultvalue": {
      const v = ev(0);
      return v === null || v === undefined || v === "" ? ev(1) : v;
    }
    default:
      throw new Error(`unsupported Arcade function '${name}()'`);
  }
}
