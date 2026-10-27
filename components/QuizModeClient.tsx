"use client";

import Link from "next/link";
import posthog from "posthog-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { MathText } from "@/components/MathText";
import type { QuizQuestion } from "@/lib/quiz-types";
import { useResolvedDark } from "@/hooks/use-resolved-dark";

type Props = {
  questions: QuizQuestion[];
  courseName: string;
  bankName: string;
  courseId: string;
  bankId: string;
  timeConfig: string;
};

type AnswerMap = Record<number, string>; // questionIndex -> selectedKey

// ─── Timer helpers ────────────────────────────────────────────────────────────

function parseTimeConfig(cfg: string): { mode: "none" | "per" | "total"; seconds: number } {
  if (cfg === "none") return { mode: "none", seconds: 0 };
  if (cfg.startsWith("per_")) return { mode: "per", seconds: parseInt(cfg.split("_")[1], 10) };
  if (cfg.startsWith("total_")) return { mode: "total", seconds: parseInt(cfg.split("_")[1], 10) };
  return { mode: "none", seconds: 0 };
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

// ─── Results Screen ───────────────────────────────────────────────────────────

function ResultsScreen({
  questions,
  answers,
  courseName,
  bankName,
  courseId,
  bankId,
  timeTaken,
  dark,
}: {
  questions: QuizQuestion[];
  answers: AnswerMap;
  courseName: string;
  bankName: string;
  courseId: string;
  bankId: string;
  timeTaken: number;
  dark: boolean;
}) {
  const total = questions.length;
  const correct = questions.filter((q, i) => {
    const sel = answers[i];
    return sel !== undefined && q.answerKey.includes(sel);
  }).length;
  const unanswered = questions.filter((_, i) => answers[i] === undefined).length;
  const wrong = total - correct - unanswered;
  const pct = Math.round((correct / total) * 100);

  const grade =
    pct >= 70 ? { label: "Pass", color: "text-emerald-500" } : { label: "Fail", color: "text-rose-500" };

  const card = dark
    ? "border-zinc-800 bg-zinc-900/60"
    : "border-zinc-200 bg-white/80";

  const subtext = dark ? "text-zinc-400" : "text-zinc-600";

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col items-center justify-start px-4 py-8 sm:py-12 transition-colors ${dark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"
        }`}
    >
      <div className={`w-full max-w-2xl rounded-3xl border px-5 py-8 shadow-sm sm:px-8 ${card}`}>
        {/* Score header */}
        <div className="mb-8 text-center">
          <p className={`text-xs font-medium uppercase tracking-widest mb-1 ${subtext}`}>
            Quiz Complete
          </p>
          <div className="my-4 inline-flex flex-col items-center">
            <span className="text-7xl font-bold tabular-nums tracking-tight">{pct}%</span>
            <span className={`mt-1 text-lg font-semibold ${grade.color}`}>{grade.label}</span>
          </div>
          <p className={`text-sm ${subtext}`}>
            {correct} of {total} correct
            {timeTaken > 0 && ` · ${formatTime(timeTaken)} taken`}
          </p>
        </div>

        {/* Stats row */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          {[
            { label: "Correct", value: correct, color: "text-emerald-500" },
            { label: "Wrong", value: wrong, color: "text-rose-400" },
            { label: "Skipped", value: unanswered, color: "text-zinc-400" },
          ].map((s) => (
            <div
              key={s.label}
              className={`rounded-2xl border px-3 py-4 text-center ${dark ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-zinc-50"
                }`}
            >
              <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
              <p className={`mt-0.5 text-xs ${subtext}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Question review */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Review</p>
          {questions.map((q, i) => {
            const sel = answers[i];
            const isCorrect = sel !== undefined && q.answerKey.includes(sel);
            const skipped = sel === undefined;

            return (
              <div
                key={q.id}
                className={`rounded-2xl border px-4 py-3 ${dark ? "border-zinc-800 bg-zinc-900/40" : "border-zinc-200 bg-white"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 shrink-0 text-xs font-bold ${skipped
                        ? "text-zinc-400"
                        : isCorrect
                          ? "text-emerald-500"
                          : "text-rose-400"
                      }`}
                  >
                    {skipped ? "–" : isCorrect ? "✓" : "✗"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm leading-snug">
                      <MathText text={q.question} />
                    </div>
                    {!skipped && (
                      <p
                        className={`mt-1 text-xs ${isCorrect ? "text-emerald-500" : "text-rose-400"
                          }`}
                      >
                        Your answer: {sel}. <MathText text={q.options[sel]} />
                      </p>
                    )}
                    {(!isCorrect || skipped) && (
                      <p className="mt-0.5 text-xs text-emerald-500">
                        Correct:{" "}
                        {q.answerKey.map((k, idx) => (
                          <span key={k}>
                            {idx > 0 ? " · " : ""}
                            {k}. <MathText text={q.options[k]} />
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/courses/${courseId}/${bankId}/setup`}
            className="btn-auth-primary flex-1 py-2.5 text-center text-sm font-semibold"
          >
            Try Again
          </Link>
          <Link
            href={`/courses/${courseId}`}
            className={`flex-1 rounded-lg border py-2.5 text-center text-sm font-medium transition-colors ${dark
                ? "border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800"
                : "border-zinc-300 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
              }`}
          >
            Back to Banks
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function QuizModeClient({
  questions,
  courseName,
  bankName,
  courseId,
  bankId,
  timeConfig,
}: Props) {
  const totalQuestions = questions.length;
  const timeCfg = useMemo(() => parseTimeConfig(timeConfig), [timeConfig]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);

  // Per-question timer (resets on navigation)
  const [perSecondsLeft, setPerSecondsLeft] = useState(
    timeCfg.mode === "per" ? timeCfg.seconds : 0,
  );
  // Total timer
  const [totalSecondsLeft, setTotalSecondsLeft] = useState(
    timeCfg.mode === "total" ? timeCfg.seconds : 0,
  );

  const startTime = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = questions[index];
  const selectedOption = answers[index] ?? null;
  const answeredCount = Object.keys(answers).length;

  const dark = useResolvedDark();

  // ── Submit quiz ──
  const handleSubmit = useCallback(
    (fromTimer = false) => {
      if (submitted) return;
      setSubmitted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      const elapsed = Math.round((Date.now() - startTime.current) / 1000);
      setTimeTaken(elapsed);

      const correct = questions.filter((q, i) => {
        const sel = answers[i];
        return sel !== undefined && q.answerKey.includes(sel);
      }).length;

      posthog.capture("quiz_completed", {
        course_id: courseId,
        bank_id: bankId,
        mode: "quiz",
        total_questions: totalQuestions,
        answered: Object.keys(answers).length,
        correct,
        score_pct: Math.round((correct / totalQuestions) * 100),
        time_config: timeConfig,
        time_taken_seconds: elapsed,
        timed_out: fromTimer,
      });
    },
    [submitted, questions, answers, courseId, bankId, totalQuestions, timeConfig],
  );

  // ── Timers ──
  useEffect(() => {
    if (submitted) return;

    if (timeCfg.mode === "total") {
      timerRef.current = setInterval(() => {
        setTotalSecondsLeft((prev) => {
          if (prev <= 1) {
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeCfg.mode, submitted, handleSubmit]);

  // Per-question timer — reset when index changes
  useEffect(() => {
    if (submitted || timeCfg.mode !== "per") return;
    setPerSecondsLeft(timeCfg.seconds);

    const id = setInterval(() => {
      setPerSecondsLeft((prev) => {
        if (prev <= 1) {
          // Auto-advance to next question or submit
          clearInterval(id);
          setIndex((cur) => {
            if (cur >= totalQuestions - 1) {
              handleSubmit(true);
              return cur;
            }
            return cur + 1;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, submitted]);

  const handleSelect = (key: string) => {
    if (submitted) return;
    if (selectedOption === key) return;
    const isRevision = selectedOption !== null;
    setAnswers((prev) => ({ ...prev, [index]: key }));
    const isCorrect = currentQuestion.answerKey.includes(key);
    posthog.capture("quiz_answer_submitted", {
      course_id: courseId,
      bank_id: bankId,
      mode: "quiz",
      question_id: currentQuestion.id,
      selected_option: key,
      is_correct: isCorrect,
      question_index: index,
      total_questions: totalQuestions,
      time_config: timeConfig,
      is_revision: isRevision,
    });
  };

  const navigate = (next: number) => {
    setIndex(Math.max(0, Math.min(totalQuestions - 1, next)));
  };

  const handlePrev = () => navigate(index - 1);
  const handleNext = () => navigate(index + 1);

  // Keyboard nav: ← → (match Practice mode)
  useEffect(() => {
    if (submitted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowLeft") {
        setIndex((p) => Math.max(0, p - 1));
      }
      if (e.key === "ArrowRight") {
        setIndex((p) => Math.min(totalQuestions - 1, p + 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submitted, totalQuestions]);

  const showPerTimer = timeCfg.mode === "per" && !submitted;
  const showTotalTimer = timeCfg.mode === "total" && !submitted;
  const timerUrgent =
    (timeCfg.mode === "per" && perSecondsLeft <= 5) ||
    (timeCfg.mode === "total" && totalSecondsLeft <= 30);

  const bg = dark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900";
  const card = dark ? "border-zinc-800 bg-zinc-900/60" : "border-zinc-200 bg-white/80";
  const subtext = dark ? "text-zinc-400" : "text-zinc-600";

  if (submitted) {
    return (
      <ResultsScreen
        questions={questions}
        answers={answers}
        courseName={courseName}
        bankName={bankName}
        courseId={courseId}
        bankId={bankId}
        timeTaken={timeTaken}
        dark={dark}
      />
    );
  }

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-6 transition-colors sm:py-12 ${bg}`}
    >
      <main
        className={`flex w-full max-w-2xl flex-col gap-6 overflow-y-auto rounded-3xl border px-5 py-6 shadow-sm transition-colors sm:px-8 sm:py-8 ${card}`}
      >
        {/* ── Top bar ── */}
        <div className="flex items-center justify-start gap-4">
          <Link
            href={`/courses/${courseId}/${bankId}/setup`}
            className={`text-xs transition-colors hover:underline ${dark ? "text-zinc-500 hover:text-[#e8d5a0]" : "text-zinc-500 hover:text-[#8a6a14]"
              }`}
          >
            ← Exit Quiz
          </Link>
        </div>

        {/* ── Meta + progress (match Practice layout) ── */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <div className="min-w-0">
              <p className={`text-xs ${dark ? "text-zinc-400" : "text-zinc-500"}`}>{courseName}</p>
              <h1 className="mt-0.5 text-base font-semibold tracking-tight sm:text-lg">{bankName}</h1>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              {showTotalTimer && (
                <span
                  className={`tabular-nums text-xs font-semibold ${timerUrgent
                      ? "text-rose-400"
                      : dark
                        ? "text-zinc-300"
                        : "text-zinc-700"
                    }`}
                >
                  {formatTime(totalSecondsLeft)}
                </span>
              )}
              {showPerTimer && (
                <span
                  className={`tabular-nums text-xs font-semibold ${timerUrgent ? "text-rose-400" : subtext}`}
                >
                  {formatTime(perSecondsLeft)} <span className="font-normal opacity-80">this question</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`h-1 flex-1 overflow-hidden rounded-full ${dark ? "bg-zinc-800" : "bg-zinc-200"}`}
            >
              <div
                className="h-full rounded-full bg-[#c9a84c] transition-all duration-300"
                style={{ width: `${((index + 1) / totalQuestions) * 100}%` }}
              />
            </div>
            <QuestionJumper
              index={index}
              total={totalQuestions}
              onJump={navigate}
              dark={dark}
            />
          </div>

          <p className={`text-xs ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
            {answeredCount} answered · {totalQuestions - answeredCount} remaining
          </p>
        </div>

        {/* ── Question ── */}
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Question {currentQuestion.id}
          </p>
          <div className="text-base font-medium leading-relaxed sm:text-lg">
            <MathText text={currentQuestion.question} />
          </div>
        </div>

        {/* ── Options — no feedback shown ── */}
        <div className="space-y-2.5">
          {Object.entries(currentQuestion.options)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, label]) => {
              const isSelected = selectedOption === key;

              let cls =
                "w-full rounded-2xl border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]/60 sm:text-base";

              if (isSelected) {
                cls +=
                  dark
                    ? " border-[#c9a84c]/80 bg-[#2a2410] text-[#f0dda0]"
                    : " border-[#c9a84c] bg-[#fff8e7] text-[#8a6a14]";
              } else {
                cls +=
                  dark
                    ? " border-zinc-700 bg-zinc-900/80 hover:border-[#c9a84c]/50 hover:bg-zinc-800"
                    : " border-zinc-200 bg-white hover:border-[#c9a84c]/50 hover:bg-[#fff8e7]/60";
              }

              return (
                <button key={key} type="button" onClick={() => handleSelect(key)} className={cls}>
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

        {/* ── Nav footer ── */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <NavButton onClick={handlePrev} disabled={index === 0} dark={dark}>
            <span aria-hidden>←</span>
            <span>Prev</span>
          </NavButton>

          {index === totalQuestions - 1 ? (
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="btn-auth-primary px-5 py-2 text-sm font-semibold"
            >
              Submit Quiz
            </button>
          ) : (
            <NavButton onClick={handleNext} disabled={false} dark={dark}>
              <span>Next</span>
              <span aria-hidden>→</span>
            </NavButton>
          )}
        </div>

        {index < totalQuestions - 1 && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className={`text-xs underline underline-offset-2 transition-colors ${dark ? "text-zinc-400 hover:text-[#e8d5a0]" : "text-zinc-600 hover:text-[#8a6a14]"
                }`}
            >
              Submit early ({answeredCount}/{totalQuestions} answered)
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── QuestionJumper (same pattern as Practice mode) ─────────────────────────────

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
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commit(displayValue);
            inputRef.current?.blur();
          }
        }}
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

// ─── NavButton (match Practice mode) ──────────────────────────────────────────

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
