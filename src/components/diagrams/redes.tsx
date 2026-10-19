"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RichText } from "@/components/ui";
import { formatNumber, ipToString, maskFromPrefix, octets, parseIPv4, subnet, toBin8 } from "@/lib/ip";
import { DetailPanel, Frame, Hint, StepControls, useStepper } from "./shared";

// ---------------- Red doméstica ----------------
const LAN = [
  { id: "router", icon: "📡", name: "Router", ip: "192.168.1.1", info: "Puerta de enlace (gateway) de la red. Tiene **dos** IP: la privada 192.168.1.1 hacia dentro y una **pública** hacia Internet (asignada por el ISP)." },
  { id: "pc", icon: "💻", name: "Computadora", ip: "192.168.1.10", info: "IP privada asignada por DHCP. Para salir a Internet usa el router (NAT)." },
  { id: "phone", icon: "📱", name: "Teléfono", ip: "192.168.1.11", info: "Otra IP privada de la misma red /24. Si se conecta a otra Wi-Fi, su IP cambiará." },
  { id: "printer", icon: "🖨️", name: "Impresora", ip: "192.168.1.12", info: "Conviene que sea **estática** (o reserva DHCP) para que las PC siempre la encuentren." },
];

export function HomeLan() {
  const [sel, setSel] = useState("router");
  const d = LAN.find((x) => x.id === sel)!;
  return (
    <Frame>
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-950 dark:text-sky-200">☁️ Internet · IP pública 203.0.113.5</div>
        <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
        <Device d={LAN[0]} active={sel === "router"} onClick={() => setSel("router")} />
        <div className="relative h-6 w-3/4">
          <div className="absolute left-1/2 top-0 h-3 w-px bg-slate-300 dark:bg-slate-600" />
          <div className="absolute left-[12%] right-[12%] top-3 h-px bg-slate-300 dark:bg-slate-600" />
          {[12, 50, 88].map((l) => (
            <div key={l} className="absolute top-3 h-3 w-px bg-slate-300 dark:bg-slate-600" style={{ left: `${l}%` }} />
          ))}
        </div>
        <div className="grid w-full grid-cols-3 gap-2">
          {LAN.slice(1).map((x) => (
            <Device key={x.id} d={x} active={sel === x.id} onClick={() => setSel(x.id)} />
          ))}
        </div>
        <p className="mt-2 text-[11px] font-semibold text-slate-400">Red privada 192.168.1.0/24</p>
      </div>
      <div className="mt-2">
        <DetailPanel title={`${d.icon} ${d.name} · ${d.ip}`} color="violet">
          <RichText text={d.info} />
        </DetailPanel>
      </div>
    </Frame>
  );
}

function Device({ d, active, onClick }: { d: (typeof LAN)[number]; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex flex-col items-center rounded-2xl border-2 px-2 py-2 transition", active ? "border-violet-500 bg-violet-50 dark:bg-violet-950/50" : "border-slate-200 dark:border-white/10")}
    >
      <span className="text-2xl">{d.icon}</span>
      <span className="text-[11px] font-semibold">{d.name}</span>
      <span className="font-mono text-[10px] text-muted">{d.ip}</span>
    </button>
  );
}

// ---------------- Viaje del paquete ----------------
type Hop = "pc" | "dns" | "router" | "isp" | "internet" | "server";
const HOPS: { id: Hop; icon: string; name: string }[] = [
  { id: "pc", icon: "💻", name: "Tu PC" },
  { id: "router", icon: "📡", name: "Router NAT" },
  { id: "isp", icon: "🏢", name: "ISP" },
  { id: "internet", icon: "🌐", name: "Routers" },
  { id: "server", icon: "🗄️", name: "Servidor" },
];

