"use client";

import Link from "next/link";
import { useEffect } from "react";

// Si algo falla en una pantalla, se muestra esto en lugar de una página en blanco.
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl">🛠️</div>
      <h1 className="mt-4 text-2xl font-black">Algo salió mal</h1>
      <p className="mt-2 max-w-xs text-sm text-slate-500">Tu progreso está a salvo. Intenta de nuevo o vuelve al inicio.</p>
      <div className="mt-6 flex gap-2">
        <button type="button" onClick={() => retry()} className="h-12 rounded-2xl bg-indigo-600 px-6 font-semibold text-white">
          Reintentar
        </button>
        <Link href="/" className="inline-flex h-12 items-center rounded-2xl border border-slate-300 px-6 font-semibold dark:border-slate-700">
          Inicio
        </Link>
      </div>
    </div>
  );
}
