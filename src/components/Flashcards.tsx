"use client";

import { useRef, useState } from "react";
import type { Flashcard } from "@/content/types";
import { rateCard, useProgress } from "@/lib/store";
import { cn, pct, shuffle } from "@/lib/utils";
import { Button, Card, ProgressBar, RichText } from "@/components/ui";

type Deck = (Flashcard & { tag?: string })[];

export default function Flashcards({ cards, title }: { cards: Deck; title?: string }) {
  const progress = useProgress();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const now = Date.now();
  const due = cards.filter((c) => (progress.cards[c.id]?.due ?? 0) <= now);
  const mastered = cards.filter((c) => (progress.cards[c.id]?.box ?? 0) >= 3).length;

  const start = (d: Deck) => {
    setDeck(shuffle(d));
    setI(0);
    setFlipped(false);
    setKnown(0);
    // Lleva el mazo a la vista (debajo de los encabezados fijos)
    requestAnimationFrame(() => boxRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  if (!deck) {
    return (
      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-muted">{title ?? "Tarjetas de memoria"}</p>
              <p className="mt-0.5 text-3xl font-extrabold tracking-tight">{cards.length} tarjetas</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-bold text-emerald-600 dark:text-emerald-400">✓ {mastered} dominadas</p>
              <p className="font-semibold text-amber-600 dark:text-amber-400">⏰ {due.length} para hoy</p>
            </div>
          </div>
          <ProgressBar className="mt-4" value={pct(mastered, cards.length)} color="bg-emerald-500" size="lg" />
        </Card>
        <p className="text-sm leading-relaxed text-muted">
          Lee la pregunta, intenta responder <strong>en voz alta</strong> y luego toca la tarjeta para girarla. Si la sabías, marca <strong>“Lo sé”</strong>: volverá en
          unos días. Si no, volverá pronto (repetición espaciada).
        </p>
        <div className="grid gap-3">
          <Button disabled={due.length === 0} onClick={() => start(due)}>
            ▶ Estudiar pendientes ({due.length})
          </Button>
          <Button variant="secondary" onClick={() => start(cards)}>
            Repasar todas ({cards.length})
          </Button>
        </div>
      </div>
    );
  }

  if (i >= deck.length) {
    return (
      <div className="animate-pop space-y-4 text-center">
        <div className="text-6xl">🎉</div>
        <h3 className="text-2xl font-extrabold tracking-tight">¡Mazo completado!</h3>
        <p className="text-muted">
          Sabías {known} de {deck.length} ({pct(known, deck.length)}%)
        </p>
        <div className="grid gap-3">
          <Button onClick={() => start(deck)}>Repetir este mazo</Button>
          <Button variant="ghost" onClick={() => setDeck(null)}>
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const card = deck[i];
  const rate = (ok: boolean) => {
    rateCard(card.id, ok);
    if (ok) setKnown((k) => k + 1);
    setFlipped(false);
    setTimeout(() => setI((x) => x + 1), 150);
  };

  return (
    <div ref={boxRef} className="scroll-mt-36 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setDeck(null)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-muted shadow-card ring-1 ring-line active:scale-95" aria-label="Salir">
          ✕
        </button>
        <ProgressBar value={pct(i, deck.length)} color="bg-emerald-500" size="lg" />
        <span className="shrink-0 text-xs font-extrabold tabular-nums text-muted">
          {i + 1}/{deck.length}
        </span>
      </div>

      <button type="button" onClick={() => setFlipped((f) => !f)} className="flip block h-80 w-full text-left" aria-label="Girar tarjeta">
        <div className={cn("flip-inner relative h-full w-full", flipped && "flipped")}>
          <div className="flip-face absolute inset-0 flex flex-col rounded-4xl bg-surface p-6 shadow-float ring-1 ring-line">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">{card.tag ?? "Pregunta"}</span>
              <span className="text-2xl">🤔</span>
            </div>
            <div className="flex flex-1 items-center justify-center text-center text-[22px] font-extrabold leading-snug tracking-tight">
              <RichText text={card.front} />
            </div>
            <p className="text-center text-xs font-semibold text-muted">Piensa la respuesta y toca para girar ↻</p>
          </div>
          <div className="flip-face flip-back absolute inset-0 flex flex-col overflow-hidden rounded-4xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-float">
            <div className="dots pointer-events-none absolute inset-0 opacity-40" />
            <span className="relative w-fit rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest">💡 Respuesta</span>
            <div className="relative flex flex-1 items-center justify-center overflow-y-auto text-center text-[17px] font-semibold leading-relaxed">
              <RichText text={card.back} />
            </div>
          </div>
        </div>
      </button>

      <div className={cn("grid grid-cols-2 gap-3 transition-all duration-300", flipped ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0")}>
        <Button variant="secondary" onClick={() => rate(false)}>
          😕 Repasar
        </Button>
        <Button variant="success" onClick={() => rate(true)}>
          😊 Lo sé
        </Button>
      </div>
    </div>
  );
}