const JOURNEY: { at: Hop[]; title: string; text: string; src?: string; dst?: string; proto?: string }[] = [
  { at: ["pc"], title: "1. Escribes el dominio", text: "Escribes `www.ejemplo.com`. Tu PC aún no sabe a qué IP enviar." },
  { at: ["pc", "router"], title: "2. Consulta DNS", text: "La PC pregunta al servidor **DNS** (a través del router): ¿qué IP tiene www.ejemplo.com?", src: "192.168.1.10:53000", dst: "8.8.8.8:53", proto: "UDP · DNS" },
  { at: ["pc"], title: "2b. Respuesta DNS", text: "El DNS responde con un registro **A**: `93.184.216.34`.", proto: "A → 93.184.216.34" },
  { at: ["pc"], title: "3. Se arma el paquete", text: "La PC crea el paquete con **IP de origen** (su IP privada) e **IP de destino** (la del servidor).", src: "192.168.1.10:51000", dst: "93.184.216.34:443", proto: "TCP · HTTPS" },
  { at: ["router"], title: "4. El router aplica NAT", text: "El router **cambia la IP de origen** por su IP pública y anota la traducción en su **tabla NAT**.", src: "203.0.113.5:40001", dst: "93.184.216.34:443", proto: "TCP · HTTPS" },
  { at: ["isp", "internet"], title: "5. Routers intermedios", text: "El ISP y los routers de Internet **encaminan** el paquete salto a salto según la IP de destino (lo que ves en `tracert`).", src: "203.0.113.5:40001", dst: "93.184.216.34:443" },
  { at: ["server"], title: "6. El servidor responde", text: "El servidor procesa la solicitud y responde a la IP pública del router.", src: "93.184.216.34:443", dst: "203.0.113.5:40001", proto: "HTTP 200 OK" },
  { at: ["router"], title: "6b. NAT inverso", text: "El router busca el puerto 40001 en su tabla NAT y **reenvía** la respuesta a 192.168.1.10.", src: "93.184.216.34:443", dst: "192.168.1.10:51000" },
  { at: ["pc"], title: "7. El navegador interpreta", text: "Tu PC recibe los datos y el navegador **muestra la página**. ✔" },
];

export function PacketJourney() {
  const st = useStepper(JOURNEY.length, 2800);
  const cur = JOURNEY[st.step];
  return (
    <Frame>
      <div className="flex items-start justify-between gap-1">
        {HOPS.map((h, i) => (
          <div key={h.id} className="flex flex-1 items-center">
            <div className="flex flex-1 flex-col items-center">
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-2xl border-2 text-xl transition-all duration-300",
                  cur.at.includes(h.id) ? "scale-110 border-violet-500 bg-violet-100 shadow-md dark:bg-violet-950" : "border-slate-200 opacity-50 dark:border-slate-700",
                )}
              >
                {h.icon}
              </span>
              <span className="mt-1 text-center text-[10px] font-semibold leading-tight">{h.name}</span>
            </div>
            {i < HOPS.length - 1 && <span className="mb-4 text-slate-300 dark:text-slate-600">—</span>}
          </div>
        ))}
      </div>
      {(cur.src || cur.dst || cur.proto) && (
        <div key={st.step} className="animate-pop mt-3 overflow-hidden rounded-xl border border-violet-200 font-mono text-[11px] dark:border-violet-900">
          <div className="bg-violet-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">📦 Paquete</div>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 bg-violet-50 px-3 py-2 dark:bg-violet-950/40">
            {cur.src && (
              <>
                <span className="text-muted">Origen</span>
                <span className="font-semibold">{cur.src}</span>
              </>
            )}
            {cur.dst && (
              <>
                <span className="text-muted">Destino</span>
                <span className="font-semibold">{cur.dst}</span>
              </>
            )}
            {cur.proto && (
              <>
                <span className="text-muted">Info</span>
                <span>{cur.proto}</span>
              </>
            )}
          </div>
        </div>
      )}
      <div className="mt-3 space-y-2">
        <DetailPanel title={cur.title} color="violet">
          <RichText text={cur.text} />
        </DetailPanel>
        <StepControls stepper={st} total={JOURNEY.length} />
      </div>
    </Frame>
  );
}

