import { tokenizePython, splitPythonLines, type PythonTokenType } from "@/lib/python-highlight";
import { cn } from "@/lib/utils";

const TOKEN_CLASS: Record<PythonTokenType, string> = {
  keyword: "text-violet-700 dark:text-violet-300",
  builtin: "text-sky-700 dark:text-sky-300",
  function: "text-blue-700 dark:text-blue-300",
  string: "text-emerald-700 dark:text-emerald-300",
  number: "text-amber-700 dark:text-amber-300",
  comment: "italic text-zinc-500",
  operator: "text-rose-600 dark:text-rose-300",
  punct: "text-zinc-500 dark:text-zinc-400",
  self: "italic text-violet-700 dark:text-violet-300",
  plain: "",
};

function TokenText({ code }: { code: string }) {
  const tokens = tokenizePython(code);
  return (
    <>
      {tokens.map((token, index) => (
        <span key={index} className={TOKEN_CLASS[token.type]}>
          {token.value}
        </span>
      ))}
    </>
  );
}

export function PythonInlineCode({ code }: { code: string }) {
  return (
    <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-[family-name:var(--font-geist-mono),ui-monospace,monospace] text-[0.92em] font-normal text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
      <TokenText code={code} />
    </code>
  );
}

export function PythonCodeBlock({ code }: { code: string }) {
  const lines = splitPythonLines(tokenizePython(code.replace(/\n$/, "")));
  const showNumbers = lines.length > 1;

  return (
    <pre className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 font-[family-name:var(--font-geist-mono),ui-monospace,monospace] text-[13px] font-normal leading-6 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-100">
      <code>
        {lines.map((line, lineIndex) => (
          <span key={lineIndex} className="grid grid-cols-[auto_1fr]">
            {showNumbers && (
              <span className="select-none pr-4 text-right text-zinc-400 tabular-nums">
                {lineIndex + 1}
              </span>
            )}
            <span className={cn("whitespace-pre", showNumbers && "min-w-0")}>
              {line.length === 0
                ? " "
                : line.map((token, tokenIndex) => (
                    <span key={tokenIndex} className={TOKEN_CLASS[token.type]}>
                      {token.value}
                    </span>
                  ))}
            </span>
          </span>
        ))}
      </code>
    </pre>
  );
}
