"use client";

import { Fragment } from "react";
import { InlineMath } from "react-katex";
import { cn } from "@/lib/utils";

type MathTextProps = {
  text: string;
  className?: string;
};

const INLINE_MATH_PATTERN = /(?<!\\)\$(.+?)(?<!\\)\$/g;
const INLINE_MATH_DETECT = /(?<!\\)\$(.+?)(?<!\\)\$/;

function hasInlineMath(text: string): boolean {
  return INLINE_MATH_DETECT.test(text);
}

function splitByInlineMath(text: string): Array<{ kind: "text" | "math"; value: string }> {
  const segments: Array<{ kind: "text" | "math"; value: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  INLINE_MATH_PATTERN.lastIndex = 0;
  while ((match = INLINE_MATH_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        kind: "text",
        value: text.slice(lastIndex, match.index),
      });
    }

    segments.push({ kind: "math", value: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ kind: "text", value: text.slice(lastIndex) });
  }

  return segments;
}

export function MathText({ text, className }: MathTextProps) {
  const classes = cn("whitespace-pre-wrap", className);

  if (!hasInlineMath(text)) {
    return <span className={classes}>{text}</span>;
  }

  const parts = splitByInlineMath(text);

  return (
    <span className={classes}>
      {parts.map((part, index) => {
        if (part.kind === "text") {
          return <Fragment key={`text-${index}`}>{part.value}</Fragment>;
        }

        return (
          <InlineMath
            key={`math-${index}`}
            math={part.value}
          />
        );
      })}
    </span>
  );
}
