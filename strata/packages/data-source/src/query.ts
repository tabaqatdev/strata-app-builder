/**
 * Pure, node-safe query helpers: a small SQL-`where` evaluator and an aggregate engine over plain rows.
 *
 * The evaluator covers exactly the subset strata's WIF emits (`categoryWhere`/`rangeWhere` — equality,
 * comparisons, `IN`, `BETWEEN`) joined by `AND`/`OR`, plus `IS NULL`/`IS NOT NULL`. It is deliberately
 * flat (no nested parentheses): enough to filter an in-memory view deterministically without a SQL engine.
 * Network-backed sources bypass this by injecting a `queryFn`.
 */
import type { Row, StatDefinition, StatResult } from "./types.js";

type Cmp = "=" | "<>" | "!=" | ">=" | "<=" | ">" | "<";

const CMP: Cmp[] = [">=", "<=", "<>", "!=", "=", ">", "<"];

/** Parse a scalar literal: `'text'` → string (unescaping `''`), numeric → number, NULL → null. */
function literal(raw: string): unknown {
  const s = raw.trim();
  if (/^null$/i.test(s)) return null;
  if (s.startsWith("'") && s.endsWith("'")) return s.slice(1, -1).replace(/''/g, "'");
  const n = Number(s);
  return Number.isNaN(n) ? s : n;
}

function coerce(a: unknown, b: unknown): [unknown, unknown] {
  if (typeof a === "number" && typeof b === "string") {
    const n = Number(b);
    if (!Number.isNaN(n)) return [a, n];
  }
  if (typeof b === "number" && typeof a === "string") {
    const n = Number(a);
    if (!Number.isNaN(n)) return [n, b];
  }
  return [a, b];
}

function compare(left: unknown, op: Cmp, rightRaw: string): boolean {
  const [l, r] = coerce(left, literal(rightRaw));
  switch (op) {
    case "=":
      return l === r;
    case "<>":
    case "!=":
      return l !== r;
    case ">":
      return (l as number) > (r as number);
    case "<":
      return (l as number) < (r as number);
    case ">=":
      return (l as number) >= (r as number);
    case "<=":
      return (l as number) <= (r as number);
    default:
      return false;
  }
}

/** Evaluate a single predicate (no AND/OR) against a row. Unknown forms return true (permissive). */
function evalPredicate(pred: string, row: Row): boolean {
  const p = pred.trim();
  if (!p) return true;

  // IS [NOT] NULL
  const isNull = /^(.+?)\s+is\s+(not\s+)?null$/i.exec(p);
  if (isNull) {
    const field = isNull[1].trim();
    const v = row[field];
    const nullish = v === null || v === undefined;
    return isNull[2] ? !nullish : nullish;
  }

  // IN ( ... )
  const inMatch = /^(.+?)\s+in\s*\((.*)\)$/i.exec(p);
  if (inMatch) {
    const field = inMatch[1].trim();
    const set = inMatch[2].split(",").map((x) => literal(x));
    const [lv] = [row[field]];
    return set.some((val) => {
      const [a, b] = coerce(lv, val);
      return a === b;
    });
  }

  // comparisons
  for (const op of CMP) {
    const i = p.indexOf(op);
    if (i > 0) {
      const field = p.slice(0, i).trim();
      const rhs = p.slice(i + op.length).trim();
      return compare(row[field], op, rhs);
    }
  }
  return true;
}

/** Expand `X BETWEEN a AND b` → `X >= a AND X <= b` so the AND-split below is unambiguous. */
function expandBetween(where: string): string {
  return where.replace(
    /(\S+)\s+between\s+(.+?)\s+and\s+(.+?)(?=(\s+and\s+|\s+or\s+|$))/gi,
    (_m, field, lo, hi) => `${field} >= ${lo} AND ${field} <= ${hi}`,
  );
}

/**
 * Evaluate a flat `where` (AND/OR, no parentheses) against a row.
 * OR has lowest precedence; each OR-term is a conjunction of predicates.
 */
export function matchesWhere(where: string | undefined | null, row: Row): boolean {
  if (!where || !where.trim()) return true;
  const expanded = expandBetween(where);
  const orTerms = expanded.split(/\s+or\s+/i);
  return orTerms.some((term) =>
    term.split(/\s+and\s+/i).every((pred) => evalPredicate(pred, row)),
  );
}

/** Filter rows by a `where` clause (returns a new array). */
export function applyWhere(rows: Row[], where: string | undefined | null): Row[] {
  if (!where || !where.trim()) return rows.slice();
  return rows.filter((r) => matchesWhere(where, r));
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isNaN(n) ? 0 : n;
}

function aggregate(rows: Row[], def: StatDefinition): number {
  if (def.op === "count") return rows.length;
  const vals = rows.map((r) => num(r[def.field]));
  if (vals.length === 0) return 0;
  switch (def.op) {
    case "sum":
      return vals.reduce((a, b) => a + b, 0);
    case "avg":
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    case "min":
      return Math.min(...vals);
    case "max":
      return Math.max(...vals);
    default:
      return 0;
  }
}

/** Compute aggregates over rows; a `groupBy` on any definition produces one row per distinct group. */
export function computeStatistics(rows: Row[], defs: StatDefinition[]): StatResult {
  const groupBy = defs.find((d) => d.groupBy)?.groupBy;
  const outName = (d: StatDefinition) => d.alias ?? `${d.op}_${d.field}`;

  if (!groupBy) {
    const row: Row = {};
    for (const d of defs) row[outName(d)] = aggregate(rows, d);
    return { rows: [row] };
  }

  const groups = new Map<unknown, Row[]>();
  for (const r of rows) {
    const key = r[groupBy];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }
  const out: Row[] = [];
  for (const [key, groupRows] of groups) {
    const row: Row = { [groupBy]: key };
    for (const d of defs) row[outName(d)] = aggregate(groupRows, d);
    out.push(row);
  }
  return { rows: out };
}
