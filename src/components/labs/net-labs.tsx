"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { markLab } from "@/lib/store";
import { Button } from "@/components/ui";

// ============================================================
// Simulador NAT
// ============================================================
const PUBLIC_IP = "203.0.113.5";
const DEVICES = [
  { id: "a", icon: "💻", name: "PC A", ip: "192.168.1.10" },
  { id: "b", icon: "💻", name: "PC B", ip: "192.168.1.11" },
  { id: "c", icon: "📱", name: "Teléfono", ip: "192.168.1.12" },
];
const DESTS = [
  { id: "web", name: "ejemplo.com (web)", addr: "93.184.216.34:443" },
  { id: "dns", name: "DNS 8.8.8.8", addr: "8.8.8.8:53" },
  { id: "game", name: "Servidor de juego", addr: "198.51.100.7:27015" },
];

type NatRow = { id: number; dev: string; inside: string; outside: string; dest: string; answered: boolean };
type LogLine = { kind: "out" | "in" | "drop" | "info"; text: string };

export function NatSim() {
  const [dev, setDev] = useState("a");
  const [dest, setDest] = useState("web");
  const [rows, setRows] = useState<NatRow[]>([]);
  const [nextPort, setNextPort] = useState(40001);
  const [log, setLog] = useState<LogLine[]>([{ kind: "info", text: "Elige un dispositivo y un destino, luego toca “Enviar petición”." }]);
  const [forward, setForward] = useState(false);
  const [cgnat, setCgnat] = useState(false);
  const counter = useRef(0);

  const push = (l: LogLine) => setLog((x) => [l, ...x].slice(0, 12));

  const send = () => {
    const d = DEVICES.find((x) => x.id === dev)!;
    const t = DESTS.find((x) => x.id === dest)!;
    const srcPort = 50000 + ((counter.current * 137) % 9000);
    counter.current++;
    const row: NatRow = { id: counter.current, dev: d.name, inside: `${d.ip}:${srcPort}`, outside: `${PUBLIC_IP}:${nextPort}`, dest: t.addr, answered: false };
    setRows((r) => [...r, row].slice(-8));
    setNextPort((p) => p + 1);
    push({ kind: "out", text: `${d.name} ${row.inside} → router: traduce a ${row.outside} → ${t.addr}` });
    markLab("nat-sim");
  };

  const answer = (row: NatRow) => {
    setRows((r) => r.map((x) => (x.id === row.id ? { ...x, answered: true } : x)));
    push({ kind: "in", text: `Respuesta de ${row.dest} llega a ${row.outside} → la tabla dice ${row.inside} → entregada a ${row.dev} ✔` });
  };

  const inbound = () => {
    if (cgnat) {
      push({ kind: "drop", text: `Alguien de Internet intenta conectarse a tu IP… pero tu router no tiene IP pública: el CGNAT del ISP no sabe a qué cliente enviarlo → descartado ✖` });
      return;
    }
    if (forward) push({ kind: "in", text: `Conexión entrante a ${PUBLIC_IP}:8080 → regla de reenvío de puertos → 192.168.1.10:8080 (PC A) ✔` });
    else push({ kind: "drop", text: `Conexión entrante a ${PUBLIC_IP}:8080 → no hay entrada en la tabla NAT ni reenvío → descartada ✖` });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
        <p className="mb-2 text-xs font-bold uppercase text-muted">1 · Dispositivo (red privada)</p>
        <div className="grid grid-cols-3 gap-2">
          {DEVICES.map((d) => (
            <button key={d.id} type="button" onClick={() => setDev(d.id)} className={cn("rounded-2xl border-2 p-2 text-center", dev === d.id ? "border-violet-500 bg-violet-50 dark:bg-violet-950/50" : "border-slate-200 dark:border-white/10")}>
              <span className="text-xl">{d.icon}</span>
              <span className="block text-xs font-semibold">{d.name}</span>
              <span className="block font-mono text-[10px] text-muted">{d.ip}</span>
            </button>
          ))}
        </div>
        <p className="mb-2 mt-3 text-xs font-bold uppercase text-muted">2 · Destino en Internet</p>
        <div className="flex flex-wrap gap-1.5">
          {DESTS.map((d) => (
            <button key={d.id} type="button" onClick={() => setDest(d.id)} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium", dest === d.id ? "border-violet-600 bg-violet-600 text-white" : "border-slate-300 dark:border-white/15")}>
              {d.name}
            </button>
          ))}
        </div>
        <Button full className="mt-3" onClick={send}>
          📤 Enviar petición
        </Button>
      </div>

      <div>
        <p className="mb-1 text-sm font-bold">📋 Tabla NAT del router (IP pública {PUBLIC_IP})</p>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
          <table className="w-full min-w-max text-left font-mono text-[11px]">
            <thead className="bg-surface-2">
              <tr>
                <th className="px-2 py-1.5">Privada</th>
                <th className="px-2 py-1.5">Pública</th>
                <th className="px-2 py-1.5">Destino</th>
                <th className="px-2 py-1.5"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-2 py-3 text-center font-sans text-slate-400">
                    Vacía: aún no salió ninguna conexión
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="animate-pop border-t border-slate-100 dark:border-slate-800">
                  <td className="px-2 py-1.5">{r.inside}</td>
                  <td className="px-2 py-1.5 font-bold text-violet-700 dark:text-violet-300">{r.outside}</td>
                  <td className="px-2 py-1.5">{r.dest}</td>
                  <td className="px-2 py-1">
                    <button type="button" disabled={r.answered} onClick={() => answer(r)} className="rounded-lg bg-emerald-600 px-2 py-1 font-sans text-[10px] font-bold text-white disabled:bg-slate-300 dark:disabled:bg-slate-700">
                      {r.answered ? "✔" : "📥 Respuesta"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
        <p className="mb-2 text-sm font-bold">🌍 Conexiones entrantes</p>
        <div className="space-y-2 text-sm">
          <label className="flex items-center justify-between gap-2">
            <span>Reenvío de puerto 8080 → PC A</span>
            <input type="checkbox" checked={forward} onChange={(e) => setForward(e.target.checked)} className="h-5 w-5 accent-violet-600" />
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>Mi ISP usa CGNAT</span>
            <input type="checkbox" checked={cgnat} onChange={(e) => setCgnat(e.target.checked)} className="h-5 w-5 accent-violet-600" />
          </label>
        </div>
        <Button full variant="secondary" className="mt-3" onClick={inbound}>
          📨 Simular conexión desde Internet
        </Button>
      </div>

      <div className="space-y-1.5 rounded-xl bg-slate-900 p-3 font-mono text-[11px] leading-relaxed">
        {log.map((l, i) => (
          <p key={i} className={cn(l.kind === "out" && "text-sky-300", l.kind === "in" && "text-emerald-300", l.kind === "drop" && "text-rose-300", l.kind === "info" && "text-slate-400", i === 0 && "animate-pop")}>
            {l.kind === "out" ? "⬆ " : l.kind === "in" ? "⬇ " : l.kind === "drop" ? "⛔ " : "› "}
            {l.text}
          </p>
        ))}
      </div>
      <p className="text-xs text-muted">
        Observa: todos salen con la <strong>misma IP pública</strong> pero con <strong>puertos distintos</strong> (PAT). Sin entrada en la tabla ni reenvío, lo que llega de afuera se descarta. Con CGNAT, ni el reenvío ayuda.
      </p>
    </div>
  );
}

// ============================================================
// Terminal de diagnóstico
// ============================================================
type ScenarioId = "ok" | "dhcp" | "dns" | "cable" | "isp";
type Diagnosis = { id: ScenarioId; label: string };

const DIAGNOSES: Diagnosis[] = [
  { id: "ok", label: "✅ Todo funciona correctamente" },
  { id: "dhcp", label: "🏷️ Falla de DHCP (APIPA 169.254.x.x)" },
  { id: "dns", label: "📖 Problema de DNS" },
  { id: "cable", label: "🔌 Cable / Wi-Fi desconectado" },
  { id: "isp", label: "🏢 Sin salida a Internet (router/ISP)" },
];

const SCENARIOS: Record<ScenarioId, { ticket: string; explain: string }> = {
  ok: { ticket: "Carlos quiere aprender a usar los comandos. Su conexión parece normal.", explain: "IP válida, gateway responde, 8.8.8.8 responde y nslookup resuelve: todo correcto." },
  dhcp: {
    ticket: "Ana: “Me conecté a la red del laboratorio y no carga nada. Las otras PC sí funcionan.”",
    explain: "ipconfig muestra 169.254.x.x con máscara 255.255.0.0 y sin gateway: la PC no recibió respuesta del servidor DHCP (APIPA). Solución: revisar conexión/VLAN/servidor DHCP y ejecutar ipconfig /release y /renew.",
  },
  dns: {
    ticket: "Luis: “WhatsApp no conecta y el navegador dice ‘No se encuentra la dirección’, pero el ícono de Wi-Fi dice conectado.”",
    explain: "ping 8.8.8.8 funciona (hay Internet por IP), pero nslookup falla: los nombres no se resuelven → problema de DNS. Solución: cambiar el servidor DNS o reiniciar el del router.",
  },
  cable: {
    ticket: "Marta: “Desde que moví el escritorio no tengo nada de red.”",
    explain: "ipconfig dice ‘medios desconectados’ y los pings fuera del equipo dan ‘Error general’. La pila TCP/IP local funciona (127.0.0.1). Revisar el cable o la conexión Wi-Fi.",
  },
  isp: {
    ticket: "Jorge: “Puedo entrar a la impresora y a la configuración del router, pero no a Internet.”",
    explain: "Hay IP válida y el gateway responde, pero 8.8.8.8 no responde y tracert se corta después del router: el problema está en el router (WAN) o en el proveedor.",
  },
};

const PROMPT = "C:\\Users\\estudiante>";

function pingOk(ip: string, ms: number[], ttl: number) {
  return [
    `Haciendo ping a ${ip} con 32 bytes de datos:`,
    ...ms.map((m) => `Respuesta desde ${ip}: bytes=32 tiempo${m < 1 ? "<1" : "=" + m}ms TTL=${ttl}`),
    "",
    `Estadísticas de ping para ${ip}:`,
    "    Paquetes: enviados = 4, recibidos = 4, perdidos = 0",
    "    (0% perdidos),",
  ];
}
function pingFail(ip: string, line: string) {
  return [`Haciendo ping a ${ip} con 32 bytes de datos:`, line, line, line, line, "", `Estadísticas de ping para ${ip}:`, "    Paquetes: enviados = 4, recibidos = 0, perdidos = 4", "    (100% perdidos),"];
}

function run(cmd: string, sc: ScenarioId): string[] {
  const c = cmd.trim().toLowerCase().replace(/\s+/g, " ");
  const ipLine = sc === "dhcp" ? "   Dirección IPv4 de configuración automática: 169.254.88.12" : "   Dirección IPv4. . . . . . . . . . . . . . : 192.168.1.10";
  const maskLine = sc === "dhcp" ? "   Máscara de subred . . . . . . . . . . . . : 255.255.0.0" : "   Máscara de subred . . . . . . . . . . . . : 255.255.255.0";
  const gwLine = sc === "dhcp" ? "   Puerta de enlace predeterminada . . . . . :" : "   Puerta de enlace predeterminada . . . . . : 192.168.1.1";

  if (c === "ipconfig") {
    if (sc === "cable") return ["Configuración IP de Windows", "", "Adaptador de LAN inalámbrica Wi-Fi:", "", "   Estado de los medios. . . . . . . . . . . : medios desconectados", "   Sufijo DNS específico para la conexión. . :"];
    return ["Configuración IP de Windows", "", "Adaptador de LAN inalámbrica Wi-Fi:", "", "   Sufijo DNS específico para la conexión. . :", "   Vínculo: dirección IPv6 local. . . : fe80::1c2b:3d4e:5f60:7a8b%12", ipLine, maskLine, gwLine];
  }
  if (c === "ipconfig /all") {
    if (sc === "cable")
      return ["Configuración IP de Windows", "", "Adaptador de LAN inalámbrica Wi-Fi:", "", "   Estado de los medios. . . . . . . . . . . : medios desconectados", "   Descripción . . . . . . . . . . . . . . . : Intel(R) Wi-Fi 6 AX201", "   Dirección física. . . . . . . . . . . . . : 3C-52-82-1A-2B-3C", "   DHCP habilitado . . . . . . . . . . . . . : sí"];
    return [
      "Configuración IP de Windows",
      "",
      "   Nombre de host. . . . . . . . . : LAB-PC07",
      "",
      "Adaptador de LAN inalámbrica Wi-Fi:",
      "",
      "   Descripción . . . . . . . . . . . . . . . : Intel(R) Wi-Fi 6 AX201",
      "   Dirección física. . . . . . . . . . . . . : 3C-52-82-1A-2B-3C",
      "   DHCP habilitado . . . . . . . . . . . . . : sí",
      ipLine,
      maskLine,
      gwLine,
      ...(sc === "dhcp" ? [] : ["   Servidor DHCP . . . . . . . . . . . . . . : 192.168.1.1", "   Concesión obtenida. . . . . . . . . . . . : hoy 08:02:11", "   La concesión expira . . . . . . . . . . . : mañana 08:02:11"]),
      `   Servidores DNS. . . . . . . . . . . . . . : ${sc === "dhcp" ? "" : "192.168.1.1"}`,
    ];
  }
  if (c === "ping 127.0.0.1" || c === "ping localhost") return pingOk("127.0.0.1", [0, 0, 0, 0], 128);
  if (c === "ping 192.168.1.1") {
    if (sc === "cable") return pingFail("192.168.1.1", "Error general.");
    if (sc === "dhcp") return pingFail("192.168.1.1", "Respuesta desde 169.254.88.12: Host de destino inaccesible.");
    return pingOk("192.168.1.1", [2, 1, 3, 2], 64);
  }
  if (c === "ping 8.8.8.8") {
    if (sc === "cable") return pingFail("8.8.8.8", "Error general.");
    if (sc === "dhcp") return pingFail("8.8.8.8", "Error general.");
    if (sc === "isp") return pingFail("8.8.8.8", "Tiempo de espera agotado para esta solicitud.");
    return pingOk("8.8.8.8", [24, 22, 25, 23], 117);
  }
  if (c.startsWith("nslookup")) {
    const name = c.split(" ")[1] || "ejemplo.com";
    if (sc === "ok") return ["Servidor:  router.home", "Address:  192.168.1.1", "", "Respuesta no autoritativa:", `Nombre:  ${name}`, "Address:  93.184.216.34"];
    if (sc === "cable" || sc === "dhcp") return ["*** No se puede encontrar el nombre del servidor para la dirección: no hay servidores DNS disponibles", "Servidor:  UnKnown", "Address:  ::1"];
    return ["DNS request timed out.", "    timeout was 2 seconds.", "Servidor:  UnKnown", "Address:  192.168.1.1", "", `*** Se agotó el tiempo de espera de la solicitud a UnKnown para ${name}`];
  }
  if (c.startsWith("tracert")) {
    const head = ["Traza a la dirección 8.8.8.8", "sobre un máximo de 30 saltos:", ""];
    if (sc === "cable" || sc === "dhcp") return ["No se puede resolver el nombre de destino o la red no está disponible.", "Error general."];
    if (sc === "isp")
      return [...head, "  1     2 ms     1 ms     2 ms  192.168.1.1", "  2     *        *        *     Tiempo de espera agotado para esta solicitud.", "  3     *        *        *     Tiempo de espera agotado para esta solicitud.", "  4     *        *        *     Tiempo de espera agotado para esta solicitud.", "  …", "Traza completa."];
    return [...head, "  1     2 ms     1 ms     2 ms  192.168.1.1", "  2    10 ms     9 ms    11 ms  10.20.0.1", "  3    15 ms    14 ms    16 ms  172.16.5.1", "  4     *        *        *     Tiempo de espera agotado para esta solicitud.", "  5    24 ms    23 ms    25 ms  dns.google [8.8.8.8]", "", "Traza completa."];
  }
  if (c === "arp -a") {
    if (sc === "cable") return ["No se encontraron entradas ARP."];
    if (sc === "dhcp") return ["", "Interfaz: 169.254.88.12 --- 0xc", "  Dirección de Internet     Dirección física      Tipo", "  169.254.255.255           ff-ff-ff-ff-ff-ff     estático", "  224.0.0.22                01-00-5e-00-00-16     estático"];
    return [
      "",
      "Interfaz: 192.168.1.10 --- 0xc",
      "  Dirección de Internet     Dirección física      Tipo",
      "  192.168.1.1               a4-2b-b0-11-22-33     dinámico",
      "  192.168.1.12              5c-cf-7f-44-55-66     dinámico",
      "  192.168.1.255             ff-ff-ff-ff-ff-ff     estático",
    ];
  }
  if (c === "cls" || c === "clear") return ["__clear__"];
  if (c === "help" || c === "ayuda") return ["Comandos: ipconfig, ipconfig /all, ping 127.0.0.1, ping 192.168.1.1, ping 8.8.8.8, nslookup ejemplo.com, tracert 8.8.8.8, arp -a, cls"];
  return [`"${cmd.trim()}" no se reconoce como un comando interno o externo,`, "programa o archivo por lotes ejecutable. (Escribe 'ayuda')"];
}

const QUICK = ["ipconfig", "ipconfig /all", "ping 127.0.0.1", "ping 192.168.1.1", "ping 8.8.8.8", "nslookup ejemplo.com", "tracert 8.8.8.8", "arp -a"];

export function NetTerminal() {
  const [sc, setSc] = useState<ScenarioId | null>(null);
  const [mystery, setMystery] = useState(true);
  const [lines, setLines] = useState<string[]>([]);
  const [cmd, setCmd] = useState("");
  const [used, setUsed] = useState<string[]>([]);
  const [guess, setGuess] = useState<ScenarioId | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = termRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const start = (id: ScenarioId) => {
    setSc(id);
    setLines(["Microsoft Windows [Versión 10.0.26200]", "(c) Microsoft Corporation. Todos los derechos reservados.", ""]);
    setUsed([]);
    setGuess(null);
    setCmd("");
  };

  const exec = (c: string) => {
    if (!sc || !c.trim()) return;
    const out = run(c, sc);
    if (out[0] === "__clear__") setLines([]);
    else setLines((l) => [...l, `${PROMPT}${c}`, ...out, ""]);
    setUsed((u) => (u.includes(c) ? u : [...u, c]));
    setCmd("");
    markLab("net-terminal");
  };

  if (!sc) {
    const ids = Object.keys(SCENARIOS) as ScenarioId[];
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Eres el técnico de soporte. Lee el reporte del usuario, ejecuta comandos como en Windows y da tu diagnóstico. Sigue la secuencia: <strong>ipconfig → ping 127.0.0.1 → ping gateway → ping 8.8.8.8 → nslookup → tracert</strong>.
        </p>
        <Button full onClick={() => { setMystery(true); start(ids[Math.floor(Math.random() * ids.length)]); }}>
          🕵️ Caso misterioso (aleatorio)
        </Button>
        <p className="text-center text-xs font-semibold text-slate-400">o elige un caso para practicar</p>
        <div className="grid gap-2">
          {ids.map((id) => (
            <button key={id} type="button" onClick={() => { setMystery(false); start(id); }} className="rounded-xl border border-slate-200 bg-white p-3 text-left text-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="font-semibold">{DIAGNOSES.find((d) => d.id === id)!.label}</span>
              <span className="mt-0.5 block text-xs text-muted">{SCENARIOS[id].ticket}</span>
            </button>
          ))}
        </div>
        {score.total > 0 && <p className="text-center text-sm">Diagnósticos acertados: {score.ok}/{score.total}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border-l-4 border-amber-400 bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
        <p className="text-[11px] font-bold uppercase text-amber-700 dark:text-amber-300">🎫 Reporte {mystery ? "(misterio)" : ""}</p>
        {SCENARIOS[sc].ticket}
      </div>

      <div ref={termRef} className="h-72 overflow-y-auto rounded-xl bg-[#0c0c0c] p-3 font-mono text-[11px] leading-[1.45] text-slate-200">
        {lines.map((l, i) => (
          <pre key={i} className={cn("whitespace-pre-wrap break-words", l.startsWith(PROMPT) && "text-yellow-300")}>
            {l || " "}
          </pre>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            exec(cmd);
          }}
          className="flex items-center"
        >
          <span className="shrink-0 text-yellow-300">{PROMPT}</span>
          <input
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            autoCapitalize="off"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-[16px] text-white outline-none sm:text-[11px]"
            aria-label="Comando"
          />
        </form>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {QUICK.map((q) => (
          <button key={q} type="button" onClick={() => exec(q)} className={cn("shrink-0 rounded-lg border px-2.5 py-1.5 font-mono text-[11px]", used.includes(q) ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40" : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900")}>
            {q}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
        <p className="mb-2 text-sm font-bold">🩺 Tu diagnóstico</p>
        {used.length < 2 && !guess && <p className="mb-2 text-xs text-muted">Ejecuta al menos 2 comandos antes de diagnosticar.</p>}
        <div className="grid gap-1.5">
          {DIAGNOSES.map((d) => (
            <button
              key={d.id}
              type="button"
              disabled={!!guess || used.length < 2}
              onClick={() => {
                setGuess(d.id);
                setScore((s) => ({ ok: s.ok + (d.id === sc ? 1 : 0), total: s.total + 1 }));
              }}
              className={cn(
                "min-h-11 rounded-2xl border-2 px-3 text-left text-sm font-medium transition disabled:cursor-default",
                !guess && "border-slate-200 bg-white disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900",
                guess && d.id === sc && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
                guess && d.id === guess && guess !== sc && "border-rose-500 bg-rose-50 dark:bg-rose-950/40",
                guess && d.id !== sc && d.id !== guess && "border-slate-200 opacity-40 dark:border-slate-700",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
        {guess && (
          <div className="animate-pop mt-3 space-y-2">
            <p className={cn("rounded-xl p-3 text-sm", guess === sc ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-rose-50 dark:bg-rose-950/40")}>
              <strong>{guess === sc ? "✅ ¡Diagnóstico correcto! " : "❌ No era eso. "}</strong>
              {SCENARIOS[sc].explain}
            </p>
            <Button full onClick={() => setSc(null)}>
              Otro caso →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
