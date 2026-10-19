"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { RichText } from "@/components/ui";
import { DetailPanel, Frame, Hint } from "./shared";

// =============== Renderizador genérico de diagramas de casos de uso ===============

export type UcActor = { id: string; label: string; x: number; y: number };
export type UcCase = { id: string; label: string; x: number; y: number; rx?: number; ry?: number };
export type UcRel = { from: string; to: string; kind: "include" | "extend" | "gen" };
export type UcLink = { actor: string; uc: string; state?: "ok" | "missing" | "extra" };

export type UcDiagramProps = {
  width: number;
  height: number;
  system?: { x: number; y: number; w: number; h: number; title: string };
  actors: UcActor[];
  cases: UcCase[];
  links: UcLink[];
  rels?: UcRel[];
  actorGen?: { child: string; parent: string }[];
  highlight?: string | null;
  onTap?: (id: string) => void;
};

function edgePoint(cx: number, cy: number, rx: number, ry: number, tx: number, ty: number) {
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const t = 1 / Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2);
  return { x: cx + dx * t, y: cy + dy * t };
}

function Lines({ text, x, y, size = 10, className }: { text: string; x: number; y: number; size?: number; className?: string }) {
  const lines = text.split("\n");
  const start = y - ((lines.length - 1) * size * 1.15) / 2;
  return (
    <text x={x} textAnchor="middle" fontSize={size} className={className}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} y={start + i * size * 1.15} dominantBaseline="middle">
          {l}
        </tspan>
      ))}
    </text>
  );
}

export function StickActor({ x, y, label, active, onClick }: { x: number; y: number; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <g onClick={onClick} className={cn(onClick && "cursor-pointer")}>
      <rect x={x - 30} y={y - 34} width={60} height={78} fill="transparent" />
      <g className={active ? "stroke-indigo-600 dark:stroke-indigo-400" : "stroke-slate-700 dark:stroke-slate-300"} strokeWidth={2} fill="none" strokeLinecap="round">
        <circle cx={x} cy={y - 22} r={7} className="fill-white dark:fill-slate-900" />
        <line x1={x} y1={y - 15} x2={x} y2={y + 4} />
        <line x1={x - 11} y1={y - 8} x2={x + 11} y2={y - 8} />
        <line x1={x} y1={y + 4} x2={x - 9} y2={y + 16} />
        <line x1={x} y1={y + 4} x2={x + 9} y2={y + 16} />
      </g>
      <Lines text={label} x={x} y={y + 30} size={9.5} className={cn("font-semibold", active ? "fill-indigo-700 dark:fill-indigo-300" : "fill-slate-800 dark:fill-slate-200")} />
    </g>
  );
}

