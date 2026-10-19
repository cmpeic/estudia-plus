"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RichText } from "@/components/ui";
import { DetailPanel, Frame, Hint, StepControls, useStepper } from "./shared";

// ---------------- Ciclo de etapas ----------------
const CYCLE = [
  { icon: "📋", name: "Requisitos", text: "Qué necesita el sistema: funciones y **atributos de calidad** (disponibilidad, seguridad, desempeño…)." },
  { icon: "✏️", name: "Diseño", text: "Se decide **qué componentes** habrá, qué **patrón** usar (ej. MVC) y **cómo se relacionan**." },
  { icon: "📚", name: "Documentación", text: "Se registran decisiones y diagramas para que el equipo **entienda y mantenga** el sistema." },
  { icon: "✅", name: "Evaluación", text: "Se verifica que el funcionamiento **cumple los atributos de calidad**. Si no, se vuelve a los requisitos o al diseño." },
];

export function ArchCycle() {
  const [sel, setSel] = useState(0);
  return (
    <Frame>
      <div className="relative grid grid-cols-2 gap-3">
        {CYCLE.map((c, i) => {
          // orden visual en reloj: 0 arriba-izq, 1 arriba-der, 2 abajo-der, 3 abajo-izq
          const pos = ["order-1", "order-2", "order-4", "order-3"][i];
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => setSel(i)}
              className={cn(
                pos,
                "flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center transition",
                sel === i ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50" : "border-slate-200 dark:border-white/10",
              )}
            >
              <span className="text-2xl">{c.icon}</span>
              <span className="text-xs font-bold text-slate-400">Etapa {i + 1}</span>
              <span className="text-sm font-semibold">{c.name}</span>
            </button>
          );
        })}
        <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-xl text-white shadow-lg dark:border-slate-900">
          ↻
        </div>
      </div>
      <div className="mt-3">
        <DetailPanel title={`${CYCLE[sel].icon} ${CYCLE[sel].name}`}>
          <RichText text={CYCLE[sel].text} />
        </DetailPanel>
      </div>
    </Frame>
  );
}

// ---------------- 7 términos ----------------
export const SEVEN = [
  { icon: "🟢", name: "Disponibilidad", def: "Posibilidad de acceder a la base de datos; debería estar disponible todo el tiempo.", ex: "La app del banco funciona a las 3 a. m. de un domingo.", fail: "Usuarios sin servicio, ventas perdidas, mala imagen." },
  { icon: "⏱️", name: "Latencia", def: "Distancia que puede existir entre los datos; la arquitectura debe apuntar a una unificación.", ex: "Datos repartidos en servidores lejanos hacen lenta cada consulta.", fail: "Respuestas lentas y datos difíciles de reunir." },
  { icon: "🗺️", name: "Topología / conectividad / geografía", def: "Relación unificada de los datos entre sí.", ex: "Sucursales de La Paz, Cochabamba y Santa Cruz comparten una base conectada.", fail: "Cada sede con datos distintos, información que no coincide." },
  { icon: "🪞", name: "Redundancia", def: "Saber duplicar los servidores: si uno se cae, debe haber otro.", ex: "Un servidor espejo toma el control cuando falla el principal.", fail: "Un solo punto de falla tumba todo el sistema." },
  { icon: "🏛️", name: "Gobierno", def: "Factor que administra la segmentación; influye en el desarrollo de la arquitectura de datos.", ex: "Solo RR. HH. ve salarios; cada área accede a su segmento.", fail: "Datos sin dueño, accesos indebidos, desorden." },
  { icon: "🔒", name: "Seguridad", def: "La arquitectura de datos debe proteger la información en su desarrollo.", ex: "Contraseñas cifradas, control de accesos, respaldos.", fail: "Filtraciones de datos y ataques." },
  { icon: "🪗", name: "Elasticidad", def: "Gestionar desde poca cantidad de datos hasta un gran volumen.", ex: "La tienda online soporta el pico de Black Friday y luego se reduce.", fail: "El sistema colapsa con mucha demanda o se paga de más en baja demanda." },
];

