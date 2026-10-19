"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RichText } from "@/components/ui";
import { DetailPanel, Frame } from "./shared";

const TRIAD = {
  eficacia: { icon: "🎯", name: "Eficacia", q: "¿Puede completar la tarea correctamente?", ex: "El estudiante se inscribe en una asignatura **sin cometer errores**.", m: "% de tareas completadas, número de errores" },
  eficiencia: { icon: "⚡", name: "Eficiencia", q: "¿Cuántos recursos le cuesta?", ex: "Encuentra su calificación **en pocos segundos**.", m: "Tiempo por tarea, número de pasos/clics, esfuerzo" },
  satisfaccion: { icon: "😊", name: "Satisfacción", q: "¿Cómo se siente al usarlo?", ex: "Considera la plataforma **clara, agradable y fácil** de manejar.", m: "Cuestionarios (SUS), entrevistas" },
  contexto: { icon: "🧩", name: "Contexto de uso", q: "¿Quién, qué tarea, con qué equipo y dónde?", ex: "No es lo mismo un docente en PC que un estudiante en el celular desde el bus.", m: "Usuarios, tareas, equipo y entorno concretos" },
};

export function IsoTriad() {
  const [sel, setSel] = useState<keyof typeof TRIAD>("eficacia");
  const t = TRIAD[sel];
  const node = (k: keyof typeof TRIAD, x: number, y: number) => (
    <g onClick={() => setSel(k)} className="cursor-pointer">
      <circle cx={x} cy={y} r={34} strokeWidth={sel === k ? 3 : 1.5} className={sel === k ? "fill-sky-100 stroke-sky-500 dark:fill-sky-950" : "fill-white stroke-slate-300 dark:fill-slate-900 dark:stroke-slate-600"} />
      <text x={x} y={y - 4} textAnchor="middle" fontSize={20}>
        {TRIAD[k].icon}
      </text>
      <text x={x} y={y + 18} textAnchor="middle" fontSize={10} className="fill-slate-800 font-bold dark:fill-slate-100">
        {TRIAD[k].name}
      </text>
    </g>
  );
  return (
    <Frame>
      <svg viewBox="0 0 300 230" className="mx-auto h-auto w-full max-w-sm select-none">
        <polygon points="150,40 50,190 250,190" fill="none" strokeWidth={2} strokeDasharray="6 5" className="stroke-sky-300 dark:stroke-sky-800" />
        <g onClick={() => setSel("contexto")} className="cursor-pointer">
          <rect x={102} y={118} width={96} height={34} rx={10} strokeWidth={sel === "contexto" ? 3 : 1.5} className={sel === "contexto" ? "fill-amber-100 stroke-amber-500 dark:fill-amber-950" : "fill-slate-50 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-600"} />
          <text x={150} y={139} textAnchor="middle" fontSize={10} className="fill-slate-800 font-semibold dark:fill-slate-100">
            🧩 Contexto de uso
          </text>
        </g>
        {node("eficacia", 150, 40)}
        {node("eficiencia", 50, 190)}
        {node("satisfaccion", 250, 190)}
      </svg>
      <p className="-mt-1 mb-2 text-center text-[11px] font-semibold text-slate-400">ISO 9241-11</p>
      <DetailPanel title={`${t.icon} ${t.name}: ${t.q}`} color="sky">
        <RichText text={t.ex} />
        <p className="mt-1 text-xs">
          <strong>Se mide con:</strong> {t.m}
        </p>
      </DetailPanel>
    </Frame>
  );
}

const STAGES = [
  { icon: "✏️", name: "Diseño y prototipos", text: "¿La distribución, los nombres de opciones y los recorridos son comprensibles **antes de programar**?", cost: 1 },
  { icon: "🛠️", name: "Durante el desarrollo", text: "Detectar problemas cuando **aún es barato corregirlos**.", cost: 2 },
  { icon: "🚦", name: "Antes de implementar", text: "¿Los usuarios **completan las tareas principales**? ¿Está listo?", cost: 3 },
  { icon: "🚀", name: "Después de implementar", text: "Percepción de **usuarios reales**, dificultades y mejoras para futuras versiones.", cost: 4 },
  { icon: "🔄", name: "Después de una actualización", text: "Comparar la experiencia **anterior vs nueva**: ¿mejoró o empeoró?", cost: 4 },
];

