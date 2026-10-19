"use client";

import Link from "next/link";
import { TOPICS, getTopic } from "@/content";
import { COLORS } from "@/content/topic-colors";
import { useHydrated, useProgress } from "@/lib/store";
import { topicStats } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { ChevronRight, ProgressBar, RichText, SectionTitle } from "@/components/ui";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "¡Buenos días!";
  if (h < 19) return "¡Buenas tardes!";
  return "¡Buenas noches!";
}

export default function HomeView() {
  const progress = useProgress();
  const hydrated = useHydrated();
  const stats = TOPICS.map((t) => ({ t, s: topicStats(t, progress) }));
  const overall = hydrated ? Math.round(stats.reduce((a, x) => a + x.s.percent, 0) / stats.length) : 0;
  const last = (progress.lastTopic && getTopic(progress.lastTopic)) || TOPICS[0];
  const started = progress.lastTopic !== undefined;
  const wrong = stats.reduce((a, x) => a + x.s.qWrong, 0);
  const sectionsRead = stats.reduce((a, x) => a + x.s.sectionsRead, 0);
  const sectionsTotal = stats.reduce((a, x) => a + x.s.sectionsTotal, 0);
  const mastered = stats.reduce((a, x) => a + x.s.qMastered, 0);
  const terms = TOPICS.reduce((a, t) => a + t.glossary.length, 0);

  // Consejo del día: cambia cada día (solo en el cliente para evitar desajustes)
  const allTips = TOPICS.flatMap((t) => t.summary.map((s) => ({ t, s })));
  const dayIndex = hydrated ? Math.floor(Date.now() / 86_400_000) % allTips.length : 0;
  const tip = allTips[dayIndex];

  return (
    <div className="space-y-6 px-4 pb-6 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
      {/* Encabezado */}
      <header className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" className="h-11 w-11 rounded-2xl shadow-card" />
          <div>
            <p className="text-sm font-semibold text-muted" suppressHydrationWarning>
              {hydrated ? greeting() : "¡Hola!"} 👋
            </p>
            <h1 className="text-[22px] font-extrabold leading-tight tracking-tight">¿Qué estudiamos hoy?</h1>
          </div>
        </div>
        <Link href="/ajustes/" aria-label="Ajustes" className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-muted shadow-card ring-1 ring-line transition active:scale-95">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </Link>
      </header>

      {/* Tarjeta principal */}
      <section className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 text-white shadow-float">
        <div className="dots pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-fuchsia-300/30 blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">Progreso general</p>
              <p className="mt-1 text-5xl font-extrabold leading-none tracking-tight tabular-nums">
                {overall}
                <span className="text-2xl text-white/70">%</span>
              </p>
            </div>
            <div className="flex flex-col items-center rounded-2xl bg-white/15 px-3 py-2 ring-1 ring-white/20 backdrop-blur">
              <span className="text-2xl leading-none">🔥</span>
              <span className="mt-1 text-lg font-extrabold leading-none tabular-nums">{hydrated ? progress.streak.count : 0}</span>
              <span className="text-[10px] font-semibold text-white/75">{hydrated && progress.streak.count === 1 ? "día" : "días"}</span>
            </div>
          </div>
          <ProgressBar value={overall} size="lg" color="bg-white" className="mt-4 bg-white/20 dark:bg-white/20" />
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <HeroStat value={`${hydrated ? sectionsRead : 0}/${sectionsTotal}`} label="secciones" />
            <HeroStat value={String(hydrated ? mastered : 0)} label="dominadas" />
            <HeroStat value={String(hydrated ? wrong : 0)} label="por repasar" />
          </div>
          <Link
            href={`/tema/${last.id}/`}
            className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-3 text-slate-900 shadow-[0_4px_0_0_rgb(0_0_0/0.18)] transition active:translate-y-[3px] active:shadow-[0_1px_0_0_rgb(0_0_0/0.18)]"
          >
            <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-2xl", COLORS[last.color].grad)}>{last.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold uppercase tracking-wide text-indigo-600">{hydrated && started ? "Continuar" : "Empieza por aquí"}</span>
              <span className="block truncate text-[15px] font-extrabold">{last.title.split(":")[0]}</span>
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">▶</span>
          </Link>
        </div>
      </section>

      {/* Accesos rápidos */}
      <section className="grid grid-cols-3 gap-3">
        <QuickAction href="/examen/" icon="⏱️" title="Simulacro" sub="con nota" tint="from-rose-500 to-orange-400" />
        <QuickAction href="/repaso/" icon="🔁" title="Repaso" sub={hydrated && wrong ? `${wrong} errores` : "tarjetas"} tint="from-emerald-500 to-teal-400" />
        <QuickAction href="/glosario/" icon="📚" title="Glosario" sub={`${terms} términos`} tint="from-amber-500 to-yellow-400" />
      </section>

      {/* Consejo del día */}
      <section className="rounded-3xl bg-surface p-4 shadow-card ring-1 ring-line">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-base dark:bg-amber-500/20">💡</span>
          <p className="text-sm font-extrabold">Dato clave del día</p>
          <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold", COLORS[tip.t.color].soft, COLORS[tip.t.color].text)}>
            {tip.t.icon} {tip.t.title.split(":")[0].split(" ").slice(0, 2).join(" ")}
          </span>
        </div>
        <p className="text-[14.5px] leading-relaxed text-fg/80" suppressHydrationWarning>
          <RichText text={tip.s} />
        </p>
      </section>

      {/* Temas */}
      <section>
        <SectionTitle action={<span className="text-xs font-semibold text-muted">{TOPICS.length} temas</span>}>Tus temas</SectionTitle>
        <div className="space-y-3">
          {stats.map(({ t, s }) => {
            const c = COLORS[t.color];
            const pctv = hydrated ? s.percent : 0;
            const next = t.sections.find((sec) => !progress.sections[`${t.id}/${sec.id}`]);
            return (
              <Link
                key={t.id}
                href={`/tema/${t.id}/`}
                className="group flex items-center gap-3.5 rounded-3xl bg-surface p-3.5 shadow-card ring-1 ring-line transition duration-150 active:scale-[0.985]"
              >
                <span className={cn("relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-[28px] shadow-[inset_0_-3px_0_rgb(0_0_0/0.12)]", c.grad)}>
                  {t.icon}
                  {pctv === 100 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white ring-2 ring-surface">✓</span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[15px] font-extrabold tracking-tight">{t.title.split(":")[0]}</span>
                    {t.isNew && <span className="shrink-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-white">NUEVO</span>}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted">
                    {hydrated && pctv > 0 && next ? `Sigue: ${next.title}` : t.short}
                  </span>
                  <span className="mt-2 flex items-center gap-2">
                    <ProgressBar value={pctv} size="sm" color={c.bg} />
                    <span className="w-8 shrink-0 text-right text-[11px] font-extrabold tabular-nums text-muted">{pctv}%</span>
                  </span>
                </span>
                <ChevronRight className="shrink-0 text-muted/60 transition group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      </section>

      <p className="pb-2 text-center text-[11px] text-muted">Funciona sin conexión · tu progreso se guarda en este dispositivo</p>
    </div>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/12 px-1 py-2 ring-1 ring-white/15">
      <p className="text-[15px] font-extrabold leading-none tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] font-semibold text-white/75">{label}</p>
    </div>
  );
}

function QuickAction({ href, icon, title, sub, tint }: { href: string; icon: string; title: string; sub: string; tint: string }) {
  return (
    <Link href={href} className="flex flex-col items-start gap-2 rounded-3xl bg-surface p-3 shadow-card ring-1 ring-line transition active:scale-[0.97]">
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-xl shadow-[inset_0_-2px_0_rgb(0_0_0/0.12)]", tint)}>{icon}</span>
      <span>
        <span className="block text-sm font-extrabold leading-tight">{title}</span>
        <span className="block text-[11px] font-medium text-muted">{sub}</span>
      </span>
    </Link>
  );
}
