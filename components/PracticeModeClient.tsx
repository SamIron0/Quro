"use client";

import Link from "next/link";
import posthog from "posthog-js";
import { useEffect, useMemo, useRef, useState } from "react";

import { MathText } from "@/components/MathText";
import type { QuizQuestion } from "@/lib/quiz-types";
import { useResolvedDark } from "@/hooks/use-resolved-dark";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  questions: QuizQuestion[];
  courseName: string;
  bankName: string;
  courseId: string;
  bankId: string;
};

type OptionState = "idle" | "correct" | "wrong" | "reveal";

// ─── Option styling ───────────────────────────────────────────────────────────
// Lookup table beats string concatenation across nested conditionals.

const OPTION_STYLES: Record<OptionState, { light: string; dark: string }> = {
  idle: {
    light: "border-zinc-200 bg-white hover:border-[#c9a84c]/60 hover:bg-[#fff8e7]",
    dark: "border-zinc-700 bg-zinc-900/80 hover:border-[#c9a84c]/60 hover:bg-zinc-800",
  },
  correct: {
    light: "border-emerald-500 bg-emerald-50 text-emerald-900",
    dark: "border-emerald-500 bg-emerald-900/30 text-emerald-100",
  },
  wrong: {
    light: "border-rose-400 bg-rose-50 text-rose-900",
    dark: "border-rose-500 bg-rose-900/30 text-rose-100",
  },
  reveal: {
    light: "border-emerald-400/60 bg-emerald-50/50 opacity-80",
    dark: "border-emerald-500/50 bg-emerald-900/15 opacity-80",
  },
};

