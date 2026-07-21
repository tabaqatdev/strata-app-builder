/** ast — node types for the Arcade-subset expression tree. */

export type Node =
  | NumberLit
  | StringLit
  | BoolLit
  | FieldAccess
  | Unary
  | Binary
  | Logical
  | Call;

export interface NumberLit {
  kind: "number";
  value: number;
}
export interface StringLit {
  kind: "string";
  value: string;
}
export interface BoolLit {
  kind: "bool";
  value: boolean;
}
/** `$feature.FIELD` or `$feature["FIELD"]`. */
export interface FieldAccess {
  kind: "field";
  name: string;
}
export interface Unary {
  kind: "unary";
  op: "-" | "!";
  arg: Node;
}
export interface Binary {
  kind: "binary";
  op: "+" | "-" | "*" | "/" | "%" | "<" | ">" | "<=" | ">=" | "==" | "!=";
  left: Node;
  right: Node;
}
export interface Logical {
  kind: "logical";
  op: "&&" | "||";
  left: Node;
  right: Node;
}
/** A function call: `When(...)`, `Iif(...)`, `Decode(...)`, `Round(...)`, `Text(...)`, etc. */
export interface Call {
  kind: "call";
  name: string; // lower-cased
  args: Node[];
}
