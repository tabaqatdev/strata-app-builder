/**
 * parser — recursive-descent parser for the Arcade subset.
 *
 * Precedence (low → high): || , && , equality , comparison , additive , multiplicative , unary , primary.
 * `$feature.FIELD` / `$feature["FIELD"]` become FieldAccess nodes; `Fn(args)` become Call nodes.
 * Throws on anything outside the subset — callers catch and fall back.
 */

import { tokenize, Token } from "./lexer.js";
import type { Node } from "./ast.js";

export function parse(src: string): Node {
  const tokens = tokenize(src);
  let pos = 0;

  const peek = (): Token => tokens[pos];
  const next = (): Token => tokens[pos++];
  const expect = (type: Token["type"], what: string): Token => {
    const t = peek();
    if (t.type !== type) throw new Error(`expected ${what} but found '${t.value}' at ${t.pos}`);
    return next();
  };

  function parseExpression(): Node {
    return parseLogicalOr();
  }

  function parseLogicalOr(): Node {
    let left = parseLogicalAnd();
    while (peek().type === "op" && peek().value === "||") {
      next();
      left = { kind: "logical", op: "||", left, right: parseLogicalAnd() };
    }
    return left;
  }

  function parseLogicalAnd(): Node {
    let left = parseEquality();
    while (peek().type === "op" && peek().value === "&&") {
      next();
      left = { kind: "logical", op: "&&", left, right: parseEquality() };
    }
    return left;
  }

  function parseEquality(): Node {
    let left = parseComparison();
    while (peek().type === "op" && ["==", "!=", "<>"].includes(peek().value)) {
      const raw = next().value;
      const op = raw === "==" ? "==" : "!="; // `<>` and `!=` are equivalent
      left = { kind: "binary", op, left, right: parseComparison() };
    }
    return left;
  }

  function parseComparison(): Node {
    let left = parseAdditive();
    while (peek().type === "op" && ["<", ">", "<=", ">="].includes(peek().value)) {
      const op = next().value as "<" | ">" | "<=" | ">=";
      left = { kind: "binary", op, left, right: parseAdditive() };
    }
    return left;
  }

  function parseAdditive(): Node {
    let left = parseMultiplicative();
    while (peek().type === "op" && ["+", "-"].includes(peek().value)) {
      const op = next().value as "+" | "-";
      left = { kind: "binary", op, left, right: parseMultiplicative() };
    }
    return left;
  }

  function parseMultiplicative(): Node {
    let left = parseUnary();
    while (peek().type === "op" && ["*", "/", "%"].includes(peek().value)) {
      const op = next().value as "*" | "/" | "%";
      left = { kind: "binary", op, left, right: parseUnary() };
    }
    return left;
  }

  function parseUnary(): Node {
    if (peek().type === "op" && (peek().value === "-" || peek().value === "!")) {
      const op = next().value as "-" | "!";
      return { kind: "unary", op, arg: parseUnary() };
    }
    return parsePrimary();
  }

  function parsePrimary(): Node {
    const t = peek();

    if (t.type === "number") {
      next();
      return { kind: "number", value: Number(t.value) };
    }
    if (t.type === "string") {
      next();
      return { kind: "string", value: t.value };
    }
    if (t.type === "lparen") {
      next();
      const inner = parseExpression();
      expect("rparen", ")");
      return inner;
    }
    if (t.type === "dollar") {
      // $feature.FIELD  or  $feature["FIELD"]
      if (t.value.toLowerCase() !== "$feature") {
        throw new Error(`unsupported profile variable '${t.value}' at ${t.pos}`);
      }
      next();
      if (peek().type === "dot") {
        next();
        const field = expect("ident", "field name");
        return { kind: "field", name: field.value };
      }
      if (peek().type === "lbracket") {
        next();
        const field = expect("string", "quoted field name");
        expect("rbracket", "]");
        return { kind: "field", name: field.value };
      }
      throw new Error(`expected .field or ["field"] after $feature at ${t.pos}`);
    }
    if (t.type === "ident") {
      const name = t.value;
      const lower = name.toLowerCase();
      // boolean / null literals
      if (lower === "true") {
        next();
        return { kind: "bool", value: true };
      }
      if (lower === "false") {
        next();
        return { kind: "bool", value: false };
      }
      // function call
      next();
      if (peek().type !== "lparen") {
        throw new Error(`bare identifier '${name}' is not supported at ${t.pos}`);
      }
      next(); // (
      const args: Node[] = [];
      if (peek().type !== "rparen") {
        args.push(parseExpression());
        while (peek().type === "comma") {
          next();
          args.push(parseExpression());
        }
      }
      expect("rparen", ")");
      return { kind: "call", name: lower, args };
    }

    throw new Error(`unexpected token '${t.value}' at ${t.pos}`);
  }

  const node = parseExpression();
  if (peek().type !== "eof") {
    throw new Error(`unexpected trailing token '${peek().value}' at ${peek().pos}`);
  }
  return node;
}