export function UxTimeline() {
  const [sel, setSel] = useState(0);
  return (
    <Frame>
      <div className="relative flex justify-between">
        <div className="absolute left-5 right-5 top-5 h-1 rounded bg-gradient-to-r from-emerald-300 via-amber-300 to-rose-300" />
        {STAGES.map((s, i) => (
          <button key={s.name} type="button" onClick={() => setSel(i)} className="relative z-10 flex w-14 flex-col items-center gap-1">
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white text-lg transition dark:bg-slate-900", sel === i ? "scale-110 border-sky-500" : "border-slate-300 dark:border-slate-600")}>{s.icon}</span>
            <span className="text-center text-[9.5px] font-semibold leading-tight">{s.name}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted">Costo de corregir un problema: 🟢 bajo al inicio → 🔴 alto al final</p>
      <div className="mt-2">
        <DetailPanel title={`${STAGES[sel].icon} ${STAGES[sel].name}`} color="sky">
          <RichText text={STAGES[sel].text} />
        </DetailPanel>
      </div>
    </Frame>
  );
}

export function susBand(score: number) {
  if (score < 50) return { label: "Bajo", color: "text-rose-600", bg: "bg-rose-500", text: "Resultado bajo: sugiere dificultades importantes o una experiencia poco favorable." };
  if (score < 68) return { label: "Inferior a la referencia", color: "text-amber-600", bg: "bg-amber-500", text: "Por debajo del valor de referencia (68): conviene investigar las dificultades y priorizar mejoras." };
  if (score === 68) return { label: "Referencia", color: "text-sky-600", bg: "bg-sky-500", text: "68 es el valor de referencia tradicional para comparar con otros sistemas." };
  if (score < 80) return { label: "Superior a la referencia", color: "text-lime-600", bg: "bg-lime-500", text: "Supera la referencia de 68, aunque todavía pueden existir problemas específicos." };
  return { label: "Favorable", color: "text-emerald-600", bg: "bg-emerald-500", text: "Alrededor de 80 o más suele asociarse con una usabilidad percibida favorable (según población y contexto)." };
}

export function SusGauge({ score }: { score: number }) {
  const b = susBand(score);
  return (
    <div>
      <div className="relative h-4 overflow-hidden rounded-full">
        <div className="absolute inset-y-0 left-0 w-[50%] bg-rose-400" />
        <div className="absolute inset-y-0 left-[50%] w-[18%] bg-amber-400" />
        <div className="absolute inset-y-0 left-[68%] w-[12%] bg-lime-400" />
        <div className="absolute inset-y-0 left-[80%] w-[20%] bg-emerald-500" />
        <div className="absolute inset-y-0 left-[68%] w-0.5 bg-slate-900 dark:bg-white" />
      </div>
      <div className="relative h-6">
        <div className="absolute -translate-x-1/2 transition-all duration-500" style={{ left: `${score}%` }}>
          <div className="mx-auto h-0 w-0 border-x-[7px] border-b-[9px] border-x-transparent border-b-slate-900 dark:border-b-white" />
        </div>
      </div>
      <div className="flex justify-between text-[10px] font-semibold text-slate-400">
        <span>0</span>
        <span>50</span>
        <span className="text-slate-900 dark:text-white">68</span>
        <span>80</span>
        <span>100</span>
      </div>
      <p className={cn("mt-2 text-center text-lg font-black", b.color)}>
        {score % 1 === 0 ? score : score.toFixed(1)} · {b.label}
      </p>
      <p className="text-center text-sm text-muted">{b.text}</p>
    </div>
  );
}

export function SusScale() {
  const [s, setS] = useState(55);
  return (
    <Frame>
      <SusGauge score={s} />
      <input type="range" min={0} max={100} step={2.5} value={s} onChange={(e) => setS(Number(e.target.value))} className="mt-3 w-full accent-sky-600" aria-label="Puntuación SUS" />
      <p className="mt-1 text-center text-[11px] text-slate-400">Recuerda: SUS no es un porcentaje y los intervalos son orientativos.</p>
    </Frame>
  );
}
