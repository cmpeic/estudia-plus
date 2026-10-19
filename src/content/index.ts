import type { Question, Topic } from "./types";
import { arquitectura } from "./topics/arquitectura";
import { entornos } from "./topics/entornos";
import { quishing } from "./topics/quishing";
import { uml } from "./topics/uml";
import { usabilidad } from "./topics/usabilidad";
import { redesIp } from "./topics/redes-ip";

export const TOPICS: Topic[] = [redesIp, arquitectura, entornos, uml, usabilidad, quishing];

export function getTopic(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}

export type TaggedQuestion = Question & { topicId: string };

/** Todas las preguntas del banco (práctica + casos + mini-checks de lecciones) */
export function allQuestions(topic: Topic): Question[] {
  const checks: Question[] = [];
  for (const s of topic.sections) for (const b of s.blocks) if (b.t === "check") checks.push(b.q);
  return [...topic.questions, ...checks];
}

export function questionBank(topicIds?: string[]): TaggedQuestion[] {
  return TOPICS.filter((t) => !topicIds || topicIds.includes(t.id)).flatMap((t) =>
    allQuestions(t).map((q) => ({ ...q, topicId: t.id })),
  );
}

export function topicOfQuestion(qid: string): Topic | undefined {
  return TOPICS.find((t) => allQuestions(t).some((q) => q.id === qid) || t.cases.some((c) => c.question.id === qid));
}
