"use client";

import { useEffect, useState } from "react";
import { TOPICS } from "@/content";
import { exportProgress, importProgress, resetProgress, useProgress } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button, PageHeader } from "@/components/ui";

type Theme = "light" | "dark" | "system";

function applyTheme(t: Theme) {
  const dark = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export default function SettingsView() {
  const progress = useProgress();
  const [theme, setTheme] = useState<Theme>("system");
  const [importText, setImportText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem("theme") as Theme | null;
      if (t === "light" || t === "dark" || t === "system") setTheme(t);
    } catch {
      /* ignore */
    }
  }, []);

  const changeTheme = (t: Theme) => {
    setTheme(t);
    try {
      localStorage.setItem("theme", t);
    } catch {
      /* ignore */
    }
    applyTheme(t);
  };

  const download = () => {
    const blob = new Blob([exportProgress()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `estudia-progreso-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const answered = Object.keys(progress.quiz).length;
  const sections = Object.keys(progress.sections).length;
  const totalSections = TOPICS.reduce((a, t) => a + t.sections.length, 0);

  return (
    <div>
      <PageHeader title="Ajustes" back="/" />
      <div className="space-y-6 px-4 py-4">
        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Apariencia</h2>
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-200/60 p-1.5 dark:bg-slate-800/60">
            {(
              [
                ["light", "☀️", "Claro"],
                ["dark", "🌙", "Oscuro"],
                ["system", "📱", "Sistema"],
              ] as const
            ).map(([v, icon, label]) => (
              <button
                key={v}
                type="button"
                onClick={() => changeTheme(v)}
                className={cn("flex flex-col items-center gap-0.5 rounded-xl py-3 text-sm font-semibold transition", theme === v ? "bg-white shadow-sm dark:bg-slate-950" : "text-muted")}
              >
                <span className="text-xl">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Tu progreso</h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-900">
              <p className="text-xl font-black">
                {sections}/{totalSections}
              </p>
              <p className="text-[11px] text-muted">secciones</p>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-900">
              <p className="text-xl font-black">{answered}</p>
              <p className="text-[11px] text-muted">preguntas vistas</p>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-900">
              <p className="text-xl font-black">{progress.exams.length}</p>
              <p className="text-[11px] text-muted">simulacros</p>
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Tu progreso se guarda solo en este dispositivo (no hace falta cuenta). Para pasarlo a otro celular, descárgalo y luego impórtalo allá.
          </p>
          <div className="mt-3 grid gap-2">
            <Button variant="secondary" onClick={download}>
              ⬇️ Descargar copia de mi progreso
            </Button>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Pega aquí el contenido del archivo de progreso para importarlo…"
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-mono text-xs dark:border-slate-800 dark:bg-slate-900"
            />
            <Button
              variant="secondary"
              disabled={!importText.trim()}
              onClick={() => {
                const ok = importProgress(importText.trim());
                setMsg(ok ? "✅ Progreso importado correctamente." : "❌ El texto no es un progreso válido.");
                if (ok) setImportText("");
              }}
            >
              ⬆️ Importar progreso
            </Button>
            {msg && <p className="text-center text-sm">{msg}</p>}
            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm("¿Borrar todo tu progreso? Esta acción no se puede deshacer.")) {
                  resetProgress();
                  setMsg("Progreso reiniciado.");
                }
              }}
            >
              🗑️ Reiniciar todo el progreso
            </Button>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Instalar como app</h2>
          <div className="space-y-2 rounded-2xl bg-white p-4 text-sm leading-relaxed shadow-sm dark:bg-slate-900">
            <p>
              <strong>Android (Chrome):</strong> menú ⋮ → <em>Agregar a la pantalla principal</em>.
            </p>
            <p>
              <strong>iPhone (Safari):</strong> botón Compartir → <em>Agregar a inicio</em>.
            </p>
            <p className="text-muted">Una vez abierta, la app funciona sin conexión: ideal para repasar camino al examen.</p>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Contenido</h2>
          <ul className="divide-y divide-slate-100 rounded-2xl bg-white shadow-sm dark:divide-slate-800 dark:bg-slate-900">
            {TOPICS.map((t) => (
              <li key={t.id} className="flex items-center gap-3 p-3 text-sm">
                <span className="text-xl">{t.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{t.title}</span>
                  <span className="block truncate text-xs text-muted">Fuente: {t.source}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
