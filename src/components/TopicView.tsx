"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CaseStudy, Question, Topic } from "@/content/types";
import { allQuestions, getTopic } from "@/content";
import { COLORS } from "@/content/topic-colors";
import { markCase, markSection, recordAnswer, setLastTopic, useHydrated, useProgress } from "@/lib/store";
import { topicStats } from "@/lib/progress";
import { cn, pct, shuffle } from "@/lib/utils";
import { Button, Card, ChevronRight, Chip, PageHeader, ProgressBar, ProgressRing, RichText } from "@/components/ui";
import Blocks from "@/components/Blocks";
import Flashcards from "@/components/Flashcards";
import QuizRunner from "@/components/quiz/QuizRunner";
import QuestionView from "@/components/quiz/QuestionView";
import LabView from "@/components/labs";

const TABS = [
  { id: "aprender", icon: "📖", label: "Aprender" },
  { id: "labs", icon: "🧪", label: "Labs" },
  { id: "tarjetas", icon: "🃏", label: "Tarjetas" },
  { id: "practicar", icon: "✍️", label: "Practicar" },
  { id: "casos", icon: "🧩", label: "Casos" },
  { id: "resumen", icon: "📝", label: "Resumen" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function TopicView({ topicId }: { topicId: string }) {
  const topic = getTopic(topicId)!;
  const progress = useProgress();
  const hydrated = useHydrated();
  const stats = topicStats(topic, progress);
  const percent = hydrated ? stats.percent : 0;
  const color = COLORS[topic.color];
  const [tab, setTab] = useState<TabId>("aprender");
  const tabsRef = useRef<HTMLDivElement>(null);

  // Mantiene visible la pestaña activa en la barra deslizable
  useEffect(() => {
    const box = tabsRef.current;
    const btn = box?.querySelector<HTMLElement>(`[data-tab="${tab}"]`);
    if (box && btn) box.scrollTo({ left: btn.offsetLeft - box.clientWidth / 2 + btn.clientWidth / 2, behavior: "smooth" });
  }, [tab]);

  // Pestaña inicial desde el hash (#labs…) después de montar: sin errores de hidratación
  useEffect(() => {
    const h = window.location.hash.replace("#", "") as TabId;
    if (TABS.some((t) => t.id === h)) setTab(h);
    setLastTopic(topic.id);
  }, [topic.id]);

  const changeTab = (t: TabId) => {
    setTab(t);
    const el = document.getElementById("topic-content");
    if (el && el.getBoundingClientRect().top < 100) scrollTop();
    try {
      window.history.replaceState(null, "", `#${t}`);
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      <PageHeader title={topic.title.split(":")[0]} subtitle={`${percent}% completado`} back="/" />

      <div className="px-4 pt-1">
        <div className={cn("relative overflow-hidden rounded-4xl bg-gradient-to-br p-5 text-white shadow-float", color.grad)}>
          <div className="dots pointer-events-none absolute inset-0 opacity-50" />
          <div className="pointer-events-none absolute -right-10 -top-12 text-[120px] leading-none opacity-20 blur-[1px]">{topic.icon}</div>
          <div className="relative">
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                {topic.isNew && <span className="mb-2 inline-block rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ring-1 ring-white/30">✨ Nuevo tema</span>}
                <h2 className="text-[22px] font-extrabold leading-tight tracking-tight">{topic.title}</h2>
                <p className="mt-1 text-[13px] leading-snug text-white/85">{topic.short}</p>
              </div>
              <ProgressRing value={percent} size={64} stroke={7} color="#ffffff" track="stroke-white/25" labelClass="text-white text-sm" />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              <Mini k="Secciones" v={`${hydrated ? stats.sectionsRead : 0}/${stats.sectionsTotal}`} />
              <Mini k="Preguntas" v={`${hydrated ? stats.qMastered : 0}/${stats.qTotal}`} />
              <Mini k="Labs" v={`${hydrated ? stats.labsDone : 0}/${stats.labsTotal}`} />
              <Mini k="Casos" v={`${hydrated ? stats.casesDone : 0}/${stats.casesTotal}`} />
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-20 mt-4 bg-bg/85 backdrop-blur-xl">
        <div ref={tabsRef} className="no-scrollbar relative flex gap-1.5 overflow-x-auto px-4 py-2.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-tab={t.id}
              type="button"
              onClick={() => changeTab(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition active:scale-95",
                tab === t.id ? "bg-fg text-bg shadow-card" : "bg-surface text-fg/70 ring-1 ring-line",
              )}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div id="topic-content" className="px-4 pb-4 pt-3">
        {tab === "aprender" && <Lesson topic={topic} onPractice={() => changeTab("practicar")} />}
        {tab === "labs" && <Labs topic={topic} />}
        {tab === "tarjetas" && <Flashcards cards={topic.flashcards} title={`Tarjetas · ${topic.title.split(":")[0]}`} />}
        {tab === "practicar" && <Practice topic={topic} />}
        {tab === "casos" && <Cases topic={topic} />}
        {tab === "resumen" && <Summary topic={topic} />}
      </div>
    </div>
  );
}

function Mini({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-white/15 px-1 py-2 ring-1 ring-white/15">
      <p className="text-[14px] font-extrabold leading-none tabular-nums">{v}</p>
      <p className="mt-1 text-[10px] font-semibold text-white/80">{k}</p>
    </div>
  );
}

/** Lleva la vista al inicio del contenido de la pestaña (debajo del encabezado y las pestañas) */
function scrollTop() {
  if (typeof window === "undefined") return;
  const el = document.getElementById("topic-content");
  if (!el) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const y = el.getBoundingClientRect().top + window.scrollY - 124;
  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
}

function BackLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-surface px-3 py-1.5 text-sm font-bold text-muted shadow-card ring-1 ring-line active:scale-95">
      ‹ {children}
    </button>
  );
}

// ---------------------------------------------------------------- Aprender
function Lesson({ topic, onPractice }: { topic: Topic; onPractice: () => void }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const [open, setOpen] = useState<number | null>(null);
  const color = COLORS[topic.color];
  const isRead = (id: string) => hydrated && !!progress.sections[`${topic.id}/${id}`];

  if (open !== null) {
    const s = topic.sections[open];
    const last = open === topic.sections.length - 1;
    return (
      <article className="animate-pop space-y-5">
        <div className="flex items-center gap-3">
          <BackLink onClick={() => setOpen(null)}>Secciones</BackLink>
          <ProgressBar value={pct(open + 1, topic.sections.length)} size="sm" color={color.bg} />
          <span className="shrink-0 text-xs font-extrabold tabular-nums text-muted">
            {open + 1}/{topic.sections.length}
          </span>
        </div>
        <div>
          <p className={cn("text-xs font-extrabold uppercase tracking-widest", color.text)}>Sección {open + 1}</p>
          <h2 className="mt-1 text-[26px] font-extrabold leading-[1.15] tracking-tight">{s.title}</h2>
          {s.goal && (
            <p className="mt-3 flex gap-2 rounded-2xl bg-surface px-3.5 py-2.5 text-sm font-medium text-fg/75 shadow-card ring-1 ring-line">
              <span>🎯</span>
              <span>{s.goal}</span>
            </p>
          )}
        </div>
        <Blocks blocks={s.blocks} />
        <div className="grid grid-cols-[auto_1fr] gap-3 pt-4">
          <Button
            variant="secondary"
            disabled={open === 0}
            onClick={() => {
              setOpen(open - 1);
              scrollTop();
            }}
          >
            ‹
          </Button>
          <Button
            onClick={() => {
              markSection(topic.id, s.id);
              if (last) setOpen(null);
              else setOpen(open + 1);
              scrollTop();
            }}
          >
            {last ? "✓ Terminar lección" : "Entendido, siguiente →"}
          </Button>
        </div>
      </article>
    );
  }

  const readCount = topic.sections.filter((s) => isRead(s.id)).length;
  const nextIdx = topic.sections.findIndex((s) => !isRead(s.id));

  return (
    <div className="space-y-4">
      {nextIdx >= 0 ? (
        <Button
          full
          onClick={() => {
            setOpen(nextIdx);
            scrollTop();
          }}
        >
          {readCount === 0 ? "▶ Empezar a estudiar" : "▶ Continuar donde quedé"}
        </Button>
      ) : (
        <Card className="text-center">
          <p className="text-4xl">🎉</p>
          <p className="mt-1 text-lg font-extrabold">¡Leíste todas las secciones!</p>
          <p className="mb-4 text-sm text-muted">Ahora ponte a prueba con preguntas.</p>
          <Button onClick={onPractice}>✍️ Practicar preguntas</Button>
        </Card>
      )}

      {/* Camino de aprendizaje */}
      <ol className="relative">
        <span className="absolute bottom-6 left-[27px] top-6 w-[3px] rounded-full bg-slate-200 dark:bg-white/10" aria-hidden />
        {topic.sections.map((s, i) => {
          const read = isRead(s.id);
          const current = i === nextIdx;
          return (
            <li key={s.id} className="relative py-1.5">
              <button
                type="button"
                onClick={() => {
                  setOpen(i);
                  scrollTop();
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-3xl p-2.5 pr-3 text-left transition active:scale-[0.985]",
                  current ? "bg-surface shadow-card ring-2 ring-indigo-400/60" : "hover:bg-surface/70",
                )}
              >
                <span
                  className={cn(
                    "relative z-10 flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-sm font-extrabold ring-4 ring-bg",
                    read && "bg-emerald-500 text-white shadow-[0_3px_0_0_var(--color-emerald-700)]",
                    current && !read && cn(color.bg, "text-white shadow-[0_3px_0_0_rgb(0_0_0/0.2)]"),
                    !read && !current && "bg-surface text-muted ring-4 ring-bg shadow-card",
                  )}
                >
                  {read ? "✓" : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-[15px] font-bold leading-snug", read && "text-fg/70")}>{s.title}</span>
                  {s.goal && <span className="mt-0.5 block truncate text-xs text-muted">{s.goal}</span>}
                </span>
                {current ? (
                  <span className={cn("shrink-0 rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white", color.bg)}>Sigue</span>
                ) : (
                  <ChevronRight className="shrink-0 text-muted/50" />
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------- Labs
function Labs({ topic }: { topic: Topic }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const [open, setOpen] = useState<string | null>(null);
  const lab = topic.labs.find((l) => l.id === open);
  const color = COLORS[topic.color];

  if (lab) {
    return (
      <div className="animate-pop space-y-4">
        <BackLink onClick={() => setOpen(null)}>Laboratorios</BackLink>
        <div>
          <h2 className="text-[22px] font-extrabold tracking-tight">{lab.title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">{lab.description}</p>
        </div>
        <LabView id={lab.id} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-muted">Aprende haciendo: simuladores, juegos y calculadoras para entender el tema con las manos.</p>
      {topic.labs.map((l, i) => {
        const done = hydrated && progress.labs[l.id];
        return (
          <Card
            key={l.id}
            onClick={() => {
              setOpen(l.id);
              scrollTop();
            }}
            className="flex items-center gap-3.5 !p-3.5"
          >
            <span className={cn("relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xl text-white shadow-[inset_0_-3px_0_rgb(0_0_0/0.12)]", color.grad)}>
              {["🧪", "🎮", "🧮", "🔬", "🕹️", "🛠️", "🧭"][i % 7]}
              {done && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] ring-2 ring-surface">✓</span>}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-extrabold tracking-tight">{l.title}</span>
              <span className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted">{l.description}</span>
            </span>
            <ChevronRight className="shrink-0 text-muted/50" />
          </Card>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- Practicar
type Filter = "todas" | "falladas" | "nuevas";

function Practice({ topic }: { topic: Topic }) {
  const progress = useProgress();
  const bank = useMemo(() => allQuestions(topic), [topic]);
  const [count, setCount] = useState<number>(10);
  const [filter, setFilter] = useState<Filter>("todas");
  const [level, setLevel] = useState<0 | 1 | 2 | 3>(0);
  const [running, setRunning] = useState<Question[] | null>(null);
  const [runKey, setRunKey] = useState(0);

  const pool = bank.filter((q) => {
    const st = progress.quiz[q.id];
    if (filter === "falladas" && !(st && !st.last)) return false;
    if (filter === "nuevas" && st) return false;
    if (level && (q.level ?? 1) !== level) return false;
    return true;
  });

  const start = () => {
    setRunning(shuffle(pool).slice(0, count === 0 ? pool.length : count));
    setRunKey((k) => k + 1);
    scrollTop();
  };

  if (running) return <QuizRunner key={runKey} questions={running} onExit={() => setRunning(null)} onRestart={start} />;

  const wrong = bank.filter((q) => progress.quiz[q.id] && !progress.quiz[q.id].last).length;
  const seen = bank.filter((q) => progress.quiz[q.id]).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        <StatBox value={bank.length} label="en el banco" />
        <StatBox value={seen - wrong} label="dominadas" tone="text-emerald-600 dark:text-emerald-400" />
        <StatBox value={wrong} label="por repasar" tone="text-rose-600 dark:text-rose-400" />
      </div>

      <Group title="¿Qué preguntas?">
        <Chip active={filter === "todas"} onClick={() => setFilter("todas")}>
          Todas
        </Chip>
        <Chip active={filter === "nuevas"} onClick={() => setFilter("nuevas")}>
          🆕 No vistas
        </Chip>
        <Chip active={filter === "falladas"} onClick={() => setFilter("falladas")}>
          ❌ Falladas · {wrong}
        </Chip>
      </Group>
      <Group title="Nivel">
        {(
          [
            [0, "Todos"],
            [1, "🌱 Básico"],
            [2, "🌿 Intermedio"],
            [3, "🌳 Avanzado"],
          ] as const
        ).map(([v, l]) => (
          <Chip key={v} active={level === v} onClick={() => setLevel(v)}>
            {l}
          </Chip>
        ))}
      </Group>
      <Group title="¿Cuántas?">
        {[5, 10, 20, 0].map((n) => (
          <Chip key={n} active={count === n} onClick={() => setCount(n)}>
            {n === 0 ? "Todas" : n}
          </Chip>
        ))}
      </Group>
      <Button full disabled={pool.length === 0} onClick={start}>
        ▶ Empezar · {count === 0 ? pool.length : Math.min(count, pool.length)} preguntas
      </Button>
      {pool.length === 0 && <p className="text-center text-sm text-muted">No hay preguntas con este filtro. ¡Prueba otro!</p>}
      <p className="text-center text-xs leading-relaxed text-muted">Opción única · múltiple · V/F · emparejar · ordenar · clasificar · respuesta escrita. Cada respuesta trae su explicación.</p>
    </div>
  );
}

function StatBox({ value, label, tone }: { value: number; label: string; tone?: string }) {
  return (
    <div className="rounded-3xl bg-surface p-3 text-center shadow-card ring-1 ring-line">
      <p className={cn("text-2xl font-extrabold tabular-nums", tone)}>{value}</p>
      <p className="text-[11px] font-semibold text-muted">{label}</p>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------- Casos
function Cases({ topic }: { topic: Topic }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const [open, setOpen] = useState<number | null>(null);

  if (open !== null) {
    return (
      <CaseView
        key={open}
        c={topic.cases[open]}
        index={open}
        total={topic.cases.length}
        onBack={() => setOpen(null)}
        onNext={
          open + 1 < topic.cases.length
            ? () => {
                setOpen(open + 1);
                scrollTop();
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-muted">Situaciones reales para aplicar lo aprendido. Lee, razona y responde: al final verás el razonamiento paso a paso.</p>
      {topic.cases.map((c, i) => {
        const st = hydrated ? progress.cases[c.id] : undefined;
        return (
          <Card
            key={c.id}
            onClick={() => {
              setOpen(i);
              scrollTop();
            }}
            className="flex items-center gap-3.5 !p-3.5"
          >
            <span
              className={cn(
                "flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl text-xs font-extrabold",
                st === undefined ? "bg-surface-2 text-muted" : st ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
              )}
            >
              <span className="text-lg leading-none">{st === undefined ? "🧩" : st ? "✅" : "🔁"}</span>
              <span className="mt-0.5 text-[9px]">CASO {i + 1}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-extrabold leading-snug tracking-tight">{c.title}</span>
              <span className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted">{c.scenario}</span>
            </span>
            <ChevronRight className="shrink-0 text-muted/50" />
          </Card>
        );
      })}
    </div>
  );
}

function CaseView({ c, index, total, onBack, onNext }: { c: CaseStudy; index: number; total: number; onBack: () => void; onNext?: () => void }) {
  const [hints, setHints] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [attempt, setAttempt] = useState(0);
  return (
    <div className="animate-pop space-y-4">
      <div className="flex items-center gap-3">
        <BackLink onClick={onBack}>Casos</BackLink>
        <ProgressBar value={pct(index + 1, total)} size="sm" />
        <span className="shrink-0 text-xs font-extrabold tabular-nums text-muted">
          {index + 1}/{total}
        </span>
      </div>
      <h2 className="text-[24px] font-extrabold leading-tight tracking-tight">{c.title}</h2>
      <div className="relative overflow-hidden rounded-3xl bg-amber-50 p-4 pl-5 text-[15px] leading-relaxed ring-1 ring-amber-200/70 dark:bg-amber-500/10 dark:ring-amber-500/20">
        <span className="absolute inset-y-0 left-0 w-1.5 bg-amber-400" />
        <p className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-300">📍 Escenario</p>
        <RichText text={c.scenario} />
      </div>
      {c.hints && (
        <div>
          <button type="button" onClick={() => setHints((h) => !h)} className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
            {hints ? "Ocultar pistas" : "💡 Ver pistas"}
          </button>
          {hints && (
            <ul className="animate-pop mt-2 space-y-1 text-sm text-fg/80">
              {c.hints.map((h) => (
                <li key={h}>• {h}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <Card>
        <QuestionView
          key={attempt}
          q={c.question}
          attempt={attempt}
          onAnswered={(ok) => {
            recordAnswer(c.question.id, ok);
            markCase(c.id, ok);
            setAnswered(true);
          }}
        />
      </Card>
      {answered && (
        <div className="animate-slide-up space-y-3">
          <div className="rounded-3xl bg-indigo-50 p-4 ring-1 ring-indigo-200/70 dark:bg-indigo-500/10 dark:ring-indigo-500/20">
            <p className="mb-2 font-extrabold">🧠 Razonamiento paso a paso</p>
            <ol className="space-y-2 text-sm">
              {c.reasoning.map((r, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">{i + 1}</span>
                  <span className="leading-relaxed">
                    <RichText text={r} />
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setAttempt((a) => a + 1);
                setAnswered(false);
              }}
            >
              🔁 Reintentar
            </Button>
            {onNext ? <Button onClick={onNext}>Siguiente →</Button> : <Button onClick={onBack}>Terminar</Button>}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Resumen
function Summary({ topic }: { topic: Topic }) {
  const color = COLORS[topic.color];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold tracking-tight">Lo esencial para el examen</h2>
        <button type="button" onClick={() => window.print()} className="no-print rounded-full bg-surface px-3 py-1.5 text-sm font-bold shadow-card ring-1 ring-line">
          🖨️ Imprimir
        </button>
      </div>
      <ul className="space-y-2.5">
        {topic.summary.map((s, i) => (
          <li key={i} className="flex gap-3 rounded-3xl bg-surface p-3.5 text-[15px] leading-relaxed shadow-card ring-1 ring-line">
            <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold text-white", color.bg)}>{i + 1}</span>
            <span>
              <RichText text={s} />
            </span>
          </li>
        ))}
      </ul>
      <div>
        <h3 className="mb-2 text-lg font-extrabold tracking-tight">📚 Glosario del tema</h3>
        <dl className="divide-y divide-line overflow-hidden rounded-3xl bg-surface shadow-card ring-1 ring-line">
          {topic.glossary.map((g) => (
            <div key={g.term} className="p-3.5">
              <dt className="font-bold">{g.term}</dt>
              <dd className="mt-0.5 text-sm leading-relaxed text-muted">{g.def}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="text-xs text-muted">Fuente: {topic.source}</p>
    </div>
  );
}