export function SevenTerms() {
  const [sel, setSel] = useState<number | null>(null);
  const t = sel !== null ? SEVEN[sel] : null;
  return (
    <Frame>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {SEVEN.map((s, i) => (
          <button
            key={s.name}
            type="button"
            onClick={() => setSel(i)}
            className={cn(
              "flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 p-2 text-center transition",
              sel === i ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50" : "border-slate-200 dark:border-white/10",
            )}
          >
            <span className="text-xl">{s.icon}</span>
            <span className="text-[11px] font-semibold leading-tight">{s.name.split(" /")[0]}</span>
            <span className="text-[10px] font-bold text-slate-400">{i + 1}</span>
          </button>
        ))}
      </div>
      <div className="mt-3">
        {t ? (
          <DetailPanel title={`${t.icon} ${t.name}`}>
            <p>
              <strong>Apunte:</strong> {t.def}
            </p>
            <p className="mt-1">
              <strong>Ejemplo:</strong> {t.ex}
            </p>
            <p className="mt-1">
              <strong>Si se descuida:</strong> {t.fail}
            </p>
          </DetailPanel>
        ) : (
          <Hint>Toca un término para ver su definición, un ejemplo y qué pasa si falla.</Hint>
        )}
      </div>
    </Frame>
  );
}

// ---------------- MVC ----------------
type MvcNode = "usuario" | "vista" | "controlador" | "modelo" | "bd";
const NODES: { id: MvcNode; icon: string; name: string; sub: string; cls: string }[] = [
  { id: "usuario", icon: "👤", name: "Usuario", sub: "persona", cls: "border-slate-300" },
  { id: "vista", icon: "🖥️", name: "Vista", sub: "interfaz / GUI", cls: "border-sky-400" },
  { id: "controlador", icon: "🧠", name: "Controlador", sub: "cerebro / enlace", cls: "border-amber-400" },
  { id: "modelo", icon: "🗃️", name: "Modelo", sub: "datos / backend", cls: "border-emerald-400" },
  { id: "bd", icon: "💾", name: "Base de datos", sub: "MySQL, API, JSON", cls: "border-slate-300" },
];

export type MvcStep = { from: MvcNode; to: MvcNode; text: string; data?: string };

export const MVC_SCENARIOS: { id: string; name: string; steps: MvcStep[] }[] = [
  {
    id: "buscar",
    name: "🔎 Buscar 'laptop'",
    steps: [
      { from: "usuario", to: "vista", text: "El usuario escribe **laptop** y toca **Buscar** en la Vista.", data: "click: Buscar" },
      { from: "vista", to: "controlador", text: "La Vista envía la petición al **ProductoController**.", data: "GET /buscar?q=laptop" },
      { from: "controlador", to: "modelo", text: "El Controlador pide al **Modelo** los productos que coincidan.", data: "ProductoModel.buscar('laptop')" },
      { from: "modelo", to: "bd", text: "El Modelo consulta la base de datos (con ORM o SQL).", data: "SELECT * FROM productos WHERE nombre LIKE '%laptop%'" },
      { from: "bd", to: "modelo", text: "La base de datos devuelve las filas encontradas.", data: "3 filas" },
      { from: "modelo", to: "controlador", text: "El Modelo entrega los datos como objetos.", data: "[Laptop A, Laptop B, Laptop C]" },
      { from: "controlador", to: "vista", text: "El Controlador **elige la vista** 'resultados' y le pasa los datos.", data: "view('resultados', productos)" },
      { from: "vista", to: "usuario", text: "La Vista genera el HTML y muestra la lista. ¡Listo!", data: "<ul> 3 laptops </ul>" },
    ],
  },
  {
    id: "login",
    name: "🔐 Iniciar sesión",
    steps: [
      { from: "usuario", to: "vista", text: "El usuario llena correo y contraseña y toca **Entrar**.", data: "submit: login" },
      { from: "vista", to: "controlador", text: "La Vista envía las credenciales al **AuthController**.", data: "POST /login" },
      { from: "controlador", to: "modelo", text: "El Controlador pide al **UsuarioModel** verificar las credenciales.", data: "UsuarioModel.verificar(correo, clave)" },
      { from: "modelo", to: "bd", text: "El Modelo busca al usuario y compara el **hash** de la contraseña.", data: "SELECT hash FROM usuarios WHERE correo = ?" },
      { from: "bd", to: "modelo", text: "La BD devuelve el registro del usuario.", data: "{ id: 7, hash: '$2b$…' }" },
      { from: "modelo", to: "controlador", text: "El Modelo responde: credenciales válidas.", data: "true" },
      { from: "controlador", to: "vista", text: "El Controlador elige la vista **panel** (o 'login con error' si fallara).", data: "redirect('/panel')" },
      { from: "vista", to: "usuario", text: "El usuario ve su panel de inicio.", data: "Bienvenido, Ana 👋" },
    ],
  },
  {
    id: "comprar",
    name: "🛒 Pagar compra",
    steps: [
      { from: "usuario", to: "vista", text: "El usuario toca **Pagar** en el carrito.", data: "click: Pagar" },
      { from: "vista", to: "controlador", text: "La Vista envía la orden al **PedidoController**.", data: "POST /pedidos" },
      { from: "controlador", to: "modelo", text: "El Controlador pide al Modelo **verificar stock** y **registrar el pedido**.", data: "PedidoModel.crear(carrito)" },
      { from: "modelo", to: "bd", text: "El Modelo guarda el pedido y **descuenta el stock**.", data: "INSERT pedido · UPDATE stock" },
      { from: "bd", to: "modelo", text: "La BD confirma la transacción.", data: "pedido #1024 OK" },
      { from: "modelo", to: "controlador", text: "El Modelo devuelve el pedido creado.", data: "{ id: 1024, total: 850 }" },
      { from: "controlador", to: "vista", text: "El Controlador elige la vista **confirmación**.", data: "view('confirmacion', pedido)" },
      { from: "vista", to: "usuario", text: "El usuario ve “¡Compra realizada! Pedido #1024”.", data: "✔ Pedido #1024" },
    ],
  },
];

