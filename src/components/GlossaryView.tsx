"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TOPICS } from "@/content";
import { COLORS } from "@/content/topic-colors";
import { cn, normalize } from "@/lib/utils";
import { EmptyState, PageHeader } from "@/components/ui";

type Entry = { term: string; def: string; topicId: string };

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const n = normalize(text);
  const i = n.indexOf(q);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-amber-200 px-0.5 text-inherit dark:bg-amber-500/40">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

export default function GlossaryView() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string | null>(null);

  const all = useMemo<Entry[]>(
    () =>
      TOPICS.flatMap((t) => t.glossary.map((g) => ({ ...g, topicId: t.id }))).sort((a, b) =>
        normalize(a.term).localeCompare(normalize(b.term), "es"),
      ),
    [],
  );

  const q = normalize(query);
  const list = all.filter((e) => (!topic || e.topicId === topic) && (!q || normalize(e.term).includes(q) || normalize(e.def).includes(q)));

  const groups = useMemo(() => {
    const m = new Map<string, Entry[]>();
    for (const e of list) {
      const letter = normalize(e.term).charAt(0).toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : "#";
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(e);
    }
    return [...m.entries()];
  }, [list]);

  return (
    <div>
      <PageHeader title="Glosario" subtitle={`${all.length} términos de todos los temas`} />
      <div className="space-y-4 px-4 py-4">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar término o definición…"
            type="search"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:focus:ring-indigo-500/20"
          />
        </div>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <button
            type="button"
            onClick={() => setTopic(null)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition",
              topic === null ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900" : "border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
            )}
          >
            Todos
          </button>
          {TOPICS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTopic(topic === t.id ? null : t.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition",
                topic === t.id ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900" : "border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
              )}
            >
              {t.icon} {t.title.split(":")[0]}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState icon="🔎" title="Sin resultados" text={`No encontramos “${query}”. Prueba con otra palabra.`} />
        ) : (
          <div className="space-y-5">
            {groups.map(([letter, entries]) => (
              <section key={letter}>
                <h2 className="sticky top-14 z-10 -mx-4 bg-[var(--bg)]/90 px-4 py-1 text-xs font-black tracking-widest text-slate-400 backdrop-blur">{letter}</h2>
                <div className="mt-1 space-y-2">
                  {entries.map((e) => {
                    const t = TOPICS.find((x) => x.id === e.topicId)!;
                    return (
                      <div key={`${e.topicId}-${e.term}`} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold leading-snug">
                            <Highlight text={e.term} q={q} />
                          </h3>
                          <Link href={`/tema/${t.id}/`} className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold", COLORS[t.color].soft, COLORS[t.color].text)}>
                            {t.icon} {t.title.split(":")[0].split(" ")[0]}
                          </Link>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                          <Highlight text={e.def} q={q} />
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
