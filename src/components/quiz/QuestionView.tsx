"use client";

import { useMemo, useState } from "react";
import type {
  ChoiceQ,
  ClassifyQ,
  InputQ,
  MatchQ,
  MultiQ,
  OrderQ,
  Question,
  TrueFalseQ,
} from "@/content/types";
import { cn, normalize, seededShuffle } from "@/lib/utils";
import { Button, RichText } from "@/components/ui";

export type QuestionViewProps = {
  q: Question;
  /** true: muestra correcto/incorrecto y explicación (práctica). false: examen. */
  reveal?: boolean;
  /** Semilla extra para mezclar opciones distinto en cada intento */
  attempt?: number;
  onAnswered?: (correct: boolean) => void;
  /** Contenido debajo del feedback (ej. botón Siguiente) */
  footer?: React.ReactNode;
};

const TYPE_ICON: Record<Question["type"], string> = {
  choice: "◉",
  multi: "☑",
  tf: "⚖",
  match: "🔗",
  order: "↕",
  classify: "🗂",
  input: "⌨",
};

const PRAISE = ["¡Correcto!", "¡Excelente!", "¡Muy bien!", "¡Perfecto!", "¡Así se hace!"];
const ENCOURAGE = ["Casi…", "No exactamente", "¡A repasar!", "Esta vez no"];

const TYPE_LABEL: Record<Question["type"], string> = {
  choice: "Elige una opción",
  multi: "Elige todas las correctas",
  tf: "Verdadero o falso",
  match: "Empareja",
  order: "Ordena",
  classify: "Clasifica",
  input: "Escribe la respuesta",
};

export default function QuestionView({ q, reveal = true, attempt = 0, onAnswered, footer }: QuestionViewProps) {
  const [result, setResult] = useState<boolean | null>(null);
  const locked = result !== null;

  const submit = (ok: boolean) => {
    if (locked) return;
    setResult(ok);
    onAnswered?.(ok);
  };

  const seed = `${q.id}:${attempt}`;
  const common = { locked, reveal, seed, onSubmit: submit };

  return (
    <div className="space-y-4">
      {q.context && (
        <div className="relative overflow-hidden rounded-2xl bg-amber-50 p-3.5 pl-5 text-sm leading-relaxed text-amber-950 ring-1 ring-amber-200/70 dark:bg-amber-500/10 dark:text-amber-50 dark:ring-amber-500/20">
          <span className="absolute inset-y-0 left-0 w-1.5 bg-amber-400" />
          <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-300">📍 Situación</span>
          <RichText text={q.context} />
        </div>
      )}
      <div>
        <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-muted">
          {TYPE_ICON[q.type]} {TYPE_LABEL[q.type]}
        </span>
        <h3 className="text-[18px] font-bold leading-snug tracking-tight">
          <RichText text={q.prompt} />
        </h3>
      </div>

      {q.type === "choice" && <Choice q={q} {...common} />}
      {q.type === "multi" && <Multi q={q} {...common} />}
      {q.type === "tf" && <TrueFalse q={q} {...common} />}
      {q.type === "match" && <Match q={q} {...common} />}
      {q.type === "order" && <Order q={q} {...common} />}
      {q.type === "classify" && <Classify q={q} {...common} />}
      {q.type === "input" && <Input q={q} {...common} />}

      {locked && reveal && (
        <div
          className={cn(
            "animate-slide-up rounded-3xl p-4 ring-1",
            result
              ? "bg-emerald-50 ring-emerald-200 dark:bg-emerald-500/10 dark:ring-emerald-500/25"
              : "bg-rose-50 ring-rose-200 dark:bg-rose-500/10 dark:ring-rose-500/25",
          )}
        >
          <div className="mb-1.5 flex items-center gap-2.5">
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white",
                result ? "bg-emerald-500 shadow-[0_3px_0_0_var(--color-emerald-700)]" : "bg-rose-500 shadow-[0_3px_0_0_var(--color-rose-700)]",
              )}
            >
              {result ? "✓" : "✕"}
            </span>
            <p className={cn("text-[17px] font-extrabold", result ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300")}>
              {result ? PRAISE[(q.id.length + attempt) % PRAISE.length] : ENCOURAGE[(q.id.length + attempt) % ENCOURAGE.length]}
            </p>
          </div>
          <p className="text-[14.5px] leading-relaxed text-fg/85">
            <RichText text={q.explanation} />
          </p>
        </div>
      )}
      {locked && footer}
    </div>
  );
}