export function MvcFlow({ scenarioId = "buscar", showPicker = false }: { scenarioId?: string; showPicker?: boolean }) {
  const [sid, setSid] = useState(scenarioId);
  const scenario = MVC_SCENARIOS.find((s) => s.id === sid) ?? MVC_SCENARIOS[0];
  const steps = scenario.steps;
  const st = useStepper(steps.length, 2600);
  const cur = steps[st.step];
  const order = NODES.map((n) => n.id);
  const fi = order.indexOf(cur.from);
  const ti = order.indexOf(cur.to);
  const down = ti > fi;

  return (
    <Frame>
      {showPicker && (
        <div className="no-scrollbar -mx-1 mb-3 flex gap-2 overflow-x-auto px-1">
          {MVC_SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setSid(s.id);
                st.reset();
              }}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium",
                s.id === sid ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 dark:border-white/15",
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col items-stretch">
        {NODES.map((n, i) => {
          const active = n.id === cur.from || n.id === cur.to;
          const isTarget = n.id === cur.to;
          const between = i < NODES.length - 1 && Math.min(fi, ti) === i;
          return (
            <div key={n.id}>
              <div
                className={cn(
                  "mx-auto flex w-full max-w-xs items-center gap-3 rounded-2xl border-2 px-3 py-2 transition-all duration-300",
                  n.cls,
                  active ? "scale-[1.02] bg-indigo-50 shadow-md dark:bg-indigo-950/50" : "bg-white opacity-60 dark:bg-slate-900",
                  isTarget && "ring-2 ring-indigo-400",
                )}
              >
                <span className="text-xl">{n.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold leading-tight">{n.name}</p>
                  <p className="text-[11px] text-muted">{n.sub}</p>
                </div>
                {isTarget && <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">recibe</span>}
              </div>
              {i < NODES.length - 1 && (
                <div className="flex h-7 items-center justify-center">
                  <span className={cn("text-lg transition-all", between ? "scale-125 text-indigo-600 dark:text-indigo-400" : "text-slate-300 dark:text-slate-700")}>
                    {between ? (down ? "⬇" : "⬆") : "⇅"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 space-y-2">
        <DetailPanel title={`Paso ${st.step + 1}`}>
          <RichText text={cur.text} />
          {cur.data && <code className="mt-2 block overflow-x-auto rounded-lg bg-slate-900 px-2 py-1.5 font-mono text-[11px] text-emerald-300">{cur.data}</code>}
        </DetailPanel>
        <StepControls stepper={st} total={steps.length} />
      </div>
    </Frame>
  );
}
