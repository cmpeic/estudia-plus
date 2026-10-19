import type { Topic } from "@/content/types";
import { allQuestions } from "@/content";
import type { Progress } from "./store";

export type TopicStats = {
  percent: number;
  sectionsRead: number;
  sectionsTotal: number;
  qMastered: number;
  qTotal: number;
  qWrong: number;
  cardsKnown: number;
  cardsTotal: number;
  labsDone: number;
  labsTotal: number;
  casesDone: number;
  casesTotal: number;
};

/** Progreso ponderado: lectura 30%, preguntas 35%, tarjetas 15%, labs 10%, casos 10% */
export function topicStats(t: Topic, p: Progress): TopicStats {
  const sectionsRead = t.sections.filter((s) => p.sections[`${t.id}/${s.id}`]).length;
  const qs = allQuestions(t);
  const qMastered = qs.filter((q) => p.quiz[q.id]?.last).length;
  const qWrong = qs.filter((q) => p.quiz[q.id] && !p.quiz[q.id].last).length;
  const cardsKnown = t.flashcards.filter((c) => (p.cards[c.id]?.box ?? 0) >= 2).length;
  const labsDone = t.labs.filter((l) => p.labs[l.id]).length;
  const casesDone = t.cases.filter((c) => p.cases[c.id] !== undefined).length;
  const r = (a: number, b: number) => (b === 0 ? 1 : a / b);
  const percent = Math.round(
    100 *
      (0.3 * r(sectionsRead, t.sections.length) +
        0.35 * r(qMastered, qs.length) +
        0.15 * r(cardsKnown, t.flashcards.length) +
        0.1 * r(labsDone, t.labs.length) +
        0.1 * r(casesDone, t.cases.length)),
  );
  return {
    percent,
    sectionsRead,
    sectionsTotal: t.sections.length,
    qMastered,
    qTotal: qs.length,
    qWrong,
    cardsKnown,
    cardsTotal: t.flashcards.length,
    labsDone,
    labsTotal: t.labs.length,
    casesDone,
    casesTotal: t.cases.length,
  };
}
