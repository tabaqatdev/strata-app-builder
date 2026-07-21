/**
 * lexer — tokenize an Arcade-subset source string.
 *
 * Recognizes: numbers, single/double-quoted strings, identifiers (incl. the `$feature` sigil),
 * the `.` and `[...]` member accessors, arithmetic/comparison/logical operators, parens and commas.
 * Anything else is a lexing error the parser surfaces as a fall-back warning (no silent wrong answers).
 */

export type TokenType =
  | "number"
  | "string"
  | "ident"
  | "dollar" // $feature
  | "op"
  | "lparen"
  | "rparen"
  | "lbracket"
  | "rbracket"
  | "dot"
  | "comma"
  | "eof";

export interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

// Multi-char operators must be tried before their single-char prefixes.
const OPERATORS = ["<=", ">=", "==", "!=", "<>", "&&", "||", "+", "-", "*", "/", "%", "<", ">", "!"];

export function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = src.length;

  const isIdentStart = (c: string) => /[A-Za-z_]/.test(c);
  const isIdentPart = (c: string) => /[A-Za-z0-9_]/.test(c);
  const isDigit = (c: string) => /[0-9]/.test(c);

  while (i < n) {
    const c = src[i];

    // whitespace
    if (/\s/.test(c)) {
      i++;
      continue;
    }

    // $feature sigil
    if (c === "$") {
      let j = i + 1;
      while (j < n && isIdentPart(src[j])) j++;
      tokens.push({ type: "dollar", value: src.slice(i, j), pos: i });
      i = j;
      continue;
    }

    // number (int or float)
    if (isDigit(c) || (c === "." && isDigit(src[i + 1] || ""))) {
      let j = i;
      while (j < n && (isDigit(src[j]) || src[j] === ".")) j++;
      tokens.push({ type: "number", value: src.slice(i, j), pos: i });
      i = j;
      continue;
    }

    // string literal
    if (c === '"' || c === "'") {
      const quote = c;
      let j = i + 1;
      let out = "";
      while (j < n && src[j] !== quote) {
        if (src[j] === "\\" && j + 1 < n) {
          out += src[j + 1];
          j += 2;
        } else {
          out += src[j];
          j++;
        }
      }
      if (j >= n) throw new Error(`unterminated string at ${i}`);
      tokens.push({ type: "string", value: out, pos: i });
      i = j + 1;
      continue;
    }

    // identifier / function name
    if (isIdentStart(c)) {
      let j = i;
      while (j < n && isIdentPart(src[j])) j++;
      tokens.push({ type: "ident", value: src.slice(i, j), pos: i });
      i = j;
      continue;
    }

    if (c === "(") {
      tokens.push({ type: "lparen", value: c, pos: i });
      i++;
      continue;
    }
    if (c === ")") {
      tokens.push({ type: "rparen", value: c, pos: i });
      i++;
      continue;
    }
    if (c === "[") {
      tokens.push({ type: "lbracket", value: c, pos: i });
      i++;
      continue;
    }
    if (c === "]") {
      tokens.push({ type: "rbracket", value: c, pos: i });
      i++;
      continue;
    }
    if (c === ".") {
      tokens.push({ type: "dot", value: c, pos: i });
      i++;
      continue;
    }
    if (c === ",") {
      tokens.push({ type: "comma", value: c, pos: i });
      i++;
      continue;
    }

    // operators
    const op = OPERATORS.find((o) => src.startsWith(o, i));
    if (op) {
      tokens.push({ type: "op", value: op, pos: i });
      i += op.length;
      continue;
    }

    throw new Error(`unexpected character '${c}' at ${i}`);
  }

  tokens.push({ type: "eof", value: "", pos: n });
  return tokens;
}