export function UseCaseDiagram({ width, height, system, actors, cases, links, rels = [], actorGen = [], highlight, onTap }: UcDiagramProps) {
  const uid = useId().replace(/:/g, "");
  const caseById = Object.fromEntries(cases.map((c) => [c.id, c]));
  const actorById = Object.fromEntries(actors.map((a) => [a.id, a]));
  const related = new Set<string>();
  if (highlight) {
    related.add(highlight);
    links.forEach((l) => {
      if (l.actor === highlight) related.add(l.uc);
      if (l.uc === highlight) related.add(l.actor);
    });
    rels.forEach((r) => {
      if (r.from === highlight) related.add(r.to);
      if (r.to === highlight) related.add(r.from);
    });
  }
  const dim = (id: string) => highlight && !related.has(id);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full select-none" role="img">
      <defs>
        <marker id={`open-${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M1 1 L9 5 L1 9" fill="none" strokeWidth="1.6" className="stroke-slate-600 dark:stroke-slate-300" />
        </marker>
        <marker id={`tri-${uid}`} viewBox="0 0 12 12" refX="11" refY="6" markerWidth="11" markerHeight="11" orient="auto-start-reverse">
          <path d="M1 1 L11 6 L1 11 Z" strokeWidth="1.3" className="fill-white stroke-slate-600 dark:fill-slate-900 dark:stroke-slate-300" />
        </marker>
      </defs>

      {system && (
        <g>
          <rect x={system.x} y={system.y} width={system.w} height={system.h} rx={10} strokeWidth={1.5} className="fill-slate-50 stroke-slate-400 dark:fill-slate-950/60 dark:stroke-slate-600" />
          <text x={system.x + system.w / 2} y={system.y + 14} textAnchor="middle" fontSize={10} className="fill-slate-500 font-bold dark:fill-slate-400">
            {system.title}
          </text>
        </g>
      )}

      {/* asociaciones actor — caso */}
      {links.map((l, i) => {
        const a = actorById[l.actor];
        const c = caseById[l.uc];
        if (!a || !c) return null;
        const rx = c.rx ?? 88;
        const ry = c.ry ?? 19;
        const ax = a.x + (c.x > a.x ? 12 : -12);
        const ay = a.y - 8;
        const p = edgePoint(c.x, c.y, rx, ry, ax, ay);
        const stateCls =
          l.state === "missing" ? "stroke-amber-500" : l.state === "extra" ? "stroke-rose-500" : highlight && (l.actor === highlight || l.uc === highlight) ? "stroke-indigo-500" : "stroke-slate-500 dark:stroke-slate-400";
        return (
          <line
            key={i}
            x1={ax}
            y1={ay}
            x2={p.x}
            y2={p.y}
            strokeWidth={l.state ? 2.2 : 1.5}
            strokeDasharray={l.state === "missing" ? "5 4" : undefined}
            className={cn(stateCls, dim(l.actor) && dim(l.uc) && "opacity-20")}
          />
        );
      })}

      {/* relaciones entre casos */}
      {rels.map((r, i) => {
        const a = caseById[r.from];
        const b = caseById[r.to];
        if (!a || !b) return null;
        const p1 = edgePoint(a.x, a.y, a.rx ?? 88, a.ry ?? 19, b.x, b.y);
        const p2 = edgePoint(b.x, b.y, b.rx ?? 88, b.ry ?? 19, a.x, a.y);
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const dashed = r.kind !== "gen";
        return (
          <g key={i} className={cn((dim(r.from) || dim(r.to)) && "opacity-20")}>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              strokeWidth={1.5}
              strokeDasharray={dashed ? "5 4" : undefined}
              markerEnd={`url(#${r.kind === "gen" ? "tri" : "open"}-${uid})`}
              className="stroke-slate-600 dark:stroke-slate-300"
            />
            {dashed && (
              <text x={mx + 4} y={my} fontSize={9} className={cn("font-semibold", r.kind === "include" ? "fill-indigo-600 dark:fill-indigo-400" : "fill-amber-600 dark:fill-amber-400")}>
                {r.kind === "include" ? "«include»" : "«extend»"}
              </text>
            )}
          </g>
        );
      })}

      {/* generalización de actores */}
      {actorGen.map((g, i) => {
        const c = actorById[g.child];
        const p = actorById[g.parent];
        if (!c || !p) return null;
        return (
          <line
            key={i}
            x1={c.x}
            y1={c.y - 32}
            x2={p.x}
            y2={p.y + 44}
            strokeWidth={1.5}
            markerEnd={`url(#tri-${uid})`}
            className="stroke-slate-600 dark:stroke-slate-300"
          />
        );
      })}

      {cases.map((c) => (
        <g key={c.id} onClick={onTap ? () => onTap(c.id) : undefined} className={cn(onTap && "cursor-pointer", dim(c.id) && "opacity-25")}>
          <ellipse
            cx={c.x}
            cy={c.y}
            rx={c.rx ?? 88}
            ry={c.ry ?? 19}
            strokeWidth={highlight === c.id ? 2.5 : 1.6}
            className={cn(
              highlight && related.has(c.id) ? "fill-indigo-50 stroke-indigo-500 dark:fill-indigo-950" : "fill-white stroke-amber-500 dark:fill-slate-900 dark:stroke-amber-400",
            )}
          />
          <Lines text={c.label} x={c.x} y={c.y} size={9.5} className="fill-slate-800 dark:fill-slate-100" />
        </g>
      ))}

      {actors.map((a) => (
        <StickActor key={a.id} x={a.x} y={a.y} label={a.label} active={highlight === a.id || (!!highlight && related.has(a.id))} onClick={onTap ? () => onTap(a.id) : undefined} />
      ))}
    </svg>
  );
}

