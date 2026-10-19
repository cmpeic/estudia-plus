"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RichText } from "@/components/ui";
import { DetailPanel, Frame, Hint } from "./shared";

const LAYERS = [
  {
    id: "red",
    icon: "🌐",
    name: "Infraestructura de red y conectividad",
    color: "bg-sky-100 border-sky-300 dark:bg-sky-950/50 dark:border-sky-800",
    what: "Protocolos de red, **puertos abiertos**, servidores web (**Nginx, Apache**) o servicios en la nube (**AWS, Azure, Google Cloud**) si el sistema es distribuido o web.",
    ex: ["HTTPS · puerto 443", "Nginx / Apache", "AWS, Azure, GCP"],
    fail: "🚫 'No se puede acceder a este sitio' · ERR_CONNECTION_REFUSED",
  },
  {
    id: "libs",
    icon: "📦",
    name: "Bibliotecas y dependencias",
    color: "bg-violet-100 border-violet-300 dark:bg-violet-950/50 dark:border-violet-800",
    what: "Código preescrito, **drivers** y **paquetes externos** que el software llama para realizar funciones específicas.",
    ex: ["React, Pandas", "Driver ODBC", "paquetes npm / pip"],
    fail: "💥 ModuleNotFoundError: No module named 'pandas'",
  },
  {
    id: "mid",
    icon: "⚙️",
    name: "Middleware y motores de ejecución",
    color: "bg-amber-100 border-amber-300 dark:bg-amber-950/50 dark:border-amber-800",
    what: "Entornos intermedios: **máquinas virtuales** (JVM para Java), **intérpretes** (Node.js para JavaScript) o **motores de bases de datos**.",
    ex: ["JVM", "Node.js", "MySQL / PostgreSQL"],
    fail: "⛔ 'java' no se reconoce como un comando · No se encontró Java Runtime",
  },
  {
    id: "so",
    icon: "🪟",
    name: "Sistema Operativo",
    color: "bg-emerald-100 border-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800",
    what: "La **plataforma base** (Linux, Windows, macOS, iOS, Android) que **gestiona los recursos físicos** de la máquina.",
    ex: ["Windows", "Linux", "Android / iOS"],
    fail: "❌ 'Esta aplicación no es compatible con tu sistema'",
  },
  {
    id: "hw",
    icon: "🖥️",
    name: "Hardware",
    color: "bg-slate-200 border-slate-400 dark:bg-slate-800 dark:border-slate-600",
    what: "**Procesador (CPU)**, **memoria RAM**, **almacenamiento** (SSD/HDD) y **capacidad gráfica** necesarios para soportar la carga del programa.",
    ex: ["CPU", "RAM", "SSD / HDD", "GPU"],
    fail: "🐢 Memoria insuficiente · el sistema se congela con muchos usuarios",
  },
];

