"use client";

import { useSyncExternalStore } from "react";

// Progreso del estudiante guardado en localStorage.
// - Toda lectura/escritura va en try/catch (modo incógnito, almacenamiento lleno…).
// - Durante el render del servidor y la hidratación se usa EMPTY, así nunca hay
//   errores de hidratación; luego React re-renderiza con los datos reales.

export type QuizStat = { seen: number; correct: number; last: boolean; ts: number };
export type CardStat = { box: number; due: number };
export type ExamRecord = { ts: number; score: number; total: number; topics: string[]; seconds: number };

export type Progress = {
  v: 1;
  sections: Record<string, true>; // "topicId/sectionId"
  quiz: Record<string, QuizStat>; // questionId
  cards: Record<string, CardStat>; // cardId
  labs: Record<string, true>; // labId
  cases: Record<string, boolean>; // caseId -> acertó
  exams: ExamRecord[];
  streak: { day: string; count: number };
  lastTopic?: string;
};

const KEY = "estudio-examen:v1";

const EMPTY: Progress = {
  v: 1,
  sections: {},
  quiz: {},
  cards: {},
  labs: {},
  cases: {},
  exams: [],
  streak: { day: "", count: 0 },
};

let state: Progress = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load(): Progress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    if (!parsed || parsed.v !== 1) return EMPTY;
    return { ...EMPTY, ...parsed };
  } catch {
    return EMPTY;
  }
}

function ensureLoaded() {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    state = load();
    window.addEventListener("storage", (e) => {
      if (e.key === KEY) {
        state = load();
        listeners.forEach((l) => l());
      }
    });
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* sin almacenamiento: el progreso vive solo en memoria */
  }
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function bumpStreak(p: Progress): Progress["streak"] {
  const t = today();
  if (p.streak.day === t) return p.streak;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`;
  return { day: t, count: p.streak.day === yesterday ? p.streak.count + 1 : 1 };
}

export function update(fn: (p: Progress) => Progress) {
  ensureLoaded();
  const next = fn(state);
  state = { ...next, streak: bumpStreak(next) };
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  ensureLoaded();
  listeners.add(l);
  return () => listeners.delete(l);
}

function getSnapshot() {
  ensureLoaded();
  return state;
}

function getServerSnapshot() {
  return EMPTY;
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** true cuando ya se leyó localStorage (evita mostrar 0% un instante) */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

// ---------- acciones ----------

export function markSection(topicId: string, sectionId: string) {
  ensureLoaded();
  const k = `${topicId}/${sectionId}`;
  if (state.sections[k]) return;
  update((p) => ({ ...p, sections: { ...p.sections, [k]: true }, lastTopic: topicId }));
}

export function recordAnswer(questionId: string, correct: boolean) {
  update((p) => {
    const prev = p.quiz[questionId] ?? { seen: 0, correct: 0, last: false, ts: 0 };
    return {
      ...p,
      quiz: {
        ...p.quiz,
        [questionId]: {
          seen: prev.seen + 1,
          correct: prev.correct + (correct ? 1 : 0),
          last: correct,
          ts: Date.now(),
        },
      },
    };
  });
}

// Repetición espaciada tipo Leitner: caja 0..5, intervalos crecientes.
const INTERVALS_H = [0, 4, 24, 72, 168, 336];

export function rateCard(cardId: string, known: boolean) {
  update((p) => {
    const prev = p.cards[cardId] ?? { box: 0, due: 0 };
    const box = known ? Math.min(prev.box + 1, 5) : 0;
    return {
      ...p,
      cards: { ...p.cards, [cardId]: { box, due: Date.now() + INTERVALS_H[box] * 3600_000 } },
    };
  });
}

export function markLab(labId: string) {
  ensureLoaded();
  if (state.labs[labId]) return;
  update((p) => ({ ...p, labs: { ...p.labs, [labId]: true } }));
}

export function markCase(caseId: string, correct: boolean) {
  update((p) => ({ ...p, cases: { ...p.cases, [caseId]: correct } }));
}

export function saveExam(rec: ExamRecord) {
  update((p) => ({ ...p, exams: [rec, ...p.exams].slice(0, 30) }));
}

export function setLastTopic(topicId: string) {
  ensureLoaded();
  if (state.lastTopic === topicId) return;
  update((p) => ({ ...p, lastTopic: topicId }));
}

export function resetProgress() {
  state = EMPTY;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function exportProgress(): string {
  return JSON.stringify(state);
}

export function importProgress(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as Progress;
    if (parsed?.v !== 1) return false;
    update(() => ({ ...EMPTY, ...parsed }));
    return true;
  } catch {
    return false;
  }
}
