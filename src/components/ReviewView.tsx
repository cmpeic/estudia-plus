"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TOPICS, getTopic, questionBank, type TaggedQuestion } from "@/content";
import { COLORS } from "@/content/topic-colors";
import { recordAnswer, useProgress } from "@/lib/store";
import { topicStats } from "@/lib/progress";
import { shuffle } from "@/lib/utils";
import { Button, Card, ChevronRight, EmptyState, PageHeader, ProgressBar } from "@/components/ui";
import Flashcards from "@/components/Flashcards";
import QuizRunner from "@/components/quiz/QuizRunner";
import QuestionView from "@/components/quiz/QuestionView";

type Mode = "menu" | "errores" | "tarjetas" | "relampago";

export default function ReviewView() {
  const progress = useProgress();
  const [mode, setMode] = useState<Mode>("menu");
  const [quiz, setQuiz] = useState<TaggedQuestion[]>([]);
  const [flash, setFlash] = useState<TaggedQuestion | null>(null);
  const [flashN, setFlashN] = useState(0);

  const bank = useMemo(() => questionBank(), []);
  const wrong = bank.filter((q) => progress.quiz[q.id] && !progress.quiz[q.id].last);
  const allCards = useMemo(() => TOPICS.flatMap((t) => t.flashcards.map((c) => ({ ...c, tag: `${t.icon} ${t.title.split(":")[0]}` }))), []);
  const now = Date.now();
  const due = allCards.filter((c) => (progress.cards[c.id]?.due ?? 0) <= now).length;
  const weak = TOPICS.map((t) => ({ t, s: topicStats(t, progress) })).sort((a, b) => a.s.percent - b.s.percent);

  const back = () => setMode("menu");

  if (mode === "errores")
    return (
      <div>
        <PageHeader title="Repasar errores" />
        <div className="px-4 py-4">
          <QuizRunner questions={quiz} onExit={back} />
        </div>
      </div>
    );

  if (mode === "tarjetas")
    return (
      <div>
        <PageHeader title="Tarjetas de todos los temas" right={<button className="text-sm font-semibold text-slate-500" onClick={back}>Cerrar</button>} />
        <div className="px-4 py-4">
          <Flashcards cards={allCards} title="Todas las tarjetas" />
        </div>
      </div>
    );

  if (mode === "relampago" && flash) {
    const t = getTopic(flash.topicId)!;
    return (
      <div>
        <PageHeader title="⚡ Pregunta relámpago" subtitle={`${t.icon} ${t.title}`} right={<button className="text-sm font-semibold text-slate-500" onClick={back}>Cerrar</button>} />
        <div className="px-4 py-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <QuestionView
              key={flashN}
              q={flash}
              attempt={flashN}
              onAnswered={(ok) => recordAnswer(flash.id, ok)}
              footer={
                <Button
                  full
                  onClick={() => {
                    setFlash(bank[Math.floor(Math.random() * bank.length)]);
                    setFlashN((n) => n + 1);
                  }}
                >
                  Otra pregunta ⚡
                </Button>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Repaso" subtitle="Refuerza lo que más te cuesta" />
      <div className="space-y-4 px-4 py-2">
        <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-5 text-white shadow-float">
          <div className="dots pointer-events-none absolute inset-0 opacity-50" />
          <div className="pointer-events-none absolute -right-4 -top-8 text-[110px] leading-none opacity-25">🔁</div>
          <div className="relative">
            <p className="text-xs font-extrabold uppercase tracking-widest text-white/80">Repaso inteligente</p>
            <h2 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight">Lo que más te cuesta, primero</h2>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                [wrong.length, "errores"],
                [due, "tarjetas hoy"],
                [bank.length, "preguntas"],
              ].map(([v, l]) => (
                <div key={String(l)} className="rounded-2xl bg-white/15 px-1 py-2 ring-1 ring-white/20">
                  <p className="text-lg font-extrabold leading-none tabular-nums">{v}</p>
                  <p className="mt-1 text-[10px] font-semibold text-white/80">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Card
          onClick={() => {
            if (wrong.length === 0) return;
            setQuiz(shuffle(wrong));
            setMode("errores");
          }}
          className="flex items-center gap-3"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-2xl shadow-[inset_0_-3px_0_rgb(0_0_0/0.12)]">❌</span>
          <span className="flex-1">
            <span className="block font-extrabold tracking-tight">Preguntas falladas</span>
            <span className="block text-xs leading-snug text-muted">{wrong.length ? `${wrong.length} preguntas para volver a intentar` : "¡No tienes errores pendientes!"}</span>
          </span>
          {wrong.length > 0 && <ChevronRight className="text-slate-400" />}
        </Card>
        <Card onClick={() => setMode("tarjetas")} className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-2xl shadow-[inset_0_-3px_0_rgb(0_0_0/0.12)]">🃏</span>
          <span className="flex-1">
            <span className="block font-extrabold tracking-tight">Tarjetas del día</span>
            <span className="block text-xs leading-snug text-muted">
              {due} pendientes de {allCards.length} (repetición espaciada)
            </span>
          </span>
          <ChevronRight className="text-slate-400" />
        </Card>
        <Card
          onClick={() => {
            setFlash(bank[Math.floor(Math.random() * bank.length)]);
            setFlashN((n) => n + 1);
            setMode("relampago");
          }}
          className="flex items-center gap-3"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-2xl shadow-[inset_0_-3px_0_rgb(0_0_0/0.12)]">⚡</span>
          <span className="flex-1">
            <span className="block font-extrabold tracking-tight">Pregunta relámpago</span>
            <span className="block text-xs leading-snug text-muted">Una pregunta al azar de {bank.length}, ideal para 2 minutos libres</span>
          </span>
          <ChevronRight className="text-slate-400" />
        </Card>

        <div>
          <h2 className="mb-3 mt-4 text-lg font-extrabold tracking-tight">Temas para reforzar</h2>
          {weak.every((w) => w.s.percent === 0) ? (
            <EmptyState icon="🌱" title="Aún no hay datos" text="Estudia una lección o practica preguntas y aquí verás qué temas necesitan más atención." />
          ) : (
            <div className="space-y-2">
              {weak.map(({ t, s }) => (
                <Link key={t.id} href={`/tema/${t.id}/`} className="block rounded-3xl bg-surface p-3.5 shadow-card ring-1 ring-line transition active:scale-[0.985]">
                  <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-bold">
                      {t.icon} {t.title.split(":")[0]}
                    </span>
                    <span className="shrink-0 font-extrabold tabular-nums">{s.percent}%</span>
                  </div>
                  <ProgressBar value={s.percent} color={COLORS[t.color].bg} />
                  {s.qWrong > 0 && <p className="mt-1 text-xs text-rose-600">{s.qWrong} preguntas falladas</p>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