// ---------------- Estructura IPv4 ----------------
export function Ipv4Structure() {
  const [sel, setSel] = useState<number | null>(null);
  const oct = [192, 168, 1, 10];
  return (
    <Frame>
      <div className="grid grid-cols-4 gap-1.5">
        {oct.map((o, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSel(i)}
            className={cn("rounded-2xl border-2 py-2 text-center transition", sel === i ? "border-violet-500 bg-violet-50 dark:bg-violet-950/50" : "border-slate-200 dark:border-white/10")}
          >
            <span className="block text-2xl font-black">{o}</span>
            <span className="block text-[10px] text-muted">Octeto {i + 1}</span>
          </button>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-4 gap-1.5 text-center font-mono text-[10.5px] text-muted">
        {oct.map((o, i) => (
          <span key={i}>{toBin8(o)}</span>
        ))}
      </div>
      <p className="mt-2 text-center text-xs font-semibold text-muted">8 bits + 8 bits + 8 bits + 8 bits = 32 bits</p>
      {sel !== null && (
        <div className="mt-2">
          <DetailPanel title={`Octeto ${sel + 1}: ${oct[sel]}`} color="violet">
            <div className="grid grid-cols-8 gap-0.5 text-center font-mono text-[11px]">
              {[128, 64, 32, 16, 8, 4, 2, 1].map((v) => (
                <span key={v} className="text-muted">
                  {v}
                </span>
              ))}
              {toBin8(oct[sel])
                .split("")
                .map((b, i) => (
                  <span key={i} className={cn("rounded py-0.5 font-bold", b === "1" ? "bg-violet-600 text-white" : "bg-slate-200 dark:bg-slate-700")}>
                    {b}
                  </span>
                ))}
            </div>
            <p className="mt-1 text-xs">
              {oct[sel]} ={" "}
              {[128, 64, 32, 16, 8, 4, 2, 1]
                .filter((v, i) => toBin8(oct[sel])[i] === "1")
                .join(" + ") || "0"}
            </p>
          </DetailPanel>
        </div>
      )}
    </Frame>
  );
}

// ---------------- Red vs host ----------------
export function NetworkHost() {
  const [p, setP] = useState(24);
  const ip = parseIPv4("192.168.1.10")!;
  const s = subnet(ip, p);
  const bits = octets(ip).map(toBin8).join("");
  const maskOct = octets(maskFromPrefix(p));
  return (
    <Frame>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-mono text-sm font-bold">192.168.1.10/{p}</span>
        <span className="text-xs text-muted">
          <span className="font-bold text-violet-600">{p}</span> red · <span className="font-bold text-amber-600">{32 - p}</span> host
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {[0, 1, 2, 3].map((o) => (
          <div key={o} className="grid grid-cols-8 gap-[2px]">
            {bits
              .slice(o * 8, o * 8 + 8)
              .split("")
              .map((b, i) => {
                const idx = o * 8 + i;
                return (
                  <span
                    key={i}
                    className={cn(
                      "flex h-6 items-center justify-center rounded-[3px] font-mono text-[9px] font-bold transition-colors",
                      idx < p ? "bg-violet-600 text-white" : "bg-amber-300 text-amber-950 dark:bg-amber-600 dark:text-white",
                    )}
                  >
                    {b}
                  </span>
                );
              })}
          </div>
        ))}
      </div>
      <input type="range" min={8} max={30} value={p} onChange={(e) => setP(Number(e.target.value))} className="mt-3 w-full accent-violet-600" aria-label="Prefijo" />
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <Stat k="Máscara" v={maskOct.join(".")} />
        <Stat k="Red" v={ipToString(s.network)} />
        <Stat k="Broadcast" v={ipToString(s.broadcast)} />
        <Stat k="Hosts útiles" v={formatNumber(s.usable)} />
      </div>
    </Frame>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <p className="text-[10px] uppercase text-muted">{k}</p>
      <p className="font-mono font-semibold">{v}</p>
    </div>
  );
}

// ---------------- NAT ----------------
export function NatDiagram() {
  const [sel, setSel] = useState<number | null>(null);
  const devices = [
    { icon: "💻", name: "Computadora A", ip: "192.168.1.10", port: 40001 },
    { icon: "💻", name: "Computadora B", ip: "192.168.1.11", port: 40002 },
    { icon: "📱", name: "Teléfono", ip: "192.168.1.12", port: 40003 },
  ];
  return (
    <Frame>
      <div className="flex items-center gap-2">
        <div className="flex-1 space-y-2">
          {devices.map((d, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSel(i)}
              className={cn("flex w-full items-center gap-2 rounded-2xl border-2 px-2 py-1.5 text-left", sel === i ? "border-violet-500 bg-violet-50 dark:bg-violet-950/50" : "border-slate-200 dark:border-white/10")}
            >
              <span>{d.icon}</span>
              <span className="font-mono text-[11px]">{d.ip}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center">
          <span className="text-slate-400">→</span>
          <span className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md">
            <span className="text-lg">📡</span>
            <span className="text-[9px] font-bold">NAT</span>
          </span>
          <span className="text-slate-400">→</span>
        </div>
        <div className="flex flex-1 flex-col items-center gap-1">
          <span className="rounded-2xl border-2 border-sky-300 bg-sky-50 px-2 py-1 text-center font-mono text-[11px] dark:border-sky-800 dark:bg-sky-950/40">
            203.0.113.5
            <br />
            <span className="text-[9px] text-muted">IP pública compartida</span>
          </span>
          <span className="text-2xl">☁️</span>
          <span className="text-[10px] font-semibold">Internet</span>
        </div>
      </div>
      <div className="mt-3">
        {sel !== null ? (
          <DetailPanel title={`${devices[sel].name}`} color="violet">
            <span className="font-mono text-xs">
              {devices[sel].ip}:51000 ⇄ 203.0.113.5:{devices[sel].port}
            </span>
            <p className="mt-1">
              Internet solo ve la IP pública con el puerto <strong>{devices[sel].port}</strong>. Cuando llega la respuesta a ese puerto, el router sabe que es para {devices[sel].ip}.
            </p>
          </DetailPanel>
        ) : (
          <Hint>Toca un dispositivo para ver su traducción NAT.</Hint>
        )}
      </div>
    </Frame>
  );
}

// ---------------- CGNAT ----------------
export function CgnatChain() {
  const chain = [
    { icon: "💻", name: "Tu PC", ip: "192.168.1.10", note: "IP privada (RFC 1918)" },
    { icon: "📡", name: "Router doméstico", ip: "100.72.14.9", note: "NAT #1 · IP WAN del espacio compartido" },
    { icon: "🏢", name: "CGNAT del ISP", ip: "100.64.0.0/10", note: "NAT #2 · comparte IPs públicas entre clientes" },
    { icon: "🌍", name: "IP pública compartida", ip: "203.0.113.20", note: "La ven los sitios web" },
  ];
  return (
    <Frame>
      <div className="space-y-1">
        {chain.map((c, i) => (
          <div key={i}>
            <div className={cn("flex items-center gap-3 rounded-2xl border-2 px-3 py-2", i === 2 ? "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40" : "border-slate-200 dark:border-white/10")}>
              <span className="text-xl">{c.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold leading-tight">{c.name}</p>
                <p className="text-[11px] text-muted">{c.note}</p>
              </div>
              <span className="font-mono text-[11px] font-semibold">{c.ip}</span>
            </div>
            {i < chain.length - 1 && <div className="py-0.5 text-center text-slate-400">↓</div>}
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-rose-600 dark:text-rose-400">Doble NAT: las conexiones entrantes no pueden atravesar el CGNAT del ISP.</p>
    </Frame>
  );
}

// ---------------- DHCP DORA ----------------
const DORA = [
  { l: "D", name: "Discover", dir: "→", text: "El cliente grita a toda la red (broadcast): “¿Hay algún servidor DHCP?”", from: "0.0.0.0", to: "255.255.255.255" },
  { l: "O", name: "Offer", dir: "←", text: "El servidor ofrece una IP libre: “Te ofrezco 192.168.1.11 por 24 h”.", from: "192.168.1.1", to: "cliente" },
  { l: "R", name: "Request", dir: "→", text: "El cliente responde: “Acepto 192.168.1.11”.", from: "0.0.0.0", to: "255.255.255.255" },
  { l: "A", name: "Acknowledge", dir: "←", text: "El servidor confirma y entrega máscara, gateway, DNS y tiempo de concesión (lease).", from: "192.168.1.1", to: "192.168.1.11" },
];

export function DhcpDora() {
  const st = useStepper(DORA.length, 2400);
  const cur = DORA[st.step];
  return (
    <Frame>
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center">
          <span className="text-3xl">📱</span>
          <span className="text-[11px] font-semibold">Cliente</span>
        </div>
        <div className="flex flex-1 flex-col gap-1 px-2">
          {DORA.map((d, i) => (
            <button
              key={d.l}
              type="button"
              onClick={() => st.setStep(i)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1 text-xs transition",
                i === st.step ? "bg-violet-600 font-bold text-white" : i < st.step ? "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200" : "bg-slate-100 text-muted dark:bg-slate-800",
                d.dir === "←" && "flex-row-reverse",
              )}
            >
              <span className="text-base font-black">{d.l}</span>
              <span className="flex-1 text-center">{d.name}</span>
              <span>{d.dir === "→" ? "➜" : "⬅"}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center">
          <span className="text-3xl">🖧</span>
          <span className="text-[11px] font-semibold">Servidor DHCP</span>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <DetailPanel title={`${cur.l} · ${cur.name}`} color="violet">
          {cur.text}
          <p className="mt-1 font-mono text-[11px] text-muted">
            {cur.from} → {cur.to}
          </p>
        </DetailPanel>
        <StepControls stepper={st} total={DORA.length} />
      </div>
    </Frame>
  );
}

// ---------------- IP vs MAC por saltos ----------------
const HOP_MAC = [
  { seg: "PC → Router", srcMac: "AA:AA (PC)", dstMac: "BB:BB (Router LAN)", srcIp: "192.168.1.10" },
  { seg: "Router → ISP", srcMac: "CC:CC (Router WAN)", dstMac: "DD:DD (ISP)", srcIp: "203.0.113.5 (tras NAT)" },
  { seg: "ISP → Servidor", srcMac: "EE:EE (último router)", dstMac: "FF:FF (Servidor)", srcIp: "203.0.113.5" },
];

export function IpVsMac() {
  const [i, setI] = useState(0);
  const h = HOP_MAC[i];
  return (
    <Frame>
      <div className="mb-3 grid grid-cols-3 gap-1">
        {HOP_MAC.map((x, k) => (
          <button key={k} type="button" onClick={() => setI(k)} className={cn("rounded-lg border py-2 text-[11px] font-semibold", i === k ? "border-violet-500 bg-violet-50 dark:bg-violet-950/50" : "border-slate-300 dark:border-white/15")}>
            Tramo {k + 1}
            <br />
            <span className="font-normal text-muted">{x.seg}</span>
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 font-mono text-xs dark:border-slate-700">
        <div className="grid grid-cols-[auto_1fr_1fr] bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase text-muted dark:bg-slate-800">
          <span className="w-16">Capa</span>
          <span>Origen</span>
          <span>Destino</span>
        </div>
        <div key={`m${i}`} className="animate-pop grid grid-cols-[auto_1fr_1fr] gap-1 bg-amber-50 px-3 py-2 dark:bg-amber-950/30">
          <span className="w-16 font-sans font-bold text-amber-700 dark:text-amber-300">MAC (2)</span>
          <span>{h.srcMac}</span>
          <span>{h.dstMac}</span>
        </div>
        <div className="grid grid-cols-[auto_1fr_1fr] gap-1 bg-violet-50 px-3 py-2 dark:bg-violet-950/30">
          <span className="w-16 font-sans font-bold text-violet-700 dark:text-violet-300">IP (3)</span>
          <span>{h.srcIp}</span>
          <span>93.184.216.34</span>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-muted">La MAC cambia en cada tramo; la IP de destino se mantiene de extremo a extremo (la de origen solo cambia por NAT).</p>
    </Frame>
  );
}
