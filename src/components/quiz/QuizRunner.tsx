"use client";

import { useState } from "react";
import type { Question } from "@/content/types";
import { recordAnswer } from "@/lib/store";
import { pct } from "@/lib/utils";
import { Button, ProgressBar, RichText } from "@/components/ui";
import QuestionView from "./QuestionView";

type Answer = { q: Question; ok: boolean };

/** Práctica con retroalimentación inmediata y resumen final */
export default function QuizRunner({
  questions,
  onExit,
  onRestart,
}: {
  questions: Question[];
  onExit: () => void;
  onRestart?: () => void;
}) {
  const [list, setList] = useState(questions);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [round, setRound] = useState(0);
  const [answered, setAnswered] = useState(false);

  const done = idx >= list.length;
  const correct = answers.filter((a) => a.ok).length;

  if (list.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="mb-4 text-slate-500">No hay preguntas con este filtro.</p>
        <Button onClick={onExit}>Volver</Button>
      </div>
    );
  }

  if (done) {
    const score = pct(correct, list.length);
    const wrong = answers.filter((a) => !a.ok);
    const msg =
      score >= 90 ? "¡Excelente! Dominas el tema 🏆" : score >= 70 ? "¡Muy bien! Repasa los detalles 💪" : score >= 50 ? "Vas bien, sigue practicando 📚" : "Repasa la lección y vuelve a intentarlo 🔁";
    return (
      <div className="animate-pop space-y-5">
        <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-center text-white shadow-float">
          <div className="dots pointer-events-none absolute inset-0 opacity-50" />
          <p className="relative text-5xl">{score >= 90 ? "🏆" : score >= 70 ? "🎉" : score >= 50 ? "📚" : "💪"}</p>
          <p className="relative mt-1 text-xs font-bold uppercase tracking-widest opacity-80">Resultado</p>
          <p className="relative text-6xl font-extrabold tracking-tight">{score}%</p>
          <p className="relative mt-1 text-sm">
            {correct} de {list.length} correctas
          </p>
          <p className="relative mt-3 font-bold">{msg}</p>
        </div>

        {wrong.length > 0 && (
          <div>
            <h3 className="mb-2 text-lg font-extrabold tracking-tight">Para repasar ({wrong.length})</h3>
            <div className="space-y-2">
              {wrong.map(({ q }) => (
                <details key={q.id} className="rounded-2xl bg-surface p-3.5 shadow-card ring-1 ring-line">
                  <summary className="cursor-pointer text-sm font-medium">
                    <RichText text={q.prompt} />
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    <RichText text={q.explanation} />
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-3">
          {wrong.length > 0 && (
            <Button
              onClick={() => {
                setList(wrong.map((w) => w.q));
                setIdx(0);
                setAnswers([]);
                setRound((r) => r + 1);
                setAnswered(false);
              }}
            >
              🔁 Repetir solo las falladas
            </Button>
          )}
          {onRestart && (
            <Button variant="secondary" onClick={onRestart}>
              Nueva ronda
            </Button>
          )}
          <Button variant="ghost" onClick={onExit}>
            Salir
          </Button>
        </div>
      </div>
    );
  }

  const q = list[idx];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onExit} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-muted shadow-card ring-1 ring-line active:scale-95" aria-label="Salir">
          ✕
        </button>
        <ProgressBar value={pct(idx, list.length)} size="lg" color="bg-gradient-to-r from-indigo-500 to-violet-500" />
        <span className="shrink-0 text-xs font-extrabold tabular-nums text-muted">
          {idx + 1}/{list.length}
        </span>
      </div>
      <div className="rounded-3xl bg-surface p-4 shadow-card ring-1 ring-line">
        <QuestionView
          key={`${q.id}-${round}-${idx}`}
          q={q}
          attempt={round}
          onAnswered={(ok) => {
            recordAnswer(q.id, ok);
            setAnswers((a) => [...a, { q, ok }]);
            setAnswered(true);
          }}
          footer={
            <Button
              full
              onClick={() => {
                setIdx((i) => i + 1);
                setAnswered(false);
                if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              {idx + 1 === list.length ? "Ver resultado" : "Siguiente →"}
            </Button>
          }
        />
      </div>
      {!answered && (
        <div className="flex justify-center gap-2 text-xs font-bold">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">✓ {correct}</span>
          <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">✕ {answers.length - correct}</span>
        </div>
      )}
    </div>
  );
}