type Common = { locked: boolean; reveal: boolean; seed: string; onSubmit: (ok: boolean) => void };

function optionClass(state: "idle" | "selected" | "correct" | "wrong" | "missed") {
  return cn(
    "w-full rounded-2xl border-2 px-4 py-3.5 text-left text-[15px] font-semibold leading-snug transition-all duration-100 enabled:active:translate-y-[2px] enabled:active:shadow-none",
    state === "idle" &&
      "border-slate-200 bg-surface shadow-[0_3px_0_0_var(--color-slate-200)] hover:border-slate-300 dark:border-white/10 dark:shadow-[0_3px_0_0_rgb(0_0_0/0.5)] dark:hover:border-white/20",
    state === "selected" &&
      "border-indigo-400 bg-indigo-50 text-indigo-950 shadow-[0_3px_0_0_var(--color-indigo-300)] dark:bg-indigo-500/15 dark:text-indigo-50 dark:shadow-[0_3px_0_0_var(--color-indigo-700)]",
    state === "correct" &&
      "border-emerald-400 bg-emerald-50 text-emerald-950 shadow-[0_3px_0_0_var(--color-emerald-300)] dark:bg-emerald-500/15 dark:text-emerald-50 dark:shadow-[0_3px_0_0_var(--color-emerald-700)]",
    state === "wrong" &&
      "animate-shake border-rose-400 bg-rose-50 text-rose-950 shadow-[0_3px_0_0_var(--color-rose-300)] dark:bg-rose-500/15 dark:text-rose-50 dark:shadow-[0_3px_0_0_var(--color-rose-700)]",
    state === "missed" && "border-dashed border-emerald-400 bg-surface",
  );
}

function letterClass(state: "idle" | "selected" | "correct" | "wrong" | "missed") {
  return cn(
    "mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 text-[11px] font-extrabold transition",
    state === "idle" && "border-slate-200 text-muted dark:border-white/15",
    state === "selected" && "border-indigo-500 bg-indigo-500 text-white",
    state === "correct" && "border-emerald-500 bg-emerald-500 text-white",
    state === "wrong" && "border-rose-500 bg-rose-500 text-white",
    state === "missed" && "border-emerald-500 text-emerald-600",
  );
}

const LETTERS = "ABCDEFGH";

// ---------------- opción única ----------------
function Choice({ q, locked, reveal, seed, onSubmit }: Common & { q: ChoiceQ }) {
  const order = useMemo(() => seededShuffle(q.options.map((_, i) => i), seed), [q.options, seed]);
  const [sel, setSel] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {order.map((oi, pos) => {
        let st: Parameters<typeof optionClass>[0] = sel === oi ? "selected" : "idle";
        if (locked && reveal) {
          if (oi === q.answer) st = "correct";
          else if (oi === sel) st = "wrong";
          else st = "idle";
        }
        return (
          <button key={oi} type="button" disabled={locked} onClick={() => setSel(oi)} className={cn("flex items-start gap-3", optionClass(st))}>
            <span className={letterClass(st)}>{LETTERS[pos]}</span>
            <RichText text={q.options[oi]} />
          </button>
        );
      })}
      {!locked && (
        <Button full disabled={sel === null} onClick={() => sel !== null && onSubmit(sel === q.answer)}>
          Comprobar
        </Button>
      )}
    </div>
  );
}

