"use client";

import { useState } from "react";
import { cn, pct } from "@/lib/utils";
import { markLab } from "@/lib/store";
import { Button, Chip, ProgressBar, RichText } from "@/components/ui";
import { QrIcon } from "@/components/diagrams/quishing";
import { AGENCIA, UseCaseDiagram, type UcLink } from "@/components/diagrams/uml";
import { SusGauge } from "@/components/diagrams/usabilidad";

// ============================================================
// Simulador de despliegue (Entornos)
// ============================================================
type DeployEvent = {
  stage: 0 | 1 | 2 | 3;
  text: string;
  options: { label: string; ok: boolean; feedback: string }[];
};

const STAGE_NAMES = ["👩‍💻 Desarrollo", "🧪 QA", "🎭 Staging", "🌍 Producción"];

const DEPLOY: DeployEvent[] = [
  {
    stage: 0,
    text: "Terminaste de programar la función **“Pagar con QR”** en tu computadora. ¿Qué haces?",
    options: [
      { label: "La pruebo localmente y la subo al repositorio para QA", ok: true, feedback: "Correcto: en Desarrollo se escribe y prueba el código inicial; luego pasa a QA." },
      { label: "La subo directo a Producción, ya funciona en mi máquina", ok: false, feedback: "¡Peligro! Saltarte QA y Staging puede llevar errores a los usuarios finales." },
    ],
  },
  {
    stage: 1,
    text: "El tester descubre que si tocas **dos veces** el botón, el pago se cobra **duplicado**.",
    options: [
      { label: "Devolverlo a Desarrollo para corregirlo", ok: true, feedback: "Así es: QA verifica que funcione sin errores; si hay bug, vuelve a Desarrollo." },
      { label: "Pasarlo a Staging, es un detalle menor", ok: false, feedback: "Un cobro duplicado es grave. QA existe justamente para detenerlo aquí." },
    ],
  },
  {
    stage: 1,
    text: "Se corrigió el bug. Ahora **todas las pruebas pasan** y cumple los requisitos.",
    options: [
      { label: "Promoverlo a Staging", ok: true, feedback: "Bien: siguiente paso, la simulación final en un entorno casi idéntico al real." },
      { label: "Publicarlo en Producción de inmediato", ok: false, feedback: "Falta el ensayo general en Staging." },
    ],
  },
  {
    stage: 2,
    text: "En Staging la app no conecta a la base de datos: la configuración apunta a la **BD de desarrollo**.",
    options: [
      { label: "Configurar la variable de entorno DATABASE_URL propia de Staging", ok: true, feedback: "Correcto: lo que cambia entre entornos va en variables de entorno, no en el código." },
      { label: "Copiar los datos reales de clientes a la laptop del programador", ok: false, feedback: "Riesgo de seguridad y privacidad. Los entornos se configuran, no se mezclan." },
    ],
  },
  {
    stage: 2,
    text: "El cliente revisa la **simulación final** en Staging y **aprueba** la versión.",
    options: [
      { label: "Desplegar a Producción", ok: true, feedback: "¡Listo para los usuarios finales!" },
      { label: "Volver a Desarrollo sin motivo", ok: false, feedback: "No hace falta: fue aprobada." },
    ],
  },
  {
    stage: 3,
    text: "Tras el lanzamiento, el **5 % de usuarios** reporta un error al pagar.",
    options: [
      { label: "Hacer rollback a la versión anterior y analizar el error", ok: true, feedback: "Correcto: primero proteger a los usuarios (rollback), luego corregir siguiendo el ciclo." },
      { label: "Editar el código directamente en el servidor de Producción", ok: false, feedback: "Nunca se programa en Producción: puede empeorar todo y no queda registro." },
    ],
  },
];

