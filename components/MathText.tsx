"use client";

import { Fragment } from "react";
import { InlineMath } from "react-katex";
import { PythonCodeBlock, PythonInlineCode } from "@/components/PythonCode";
import { cn } from "@/lib/utils";

type MathTextProps = {
  text: string;
  className?: string;
};

type Segment = {
  kind: "text" | "math" | "code" | "inline";
  value: string;
};

const INLINE_MATH_PATTERN = /(?<!\\)\$(.+?)(?<!\\)\$/g;
const FENCE_PATTERN = /```(?:python)?\n([\s\S]*?)```/g;
const INLINE_CODE_PATTERN = /`([^`\n]+)`/g;

function parseMath(text: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  INLINE_MATH_PATTERN.lastIndex = 0;
  while ((match = INLINE_MATH_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ kind: "math", value: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ kind: "text", value: text.slice(lastIndex) });
  }

  return segments;
}

function parseInline(text: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  INLINE_CODE_PATTERN.lastIndex = 0;
  while ((match = INLINE_CODE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push(...parseMath(text.slice(lastIndex, match.index)));
    }
    segments.push({ kind: "inline", value: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push(...parseMath(text.slice(lastIndex)));
  }

  return segments;
}

function parseRichText(text: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  FENCE_PATTERN.lastIndex = 0;
  while ((match = FENCE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push(...parseInline(text.slice(lastIndex, match.index).replace(/\s+$/, "")));
    }
    segments.push({ kind: "code", value: match[1].replace(/\n$/, "") });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push(...parseInline(text.slice(lastIndex)));
  }

  return segments.filter((segment) => segment.kind !== "text" || segment.value.length > 0);
}

export function MathText({ text, className }: MathTextProps) {
  const segments = parseRichText(text);
  const hasBlock = segments.some((segment) => segment.kind === "code");
  const Wrapper = hasBlock ? "div" : "span";

  return (
    <Wrapper className={cn(!hasBlock && "whitespace-pre-wrap", className)}>
      {segments.map((segment, index) => {
        if (segment.kind === "code") {
          return <PythonCodeBlock key={`code-${index}`} code={segment.value} />;
        }

        if (segment.kind === "inline") {
          return <PythonInlineCode key={`inline-${index}`} code={segment.value} />;
        }

        if (segment.kind === "math") {
          return <InlineMath key={`math-${index}`} math={segment.value} />;
        }

        return <Fragment key={`text-${index}`}>{segment.value}</Fragment>;
      })}
    </Wrapper>
  );
}
