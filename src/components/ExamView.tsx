"use client";

import { useEffect, useRef, useState } from "react";
import { TOPICS, getTopic, questionBank, type TaggedQuestion } from "@/content";
import { COLORS } from "@/content/topic-colors";
import { recordAnswer, saveExam, useProgress } from "@/lib/store";
import { cn, pct, shuffle } from "@/lib/utils";
import { Button, Card, Chip, PageHeader, ProgressBar, RichText } from "@/components/ui";
import QuestionView from "@/components/quiz/QuestionView";

type Phase = "config" | "run" | "result";
type Ans = { q: TaggedQuestion; ok: boolean | null };

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ExamView() {
  const progress = useProgress();
  const [phase, setPhase] = useState<Phase>("config");
  const [topics, setTopics] = useState<string[]>(TOPICS.map((t) => t.id));
  const [count, setCount] = useState(20);
  const [timed, setTimed] = useState(true);
  const [answers, setAnswers] = useState<Ans[]>([]);
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [left, setLeft] = useState(0);
  const [startTs, setStartTs] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const finishing = useRef(false);

  const available = questionBank(topics).length;

  const start = () => {
    // Reparte las preguntas entre los temas elegidos para que todos aparezcan
    const perTopic = topics.map((id) => shuffle(questionBank([id])));
    const picked: TaggedQuestion[] = [];
    let round = 0;
    while (picked.length < count && perTopic.some((l) => l.length > round)) {
      for (const l of perTopic) if (l[round] && picked.length < count) picked.push(l[round]);
      round++;
    }
    setAnswers(shuffle(picked).map((q) => ({ q, ok: null })));
    setIdx(0);
    setAnswered(false);
    setLeft(picked.length * 60);
    setStartTs(Date.now());
    finishing.current = false;
    setPhase("run");
    window.scrollTo({ top: 0 });
  };

  const finish = (list: Ans[]) => {
    if (finishing.current) return;
    finishing.current = true;
    const secs = Math.round((Date.now() - startTs) / 1000);
    setElapsed(secs);
    list.forEach((a) => {
      if (a.ok !== null) recordAnswer(a.q.id, a.ok);
    });
    const score = list.filter((a) => a.ok).length;
    saveExam({ ts: Date.now(), score, total: list.length, topics, seconds: secs });
    setAnswers(list);
    setPhase("result");
    window.scrollTo({ top: 0 });
  };

  // Cronómetro
  useEffect(() => {
    if (phase !== "run" || !timed) return;
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, [phase, timed]);

  useEffect(() => {
    if (phase === "run" && timed && left === 0 && answers.length > 0) finish(answers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  // ---------------- configuración
  if (phase === "config") {
    return (
      <div>
        <PageHeader title="Simulacro de examen" subtitle="Preguntas mezcladas sin ayuda, nota al final" />
        <div className="space-y-6 px-4 py-2">
          <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-rose-500 via-orange-500 to-amber-400 p-5 text-white shadow-float">
            <div className="dots pointer-events-none absolute inset-0 opacity-50" />
            <div className="pointer-events-none absolute -right-6 -top-8 text-[110px] leading-none opacity-25">⏱️</div>
            <div className="relative">
              <p className="text-xs font-extrabold uppercase tracking-widest text-white/80">Modo examen</p>
              <h2 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight">Ponte a prueba como el día del examen</h2>
              <p className="mt-1 text-sm text-white/85">Sin pistas ni correcciones hasta el final. Al terminar verás tu nota y la explicación de cada pregunta.</p>
              {progress.exams.length > 0 && (
                <div className="mt-3 flex gap-2 text-xs font-bold">
                  <span className="rounded-full bg-white/20 px-3 py-1 ring-1 ring-white/25">🏅 Mejor: {Math.max(...progress.exams.map((e) => pct(e.score, e.total)))}/100</span>
                  <span className="rounded-full bg-white/20 px-3 py-1 ring-1 ring-white/25">📝 {progress.exams.length} simulacro{progress.exams.length === 1 ? "" : "s"}</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">Temas incluidos</p>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <Chip
                  key={t.id}
                  active={topics.includes(t.id)}
                  onClick={() => setTopics((s) => (s.includes(t.id) ? (s.length > 1 ? s.filter((x) => x !== t.id) : s) : [...s, t.id]))}
                >
                  {t.icon} {t.title.split(":")[0]}
                </Chip>
              ))}
            </div>
            <button type="button" className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400" onClick={() => setTopics(TOPICS.map((t) => t.id))}>
              Seleccionar todos
            </button>
          </div>
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">Número de preguntas</p>
            <div className="flex flex-wrap gap-2">
              {[10, 20, 30, 50].map((n) => (
                <Chip key={n} active={count === n} onClick={() => setCount(n)}>
                  {n}
                </Chip>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">Disponibles con estos temas: {available}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={timed}
            onClick={() => setTimed((t) => !t)}
            className="flex w-full items-center justify-between gap-3 rounded-3xl bg-surface p-4 text-left shadow-card ring-1 ring-line"
          >
            <span>
              <span className="block font-extrabold">⏱️ Con tiempo</span>
              <span className="block text-xs text-muted">1 minuto por pregunta, como en un examen real</span>
            </span>
            <span className={cn("relative h-8 w-14 shrink-0 rounded-full transition", timed ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600")}>
              <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all", timed ? "left-7" : "left-1")} />
            </span>
          </button>
          <Button full onClick={start}>
            ▶ Comenzar simulacro ({Math.min(count, available)} preguntas)
          </Button>

          {progress.exams.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">Historial</p>
              <div className="space-y-2">
                {progress.exams.slice(0, 8).map((e) => {
                  const p = pct(e.score, e.total);
                  return (
                    <Card key={e.ts} className="flex items-center gap-3 !p-3">
                      <span className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-sm font-black text-white", p >= 70 ? "bg-emerald-500" : p >= 51 ? "bg-amber-500" : "bg-rose-500")}>{p}</span>
                      <span className="flex-1 text-sm">
                        <span className="block font-semibold">
                          {e.score}/{e.total} correctas
                        </span>
                        <span className="block text-xs text-muted">
                          {new Date(e.ts).toLocaleDateString("es")} · {fmt(e.seconds)} · {e.topics.length} tema(s)
                        </span>
                      </span>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------- resultado
  if (phase === "result") {
    const score = answers.filter((a) => a.ok).length;
    const p = pct(score, answers.length);
    const byTopic = topics
      .map((id) => {
        const list = answers.filter((a) => a.q.topicId === id);
        return { t: getTopic(id)!, ok: list.filter((a) => a.ok).length, n: list.length };
      })
      .filter((x) => x.n > 0);
    return (
      <div>
        <PageHeader title="Resultado del simulacro" />
        <div className="space-y-5 px-4 py-4">
          <div className={cn("rounded-3xl p-6 text-center text-white shadow-lg", p >= 70 ? "bg-gradient-to-br from-emerald-500 to-teal-600" : p >= 51 ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-rose-500 to-pink-600")}>
            <p className="text-sm opacity-90">Tu nota</p>
            <p className="text-6xl font-black">{p}</p>
            <p className="text-sm">sobre 100</p>
            <p className="mt-2 text-sm">
              {score} de {answers.length} correctas · {fmt(elapsed)}
            </p>
            <p className="mt-2 font-bold">{p >= 90 ? "¡Excelente! 🏆" : p >= 70 ? "¡Aprobado con buena nota! 🎉" : p >= 51 ? "Aprobado, pero repasa 📚" : "Necesitas repasar más 💪"}</p>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold">Por tema</p>
            <div className="space-y-2">
              {byTopic.map(({ t, ok, n }) => (
                <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold">
                      {t.icon} {t.title.split(":")[0]}
                    </span>
                    <span className="font-mono">
                      {ok}/{n}
                    </span>
                  </div>
                  <ProgressBar value={pct(ok, n)} color={COLORS[t.color].bg} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold">Revisión pregunta por pregunta</p>
            <div className="space-y-2">
              {answers.map((a, i) => (
                <details key={i} className={cn("rounded-xl border bg-white p-3 dark:bg-slate-900", a.ok ? "border-emerald-200 dark:border-emerald-900" : "border-rose-200 dark:border-rose-900")}>
                  <summary className="cursor-pointer text-sm">
                    <span className="mr-1">{a.ok ? "✅" : a.ok === null ? "⏳" : "❌"}</span>
                    <RichText text={a.q.prompt} />
                  </summary>
                  <p className="mt-2 text-sm text-muted">
                    <RichText text={a.q.explanation} />
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">{getTopic(a.q.topicId)?.title}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Button onClick={start}>🔁 Otro simulacro igual</Button>
            <Button variant="secondary" onClick={() => setPhase("config")}>
              Cambiar configuración
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- en curso
  const cur = answers[idx];
  const t = getTopic(cur.q.topicId)!;
  const next = (list: Ans[]) => {
    if (idx + 1 >= list.length) finish(list);
    else {
      setIdx(idx + 1);
      setAnswered(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div>
      <PageHeader
        title={`Pregunta ${idx + 1} de ${answers.length}`}
        subtitle={`${t.icon} ${t.title}`}
        right={
          timed ? (
            <span className={cn("rounded-full px-3 py-1 font-mono text-sm font-bold", left < 60 ? "animate-pulse bg-rose-600 text-white" : "bg-slate-200 dark:bg-slate-800")}>⏱ {fmt(left)}</span>
          ) : undefined
        }
      />
      <div className="space-y-4 px-4 py-4">
        <ProgressBar value={pct(idx, answers.length)} />
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <QuestionView
            key={idx}
            q={cur.q}
            reveal={false}
            attempt={idx}
            onAnswered={(ok) => {
              setAnswers((l) => l.map((a, i) => (i === idx ? { ...a, ok } : a)));
              setAnswered(true);
            }}
            footer={
              <Button full onClick={() => next(answers)}>
                {idx + 1 >= answers.length ? "Terminar y ver nota" : "Siguiente →"}
              </Button>
            }
          />
        </div>
        {!answered && (
          <div className="flex justify-between">
            <button type="button" className="text-sm text-muted" onClick={() => next(answers)}>
              Saltar →
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-rose-600"
              onClick={() => {
                if (window.confirm("¿Terminar el simulacro ahora? Las preguntas sin responder cuentan como incorrectas.")) finish(answers);
              }}
            >
              Terminar ya
            </button>
          </div>
        )}
        {answered && <p className="text-center text-xs text-slate-400">Respuesta guardada. La corrección se muestra al final.</p>}
      </div>
    </div>
  );
}