export function DeploySim() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);

  if (i >= DEPLOY.length) {
    return (
      <div className="animate-pop space-y-4 text-center">
        <div className="text-6xl">🚀</div>
        <h3 className="text-xl font-bold">¡Funcionalidad publicada!</h3>
        <p className="text-muted">
          Decisiones incorrectas: <strong>{mistakes}</strong>. {mistakes === 0 ? "¡Despliegue perfecto!" : "Repasa el orden Dev → QA → Staging → Producción."}
        </p>
        <Button
          full
          onClick={() => {
            setI(0);
            setPicked(null);
            setMistakes(0);
          }}
        >
          Jugar de nuevo
        </Button>
      </div>
    );
  }

  const ev = DEPLOY[i];
  const opt = picked !== null ? ev.options[picked] : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-1">
        {STAGE_NAMES.map((s, k) => (
          <div
            key={s}
            className={cn(
              "rounded-lg px-1 py-2 text-center text-[10.5px] font-semibold transition",
              k < ev.stage && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
              k === ev.stage && "bg-indigo-600 text-white shadow",
              k > ev.stage && "bg-slate-100 text-slate-400 dark:bg-slate-800",
            )}
          >
            {s}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
        <span className="text-xl">📦</span>
        <span className="font-semibold">Funcionalidad “Pagar con QR”</span>
        <span className="ml-auto text-xs text-rose-600">❌ {mistakes}</span>
      </div>
      <p key={i} className="animate-pop text-[16px] leading-relaxed">
        <RichText text={ev.text} />
      </p>
      <div className="grid gap-2">
        {ev.options.map((o, k) => (
          <button
            key={k}
            type="button"
            disabled={opt?.ok}
            onClick={() => {
              setPicked(k);
              if (!o.ok) setMistakes((m) => m + 1);
            }}
            className={cn(
              "min-h-12 rounded-2xl border-2 px-4 py-3 text-left text-sm font-medium transition",
              picked === k ? (o.ok ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" : "animate-shake border-rose-500 bg-rose-50 dark:bg-rose-950/40") : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      {opt && (
        <div className="animate-pop space-y-2">
          <p className={cn("rounded-xl p-3 text-sm", opt.ok ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-rose-50 dark:bg-rose-950/40")}>{opt.feedback}</p>
          {opt.ok ? (
            <Button
              full
              onClick={() => {
                setPicked(null);
                if (i + 1 >= DEPLOY.length) markLab("deploy-sim");
                setI(i + 1);
              }}
            >
              Continuar →
            </Button>
          ) : (
            <p className="text-center text-xs text-muted">Elige otra opción.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Inspector de QR (Quishing)
// ============================================================
type QrCase = { place: string; icon: string; scene: string; sticker?: boolean; url: string; asks: string; safe: boolean; flags: string[] };

const QR_CASES: QrCase[] = [
  {
    place: "Parquímetro en el centro",
    icon: "🅿️",
    scene: "Cartel: “Paga tu parqueo aquí – 50% OFF”. El QR parece un sticker con los bordes levantados.",
    sticker: true,
    url: "https://parqueo-pagos-lapaz.top/pagar",
    asks: "Número de tarjeta, fecha y CVV",
    safe: false,
    flags: ["Sticker pegado encima de otro QR", "Descuento demasiado bueno", "Dominio .top no oficial", "Pide datos completos de tarjeta"],
  },
  {
    place: "Mesa de restaurante",
    icon: "🍽️",
    scene: "El QR está impreso en la carta plastificada del restaurante “La Casona”.",
    url: "https://menu.lacasona.bo/carta",
    asks: "Nada: solo muestra los platos y precios",
    safe: true,
    flags: ["Impreso en la carta (no es sticker)", "Dominio coincide con el restaurante", "No pide datos sensibles"],
  },
  {
    place: "Correo electrónico",
    icon: "✉️",
    scene: "“¡URGENTE! Su cuenta sera bloqueada en 2 horas. Escanee el codigo para verificar.” De: seguridad@bancoc0ndor-alertas.com",
    url: "https://bancocondor.com.bo.seguridad-verifica.xyz/login",
    asks: "Usuario, contraseña y código SMS",
    safe: false,
    flags: ["Urgencia y amenaza", "Remitente con 0 en vez de o", "Errores de ortografía", "Dominio real: seguridad-verifica.xyz"],
  },
  {
    place: "Panel oficial de la facultad",
    icon: "🎓",
    scene: "Afiche impreso de la Feria de Ciencias, colocado en la vitrina cerrada con llave de la facultad.",
    url: "https://www.univ-andina.edu.bo/eventos/feria",
    asks: "Nada: muestra fecha, hora y lugar",
    safe: true,
    flags: ["Ubicación controlada (vitrina con llave)", "Dominio institucional", "Información pública, sin datos sensibles"],
  },
  {
    place: "Volante en la calle",
    icon: "📄",
    scene: "“¡Ganaste un celular! Escanea y registra tu tarjeta para pagar solo el envío”.",
    url: "https://premios-bolivia.click/registro",
    asks: "Datos de tarjeta y carnet de identidad",
    safe: false,
    flags: ["Premio que no pediste", "Pide tarjeta para 'el envío'", "Dominio .click sospechoso"],
  },
  {
    place: "Caja del supermercado",
    icon: "🛒",
    scene: "La cajera genera un QR de cobro en la pantalla del sistema de caja. Lo escaneas desde la app oficial de tu banco.",
    url: "App del banco: “Pagar Bs 84,50 a Supermercado El Ahorro”",
    asks: "Confirmar el pago en tu propia app (monto y comercio correctos)",
    safe: true,
    flags: ["QR dinámico generado en el momento", "Escaneado dentro de la app oficial", "Monto y comercio verificables"],
  },
  {
    place: "Estación de carga del aeropuerto",
    icon: "🔌",
    scene: "“Carga gratis: escanea y descarga nuestra app para activar el cargador”.",
    url: "https://charge-free.apk-download.net/app.apk",
    asks: "Instalar una app (APK) fuera de la tienda oficial",
    safe: false,
    flags: ["Descarga de APK desde un enlace", "Dominio extraño", "Riesgo de malware"],
  },
  {
    place: "SMS de courier",
    icon: "📦",
    scene: "“Su paquete está retenido en aduana. Pague Bs 12 con el QR del enlace”. No esperabas ningún paquete.",
    url: "https://courier-aduana-pago.com/qr",
    asks: "Pago con tarjeta",
    safe: false,
    flags: ["No esperabas el paquete", "Smishing + quishing", "Monto pequeño para que no sospeches"],
  },
];

export function QrInspector() {
  const [i, setI] = useState(0);
  const [scanned, setScanned] = useState(false);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  if (i >= QR_CASES.length) {
    return (
      <div className="animate-pop space-y-3 text-center">
        <div className="text-6xl">{score === QR_CASES.length ? "🛡️" : "🔍"}</div>
        <p className="text-3xl font-black">
          {score}/{QR_CASES.length}
        </p>
        <p className="text-muted">Recuerda: revisa el entorno, mira el enlace previo y nunca ingreses datos sensibles.</p>
        <Button
          full
          onClick={() => {
            setI(0);
            setScore(0);
            setScanned(false);
            setChoice(null);
          }}
        >
          Repetir
        </Button>
      </div>
    );
  }

  const c = QR_CASES[i];
  const ok = choice !== null && choice === c.safe;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <ProgressBar value={pct(i, QR_CASES.length)} color="bg-rose-500" />
        <span className="text-xs font-semibold tabular-nums text-muted">
          {i + 1}/{QR_CASES.length}
        </span>
      </div>
      <div key={i} className="animate-pop rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-bold">
          {c.icon} {c.place}
        </p>
        <p className="mt-1 text-sm text-muted">{c.scene}</p>
        <div className="mt-3 flex items-center justify-center">
          <div className={cn("relative rounded-xl bg-white p-2 shadow", c.sticker && "rotate-3 ring-2 ring-amber-300")}>
            <QrIcon className="h-24 w-24" />
            {c.sticker && <span className="absolute -right-2 -top-2 rounded bg-amber-300 px-1 text-[9px] font-bold text-amber-900">sticker</span>}
          </div>
        </div>
      </div>

      {!scanned ? (
        <Button full onClick={() => setScanned(true)}>
          📷 Escanear (ver vista previa)
        </Button>
      ) : (
        <div className="animate-pop space-y-3">
          <div className="rounded-2xl bg-slate-900 p-3 text-white">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Vista previa del enlace</p>
            <p className="break-all font-mono text-[13px] text-yellow-300">{c.url}</p>
            <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">La página te pide</p>
            <p className="text-sm">{c.asks}</p>
          </div>
          {choice === null ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="success"
                onClick={() => {
                  setChoice(true);
                  if (c.safe) setScore((s) => s + 1);
                }}
              >
                ✅ Es seguro
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setChoice(false);
                  if (!c.safe) setScore((s) => s + 1);
                }}
              >
                🚫 No abrir
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className={cn("rounded-xl p-3 text-sm", ok ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-rose-50 dark:bg-rose-950/40")}>
                <p className="font-bold">{ok ? "✅ ¡Bien decidido!" : "❌ Cuidado"} — {c.safe ? "Era seguro." : "Era quishing."}</p>
                <ul className="mt-1 space-y-0.5">
                  {c.flags.map((f) => (
                    <li key={f}>
                      {c.safe ? "✔" : "🚩"} {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                full
                onClick={() => {
                  setChoice(null);
                  setScanned(false);
                  if (i + 1 >= QR_CASES.length) markLab("qr-inspector");
                  setI(i + 1);
                }}
              >
                Siguiente →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Detective de dominios
// ============================================================
type UrlCase = { proto: string; host: string[]; path: string; domainCount: number; safe: boolean; note: string };

const URL_CASES: UrlCase[] = [
  { proto: "https://", host: ["bancocondor", "com", "bo", "verificar-cuenta", "xyz"], path: "/login", domainCount: 2, safe: false, note: "Todo lo de la izquierda es un disfraz. El dominio real es verificar-cuenta.xyz." },
  { proto: "https://", host: ["www", "bancocondor", "com", "bo"], path: "/pagos", domainCount: 3, safe: true, note: "El dominio real es bancocondor.com.bo; 'www' es un subdominio normal." },
  { proto: "https://", host: ["secure", "banc0condor", "com"], path: "/bo/acceso", domainCount: 2, safe: false, note: "banc0condor.com usa un cero en lugar de 'o' (typosquatting). '/bo/acceso' es solo la ruta." },
  { proto: "https://", host: ["billeteramovil", "bo", "app-pago", "top"], path: "/qr", domainCount: 2, safe: false, note: "El dominio real es app-pago.top." },
  { proto: "https://", host: ["pagos", "billeteramovil", "com", "bo"], path: "/qr", domainCount: 3, safe: true, note: "El dominio real es billeteramovil.com.bo; 'pagos' es un subdominio." },
  { proto: "https://", host: ["univ-andina", "edu", "bo-inscripciones", "online"], path: "/", domainCount: 2, safe: false, note: "¡Atento al guion! El dominio real es bo-inscripciones.online, no univ-andina.edu.bo." },
  { proto: "https://", host: ["parqueo", "gob", "bo", "pagos-rapidos", "click"], path: "/pagar", domainCount: 2, safe: false, note: "El dominio real es pagos-rapidos.click." },
  { proto: "https://", host: ["bancocondor-com-bo", "webhost-gratis", "app"], path: "/login", domainCount: 2, safe: false, note: "Es un subdominio en un hosting gratuito (webhost-gratis.app): cualquiera puede crearlo." },
];

export function UrlDetective() {
  const [i, setI] = useState(0);
  const [tap, setTap] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  if (i >= URL_CASES.length) {
    return (
      <div className="animate-pop space-y-3 text-center">
        <div className="text-6xl">🕵️</div>
        <p className="text-3xl font-black">
          {score}/{URL_CASES.length}
        </p>
        <p className="text-sm text-muted">Regla: el dominio real está justo antes de la primera “/”. Léelo de derecha a izquierda.</p>
        <Button
          full
          onClick={() => {
            setI(0);
            setScore(0);
            setTap(null);
          }}
        >
          Repetir
        </Button>
      </div>
    );
  }

  const u = URL_CASES[i];
  const domStart = u.host.length - u.domainCount;
  const answered = tap !== null;
  const ok = answered && tap >= domStart;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ProgressBar value={pct(i, URL_CASES.length)} color="bg-rose-500" />
        <span className="text-xs font-semibold text-muted">
          {i + 1}/{URL_CASES.length}
        </span>
      </div>
      <p className="text-sm text-muted">Toca la parte que corresponde al <strong>dominio real</strong>:</p>
      <div key={i} className="animate-pop flex flex-wrap items-center gap-y-2 rounded-2xl bg-slate-100 p-4 font-mono text-[15px] dark:bg-slate-800">
        <span className="text-slate-400">{u.proto}</span>
        {u.host.map((h, k) => (
          <span key={k} className="flex items-center">
            <button
              type="button"
              disabled={answered}
              onClick={() => {
                setTap(k);
                if (k >= domStart) setScore((s) => s + 1);
              }}
              className={cn(
                "rounded-md px-1 py-1 transition",
                !answered && "bg-white shadow-sm hover:bg-indigo-50 dark:bg-slate-900",
                answered && k >= domStart && "bg-rose-500 text-white",
                answered && k < domStart && k === tap && "bg-amber-300 text-amber-950",
                answered && k < domStart && k !== tap && "opacity-50",
              )}
            >
              {h}
            </button>
            {k < u.host.length - 1 && <span className="px-0.5 text-slate-400">.</span>}
          </span>
        ))}
        <span className="text-slate-400">{u.path}</span>
      </div>
      {answered && (
        <div className="animate-pop space-y-2">
          <p className={cn("rounded-xl p-3 text-sm", ok ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-rose-50 dark:bg-rose-950/40")}>
            <strong>{ok ? "✅ ¡Exacto! " : "❌ No. "}</strong>
            Dominio real: <span className="font-mono font-bold">{u.host.slice(domStart).join(".")}</span> — {u.safe ? "legítimo." : "sospechoso."} {u.note}
          </p>
          <Button
            full
            onClick={() => {
              setTap(null);
              if (i + 1 >= URL_CASES.length) markLab("url-detective");
              setI(i + 1);
            }}
          >
            Siguiente →
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Simulador de pedidos de venta (UML)
// ============================================================
type Trace = { icon: "✔" | "✖" | "⚠" | "ℹ"; text: string };

export function OrderSim() {
  const [nit, setNit] = useState(true);
  const [dir, setDir] = useState(true);
  const [limit, setLimit] = useState(10000);
  const [open, setOpen] = useState(4000);
  const [convenio, setConvenio] = useState(false);
  const [stock, setStock] = useState(100);
  const [reserved, setReserved] = useState(30);
  const [qty, setQty] = useState(40);
  const [queued, setQueued] = useState(false);
  const [result, setResult] = useState<{ trace: Trace[]; state: string; tone: "ok" | "warn" | "bad" } | null>(null);
  const [lastWasQueue, setLastWasQueue] = useState(false);

  const LIST = 60;
  const CONV = 52;

  const evaluate = (definitive: boolean, stockNow = stock) => {
    const trace: Trace[] = [];
    if (!nit || !dir) {
      trace.push({ icon: "✖", text: `Cliente sin ${!nit ? "NIT" : ""}${!nit && !dir ? " ni " : ""}${!dir ? "dirección" : ""}: no se pueden procesar pedidos hasta completar el registro maestro.` });
      setResult({ trace, state: "⛔ Pedido no procesable", tone: "bad" });
      setLastWasQueue(false);
      markLab("order-sim");
      return;
    }
    trace.push({ icon: "✔", text: "Cliente existe en el maestro con NIT y dirección. Direcciones tomadas del maestro (no editables)." });
    const price = convenio ? CONV : LIST;
    trace.push({ icon: "ℹ", text: `${convenio ? "Hay convenio vigente" : "Sin convenio vigente"} → precio ${convenio ? "de convenio" : "de lista general"}: Bs ${price} (no modificable). Total: Bs ${price * qty}.` });

    if (!definitive) {
      trace.push({ icon: "✔", text: "Se guarda como borrador: podrá modificarse y registrarse en definitivo después." });
      setResult({ trace, state: "📝 Borrador guardado", tone: "warn" });
      setLastWasQueue(false);
      markLab("order-sim");
      return;
    }

    if (open > limit) {
      trace.push({ icon: "⚠", text: `Pedidos abiertos (Bs ${open}) superan el límite de crédito (Bs ${limit}) → alerta: no se permite registrar en definitivo.` });
      trace.push({ icon: "✔", text: "El pedido se puede guardar como borrador." });
      setResult({ trace, state: "⚠️ Solo borrador (crédito excedido)", tone: "warn" });
      setLastWasQueue(false);
      markLab("order-sim");
      return;
    }
    trace.push({ icon: "✔", text: `Crédito OK: pedidos abiertos Bs ${open} ≤ límite Bs ${limit}.` });

    const available = stockNow - reserved;
    if (queued) {
      trace.push({ icon: "⚠", text: "Ya existen líneas en cola para este material → esta línea también va a la cola (orden de llegada)." });
      setResult({ trace, state: "⏳ Línea en cola de pendientes", tone: "warn" });
      setLastWasQueue(true);
      markLab("order-sim");
      return;
    }
    if (qty <= available) {
      trace.push({ icon: "✔", text: `Inventario: disponible = ${stockNow} − ${reserved} reservadas = ${available} ≥ ${qty} pedidas.` });
      trace.push({ icon: "✔", text: `Pedido dado de ALTA y se registra una reserva de ${qty} unidades.` });
      trace.push({ icon: "ℹ", text: "✉️ Se envía correo: pedido de venta registrado." });
      setResult({ trace, state: "✅ Pedido en definitivo + reserva", tone: "ok" });
      setLastWasQueue(false);
    } else {
      trace.push({ icon: "✖", text: `Inventario: disponible = ${stockNow} − ${reserved} = ${available} < ${qty} pedidas.` });
      trace.push({ icon: "⚠", text: "La línea se coloca en la cola de pedidos pendientes. Un proceso automático la revisará periódicamente." });
      setResult({ trace, state: "⏳ Línea en cola de pendientes", tone: "warn" });
      setLastWasQueue(true);
    }
    markLab("order-sim");
  };

  const arrive = () => {
    const ns = stock + 100;
    setStock(ns);
    setQueued(false);
    if (lastWasQueue) {
      const available = ns - reserved;
      if (qty <= available) {
        setResult({
          state: "✅ Proceso automático: pasó a definitivo",
          tone: "ok",
          trace: [
            { icon: "ℹ", text: `Llegaron 100 unidades: existencias = ${ns}.` },
            { icon: "✔", text: `El proceso automático revisa la cola: disponible ${available} ≥ ${qty}.` },
            { icon: "✔", text: `La línea pasa a definitiva, se da de alta el pedido y se reservan ${qty} unidades.` },
          ],
        });
        setLastWasQueue(false);
      } else {
        setResult({ state: "⏳ Sigue en cola", tone: "warn", trace: [{ icon: "ℹ", text: `Existencias = ${ns}, disponible ${available} < ${qty}. La línea sigue esperando.` }] });
      }
    }
  };

  return (
    <div className="space-y-4">
      <Section title="👤 Cliente">
        <Toggle label="Tiene NIT (identificación fiscal)" value={nit} onChange={setNit} />
        <Toggle label="Tiene dirección registrada" value={dir} onChange={setDir} />
        <Slider label="Límite de crédito" value={limit} min={0} max={20000} step={500} onChange={setLimit} prefix="Bs " />
        <Slider label="Pedidos abiertos" value={open} min={0} max={20000} step={500} onChange={setOpen} prefix="Bs " warn={open > limit} />
      </Section>
      <Section title="📦 Ítem: Cemento (bolsa)">
        <Toggle label={`Convenio vigente con el cliente (Bs ${CONV} en vez de Bs ${LIST})`} value={convenio} onChange={setConvenio} />
        <Slider label="Existencias en inventario" value={stock} min={0} max={300} step={5} onChange={setStock} />
        <Slider label="Reservado para otros pedidos" value={reserved} min={0} max={Math.max(stock, 0)} step={5} onChange={setReserved} />
        <Slider label="Cantidad pedida" value={qty} min={1} max={200} step={1} onChange={setQty} warn={qty > stock - reserved} />
        <Toggle label="Ya hay líneas en cola de este material" value={queued} onChange={setQueued} />
      </Section>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={() => evaluate(false)}>
          📝 Guardar borrador
        </Button>
        <Button onClick={() => evaluate(true)}>✔ Registrar definitivo</Button>
      </div>
      {result && (
        <div className={cn("animate-pop rounded-2xl border-2 p-4", result.tone === "ok" ? "border-emerald-400" : result.tone === "warn" ? "border-amber-400" : "border-rose-400")}>
          <p className="mb-2 text-lg font-black">{result.state}</p>
          <ol className="space-y-1.5 text-sm">
            {result.trace.map((t, k) => (
              <li key={k} className="flex gap-2">
                <span className={cn("font-bold", t.icon === "✔" && "text-emerald-600", t.icon === "✖" && "text-rose-600", t.icon === "⚠" && "text-amber-600", t.icon === "ℹ" && "text-sky-600")}>{t.icon}</span>
                <span>{t.text}</span>
              </li>
            ))}
          </ol>
          {lastWasQueue && (
            <Button variant="secondary" full className="mt-3" onClick={arrive}>
              🚚 Simular llegada de 100 unidades
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-bold">{title}</p>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn("relative h-7 w-12 shrink-0 rounded-full transition", value ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600")}
      >
        <span className={cn("absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all", value ? "left-[22px]" : "left-0.5")} />
      </button>
    </label>
  );
}

function Slider({ label, value, min, max, step, onChange, prefix = "", warn }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; prefix?: string; warn?: boolean }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className={cn("font-mono font-bold", warn && "text-rose-600")}>
          {prefix}
          {value}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-amber-500" aria-label={label} />
    </div>
  );
}

// ============================================================
// Constructor de casos de uso (Agencia de viajes)
// ============================================================
const SHORT: Record<string, string> = { cliente: "Cliente", agente: "Agente", aerea: "Aérea", turismo: "Turismo" };

export function UcBuilder() {
  const [links, setLinks] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);
  const key = (a: string, c: string) => `${a}|${c}`;
  const sol = new Set(AGENCIA.solution.map((l) => key(l.actor, l.uc)));

  const toggle = (a: string, c: string) => {
    setChecked(false);
    setLinks((s) => {
      const n = new Set(s);
      const k = key(a, c);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  };

  const shown: UcLink[] = [];
  links.forEach((k) => {
    const [actor, uc] = k.split("|");
    shown.push({ actor, uc, state: checked ? (sol.has(k) ? "ok" : "extra") : undefined });
  });
  if (checked)
    sol.forEach((k) => {
      if (!links.has(k)) {
        const [actor, uc] = k.split("|");
        shown.push({ actor, uc, state: "missing" });
      }
    });
  const missing = [...sol].filter((k) => !links.has(k)).length;
  const extra = [...links].filter((k) => !sol.has(k)).length;
  const perfect = checked && missing === 0 && extra === 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
        <p className="font-bold">Enunciado (apunte)</p>
        <p className="mt-1 text-xs leading-relaxed">
          Cliente: Reservar boleto de avión, Pagar a agente de viajes · Agente de Viajes: Reservar boleto de avión, Entregar boleto de avión · Compañía Aérea: Reservar asiento, Pagar boleto de avión · Empresa de Turismo: Organizar viaje, Pagar viaje.
        </p>
      </div>
      <p className="text-sm text-muted">Marca qué actor participa en cada caso de uso:</p>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-surface-2">
            <tr>
              <th className="px-2 py-2 text-left text-xs">Caso de uso</th>
              {AGENCIA.actors.map((a) => (
                <th key={a.id} className="px-1 py-2 text-center text-[10px] font-bold">
                  {SHORT[a.id]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AGENCIA.cases.map((c) => (
              <tr key={c.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-2 py-1.5 text-xs leading-tight">{c.label}</td>
                {AGENCIA.actors.map((a) => {
                  const on = links.has(key(a.id, c.id));
                  const k = key(a.id, c.id);
                  const st = checked ? (on && sol.has(k) ? "ok" : on ? "extra" : sol.has(k) ? "missing" : "") : "";
                  return (
                    <td key={a.id} className="px-1 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => toggle(a.id, c.id)}
                        aria-label={`${a.label} - ${c.label}`}
                        className={cn(
                          "h-9 w-9 rounded-lg border-2 text-sm font-bold transition",
                          on ? "border-amber-500 bg-amber-500 text-white" : "border-slate-200 dark:border-white/10",
                          st === "ok" && "border-emerald-500 bg-emerald-500",
                          st === "extra" && "border-rose-500 bg-rose-500",
                          st === "missing" && "border-dashed border-amber-500",
                        )}
                      >
                        {on ? "✓" : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
        <UseCaseDiagram width={360} height={445} system={{ x: 72, y: 18, w: 216, h: 420, title: "Agencia de Viajes" }} actors={AGENCIA.actors} cases={AGENCIA.cases} links={shown} />
      </div>

      {checked && (
        <p className={cn("rounded-xl p-3 text-sm", perfect ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-amber-50 dark:bg-amber-950/40")}>
          {perfect ? "🏆 ¡Diagrama perfecto! Fíjate que 'Reservar boleto de avión' es compartido por Cliente y Agente." : `Te faltan ${missing} asociaciones (punteadas en amarillo) y sobran ${extra} (en rojo).`}
        </p>
      )}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            setLinks(new Set());
            setChecked(false);
          }}
        >
          Borrar
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setLinks(new Set(sol));
            setChecked(true);
          }}
        >
          Solución
        </Button>
        <Button
          onClick={() => {
            setChecked(true);
            markLab("uc-builder");
          }}
        >
          Verificar
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Calculadora SUS (Usabilidad)
// ============================================================
const SUS_ITEMS = [
  "Creo que me gustaría usar este sistema con frecuencia.",
  "Encontré el sistema innecesariamente complejo.",
  "Pensé que el sistema era fácil de usar.",
  "Creo que necesitaría el apoyo de un técnico para poder usar este sistema.",
  "Encontré que las diversas funciones de este sistema estaban bien integradas.",
  "Pensé que había demasiada inconsistencia en este sistema.",
  "Imagino que la mayoría de las personas aprenderían a usar este sistema muy rápidamente.",
  "Encontré el sistema muy incómodo/pesado de usar.",
  "Me sentí muy seguro/confiado al usar el sistema.",
  "Necesité aprender muchas cosas antes de poder ponerme en marcha con este sistema.",
];
const PRESETS: Record<string, number[]> = {
  "😊 Satisfecho": [5, 1, 5, 2, 4, 1, 5, 1, 4, 2],
  "😐 Neutral": [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  "😣 Frustrado": [2, 4, 2, 5, 2, 4, 2, 5, 1, 4],
  "📘 Ejemplo lección": [4, 2, 5, 1, 4, 2, 4, 2, 4, 3],
};

export function susScore(r: (number | null)[]): number | null {
  if (r.some((x) => x === null)) return null;
  const sum = r.reduce<number>((acc, x, i) => acc + (i % 2 === 0 ? (x as number) - 1 : 5 - (x as number)), 0);
  return sum * 2.5;
}

export function SusCalculator() {
  const [r, setR] = useState<(number | null)[]>(Array(10).fill(null));
  const [group, setGroup] = useState<number[]>([]);
  const score = susScore(r);
  const answered = r.filter((x) => x !== null).length;
  const sum = r.reduce<number>((acc, x, i) => acc + (x === null ? 0 : i % 2 === 0 ? x - 1 : 5 - x), 0);
  const avg = group.length ? group.reduce((a, b) => a + b, 0) / group.length : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(PRESETS).map(([k, v]) => (
          <Chip key={k} onClick={() => setR(v)}>
            {k}
          </Chip>
        ))}
        <Chip onClick={() => setR(Array(10).fill(null))}>↺ Limpiar</Chip>
      </div>
      <p className="text-xs text-muted">1 = Totalmente en desacuerdo · 5 = Totalmente de acuerdo</p>

      <div className="space-y-2">
        {SUS_ITEMS.map((txt, i) => {
          const v = r[i];
          const odd = i % 2 === 0;
          const t = v === null ? null : odd ? v - 1 : 5 - v;
          return (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm leading-snug">
                <span className={cn("mr-1 rounded px-1.5 py-0.5 text-[10px] font-bold", odd ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200" : "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200")}>
                  {i + 1} {odd ? "+" : "−"}
                </span>
                {txt}
              </p>
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      const c = r.slice();
                      c[i] = n;
                      setR(c);
                      markLab("sus-calculator");
                    }}
                    className={cn("h-10 flex-1 rounded-lg border-2 text-sm font-bold transition", v === n ? "border-sky-600 bg-sky-600 text-white" : "border-slate-200 dark:border-white/10")}
                  >
                    {n}
                  </button>
                ))}
                <span className="w-16 text-right font-mono text-[11px] text-muted">{t === null ? "—" : odd ? `${v}−1=${t}` : `5−${v}=${t}`}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-20 z-10 rounded-2xl border border-sky-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-sky-900 dark:bg-slate-900/95">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span>
            Respondidas: <strong>{answered}/10</strong>
          </span>
          <span className="font-mono">
            Suma {sum} × 2,5 = <strong>{score ?? "…"}</strong>
          </span>
        </div>
        {score !== null ? <SusGauge score={score} /> : <ProgressBar value={answered * 10} color="bg-sky-500" />}
        {score !== null && (
          <Button full variant="secondary" className="mt-3" onClick={() => setGroup((g) => [...g, score])}>
            ➕ Agregar al grupo de participantes
          </Button>
        )}
      </div>

      {group.length > 0 && (
        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="font-bold">👥 Modo grupo ({group.length} participantes)</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {group.map((g, k) => (
              <span key={k} className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-xs dark:bg-slate-800">
                P{k + 1}: {g}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm">
            Promedio SUS: <strong className="text-lg">{avg!.toFixed(1)}</strong>
          </p>
          <div className="mt-2">
            <SusGauge score={Math.round(avg! * 10) / 10} />
          </div>
          <button type="button" onClick={() => setGroup([])} className="mt-2 text-xs text-rose-600">
            Vaciar grupo
          </button>
        </div>
      )}
    </div>
  );
}
