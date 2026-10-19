import type { TopicColor } from "./types";

// Clases completas escritas a mano para que Tailwind las detecte en el build.
export const COLORS: Record<
  TopicColor,
  { bg: string; soft: string; text: string; ring: string; border: string; grad: string; hex: string }
> = {
  indigo: {
    bg: "bg-indigo-600",
    soft: "bg-indigo-50 dark:bg-indigo-950/50",
    text: "text-indigo-700 dark:text-indigo-300",
    ring: "ring-indigo-500",
    border: "border-indigo-200 dark:border-indigo-800",
    grad: "from-indigo-600 to-violet-600",
    hex: "#6366f1",
  },
  emerald: {
    bg: "bg-emerald-600",
    soft: "bg-emerald-50 dark:bg-emerald-950/50",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "ring-emerald-500",
    border: "border-emerald-200 dark:border-emerald-800",
    grad: "from-emerald-600 to-teal-600",
    hex: "#10b981",
  },
  rose: {
    bg: "bg-rose-600",
    soft: "bg-rose-50 dark:bg-rose-950/50",
    text: "text-rose-700 dark:text-rose-300",
    ring: "ring-rose-500",
    border: "border-rose-200 dark:border-rose-800",
    grad: "from-rose-600 to-orange-500",
    hex: "#f43f5e",
  },
  amber: {
    bg: "bg-amber-500",
    soft: "bg-amber-50 dark:bg-amber-950/50",
    text: "text-amber-700 dark:text-amber-300",
    ring: "ring-amber-500",
    border: "border-amber-200 dark:border-amber-800",
    grad: "from-amber-500 to-orange-600",
    hex: "#f59e0b",
  },
  sky: {
    bg: "bg-sky-600",
    soft: "bg-sky-50 dark:bg-sky-950/50",
    text: "text-sky-700 dark:text-sky-300",
    ring: "ring-sky-500",
    border: "border-sky-200 dark:border-sky-800",
    grad: "from-sky-600 to-blue-700",
    hex: "#0ea5e9",
  },
  violet: {
    bg: "bg-violet-600",
    soft: "bg-violet-50 dark:bg-violet-950/50",
    text: "text-violet-700 dark:text-violet-300",
    ring: "ring-violet-500",
    border: "border-violet-200 dark:border-violet-800",
    grad: "from-violet-600 to-fuchsia-600",
    hex: "#8b5cf6",
  },
};