export function EnvStack({ simulate = false }: { simulate?: boolean }) {
  const [sel, setSel] = useState<string | null>(null);
  const [mode, setMode] = useState<"explore" | "fail">(simulate ? "fail" : "explore");
  const [off, setOff] = useState<Set<string>>(new Set());
  const layer = LAYERS.find((l) => l.id === sel);
  const broken = LAYERS.filter((l) => off.has(l.id));

  const tap = (id: string) => {
    if (mode === "explore") setSel(id);
    else
      setOff((s) => {
        const n = new Set(s);
        if (n.has(id)) n.delete(id);
        else n.add(id);
        return n;
      });
  };

  return (
    <Frame>
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-sm font-semibold dark:bg-slate-800">
        {(["explore", "fail"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setOff(new Set());
            }}
            className={cn("rounded-lg py-2", mode === m ? "bg-white shadow dark:bg-slate-950" : "text-muted")}
          >
            {m === "explore" ? "🔍 Explorar" : "🧨 Simular falla"}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "mb-2 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-3 text-center text-sm font-bold transition",
          broken.length ? "animate-shake border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" : "border-indigo-300 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
        )}
      >
        {broken.length ? "💥 La aplicación NO funciona" : "🚀 Tu aplicación funcionando"}
      </div>

      <div className="space-y-1.5">
        {LAYERS.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => tap(l.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left transition",
              l.color,
              mode === "explore" && sel === l.id && "ring-2 ring-indigo-500",
              off.has(l.id) && "border-dashed opacity-40 grayscale",
            )}
          >
            <span className="text-xl">{l.icon}</span>
            <span className="flex-1 text-sm font-semibold leading-tight">{l.name}</span>
            {mode === "fail" && <span className="text-xs font-bold">{off.has(l.id) ? "QUITADO" : "OK"}</span>}
          </button>
        ))}
      </div>

      <div className="mt-3">
        {mode === "explore" ? (
          layer ? (
            <DetailPanel title={`${layer.icon} ${layer.name}`} color="emerald">
              <RichText text={layer.what} />
              <div className="mt-2 flex flex-wrap gap-1">
                {layer.ex.map((e) => (
                  <span key={e} className="rounded-full bg-white px-2 py-0.5 text-xs font-medium dark:bg-slate-900">
                    {e}
                  </span>
                ))}
              </div>
            </DetailPanel>
          ) : (
            <Hint>Toca una capa: cada una se apoya en la de abajo.</Hint>
          )
        ) : broken.length ? (
          <div className="space-y-2">
            {broken.map((b) => (
              <DetailPanel key={b.id} title={`Sin ${b.name.toLowerCase()}`} color="rose">
                <code className="block font-mono text-xs">{b.fail}</code>
              </DetailPanel>
            ))}
          </div>
        ) : (
          <Hint>Toca una capa para quitarla y ver qué error aparece.</Hint>
        )}
      </div>
    </Frame>
  );
}

const STAGES = [
  { icon: "👩‍💻", name: "Desarrollo", en: "Development", who: "Programadores", what: "Local o compartido: se **escribe y prueba el código inicial**.", data: "Datos ficticios", risk: "Bajo: si algo se rompe, solo afecta al programador." },
  { icon: "🧪", name: "Pruebas / QA", en: "Testing", who: "Testers / QA", what: "Se **verifica que funcione sin errores** y **cumpla los requisitos**.", data: "Datos de prueba controlados", risk: "Medio: aquí deben aparecer los bugs." },
  { icon: "🎭", name: "Staging", en: "Preproducción", who: "Equipo, QA, cliente", what: "Espacio **casi idéntico al real** para **simulaciones finales** antes de lanzar.", data: "Copia realista (anonimizada)", risk: "Último filtro antes del público." },
  { icon: "🌍", name: "Producción", en: "Production", who: "Usuarios finales", what: "El **entorno real, en vivo**, donde los usuarios finales operan el software.", data: "Datos reales", risk: "Alto: un error afecta a clientes reales." },
];

export function EnvPipeline() {
  const [sel, setSel] = useState(0);
  const s = STAGES[sel];
  return (
    <Frame>
      <div className="flex items-stretch gap-1">
        {STAGES.map((st, i) => (
          <div key={st.name} className="flex flex-1 items-center gap-1">
            <button
              type="button"
              onClick={() => setSel(i)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl border-2 px-1 py-2 text-center transition",
                sel === i ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50" : "border-slate-200 dark:border-white/10",
              )}
            >
              <span className="text-xl">{st.icon}</span>
              <span className="text-[10px] font-bold text-slate-400">{i + 1}</span>
              <span className="text-[11px] font-semibold leading-tight">{st.name.split(" /")[0]}</span>
            </button>
            {i < STAGES.length - 1 && <span className="text-slate-400">›</span>}
          </div>
        ))}
      </div>
      <div className="mt-3">
        <DetailPanel title={`${s.icon} ${s.name} (${s.en})`} color="emerald">
          <RichText text={s.what} />
          <ul className="mt-2 space-y-0.5 text-xs">
            <li>
              <strong>Quién:</strong> {s.who}
            </li>
            <li>
              <strong>Datos:</strong> {s.data}
            </li>
            <li>
              <strong>Riesgo:</strong> {s.risk}
            </li>
          </ul>
        </DetailPanel>
      </div>
    </Frame>
  );
}
