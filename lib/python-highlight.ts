export type PythonTokenType =
  | "keyword"
  | "builtin"
  | "function"
  | "string"
  | "number"
  | "comment"
  | "operator"
  | "punct"
  | "self"
  | "plain";

export type PythonToken = {
  type: PythonTokenType;
  value: string;
};

const KEYWORDS = new Set([
  "False",
  "None",
  "True",
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "try",
  "while",
  "with",
  "yield",
]);

const BUILTINS = new Set([
  "abs",
  "bool",
  "dict",
  "enumerate",
  "filter",
  "float",
  "format",
  "id",
  "input",
  "int",
  "isinstance",
  "len",
  "list",
  "map",
  "max",
  "min",
  "open",
  "pow",
  "print",
  "range",
  "reversed",
  "round",
  "set",
  "sorted",
  "str",
  "sum",
  "super",
  "tuple",
  "type",
  "zip",
]);

const TWO_CHAR_OPERATORS = new Set([
  "**",
  "//",
  "<<",
  ">>",
  "==",
  "!=",
  "<=",
  ">=",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "->",
]);

export function tokenizePython(code: string): PythonToken[] {
  const tokens: PythonToken[] = [];
  let index = 0;

  while (index < code.length) {
    const char = code[index];

    if (char === "#") {
      let end = index + 1;
      while (end < code.length && code[end] !== "\n") end += 1;
      tokens.push({ type: "comment", value: code.slice(index, end) });
      index = end;
      continue;
    }

    if (char === "'" || char === '"') {
      const triple = code.startsWith(char.repeat(3), index);
      const delimiter = triple ? char.repeat(3) : char;
      let end = index + delimiter.length;
      while (end < code.length) {
        if (code[end] === "\\") {
          end += 2;
          continue;
        }
        if (code.startsWith(delimiter, end)) {
          end += delimiter.length;
          break;
        }
        end += 1;
      }
      tokens.push({ type: "string", value: code.slice(index, end) });
      index = end;
      continue;
    }

    if (/[0-9]/.test(char) || (char === "." && /[0-9]/.test(code[index + 1] ?? ""))) {
      let end = index + 1;
      while (end < code.length && /[0-9.]/.test(code[end])) end += 1;
      tokens.push({ type: "number", value: code.slice(index, end) });
      index = end;
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      let end = index + 1;
      while (end < code.length && /[A-Za-z0-9_]/.test(code[end])) end += 1;
      const word = code.slice(index, end);
      let lookAhead = end;
      while (code[lookAhead] === " ") lookAhead += 1;
      const isCall = code[lookAhead] === "(";

      let type: PythonTokenType = "plain";
      if (KEYWORDS.has(word)) type = "keyword";
      else if (word === "self" || word === "cls") type = "self";
      else if (BUILTINS.has(word)) type = "builtin";
      else if (isCall || word.startsWith("__")) type = "function";

      tokens.push({ type, value: word });
      index = end;
      continue;
    }

    const two = code.slice(index, index + 2);
    if (TWO_CHAR_OPERATORS.has(two)) {
      tokens.push({ type: "operator", value: two });
      index += 2;
      continue;
    }

    if ("+-*/%=<>!&|^~@".includes(char)) {
      tokens.push({ type: "operator", value: char });
      index += 1;
      continue;
    }

    if ("()[]{}:,.;".includes(char)) {
      tokens.push({ type: "punct", value: char });
      index += 1;
      continue;
    }

    tokens.push({ type: "plain", value: char });
    index += 1;
  }

  return tokens;
}

export function splitPythonLines(tokens: PythonToken[]): PythonToken[][] {
  const lines: PythonToken[][] = [[]];

  for (const token of tokens) {
    const parts = token.value.split("\n");
    parts.forEach((part, partIndex) => {
      if (partIndex > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ type: token.type, value: part });
    });
  }

  return lines;
}