function getOptionState(
  key: string,
  selected: string | null,
  correctKeys: string[],
): OptionState {
  if (selected === null) return "idle";
  if (key === selected) return correctKeys.includes(key) ? "correct" : "wrong";
  if (correctKeys.includes(key)) return "reveal";
  return "idle";
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

function readStorage(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function writeStorage(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PracticeModeClient({
  questions,
  courseName,
  bankName,
  courseId,
  bankId,
}: Props) {
  const total = questions.length;
  const indexKey = `qaApp.${courseId}.${bankId}.index`;

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const raw = readStorage(indexKey);
    if (raw !== null) {
      const n = parseInt(raw, 10);
      if (!isNaN(n)) setIndex(Math.max(0, Math.min(total - 1, n)));
    }
  }, [indexKey, total]);

  // Persist position per bank
  useEffect(() => { writeStorage(indexKey, String(index)); }, [index, indexKey]);

  const question = useMemo(() => questions[index], [questions, index]);
  const correctKeys = question?.answerKey ?? [];
  const answered = selected !== null;
  const isCorrect = answered && correctKeys.includes(selected!);

  const navigate = (next: number) => {
    setIndex(Math.max(0, Math.min(total - 1, next)));
    setSelected(null);
  };

  const handleSelect = (key: string) => {
    if (selected === key) return;
    const isRevision = selected !== null;
    setSelected(key);
    posthog.capture("practice_answer_submitted", {
      course_id: courseId,
      bank_id: bankId,
      question_id: question.id,
      selected_option: key,
      is_correct: correctKeys.includes(key),
      question_index: index,
      total_questions: total,
      is_revision: isRevision,
    });
  };

  // Keyboard nav: ← → arrow keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowLeft") navigate(index - 1);
      if (e.key === "ArrowRight") navigate(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const dark = useResolvedDark();

  if (!total || !question) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">No questions found.</p>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-6 transition-colors sm:py-12 ${dark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"
        }`}
    >
      <main
        className={`flex w-full max-w-2xl flex-col gap-6 overflow-y-auto rounded-3xl border px-5 py-6 shadow-sm transition-colors sm:px-8 sm:py-8 ${dark ? "border-zinc-800 bg-zinc-900/60" : "border-zinc-200 bg-white/80"
          }`}
      >
        {/* ── Top bar ── */}
        <div className="flex items-center justify-start gap-4">
          <Link
            href={`/courses/${courseId}/${bankId}/setup`}
            className={`text-xs transition-colors hover:underline ${dark ? "text-zinc-500 hover:text-[#e8d5a0]" : "text-zinc-500 hover:text-[#8a6a14]"
              }`}
          >
            ← Back
          </Link>
        </div>

        {/* ── Meta + progress ── */}
        <div className="space-y-3">
          <div>
            <p className={`text-xs ${dark ? "text-zinc-400" : "text-zinc-500"}`}>{courseName}</p>
            <h1 className="mt-0.5 text-base font-semibold tracking-tight sm:text-lg">{bankName}</h1>
          </div>

          {/* Progress bar + counter */}
          <div className="flex items-center gap-3">
            <div
              className={`h-1 flex-1 overflow-hidden rounded-full ${dark ? "bg-zinc-800" : "bg-zinc-200"}`}
            >
              <div
                className="h-full rounded-full bg-[#c9a84c] transition-all duration-300"
                style={{ width: `${((index + 1) / total) * 100}%` }}
              />
            </div>
            <QuestionJumper
              index={index}
              total={total}
              onJump={navigate}
              dark={dark}
            />
          </div>
        </div>

        {/* ── Question ── */}
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Question {question.id}
          </p>
          <div className="text-base font-medium leading-relaxed sm:text-lg">
            <MathText text={question.question} />
          </div>
        </div>

        {/* ── Options ── */}
        <div className="space-y-2.5">
          {Object.entries(question.options)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, label]) => {
              const state = getOptionState(key, selected, correctKeys);
              const styles = OPTION_STYLES[state][dark ? "dark" : "light"];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelect(key)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]/60 sm:text-base ${styles}`}
                >
                  <span className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${dark ? "border-zinc-600" : "border-zinc-300"
                        }`}
                    >
                      {key}
                    </span>
                    <MathText text={label} className="flex-1" />
                  </span>
                </button>
              );
            })}
        </div>

        {/* ── Feedback ── */}
        {answered && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${isCorrect
                ? dark
                  ? "border-emerald-700/50 bg-emerald-900/20 text-emerald-300"
                  : "border-emerald-300 bg-emerald-50 text-emerald-800"
                : dark
                  ? "border-rose-700/50 bg-rose-900/20 text-rose-300"
                  : "border-rose-300 bg-rose-50 text-rose-800"
              }`}
          >
            <p className="font-semibold">{isCorrect ? "Correct" : "Incorrect"}</p>
            {!isCorrect && (
              <p className={`mt-1 text-xs ${dark ? "text-zinc-400" : "text-zinc-600"}`}>
                {correctKeys.length === 1 ? "Answer" : "Answers"}:{" "}
                {correctKeys.map((k, idx) => (
                  <span key={k}>
                    {idx > 0 ? " · " : ""}
                    {k}. <MathText text={question.options[k]} />
                  </span>
                ))}
              </p>
            )}
          </div>
        )}

        {/* ── Nav footer ── */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <NavButton
            onClick={() => navigate(index - 1)}
            disabled={index === 0}
            dark={dark}
          >
            <span aria-hidden>←</span>
            <span>Prev</span>
          </NavButton>

          {index === total - 1 && answered && (
            <Link
              href={`/courses/${courseId}/${bankId}/setup`}
              className="btn-auth-primary px-5 py-2 text-sm font-semibold"
            >
              Finish
            </Link>
          )}

          <NavButton
            onClick={() => navigate(index + 1)}
            disabled={index === total - 1}
            dark={dark}
          >
            <span>Next</span>
            <span aria-hidden>→</span>
          </NavButton>
        </div>
      </main>
    </div>
  );
}

// ─── QuestionJumper ───────────────────────────────────────────────────────────
// Controlled input that only commits on blur/Enter, avoiding cursor-jump issues.

function QuestionJumper({
  index,
  total,
  onJump,
  dark,
}: {
  index: number;
  total: number;
  onJump: (n: number) => void;
  dark: boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = draft ?? String(index + 1);

  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n)) onJump(n - 1);
    setDraft(null);
  };

  return (
    <span className="flex shrink-0 items-center gap-1 text-xs tabular-nums text-zinc-500">
      <input
        ref={inputRef}
        type="number"
        min={1}
        max={total}
        value={displayValue}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { commit(displayValue); inputRef.current?.blur(); } }}
        aria-label="Jump to question"
        className={`w-12 rounded border py-0.5 text-center text-xs tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${dark
            ? "border-zinc-700 bg-zinc-800 text-zinc-100"
            : "border-zinc-300 bg-zinc-50 text-zinc-900"
          }`}
      />
      <span>/ {total}</span>
    </span>
  );
}

// ─── NavButton ────────────────────────────────────────────────────────────────

function NavButton({
  onClick,
  disabled,
  dark,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  dark: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${disabled
          ? "cursor-not-allowed opacity-30"
          : dark
            ? "border-zinc-700 bg-zinc-900 hover:border-[#c9a84c]/60 hover:bg-zinc-800"
            : "border-zinc-200 bg-white hover:border-[#c9a84c]/50 hover:bg-[#fff8e7]"
        }`}
    >
      {children}
    </button>
  );
}

