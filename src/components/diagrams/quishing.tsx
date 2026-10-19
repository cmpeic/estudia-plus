"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RichText } from "@/components/ui";
import { DetailPanel, Frame, Hint, StepControls, useStepper } from "./shared";

const FAMILY = [
  { icon: "✉️", name: "Phishing", channel: "Correo electrónico", ex: "'Su cuenta será suspendida, haga clic aquí para verificar'." },
  { icon: "💬", name: "Smishing", channel: "SMS / mensajería", ex: "'Su paquete está retenido, pague Bs 12 en este enlace'." },
  { icon: "📞", name: "Vishing", channel: "Llamada de voz", ex: "'Le llamamos del banco, díganos el código que le llegó'." },
  { icon: "🔳", name: "Quishing", channel: "Código QR", ex: "Sticker con QR falso pegado sobre el parquímetro o el menú." },
];

export function PhishingFamily() {
  const [sel, setSel] = useState(3);
  return (
    <Frame>
      <div className="grid grid-cols-4 gap-2">
        {FAMILY.map((f, i) => (
          <button
            key={f.name}
            type="button"
            onClick={() => setSel(i)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl border-2 p-2 text-center",
              sel === i ? "border-rose-500 bg-rose-50 dark:bg-rose-950/50" : "border-slate-200 dark:border-white/10",
            )}
          >
            <span className="text-2xl">{f.icon}</span>
            <span className="text-[11px] font-bold">{f.name}</span>
          </button>
        ))}
      </div>
      <div className="mt-3">
        <DetailPanel title={`${FAMILY[sel].icon} ${FAMILY[sel].name} · ${FAMILY[sel].channel}`} color="rose">
          {FAMILY[sel].ex}
          <p className="mt-1 text-xs text-muted">Objetivo común: robar datos o dinero mediante engaño (ingeniería social).</p>
        </DetailPanel>
      </div>
    </Frame>
  );
}

const FLOW = [
  {
    icon: "🎭",
    name: "1. El engaño",
    text: "El atacante **crea o suplanta** un QR: correo, SMS, folleto o un **sticker pegado encima** del QR legítimo.",
    screen: (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-amber-100 p-3 text-center dark:bg-amber-950">
        <div className="text-[10px] font-bold text-amber-800 dark:text-amber-200">🅿️ PARQUÍMETRO</div>
        <div className="relative">
          <QrIcon className="h-16 w-16 opacity-40" />
          <div className="absolute -right-2 -top-2 rotate-6 rounded bg-white p-1 shadow-md">
            <QrIcon className="h-14 w-14" />
          </div>
        </div>
        <div className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">¡Paga aquí 50% OFF!</div>
      </div>
    ),
  },
  {
    icon: "📷",
    name: "2. El escaneo",
    text: "La víctima **escanea el código con la cámara** de su teléfono, confiando en lo que ve.",
    screen: (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-900 p-3">
        <div className="relative rounded-lg border-2 border-yellow-400 p-2">
          <QrIcon className="h-16 w-16 invert" />
        </div>
        <div className="text-[10px] text-white">Escaneando…</div>
      </div>
    ),
  },
  {
    icon: "↪️",
    name: "3. La redirección",
    text: "Se abre una **URL maliciosa** que imita a un **banco**, una **billetera virtual** o un **login oficial**.",
    screen: (
      <div className="flex h-full flex-col bg-white text-slate-900">
        <div className="truncate bg-slate-100 px-2 py-1 font-mono text-[8px]">🔒 bancocondor.com.bo.pago-xyz.top</div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1 p-2">
          <div className="text-[11px] font-bold text-blue-800">Banco Cóndor</div>
          <div className="h-4 w-full rounded border text-[7px]">Usuario</div>
          <div className="h-4 w-full rounded border text-[7px]">Contraseña</div>
          <div className="w-full rounded bg-blue-700 py-0.5 text-center text-[8px] text-white">Ingresar</div>
        </div>
      </div>
    ),
  },
  {
    icon: "💸",
    name: "4. El robo",
    text: "La página roba **contraseñas, tarjetas, datos personales** o **instala malware**.",
    screen: (
      <div className="flex h-full flex-col items-center justify-center gap-1 bg-rose-950 p-3 text-center text-rose-100">
        <div className="text-3xl">🕵️</div>
        <div className="text-[9px] font-mono">usuario: ana.p</div>
        <div className="text-[9px] font-mono">clave: ********</div>
        <div className="text-[9px] font-mono">tarjeta: 4517 •••• ••••</div>
        <div className="mt-1 text-[10px] font-bold">Datos enviados al atacante</div>
      </div>
    ),
  },
];