// =============== Tipos de diagramas UML ===============
const UML_TREE = {
  estructura: {
    title: "🧱 Estructura",
    sub: "Cómo está hecho el sistema",
    items: ["Clases", "Objetos", "Componentes", "Despliegue", "Paquetes"],
  },
  comportamiento: {
    title: "🎬 Comportamiento",
    sub: "Qué hace y cómo interactúa",
    items: ["Casos de uso ⭐", "Actividades", "Secuencia", "Estados"],
  },
};

export function UmlTypes() {
  return (
    <Frame>
      <div className="mx-auto mb-2 w-fit rounded-xl bg-amber-500 px-4 py-2 text-center text-sm font-black text-white shadow">UML</div>
      <div className="mx-auto h-4 w-px bg-slate-300 dark:bg-slate-700" />
      <div className="grid grid-cols-2 gap-3">
        {Object.values(UML_TREE).map((g) => (
          <div key={g.title} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <p className="text-sm font-bold">{g.title}</p>
            <p className="mb-2 text-[11px] text-muted">{g.sub}</p>
            <ul className="space-y-1">
              {g.items.map((it) => (
                <li
                  key={it}
                  className={cn(
                    "rounded-lg px-2 py-1 text-xs",
                    it.includes("⭐") ? "bg-amber-100 font-bold text-amber-900 dark:bg-amber-900/50 dark:text-amber-100" : "bg-surface-2",
                  )}
                >
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Frame>
  );
}

// =============== Proceso de ventas ===============
const SALES = [
  { icon: "🧾", name: "Pedido de venta", mail: "Pedido registrado", text: "Cliente existente con NIT y dirección · precio de convenio o lista · verifica **crédito** e **inventario** · reserva o cola." },
  { icon: "🚚", name: "Orden de entrega", mail: "Mercancía despachada", text: "**ID único** · líneas ligadas a pedidos dados de alta · entregas **parciales** · varios pedidos del **mismo cliente** · **rebaja inventario**." },
  { icon: "💵", name: "Facturación", mail: "Factura emitida", text: "**En lotes** · líneas y precios solo del pedido · varios pedidos en una factura · manuales con **autorización de Gerentes**." },
  { icon: "💳", name: "Cobranza", mail: "Pago registrado", text: "Registro del **pago del cliente**; se notifica por correo." },
];

export function SalesProcess() {
  const [sel, setSel] = useState(0);
  return (
    <Frame>
      <div className="flex items-start gap-1">
        {SALES.map((s, i) => (
          <div key={s.name} className="flex flex-1 items-start gap-1">
            <button type="button" onClick={() => setSel(i)} className="flex flex-1 flex-col items-center gap-1">
              <span
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl border-2 text-xl transition",
                  sel === i ? "border-amber-500 bg-amber-50 dark:bg-amber-950/50" : "border-slate-200 dark:border-white/10",
                )}
              >
                {s.icon}
              </span>
              <span className="text-center text-[10.5px] font-semibold leading-tight">{s.name}</span>
              <span className="text-xs" title="Envía correo">
                ✉️
              </span>
            </button>
            {i < SALES.length - 1 && <span className="mt-3 text-slate-400">→</span>}
          </div>
        ))}
      </div>
      <div className="mt-3">
        <DetailPanel title={`${SALES[sel].icon} ${SALES[sel].name}`} color="amber">
          <RichText text={SALES[sel].text} />
          <p className="mt-1 text-xs">✉️ Correo automático: “{SALES[sel].mail}”.</p>
        </DetailPanel>
      </div>
    </Frame>
  );
}

// =============== Elementos de un DCU ===============
const ELEMENTS: Record<string, { title: string; text: string }> = {
  cliente: { title: "👤 Actor", text: "Alguien o algo **fuera del sistema** que interactúa con él. Puede ser una persona (Cliente) o un **sistema externo** (Banco)." },
  banco: { title: "🏦 Actor (sistema externo)", text: "Los sistemas externos también son actores: aquí la **pasarela del banco** participa en el pago." },
  pedido: { title: "⬭ Caso de uso", text: "Elipse con una **frase de acción** (verbo + sustantivo). Produce un resultado **observable y valioso** para el actor." },
  pagar: { title: "⬭ Caso de uso", text: "'Pagar Compra' es un buen nombre: acción clara con resultado de valor." },
  system: { title: "▭ Límite del sistema", text: "Rectángulo con el nombre del sistema. Los **casos de uso van dentro** y los **actores fuera**." },
};

export function UcElements() {
  const [sel, setSel] = useState<string | null>(null);
  return (
    <Frame>
      <div>
        <UseCaseDiagram
          width={360}
          height={200}
          system={{ x: 80, y: 18, w: 200, h: 170, title: "Tienda online" }}
          actors={[
            { id: "cliente", label: "Cliente", x: 38, y: 95 },
            { id: "banco", label: "Banco", x: 322, y: 135 },
          ]}
          cases={[
            { id: "pedido", label: "Realizar Pedido", x: 180, y: 70, rx: 78 },
            { id: "pagar", label: "Pagar Compra", x: 180, y: 140, rx: 78 },
          ]}
          links={[
            { actor: "cliente", uc: "pedido" },
            { actor: "cliente", uc: "pagar" },
            { actor: "banco", uc: "pagar" },
          ]}
          highlight={sel && sel !== "system" ? sel : null}
          onTap={setSel}
        />
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {[
          ["cliente", "👤 Actor"],
          ["pedido", "⬭ Caso de uso"],
          ["system", "▭ Límite del sistema"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSel(id)}
            className={cn("rounded-full border px-3 py-1 text-xs font-semibold", sel === id ? "border-amber-500 bg-amber-50 dark:bg-amber-950/50" : "border-slate-300 dark:border-white/15")}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-2">
        {sel ? (
          <DetailPanel title={ELEMENTS[sel].title} color="amber">
            <RichText text={ELEMENTS[sel].text} />
          </DetailPanel>
        ) : (
          <Hint>Toca un actor, un caso de uso o el título del sistema.</Hint>
        )}
      </div>
    </Frame>
  );
}

// =============== include / extend / generalización ===============
const RELS = {
  include: {
    label: "«include»",
    color: "indigo" as const,
    rule: "**Obligatorio.** El caso base **siempre** ejecuta el incluido. Flecha **punteada** del **caso base → caso incluido**. Sirve para **reutilizar** pasos comunes.",
    ex: "Realizar Pedido siempre verifica el método de pago.",
  },
  extend: {
    label: "«extend»",
    color: "amber" as const,
    rule: "**Opcional.** Puede o no ejecutarse; agrega comportamiento alternativo o adicional. Flecha **punteada** de la **extensión → caso base**.",
    ex: "Aplicar Cupón solo ocurre si el cliente tiene un cupón.",
  },
  gen: {
    label: "Generalización",
    color: "emerald" as const,
    rule: "**Padre-hijo.** El hijo **hereda** lo general y **agrega** lo propio. Línea **continua** con **punta triangular** del **hijo → padre**.",
    ex: "Pagar con Tarjeta y Pagar con Efectivo son tipos de Procesar Pago. Cliente VIP y Estándar son tipos de Cliente.",
  },
};

export function UcRelations() {
  const [tab, setTab] = useState<keyof typeof RELS>("include");
  const r = RELS[tab];
  return (
    <Frame>
      <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {(Object.keys(RELS) as (keyof typeof RELS)[]).map((k) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={cn("rounded-lg py-2 text-xs font-bold", tab === k ? "bg-white shadow dark:bg-slate-950" : "text-muted")}>
            {RELS[k].label}
          </button>
        ))}
      </div>
      {tab === "include" && (
        <UseCaseDiagram
          width={360}
          height={170}
          actors={[{ id: "c", label: "Cliente", x: 34, y: 60 }]}
          cases={[
            { id: "base", label: "Realizar Pedido", x: 175, y: 45, rx: 72 },
            { id: "inc", label: "Verificar Método\nde Pago", x: 250, y: 135, rx: 72, ry: 22 },
          ]}
          links={[{ actor: "c", uc: "base" }]}
          rels={[{ from: "base", to: "inc", kind: "include" }]}
        />
      )}
      {tab === "extend" && (
        <UseCaseDiagram
          width={360}
          height={170}
          actors={[{ id: "c", label: "Cliente", x: 34, y: 60 }]}
          cases={[
            { id: "base", label: "Realizar Pedido", x: 175, y: 45, rx: 72 },
            { id: "ext", label: "Aplicar Cupón\nde Descuento", x: 250, y: 135, rx: 72, ry: 22 },
          ]}
          links={[{ actor: "c", uc: "base" }]}
          rels={[{ from: "ext", to: "base", kind: "extend" }]}
        />
      )}
      {tab === "gen" && (
        <UseCaseDiagram
          width={360}
          height={200}
          actors={[
            { id: "cli", label: "Cliente", x: 40, y: 40 },
            { id: "vip", label: "Cliente\nVIP", x: 18, y: 150 },
            { id: "std", label: "Cliente\nEstándar", x: 66, y: 150 },
          ]}
          cases={[
            { id: "pp", label: "Procesar Pago", x: 240, y: 40, rx: 68 },
            { id: "pt", label: "Pagar con\nTarjeta", x: 185, y: 160, rx: 54, ry: 22 },
            { id: "pe", label: "Pagar con\nEfectivo", x: 300, y: 160, rx: 54, ry: 22 },
          ]}
          links={[]}
          rels={[
            { from: "pt", to: "pp", kind: "gen" },
            { from: "pe", to: "pp", kind: "gen" },
          ]}
          actorGen={[
            { child: "vip", parent: "cli" },
            { child: "std", parent: "cli" },
          ]}
        />
      )}
      <div className="mt-2 space-y-2">
        <DetailPanel title={r.label} color={r.color}>
          <RichText text={r.rule} />
          <p className="mt-1 text-xs italic">Ej.: {r.ex}</p>
        </DetailPanel>
      </div>
    </Frame>
  );
}

// =============== Agencia de viajes (solución) ===============
export const AGENCIA = {
  actors: [
    { id: "cliente", label: "Cliente", x: 34, y: 95 },
    { id: "agente", label: "Agente de\nViajes", x: 34, y: 205 },
    { id: "aerea", label: "Compañía\nAérea", x: 326, y: 275 },
    { id: "turismo", label: "Empresa de\nTurismo", x: 326, y: 390 },
  ],
  cases: [
    { id: "pagarAgente", label: "Pagar a agente de viajes", x: 180, y: 55, rx: 96 },
    { id: "reservarBoleto", label: "Reservar boleto de avión", x: 180, y: 115, rx: 96 },
    { id: "entregarBoleto", label: "Entregar boleto de avión", x: 180, y: 175, rx: 96 },
    { id: "reservarAsiento", label: "Reservar asiento", x: 180, y: 235, rx: 96 },
    { id: "pagarBoleto", label: "Pagar boleto de avión", x: 180, y: 295, rx: 96 },
    { id: "organizar", label: "Organizar viaje", x: 180, y: 355, rx: 96 },
    { id: "pagarViaje", label: "Pagar viaje", x: 180, y: 415, rx: 96 },
  ],
  solution: [
    { actor: "cliente", uc: "reservarBoleto" },
    { actor: "cliente", uc: "pagarAgente" },
    { actor: "agente", uc: "reservarBoleto" },
    { actor: "agente", uc: "entregarBoleto" },
    { actor: "aerea", uc: "reservarAsiento" },
    { actor: "aerea", uc: "pagarBoleto" },
    { actor: "turismo", uc: "organizar" },
    { actor: "turismo", uc: "pagarViaje" },
  ],
};

export function UcAgencia() {
  const [sel, setSel] = useState<string | null>(null);
  const actor = AGENCIA.actors.find((a) => a.id === sel);
  const uc = AGENCIA.cases.find((c) => c.id === sel);
  return (
    <Frame>
      <UseCaseDiagram
        width={360}
        height={445}
        system={{ x: 72, y: 18, w: 216, h: 420, title: "Agencia de Viajes" }}
        actors={AGENCIA.actors}
        cases={AGENCIA.cases}
        links={AGENCIA.solution}
        highlight={sel}
        onTap={(id) => setSel((s) => (s === id ? null : id))}
      />
      <div className="mt-2">
        {actor ? (
          <DetailPanel title={`👤 ${actor.label.replace("\n", " ")}`} color="amber">
            Participa en:{" "}
            {AGENCIA.solution
              .filter((l) => l.actor === actor.id)
              .map((l) => AGENCIA.cases.find((c) => c.id === l.uc)!.label)
              .join(" · ")}
          </DetailPanel>
        ) : uc ? (
          <DetailPanel title={`⬭ ${uc.label}`} color="amber">
            Actores:{" "}
            {AGENCIA.solution
              .filter((l) => l.uc === uc.id)
              .map((l) => AGENCIA.actors.find((a) => a.id === l.actor)!.label.replace("\n", " "))
              .join(" y ")}
          </DetailPanel>
        ) : (
          <Hint>Toca un actor o un caso de uso para resaltar sus relaciones.</Hint>
        )}
      </div>
    </Frame>
  );
}

// =============== Sistema de ventas con relaciones ===============
const VENTAS_INFO: Record<string, string> = {
  vendedor: "Registra los pedidos de venta de los clientes.",
  almacen: "Emite las órdenes de entrega (despacho) y con ello se rebaja el inventario.",
  facturador: "Factura los pedidos en lote y registra facturas manuales.",
  gerente: "Autoriza las facturas manuales antes de contabilizarlas.",
  borrador: "«extend»: guardar en borrador es **opcional** (o forzado si se excede el crédito). La flecha va de la extensión al caso base.",
  pedido: "Caso base. Siempre «include» la verificación de crédito y de inventario.",
  credito: "«include» obligatorio: si los pedidos abiertos superan el límite → alerta, solo borrador.",
  inventario: "«include» obligatorio: hay stock → reserva; no hay → cola de pendientes.",
  entrega: "Líneas ligadas a pedidos dados de alta; permite entregas parciales.",
  lote: "Factura en lote los pedidos pendientes; líneas y precios no modificables.",
  manual: "Factura sin pedido. Siempre incluye la autorización del Gerente.",
  autorizar: "Caso incluido en 'Registrar factura manual'; lo realiza el Gerente.",
};

export function UcVentas() {
  const [sel, setSel] = useState<string | null>(null);
  return (
    <Frame>
      <UseCaseDiagram
        width={360}
        height={530}
        system={{ x: 66, y: 10, w: 230, h: 515, title: "Sistema de Ventas" }}
        actors={[
          { id: "vendedor", label: "Vendedor", x: 30, y: 125 },
          { id: "almacen", label: "Almacenero", x: 30, y: 290 },
          { id: "facturador", label: "Facturador", x: 330, y: 385 },
          { id: "gerente", label: "Gerente", x: 330, y: 490 },
        ]}
        cases={[
          { id: "borrador", label: "Guardar como borrador", x: 181, y: 45, rx: 88 },
          { id: "pedido", label: "Registrar pedido de venta", x: 181, y: 125, rx: 92 },
          { id: "credito", label: "Verificar límite\nde crédito", x: 125, y: 205, rx: 54, ry: 22 },
          { id: "inventario", label: "Verificar\ninventario", x: 240, y: 205, rx: 50, ry: 22 },
          { id: "entrega", label: "Emitir orden de entrega", x: 181, y: 290, rx: 92 },
          { id: "lote", label: "Facturar pedidos en lote", x: 181, y: 360, rx: 92 },
          { id: "manual", label: "Registrar factura manual", x: 181, y: 425, rx: 92 },
          { id: "autorizar", label: "Autorizar factura manual", x: 181, y: 495, rx: 92 },
        ]}
        links={[
          { actor: "vendedor", uc: "pedido" },
          { actor: "almacen", uc: "entrega" },
          { actor: "facturador", uc: "lote" },
          { actor: "facturador", uc: "manual" },
          { actor: "gerente", uc: "autorizar" },
        ]}
        rels={[
          { from: "borrador", to: "pedido", kind: "extend" },
          { from: "pedido", to: "credito", kind: "include" },
          { from: "pedido", to: "inventario", kind: "include" },
          { from: "manual", to: "autorizar", kind: "include" },
        ]}
        highlight={sel}
        onTap={(id) => setSel((s) => (s === id ? null : id))}
      />
      <div className="mt-2">
        {sel ? (
          <DetailPanel title="Detalle" color="amber">
            <RichText text={VENTAS_INFO[sel]} />
          </DetailPanel>
        ) : (
          <Hint>Toca cualquier elemento para ver por qué está ahí.</Hint>
        )}
      </div>
    </Frame>
  );
}
