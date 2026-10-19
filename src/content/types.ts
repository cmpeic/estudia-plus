// Tipos del contenido de estudio. Todo el contenido vive en archivos .ts
// para que la app sea 100% estática (sin servidor) y funcione offline.

export type QBase = {
  id: string;
  prompt: string;
  explanation: string;
  /** 1 = básico, 2 = intermedio, 3 = avanzado */
  level?: 1 | 2 | 3;
  /** Texto de contexto (escenario) que se muestra antes de la pregunta */
  context?: string;
};

export type ChoiceQ = QBase & { type: "choice"; options: string[]; answer: number };
export type MultiQ = QBase & { type: "multi"; options: string[]; answers: number[] };
export type TrueFalseQ = QBase & { type: "tf"; answer: boolean };
export type MatchQ = QBase & { type: "match"; pairs: [string, string][] };
export type OrderQ = QBase & { type: "order"; items: string[] };
export type ClassifyQ = QBase & {
  type: "classify";
  buckets: string[];
  items: { text: string; bucket: number }[];
};
export type InputQ = QBase & {
  type: "input";
  /** Respuestas aceptadas (se comparan normalizadas) */
  answers: string[];
  placeholder?: string;
};

export type Question = ChoiceQ | MultiQ | TrueFalseQ | MatchQ | OrderQ | ClassifyQ | InputQ;

export type CalloutKind = "tip" | "warn" | "exam" | "info" | "example" | "analogy";

export type Block =
  | { t: "p"; text: string }
  | { t: "h"; text: string }
  | { t: "list"; items: string[]; ordered?: boolean }
  | { t: "table"; head: string[]; rows: string[][]; caption?: string }
  | { t: "callout"; kind: CalloutKind; title?: string; text: string }
  | { t: "code"; text: string; lang?: string }
  | { t: "diagram"; id: string; caption?: string }
  | { t: "terms"; items: { term: string; def: string }[] }
  | { t: "check"; q: Question }
  | { t: "steps"; items: { title: string; text: string }[] }
  | { t: "compare"; left: { title: string; items: string[] }; right: { title: string; items: string[] } };

export type Section = {
  id: string;
  title: string;
  /** Una línea: qué vas a entender en esta sección */
  goal?: string;
  blocks: Block[];
};

export type Flashcard = { id: string; front: string; back: string };

export type CaseStudy = {
  id: string;
  title: string;
  /** Situación realista */
  scenario: string;
  /** Pistas o datos para razonar (opcional) */
  hints?: string[];
  question: Question;
  /** Razonamiento paso a paso que se muestra al final */
  reasoning: string[];
};

export type Lab = {
  id: string;
  title: string;
  description: string;
};

export type Topic = {
  id: string;
  title: string;
  short: string;
  /** Emoji simple como icono (sin dependencias) */
  icon: string;
  /** Color de acento (clase de color base de Tailwind) */
  color: TopicColor;
  source: string;
  isNew?: boolean;
  sections: Section[];
  flashcards: Flashcard[];
  questions: Question[];
  cases: CaseStudy[];
  labs: Lab[];
  summary: string[];
  glossary: { term: string; def: string }[];
};

export type TopicColor = "indigo" | "emerald" | "rose" | "amber" | "sky" | "violet";
