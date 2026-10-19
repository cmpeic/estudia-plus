"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-3xl bg-surface p-3.5 shadow-card ring-1 ring-line sm:p-4", className)}>
      {children}
    </div>
  );
}

/** Control de pasos con reproducción automática opcional */
export function useStepper(total: number, intervalMs = 2200) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    if (step >= total - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, total - 1)), intervalMs);
    return () => clearTimeout(t);
  }, [playing, step, total, intervalMs]);
  return {
    step,
    setStep,
    playing,
    next: () => setStep((s) => Math.min(s + 1, total - 1)),
    prev: () => setStep((s) => Math.max(s - 1, 0)),
    reset: () => {
      setPlaying(false);
      setStep(0);
    },
    toggle: () => {
      if (step >= total - 1) setStep(0);
      setPlaying((p) => !p);
    },
  };
}

export function StepControls({
  stepper,
  total,
  className,
}: {
  stepper: ReturnType<typeof useStepper>;
  total: number;
  className?: string;
}) {
  const { step, prev, next, toggle, playing } = stepper;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button type="button" onClick={prev} disabled={step === 0} className="h-12 w-12 rounded-2xl bg-surface-2 text-xl font-bold text-fg transition active:scale-95 disabled:opacity-30" aria-label="Paso anterior">
        ‹
      </button>
      <button type="button" onClick={toggle} className="h-12 flex-1 rounded-2xl bg-indigo-600 text-sm font-bold text-white shadow-[0_4px_0_0_var(--color-indigo-800)] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--color-indigo-800)]">
        {playing ? "⏸ Pausa" : step >= total - 1 ? "↺ Repetir" : step === 0 ? "▶ Reproducir" : "▶ Continuar"}
      </button>
      <button type="button" onClick={next} disabled={step >= total - 1} className="h-12 w-12 rounded-2xl bg-surface-2 text-xl font-bold text-fg transition active:scale-95 disabled:opacity-30" aria-label="Paso siguiente">
        ›
      </button>
      <span className="w-10 text-right text-xs font-extrabold tabular-nums text-muted">
        {step + 1}/{total}
      </span>
    </div>
  );
}

/** Panel de detalle que aparece al tocar un elemento */
export function DetailPanel({ title, children, color = "indigo" }: { title: ReactNode; children: ReactNode; color?: "indigo" | "emerald" | "rose" | "amber" | "sky" | "violet" }) {
  const map = {
    indigo: "ring-indigo-200/70 bg-indigo-50 dark:ring-indigo-500/20 dark:bg-indigo-500/10",
    emerald: "ring-emerald-200/70 bg-emerald-50 dark:ring-emerald-500/20 dark:bg-emerald-500/10",
    rose: "ring-rose-200/70 bg-rose-50 dark:ring-rose-500/20 dark:bg-rose-500/10",
    amber: "ring-amber-200/70 bg-amber-50 dark:ring-amber-500/20 dark:bg-amber-500/10",
    sky: "ring-sky-200/70 bg-sky-50 dark:ring-sky-500/20 dark:bg-sky-500/10",
    violet: "ring-violet-200/70 bg-violet-50 dark:ring-violet-500/20 dark:bg-violet-500/10",
  };
  return (
    <div className={cn("animate-pop rounded-2xl p-3.5 text-sm leading-relaxed ring-1", map[color])}>
      <p className="mb-1 font-extrabold text-fg">{title}</p>
      <div className="text-fg/80">{children}</div>
    </div>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="text-center text-[11px] font-medium text-muted">👆 {children}</p>;
}