// ---------------- opción múltiple ----------------
function Multi({ q, locked, reveal, seed, onSubmit }: Common & { q: MultiQ }) {
  const order = useMemo(() => seededShuffle(q.options.map((_, i) => i), seed), [q.options, seed]);
  const [sel, setSel] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setSel((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  const check = () => {
    const ok = sel.size === q.answers.length && q.answers.every((a) => sel.has(a));
    onSubmit(ok);
  };
  return (
    <div className="space-y-2">
      {order.map((oi) => {
        const isAns = q.answers.includes(oi);
        let st: Parameters<typeof optionClass>[0] = sel.has(oi) ? "selected" : "idle";
        if (locked && reveal) {
          if (sel.has(oi)) st = isAns ? "correct" : "wrong";
          else st = isAns ? "missed" : "idle";
        }
        return (
          <button key={oi} type="button" disabled={locked} onClick={() => toggle(oi)} className={cn("flex items-start gap-3", optionClass(st))}>
            <span className={letterClass(st)}>{sel.has(oi) || st === "missed" ? "✓" : ""}</span>
            <RichText text={q.options[oi]} />
          </button>
        );
      })}
      {locked && reveal && <p className="text-xs text-muted">Borde punteado verde = correcta que no marcaste.</p>}
      {!locked && (
        <Button full disabled={sel.size === 0} onClick={check}>
          Comprobar
        </Button>
      )}
    </div>
  );
}

// ---------------- verdadero / falso ----------------
function TrueFalse({ q, locked, reveal, onSubmit }: Common & { q: TrueFalseQ }) {
  const [sel, setSel] = useState<boolean | null>(null);
  const opts: [boolean, string, string][] = [
    [true, "Verdadero", "👍"],
    [false, "Falso", "👎"],
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {opts.map(([v, label, emoji]) => {
        let st: Parameters<typeof optionClass>[0] = sel === v ? "selected" : "idle";
        if (locked && reveal) st = v === q.answer ? "correct" : sel === v ? "wrong" : "idle";
        return (
          <button
            key={label}
            type="button"
            disabled={locked}
            onClick={() => {
              setSel(v);
              onSubmit(v === q.answer);
            }}
            className={cn(optionClass(st), "flex flex-col items-center justify-center gap-1 py-6 text-center text-base font-extrabold")}
          >
            <span className="text-3xl">{emoji}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------- emparejar ----------------
const PAIR_COLORS = [
  "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/50 dark:text-indigo-200 dark:border-indigo-700",
  "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-700",
  "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-700",
  "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/50 dark:text-rose-200 dark:border-rose-700",
  "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/50 dark:text-sky-200 dark:border-sky-700",
  "bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/50 dark:text-violet-200 dark:border-violet-700",
];

function Match({ q, locked, reveal, seed, onSubmit }: Common & { q: MatchQ }) {
  const rightOrder = useMemo(() => seededShuffle(q.pairs.map((_, i) => i), seed), [q.pairs, seed]);
  // assign[leftIndex] = rightIndex (índice de pares)
  const [assign, setAssign] = useState<(number | null)[]>(() => q.pairs.map(() => null));
  const [active, setActive] = useState(0);
  const used = new Set(assign.filter((a): a is number => a !== null));

  const pick = (ri: number) => {
    if (locked) return;
    const n = assign.slice();
    n[active] = ri;
    setAssign(n);
    const nextEmpty = n.findIndex((v) => v === null);
    if (nextEmpty >= 0) setActive(nextEmpty);
  };
  const clear = (li: number) => {
    if (locked) return;
    const n = assign.slice();
    n[li] = null;
    setAssign(n);
    setActive(li);
  };
  const complete = assign.every((a) => a !== null);

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 dark:text-slate-400">Toca un concepto y luego su pareja de abajo. Toca una pareja para quitarla.</p>
      <div className="space-y-2">
        {q.pairs.map(([left], li) => {
          const ri = assign[li];
          const ok = ri === li;
          return (
            <button
              key={li}
              type="button"
              onClick={() => (ri !== null ? clear(li) : setActive(li))}
              disabled={locked}
              className={cn(
                "w-full rounded-2xl border-2 p-3.5 text-left transition",
                !locked && active === li ? "border-indigo-400 ring-4 ring-indigo-100 dark:ring-indigo-500/20" : "border-slate-200 dark:border-white/10",
                "bg-surface",
                locked && reveal && (ok ? "border-emerald-500" : "border-rose-500"),
              )}
            >
              <div className="text-[15px] font-semibold">
                <RichText text={left} />
              </div>
              <div
                className={cn(
                  "mt-2 min-h-9 rounded-lg border px-3 py-2 text-sm",
                  ri === null ? "border-dashed border-slate-300 text-slate-400 dark:border-slate-600" : PAIR_COLORS[li % PAIR_COLORS.length],
                )}
              >
                {ri === null ? "Elige su pareja…" : <RichText text={q.pairs[ri][1]} />}
              </div>
              {locked && reveal && !ok && (
                <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  Correcto: <RichText text={q.pairs[li][1]} />
                </p>
              )}
            </button>
          );
        })}
      </div>
      {!locked && (
        <div className="flex flex-wrap gap-2 rounded-2xl bg-surface-2 p-3">
          {rightOrder.filter((ri) => !used.has(ri)).length === 0 && <span className="text-sm text-slate-500">Todo emparejado ✔</span>}
          {rightOrder
            .filter((ri) => !used.has(ri))
            .map((ri) => (
              <button
                key={ri}
                type="button"
                onClick={() => pick(ri)}
                className="rounded-xl border-2 border-slate-200 bg-surface px-3 py-2 text-left text-sm font-semibold shadow-[0_3px_0_0_var(--color-slate-200)] transition active:translate-y-[2px] active:shadow-none dark:border-white/10 dark:shadow-[0_3px_0_0_rgb(0_0_0/0.5)]"
              >
                <RichText text={q.pairs[ri][1]} />
              </button>
            ))}
        </div>
      )}
      {!locked && (
        <Button full disabled={!complete} onClick={() => onSubmit(assign.every((a, i) => a === i))}>
          Comprobar
        </Button>
      )}
    </div>
  );
}

// ---------------- ordenar ----------------
function Order({ q, locked, reveal, seed, onSubmit }: Common & { q: OrderQ }) {
  const [order, setOrder] = useState<number[]>(() => {
    let o = seededShuffle(q.items.map((_, i) => i), seed);
    // evita que salga ya ordenado
    if (o.every((v, i) => v === i) && o.length > 1) o = [...o.slice(1), o[0]];
    return o;
  });
  const move = (pos: number, dir: -1 | 1) => {
    const to = pos + dir;
    if (to < 0 || to >= order.length) return;
    setOrder((o) => {
      const n = o.slice();
      [n[pos], n[to]] = [n[to], n[pos]];
      return n;
    });
  };
  return (
    <div className="space-y-2">
      {!locked && <p className="text-xs text-slate-500 dark:text-slate-400">Usa las flechas para mover cada elemento a su lugar.</p>}
      {order.map((item, pos) => {
        const ok = item === pos;
        return (
          <div
            key={item}
            className={cn(
              "flex items-center gap-2 rounded-2xl border-2 bg-surface p-2 pl-3 transition-all",
              locked && reveal ? (ok ? "border-emerald-500" : "border-rose-500") : "border-slate-200 dark:border-white/10",
            )}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">{pos + 1}</span>
            <span className="flex-1 text-[15px] leading-snug">
              <RichText text={q.items[item]} />
              {locked && reveal && !ok && (
                <span className="block text-xs text-emerald-700 dark:text-emerald-400">Va en la posición {item + 1}</span>
              )}
            </span>
            {!locked && (
              <div className="flex flex-col">
                <button type="button" aria-label="Subir" onClick={() => move(pos, -1)} disabled={pos === 0} className="flex h-8 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-25 dark:hover:bg-slate-800">
                  ▲
                </button>
                <button type="button" aria-label="Bajar" onClick={() => move(pos, 1)} disabled={pos === order.length - 1} className="flex h-8 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-25 dark:hover:bg-slate-800">
                  ▼
                </button>
              </div>
            )}
          </div>
        );
      })}
      {!locked && (
        <Button full onClick={() => onSubmit(order.every((v, i) => v === i))}>
          Comprobar orden
        </Button>
      )}
    </div>
  );
}

// ---------------- clasificar ----------------
function Classify({ q, locked, reveal, seed, onSubmit }: Common & { q: ClassifyQ }) {
  const order = useMemo(() => seededShuffle(q.items.map((_, i) => i), seed), [q.items, seed]);
  const [sel, setSel] = useState<(number | null)[]>(() => q.items.map(() => null));
  const complete = sel.every((s) => s !== null);
  return (
    <div className="space-y-2">
      {order.map((ii) => {
        const item = q.items[ii];
        const chosen = sel[ii];
        const ok = chosen === item.bucket;
        return (
          <div
            key={ii}
            className={cn(
              "rounded-2xl border-2 bg-surface p-3.5",
              locked && reveal ? (ok ? "border-emerald-500" : "border-rose-500") : "border-slate-200 dark:border-slate-700",
            )}
          >
            <p className="mb-2 text-[15px] leading-snug">
              <RichText text={item.text} />
            </p>
            <div className="flex flex-wrap gap-1.5">
              {q.buckets.map((b, bi) => {
                const isSel = chosen === bi;
                const showCorrect = locked && reveal && bi === item.bucket;
                return (
                  <button
                    key={bi}
                    type="button"
                    disabled={locked}
                    onClick={() =>
                      setSel((s) => {
                        const n = s.slice();
                        n[ii] = bi;
                        return n;
                      })
                    }
                    className={cn(
                      "min-h-10 rounded-xl border-2 px-3 text-[13px] font-bold transition active:scale-95",
                      isSel ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-surface-2 text-fg/80 dark:border-white/10",
                      locked && reveal && isSel && !ok && "border-rose-600 bg-rose-600",
                      showCorrect && !isSel && "border-emerald-600 text-emerald-700 ring-2 ring-emerald-400 dark:text-emerald-300",
                      showCorrect && isSel && "border-emerald-600 bg-emerald-600",
                    )}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {!locked && (
        <Button full disabled={!complete} onClick={() => onSubmit(q.items.every((it, i) => sel[i] === it.bucket))}>
          Comprobar
        </Button>
      )}
    </div>
  );
}

// ---------------- respuesta escrita ----------------
function Input({ q, locked, reveal, onSubmit }: Common & { q: InputQ }) {
  const [val, setVal] = useState("");
  const [ok, setOk] = useState<boolean | null>(null);
  const check = () => {
    if (!val.trim()) return;
    const good = q.answers.some((a) => normalize(a) === normalize(val));
    setOk(good);
    onSubmit(good);
  };
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        check();
      }}
    >
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        disabled={locked}
        placeholder={q.placeholder ?? "Tu respuesta…"}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        className={cn(
          "h-14 w-full rounded-2xl border-2 bg-surface px-4 font-mono text-base outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-500/20",
          locked && reveal ? (ok ? "border-emerald-500" : "border-rose-500") : "border-slate-200 dark:border-white/10",
        )}
      />
      {locked && reveal && !ok && (
        <p className="text-sm">
          Respuesta esperada: <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">{q.answers[0]}</span>
        </p>
      )}
      {!locked && (
        <Button full type="submit" disabled={!val.trim()}>
          Comprobar
        </Button>
      )}
    </form>
  );
}
