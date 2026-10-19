"use client";

import { useState } from "react";
import { cn, pct, shuffle } from "@/lib/utils";
import { markLab } from "@/lib/store";
import { Button, ProgressBar } from "@/components/ui";
import { SORT_SETS, type SortItem } from "./sort-data";

export default function SortGame({ labId }: { labId: string }) {
  const set = SORT_SETS[labId];
  const [items, setItems] = useState<SortItem[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [mistakes, setMistakes] = useState<SortItem[]>([]);

  if (!set) return null;

  const start = (list = set.items) => {
    setItems(shuffle(list));
    setI(0);
    setPicked(null);
    setScore(0);
    setStreak(0);
    setMistakes([]);
  };

  if (!items) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted">{set.intro}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {set.buckets.map((b) => (
            <span key={b} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium dark:bg-slate-800">
              {b}
            </span>
          ))}
        </div>
        <p className="text-sm text-muted">{set.items.length} tarjetas · respuesta inmediata</p>
        <Button full onClick={() => start()}>
          ▶ Empezar
        </Button>
      </div>
    );
  }

  if (i >= items.length) {
    const p = pct(score, items.length);
    return (
      <div className="animate-pop space-y-4">
        <div className="text-center">
          <div className="text-5xl">{p === 100 ? "🏆" : p >= 70 ? "🎉" : "💪"}</div>
          <p className="mt-2 text-3xl font-black">{p}%</p>
          <p className="text-muted">
            {score}/{items.length} correctas · mejor racha {best}
          </p>
        </div>
        {mistakes.length > 0 && (
          <div className="space-y-2">
            <p className="font-bold">Repasa:</p>
            {mistakes.map((m, k) => (
              <div key={k} className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="font-medium">{m.text}</p>
                <p className="mt-1 text-emerald-700 dark:text-emerald-400">
                  → {set.buckets[m.bucket]}: {m.why}
                </p>
              </div>
            ))}
          </div>
        )}
        <div className="grid gap-2">
          {mistakes.length > 0 && <Button onClick={() => start(mistakes)}>🔁 Repetir errores</Button>}
          <Button variant="secondary" onClick={() => start()}>
            Jugar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  const item = items[i];
  const answered = picked !== null;
  const ok = picked === item.bucket;

  const choose = (b: number) => {
    if (answered) return;
    setPicked(b);
    if (b === item.bucket) {
      setScore((s) => s + 1);
      const n = streak + 1;
      setStreak(n);
      setBest(Math.max(best, n));
    } else {
      setStreak(0);
      setMistakes((m) => [...m, item]);
    }
  };

  const next = () => {
    setPicked(null);
    if (i + 1 >= items.length) markLab(labId);
    setI((x) => x + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ProgressBar value={pct(i, items.length)} />
        <span className="shrink-0 text-xs font-semibold tabular-nums text-muted">
          {i + 1}/{items.length}
        </span>
        <span className="shrink-0 text-xs font-bold text-amber-600">🔥 {streak}</span>
      </div>

      <div
        key={i}
        className={cn(
          "animate-pop flex min-h-36 items-center justify-center rounded-2xl border-2 bg-white p-5 text-center text-lg font-semibold leading-snug shadow-sm dark:bg-slate-900",
          !answered && "border-slate-200 dark:border-white/10",
          answered && ok && "border-emerald-500",
          answered && !ok && "animate-shake border-rose-500",
        )}
      >
        {item.text}
      </div>

      <div className={cn("grid gap-2", set.buckets.length <= 3 ? "grid-cols-1" : "grid-cols-2")}>
        {set.buckets.map((b, bi) => (
          <button
            key={b}
            type="button"
            disabled={answered}
            onClick={() => choose(bi)}
            className={cn(
              "min-h-12 rounded-2xl border-2 px-3 text-sm font-semibold transition active:scale-[0.98]",
              !answered && "border-slate-200 bg-white hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900",
              answered && bi === item.bucket && "border-emerald-500 bg-emerald-500 text-white",
              answered && bi === picked && !ok && "border-rose-500 bg-rose-500 text-white",
              answered && bi !== item.bucket && bi !== picked && "border-slate-200 opacity-40 dark:border-slate-700",
              set.buckets.length % 2 === 1 && set.buckets.length > 3 && bi === set.buckets.length - 1 && "col-span-2",
            )}
          >
            {b}
          </button>
        ))}
      </div>

      {answered && (
        <div className="animate-pop space-y-3">
          <p className={cn("rounded-xl p-3 text-sm", ok ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200" : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200")}>
            <strong>{ok ? "¡Bien! " : "Era: " + set.buckets[item.bucket] + ". "}</strong>
            {item.why}
          </p>
          <Button full onClick={next}>
            {i + 1 >= items.length ? "Ver resultado" : "Siguiente →"}
          </Button>
        </div>
      )}
    </div>
  );
}
