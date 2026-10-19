"use client";

import { useState } from "react";
import type { Block, CalloutKind, Question } from "@/content/types";
import { cn } from "@/lib/utils";
import { recordAnswer } from "@/lib/store";
import { RichText } from "@/components/ui";
import QuestionView from "@/components/quiz/QuestionView";
import Diagram from "@/components/diagrams";

const CALLOUT: Record<CalloutKind, { icon: string; title: string; box: string; bar: string; chip: string }> = {
  tip: {
    icon: "💡",
    title: "Tip",
    box: "bg-emerald-50 ring-emerald-200/70 dark:bg-emerald-500/10 dark:ring-emerald-500/20",
    bar: "bg-emerald-400",
    chip: "text-emerald-700 dark:text-emerald-300",
  },
  warn: {
    icon: "⚠️",
    title: "Cuidado",
    box: "bg-amber-50 ring-amber-200/70 dark:bg-amber-500/10 dark:ring-amber-500/20",
    bar: "bg-amber-400",
    chip: "text-amber-700 dark:text-amber-300",
  },
  exam: {
    icon: "🎯",
    title: "Para el examen",
    box: "bg-rose-50 ring-rose-200/70 dark:bg-rose-500/10 dark:ring-rose-500/20",
    bar: "bg-rose-500",
    chip: "text-rose-700 dark:text-rose-300",
  },
  info: {
    icon: "ℹ️",
    title: "Info",
    box: "bg-sky-50 ring-sky-200/70 dark:bg-sky-500/10 dark:ring-sky-500/20",
    bar: "bg-sky-400",
    chip: "text-sky-700 dark:text-sky-300",
  },
  example: {
    icon: "🧪",
    title: "Ejemplo",
    box: "bg-violet-50 ring-violet-200/70 dark:bg-violet-500/10 dark:ring-violet-500/20",
    bar: "bg-violet-400",
    chip: "text-violet-700 dark:text-violet-300",
  },
  analogy: {
    icon: "🔗",
    title: "Analogía",
    box: "bg-indigo-50 ring-indigo-200/70 dark:bg-indigo-500/10 dark:ring-indigo-500/20",
    bar: "bg-indigo-400",
    chip: "text-indigo-700 dark:text-indigo-300",
  },
};

