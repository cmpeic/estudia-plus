import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl">🧭</div>
      <h1 className="mt-4 text-2xl font-black">Página no encontrada</h1>
      <p className="mt-2 max-w-xs text-sm text-slate-500">Esta página no existe o cambió de lugar. Vuelve al inicio para seguir estudiando.</p>
      <Link href="/" className="mt-6 inline-flex h-12 items-center rounded-2xl bg-indigo-600 px-6 font-semibold text-white">
        Ir al inicio
      </Link>
    </div>
  );
}