export function QuishingFlow() {
  const st = useStepper(FLOW.length, 2800);
  const cur = FLOW[st.step];
  return (
    <Frame>
      <div className="flex items-center gap-4">
        <div className="relative h-52 w-28 shrink-0 overflow-hidden rounded-[1.4rem] border-[5px] border-slate-800 bg-black shadow-xl dark:border-slate-600">
          <div className="absolute left-1/2 top-1 z-10 h-1.5 w-8 -translate-x-1/2 rounded-full bg-slate-800" />
          <div key={st.step} className="animate-pop h-full">
            {cur.screen}
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          {FLOW.map((f, i) => (
            <button
              key={f.name}
              type="button"
              onClick={() => st.setStep(i)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition",
                i === st.step ? "bg-rose-100 font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-200" : i < st.step ? "text-muted line-through decoration-rose-300" : "text-muted",
              )}
            >
              <span>{f.icon}</span>
              {f.name}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <DetailPanel title={cur.name} color="rose">
          <RichText text={cur.text} />
        </DetailPanel>
        <StepControls stepper={st} total={FLOW.length} />
      </div>
    </Frame>
  );
}

export function QrIcon({ className }: { className?: string }) {
  // QR decorativo (no codifica nada)
  const cells = [
    "1111111010111111",
    "1000001001100001",
    "1011101011101101",
    "1011101000101101",
    "1011101010101101",
    "1000001011000001",
    "1111111010111111",
    "0000000011000000",
    "1101011101011010",
    "0110100110110101",
    "1011011001101011",
    "0000000010110010",
    "1111111001011101",
    "1000001011010110",
    "1011101010111011",
    "1111111011010101",
  ];
  return (
    <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges" aria-hidden>
      <rect width="16" height="16" fill="white" />
      {cells.flatMap((row, y) => row.split("").map((c, x) => (c === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="black" /> : null)))}
    </svg>
  );
}

const URLS = [
  {
    parts: [
      { t: "https://", k: "proto" },
      { t: "bancocondor.com.bo.", k: "fake" },
      { t: "verificar-cuenta.xyz", k: "domain" },
      { t: "/login", k: "path" },
    ],
    verdict: "🚩 Falso: el dominio real es verificar-cuenta.xyz. 'bancocondor.com.bo' es solo un subdominio inventado.",
  },
  {
    parts: [
      { t: "https://", k: "proto" },
      { t: "www.", k: "sub" },
      { t: "bancocondor.com.bo", k: "domain" },
      { t: "/pagos/qr", k: "path" },
    ],
    verdict: "✅ Legítimo (si ese es el dominio oficial del banco): el dominio real es bancocondor.com.bo.",
  },
  {
    parts: [
      { t: "https://", k: "proto" },
      { t: "secure-login.", k: "fake" },
      { t: "banc0condor.com", k: "domain" },
      { t: "/bo/acceso", k: "path" },
    ],
    verdict: "🚩 Falso: 'banc0condor' usa un cero en lugar de la 'o' (typosquatting).",
  },
];

const PART_INFO: Record<string, { label: string; cls: string; text: string }> = {
  proto: { label: "Protocolo", cls: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200", text: "https:// solo indica que la conexión está cifrada. ¡Los sitios falsos también pueden tener candado!" },
  fake: { label: "Subdominio (disfraz)", cls: "bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100", text: "Todo lo que está a la izquierda del dominio real lo elige el dueño del sitio. El atacante pone aquí nombres confiables para engañarte." },
  sub: { label: "Subdominio", cls: "bg-sky-200 text-sky-900 dark:bg-sky-800 dark:text-sky-100", text: "www. es un subdominio normal del dominio real." },
  domain: { label: "Dominio real", cls: "bg-rose-500 text-white", text: "Es lo que hay justo antes de la primera '/'. Léelo de derecha a izquierda: esto es lo que debes verificar." },
  path: { label: "Ruta", cls: "bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100", text: "La ruta dentro del sitio. Puede contener cualquier palabra ('/banco/oficial') y no prueba nada." },
};

export function UrlAnatomy() {
  const [u, setU] = useState(0);
  const [part, setPart] = useState<string | null>("domain");
  const url = URLS[u];
  return (
    <Frame>
      <div className="mb-3 flex gap-2">
        {URLS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setU(i);
              setPart("domain");
            }}
            className={cn("flex-1 rounded-lg border py-1.5 text-xs font-semibold", u === i ? "border-rose-500 bg-rose-50 dark:bg-rose-950/40" : "border-slate-300 dark:border-white/15")}
          >
            Ejemplo {i + 1}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-0.5 rounded-xl bg-slate-100 p-3 font-mono text-[13px] dark:bg-slate-800">
        {url.parts.map((p, i) => (
          <button key={i} type="button" onClick={() => setPart(p.k)} className={cn("rounded px-1 py-0.5 transition", PART_INFO[p.k].cls, part === p.k && "ring-2 ring-indigo-500")}>
            {p.t}
          </button>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {part ? (
          <DetailPanel title={PART_INFO[part].label} color="rose">
            {PART_INFO[part].text}
          </DetailPanel>
        ) : (
          <Hint>Toca cada parte de la URL.</Hint>
        )}
        <p className="rounded-lg bg-slate-50 p-2 text-sm font-medium dark:bg-slate-800/60">{url.verdict}</p>
      </div>
    </Frame>
  );
}