export default function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5 text-[16px] leading-[1.7] text-fg/85">
      {blocks.map((b, i) => (
        <BlockView key={i} b={b} />
      ))}
    </div>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case "p":
      return (
        <p>
          <RichText text={b.text} />
        </p>
      );
    case "h":
      return (
        <h3 className="flex items-center gap-2 pt-3 text-[19px] font-extrabold tracking-tight text-fg">
          <span className="h-5 w-1.5 rounded-full bg-indigo-500" />
          {b.text}
        </h3>
      );
    case "list":
      return b.ordered ? (
        <ol className="space-y-2">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-extrabold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                {i + 1}
              </span>
              <span>
                <RichText text={it} />
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="space-y-2">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-[11px] h-2 w-2 shrink-0 rounded-full bg-indigo-500 ring-4 ring-indigo-100 dark:ring-indigo-500/20" />
              <span>
                <RichText text={it} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <figure>
          {b.caption && <figcaption className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">{b.caption}</figcaption>}
          <div className="overflow-x-auto rounded-2xl bg-surface shadow-card ring-1 ring-line">
            <table className="w-full min-w-max border-collapse text-[13.5px] leading-snug">
              <thead>
                <tr className="bg-surface-2">
                  {b.head.map((h, i) => (
                    <th key={i} className="px-3 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-wider text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r, ri) => (
                  <tr key={ri} className="border-t border-line">
                    {r.map((c, ci) => (
                      <td key={ci} className={cn("max-w-[15rem] whitespace-normal px-3 py-2.5 align-top", ci === 0 && "font-bold text-fg")}>
                        <RichText text={c} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {b.rows[0]?.length > 2 && <p className="mt-1.5 text-[11px] text-muted">↔ Desliza la tabla para ver todas las columnas</p>}
        </figure>
      );
    case "callout": {
      const c = CALLOUT[b.kind];
      return (
        <div className={cn("relative overflow-hidden rounded-2xl p-4 pl-5 ring-1", c.box)}>
          <span className={cn("absolute inset-y-0 left-0 w-1.5", c.bar)} />
          <p className={cn("mb-1 flex items-center gap-1.5 text-[13px] font-extrabold", c.chip)}>
            <span className="text-base">{c.icon}</span>
            {b.title ?? c.title}
          </p>
          <p className="text-[15px] leading-relaxed text-fg/85">
            <RichText text={b.text} />
          </p>
        </div>
      );
    }
    case "code":
      return (
        <div className="overflow-hidden rounded-2xl bg-[#0d1220] shadow-card ring-1 ring-white/5">
          <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            {b.lang && <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-slate-500">{b.lang}</span>}
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-slate-200">
            <code>{b.text}</code>
          </pre>
        </div>
      );
    case "diagram":
      return (
        <figure className="space-y-2">
          <Diagram id={b.id} />
          {b.caption && <figcaption className="text-center text-xs font-medium text-muted">{b.caption}</figcaption>}
        </figure>
      );
    case "terms":
      return <Terms items={b.items} />;
    case "check":
      return <Check q={b.q} />;
    case "steps":
      return (
        <ol className="space-y-0">
          {b.items.map((s, i) => (
            <li key={i} className="relative flex gap-3.5 pb-4 last:pb-0">
              {i < b.items.length - 1 && <span className="absolute bottom-0 left-[13px] top-8 w-[2px] rounded-full bg-indigo-200 dark:bg-indigo-500/30" />}
              <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-extrabold text-white shadow-[0_3px_0_0_var(--color-indigo-800)]">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="font-extrabold leading-snug text-fg">{s.title.replace(/^\d+[b]?\.\s*/, "")}</p>
                <p className="mt-0.5 text-[15px] leading-relaxed">
                  <RichText text={s.text} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      );
    case "compare":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {[b.left, b.right].map((side, i) => (
            <div
              key={i}
              className={cn(
                "rounded-2xl p-4 ring-1",
                i === 0 ? "bg-rose-50/70 ring-rose-200/70 dark:bg-rose-500/10 dark:ring-rose-500/20" : "bg-emerald-50/70 ring-emerald-200/70 dark:bg-emerald-500/10 dark:ring-emerald-500/20",
              )}
            >
              <p className={cn("mb-2 font-extrabold", i === 0 ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300")}>{side.title}</p>
              <ul className="space-y-1.5 text-[14px] leading-snug">
                {side.items.map((it, j) => (
                  <li key={j} className="flex gap-2">
                    <span className={cn("font-bold", i === 0 ? "text-rose-500" : "text-emerald-500")}>{i === 0 ? "•" : "✓"}</span>
                    <span>
                      <RichText text={it} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
  }
}

function Terms({ items }: { items: { term: string; def: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-line overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-line">
      {items.map((it, i) => (
        <div key={i}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left text-[15px] font-bold text-fg"
            aria-expanded={open === i}
          >
            <span>{it.term}</span>
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs text-muted transition-transform duration-200",
                open === i && "rotate-180 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
              )}
            >
              ▼
            </span>
          </button>
          {open === i && (
            <div className="animate-pop px-4 pb-4 text-[15px] leading-relaxed">
              <RichText text={it.def} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Check({ q }: { q: Question }) {
  const [attempt, setAttempt] = useState(0);
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <div className="rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-50 p-4 ring-1 ring-indigo-200/70 dark:from-indigo-500/10 dark:to-violet-500/10 dark:ring-indigo-500/20">
      <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-indigo-700 shadow-card dark:text-indigo-300">
        🧠 Comprueba que entendiste
      </p>
      <QuestionView
        key={attempt}
        q={q}
        attempt={attempt}
        onAnswered={(ok) => {
          recordAnswer(q.id, ok);
          setDone(ok);
        }}
        footer={
          done === false ? (
            <button
              type="button"
              onClick={() => {
                setAttempt((a) => a + 1);
                setDone(null);
              }}
              className="w-full rounded-2xl bg-surface py-3 text-sm font-bold text-indigo-700 shadow-card ring-1 ring-line dark:text-indigo-300"
            >
              🔁 Intentar de nuevo
            </button>
          ) : null
        }
      />
    </div>
  );
}
