"use client";

import { useMemo, useState } from "react";
import { cn, normalize, pct } from "@/lib/utils";
import { markLab } from "@/lib/store";
import {
  KIND_LABEL,
  classifyIPv4,
  classifyIPv6,
  compressIPv6,
  expandIPv6,
  formatNumber,
  ipClass,
  ipToBinary,
  ipToString,
  octets,
  parseIPv4,
  parseIPv6,
  randInt,
  subnet,
  toBin8,
  type IpKind,
} from "@/lib/ip";
import { Button, Chip, ProgressBar } from "@/components/ui";

// ============================================================
// Calculadora de subredes
// ============================================================
const EXAMPLES = ["192.168.1.10/24", "192.168.1.100/26", "10.0.5.77/8", "172.16.40.200/20", "200.10.5.1/30", "100.72.14.9/10"];

export function SubnetCalc() {
  const [ipText, setIpText] = useState("192.168.1.10");
  const [prefix, setPrefix] = useState(24);
  const [split, setSplit] = useState(4);

  const onIpChange = (v: string) => {
    if (v.includes("/")) {
      const [a, b] = v.split("/");
      setIpText(a);
      const n = Number(b);
      if (Number.isInteger(n) && n >= 0 && n <= 32) setPrefix(n);
    } else setIpText(v);
  };

  const ip = parseIPv4(ipText);
  const info = ip !== null ? subnet(ip, prefix) : null;
  const cls = ip !== null ? ipClass(ip) : null;
  const kind = ip !== null ? classifyIPv4(ip) : null;

  const newPrefix = Math.min(32, prefix + Math.log2(split));
  const subnets = useMemo(() => {
    if (!info || newPrefix > 32) return [];
    const size = 2 ** (32 - newPrefix);
    const count = Math.min(split, 64);
    return Array.from({ length: count }, (_, k) => subnet((info.network + k * size) >>> 0, newPrefix));
  }, [info, newPrefix, split]);

  return (
    <div className="space-y-4" onPointerDown={() => markLab("subnet-calc")}>
      <div className="flex flex-wrap gap-1.5">
        {EXAMPLES.map((e) => (
          <Chip key={e} onClick={() => onIpChange(e)} className="font-mono text-xs">
            {e}
          </Chip>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          value={ipText}
          onChange={(e) => onIpChange(e.target.value)}
          inputMode="decimal"
          placeholder="192.168.1.10"
          className={cn("h-12 min-w-0 flex-1 rounded-2xl border-2 bg-white px-3 font-mono dark:bg-slate-900", ip === null ? "border-rose-400" : "border-slate-200 dark:border-white/10")}
          aria-label="Dirección IPv4"
        />
        <span className="text-xl font-bold text-slate-400">/</span>
        <input
          type="number"
          min={0}
          max={32}
          value={prefix}
          onChange={(e) => setPrefix(Math.max(0, Math.min(32, Number(e.target.value) || 0)))}
          className="h-12 w-16 rounded-2xl border-2 border-slate-200 bg-white px-2 text-center font-mono dark:border-slate-700 dark:bg-slate-900"
          aria-label="Prefijo"
        />
      </div>
      <input type="range" min={0} max={32} value={prefix} onChange={(e) => setPrefix(Number(e.target.value))} className="w-full accent-violet-600" aria-label="Prefijo" />

      {!info ? (
        <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">IPv4 inválida: usa 4 números de 0 a 255 separados por puntos.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Res k="Dirección de red" v={ipToString(info.network)} strong />
            <Res k="Broadcast" v={ipToString(info.broadcast)} strong />
            <Res k="Primer host" v={ipToString(info.firstHost)} />
            <Res k="Último host" v={ipToString(info.lastHost)} />
            <Res k="Máscara" v={ipToString(info.mask)} />
            <Res k="Wildcard" v={ipToString(info.wildcard)} />
            <Res k="Direcciones" v={`2^${32 - prefix} = ${formatNumber(info.total)}`} />
            <Res k="Hosts utilizables" v={formatNumber(info.usable)} strong />
            <Res k="Clase (histórica)" v={`${cls!.cls} · ${cls!.note.split("·")[0].trim()}`} />
            <Res k="Tipo" v={KIND_LABEL[kind!.kind]} />
          </div>
          <p className="rounded-lg bg-violet-50 p-2 text-xs text-violet-900 dark:bg-violet-950/40 dark:text-violet-200">
            {kind!.label}
            {prefix === 31 && " · /31: 2 direcciones usables (enlace punto a punto)."}
            {prefix === 32 && " · /32: una sola dirección (host)."}
            {prefix < 31 && (
              <>
                {" "}
                · Número mágico: <strong>{info.blockSize}</strong> en el octeto {info.interestingOctet} (las subredes saltan de {info.blockSize} en {info.blockSize}).
              </>
            )}
          </p>

          <div className="space-y-1 overflow-x-auto rounded-xl bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-slate-200">
            <BinRow label="IP     " bin={ipToBinary(info.ip)} p={prefix} />
            <BinRow label="Máscara" bin={ipToBinary(info.mask)} p={prefix} />
            <BinRow label="Red    " bin={ipToBinary(info.network)} p={prefix} />
            <p className="pt-1 text-[10px] text-slate-400">
              <span className="text-violet-300">■</span> bits de red ({prefix}) · <span className="text-amber-300">■</span> bits de host ({32 - prefix})
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
            <p className="mb-2 text-sm font-bold">✂️ Dividir {ipToString(info.network)}/{prefix} en subredes iguales</p>
            <div className="flex flex-wrap gap-1.5">
              {[2, 4, 8, 16, 32, 64].map((n) => (
                <Chip key={n} active={split === n} onClick={() => setSplit(n)}>
                  {n}
                </Chip>
              ))}
            </div>
            {newPrefix > 32 ? (
              <p className="mt-2 text-sm text-rose-600">No se puede: no quedan bits de host suficientes.</p>
            ) : (
              <>
                <p className="mt-2 text-xs text-muted">
                  {split} subredes → 2^{Math.log2(split)} → se piden <strong>{Math.log2(split)} bits</strong> → nuevo prefijo <strong>/{newPrefix}</strong> · {formatNumber(2 ** (32 - newPrefix))} direcciones c/u (
                  {formatNumber(newPrefix >= 31 ? (newPrefix === 31 ? 2 : 1) : 2 ** (32 - newPrefix) - 2)} hosts)
                </p>
                <div className="mt-2 max-h-72 overflow-auto rounded-lg border border-slate-200 dark:border-white/10">
                  <table className="w-full min-w-max text-left font-mono text-[11px]">
                    <thead className="sticky top-0 bg-surface-2">
                      <tr>
                        <th className="px-2 py-1">#</th>
                        <th className="px-2 py-1">Subred</th>
                        <th className="px-2 py-1">Rango de hosts</th>
                        <th className="px-2 py-1">Broadcast</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subnets.map((s, k) => {
                        const mine = info.ip >= s.network && info.ip <= s.broadcast;
                        return (
                          <tr key={k} className={cn("border-t border-slate-100 dark:border-slate-800", mine && "bg-violet-100 font-bold dark:bg-violet-950/60")}>
                            <td className="px-2 py-1">{k + 1}</td>
                            <td className="px-2 py-1">
                              {ipToString(s.network)}/{newPrefix}
                            </td>
                            <td className="px-2 py-1">
                              {newPrefix >= 31 ? "—" : `${ipToString(s.firstHost)} – ${ipToString(s.lastHost)}`}
                            </td>
                            <td className="px-2 py-1">{ipToString(s.broadcast)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {split > 64 && <p className="text-xs text-muted">Se muestran las primeras 64.</p>}
                <p className="mt-1 text-[11px] text-muted">Resaltada: la subred donde cae tu IP.</p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Res({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className={cn("rounded-xl px-3 py-2", strong ? "bg-violet-100 dark:bg-violet-950/50" : "bg-surface-2")}>
      <p className="text-[10px] font-semibold uppercase text-muted">{k}</p>
      <p className="break-all font-mono text-[13px] font-bold">{v}</p>
    </div>
  );
}

function BinRow({ label, bin, p }: { label: string; bin: string; p: number }) {
  let count = 0;
  return (
    <p className="whitespace-nowrap">
      <span className="text-muted">{label} </span>
      {bin.split("").map((ch, i) => {
        if (ch === ".") return <span key={i} className="text-slate-600">.</span>;
        const isNet = count < p;
        count++;
        return (
          <span key={i} className={isNet ? "text-violet-300" : "text-amber-300"}>
            {ch}
          </span>
        );
      })}
    </p>
  );
}

// ============================================================
// Reto de subnetting
// ============================================================
type Level = "basico" | "intermedio" | "avanzado";
type Exercise = { prompt: string; answers: string[]; steps: string[] };

function randomIp(): number {
  const pools = [
    () => [192, 168, randInt(0, 255), randInt(1, 254)],
    () => [10, randInt(0, 255), randInt(0, 255), randInt(1, 254)],
    () => [172, randInt(16, 31), randInt(0, 255), randInt(1, 254)],
    () => [randInt(11, 223), randInt(0, 255), randInt(0, 255), randInt(1, 254)],
  ];
  const o = pools[randInt(0, pools.length - 1)]();
  return parseIPv4(o.join("."))!;
}

function makeExercise(level: Level): Exercise {
  const prefixes = level === "basico" ? [24, 25, 26, 27, 28, 29, 30] : level === "intermedio" ? [25, 26, 27, 28, 29, 30] : [17, 18, 19, 20, 21, 22, 23];
  const kinds = level === "basico" ? ["hosts", "mask", "split", "total"] : ["network", "broadcast", "first", "last", "network", "broadcast"];
  const p = prefixes[randInt(0, prefixes.length - 1)];
  const ip = randomIp();
  const s = subnet(ip, p);
  const kind = kinds[randInt(0, kinds.length - 1)];
  const cidr = `${ipToString(ip)}/${p}`;
  const io = s.interestingOctet;
  const maskOct = octets(s.mask)[io - 1];
  const ipOct = octets(ip)[io - 1];
  const netOct = octets(s.network)[io - 1];
  const magic = [
    `Máscara /${p} = ${ipToString(s.mask)}. Octeto interesante: el ${io}.º (${maskOct}).`,
    `Número mágico = 256 − ${maskOct} = ${s.blockSize}. Las subredes van de ${s.blockSize} en ${s.blockSize}.`,
    `El ${io}.º octeto de la IP es ${ipOct} → cae en el bloque que empieza en ${netOct} (múltiplo de ${s.blockSize}).`,
  ];
  switch (kind) {
    case "hosts":
      return {
        prompt: `¿Cuántos hosts utilizables tiene una subred /${p}?`,
        answers: [String(s.usable)],
        steps: [`Bits de host = 32 − ${p} = ${32 - p}.`, `Direcciones = 2^${32 - p} = ${s.total}.`, `Hosts = ${s.total} − 2 (red y broadcast) = ${s.usable}.`],
      };
    case "total":
      return {
        prompt: `¿Cuántas direcciones totales tiene una subred /${p}?`,
        answers: [String(s.total)],
        steps: [`Bits de host = 32 − ${p} = ${32 - p}.`, `Direcciones totales = 2^${32 - p} = ${s.total}.`],
      };
    case "mask":
      return {
        prompt: `¿Qué máscara decimal corresponde a /${p}?`,
        answers: [ipToString(s.mask)],
        steps: [`/${p} = ${p} unos seguidos de ${32 - p} ceros.`, `En binario: ${ipToBinary(s.mask)}.`, `En decimal: ${ipToString(s.mask)}.`],
      };
    case "split": {
      const n = [2, 4, 8, 16][randInt(0, 3)];
      const base = `192.168.${randInt(0, 255)}.0/24`;
      const np = 24 + Math.log2(n);
      return {
        prompt: `Divides ${base} en ${n} subredes iguales. ¿Qué prefijo usa cada subred? (escribe solo el número)`,
        answers: [String(np), `/${np}`],
        steps: [`${n} subredes → 2^n ≥ ${n} → n = ${Math.log2(n)} bits prestados.`, `Nuevo prefijo = 24 + ${Math.log2(n)} = /${np}.`, `Cada subred: 2^${32 - np} = ${2 ** (32 - np)} direcciones (${2 ** (32 - np) - 2} hosts).`],
      };
    }
    case "network":
      return { prompt: `¿Cuál es la dirección de RED de ${cidr}?`, answers: [ipToString(s.network)], steps: [...magic, `Red = ${ipToString(s.network)}.`] };
    case "broadcast":
      return {
        prompt: `¿Cuál es la dirección de BROADCAST de ${cidr}?`,
        answers: [ipToString(s.broadcast)],
        steps: [...magic, `Red = ${ipToString(s.network)}. Broadcast = siguiente red − 1 = ${ipToString(s.broadcast)}.`],
      };
    case "first":
      return { prompt: `¿Cuál es el PRIMER host utilizable de ${cidr}?`, answers: [ipToString(s.firstHost)], steps: [...magic, `Red = ${ipToString(s.network)} → primer host = red + 1 = ${ipToString(s.firstHost)}.`] };
    default:
      return {
        prompt: `¿Cuál es el ÚLTIMO host utilizable de ${cidr}?`,
        answers: [ipToString(s.lastHost)],
        steps: [...magic, `Broadcast = ${ipToString(s.broadcast)} → último host = broadcast − 1 = ${ipToString(s.lastHost)}.`],
      };
  }
}

export function SubnetPractice() {
  const [level, setLevel] = useState<Level>("basico");
  const [ex, setEx] = useState<Exercise | null>(null);
  const [val, setVal] = useState("");
  const [res, setRes] = useState<boolean | null>(null);
  const [stats, setStats] = useState({ ok: 0, total: 0, streak: 0 });

  const newEx = (l = level) => {
    setEx(makeExercise(l));
    setVal("");
    setRes(null);
  };

  const check = () => {
    if (!ex || !val.trim()) return;
    const good = ex.answers.some((a) => normalize(a) === normalize(val.replace(/\s/g, "")));
    setRes(good);
    setStats((s) => ({ ok: s.ok + (good ? 1 : 0), total: s.total + 1, streak: good ? s.streak + 1 : 0 }));
    markLab("subnet-practice");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 text-sm font-semibold dark:bg-slate-800">
        {(["basico", "intermedio", "avanzado"] as Level[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => {
              setLevel(l);
              if (ex) newEx(l);
            }}
            className={cn("rounded-lg py-2 capitalize", level === l ? "bg-white shadow dark:bg-slate-950" : "text-muted")}
          >
            {l === "basico" ? "Básico" : l === "intermedio" ? "Intermedio" : "Avanzado"}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted">
        {level === "basico" && "Hosts, direcciones, máscaras y división en subredes."}
        {level === "intermedio" && "Red, broadcast, primer y último host con prefijos /25 a /30."}
        {level === "avanzado" && "Lo mismo con prefijos /17 a /23 (el salto ocurre en el 3.er octeto)."}
      </p>

      {stats.total > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
          <span>
            ✅ {stats.ok}/{stats.total} ({pct(stats.ok, stats.total)}%)
          </span>
          <span className="font-bold text-amber-600">🔥 racha {stats.streak}</span>
        </div>
      )}

      {!ex ? (
        <Button full onClick={() => newEx()}>
          ▶ Generar ejercicio
        </Button>
      ) : (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[17px] font-semibold leading-snug">{ex.prompt}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (res === null) check();
              else newEx();
            }}
            className="space-y-3"
          >
            <input
              value={val}
              onChange={(e) => setVal(e.target.value)}
              disabled={res !== null}
              inputMode="decimal"
              autoComplete="off"
              placeholder="Tu respuesta"
              className={cn(
                "h-12 w-full rounded-2xl border-2 bg-white px-3 font-mono dark:bg-slate-950",
                res === null ? "border-slate-200 dark:border-white/10" : res ? "border-emerald-500" : "border-rose-500",
              )}
            />
            {res === null ? (
              <Button full type="submit" disabled={!val.trim()}>
                Comprobar
              </Button>
            ) : (
              <>
                <div className={cn("rounded-xl p-3 text-sm", res ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-rose-50 dark:bg-rose-950/40")}>
                  <p className="font-bold">{res ? "✅ ¡Correcto!" : `❌ Respuesta: ${ex.answers[0]}`}</p>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-700 dark:text-slate-200">
                    {ex.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </div>
                <Button full type="submit">
                  Siguiente ejercicio →
                </Button>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Conversor binario
// ============================================================
const PLACES = [128, 64, 32, 16, 8, 4, 2, 1];

export function IpBinary() {
  const [oct, setOct] = useState([192, 168, 1, 10]);
  const [text, setText] = useState("192.168.1.10");
  const [mode, setMode] = useState<"libre" | "reto">("libre");
  const [target, setTarget] = useState<number | null>(null);
  const [val, setVal] = useState(0);
  const [wins, setWins] = useState(0);

  const toggle = (o: number, bit: number) => {
    const n = oct.slice();
    n[o] = n[o] ^ PLACES[bit];
    setOct(n);
    setText(n.join("."));
    markLab("ip-binary");
  };

  const onText = (v: string) => {
    setText(v);
    const ip = parseIPv4(v);
    if (ip !== null) setOct(octets(ip));
  };

  if (mode === "reto") {
    const done = target !== null && val === target;
    return (
      <div className="space-y-4">
        <ModeTabs mode={mode} setMode={setMode} />
        {target === null ? (
          <Button full onClick={() => setTarget(randInt(1, 255))}>
            ▶ Empezar reto
          </Button>
        ) : (
          <>
            <div className="text-center">
              <p className="text-sm text-muted">Activa los bits para formar</p>
              <p className="text-5xl font-black text-violet-600">{target}</p>
              <p className="mt-1 text-sm">
                Llevas: <span className={cn("font-mono font-bold", done ? "text-emerald-600" : "")}>{val}</span> · Aciertos: {wins}
              </p>
            </div>
            <BitRow value={val} onToggle={(b) => setVal((v) => v ^ PLACES[b])} />
            {done ? (
              <div className="animate-pop space-y-2 text-center">
                <p className="font-bold text-emerald-600">
                  ✅ {target} = {toBin8(target)} = {PLACES.filter((p) => target & p).join(" + ")}
                </p>
                <Button
                  full
                  onClick={() => {
                    setWins((w) => w + 1);
                    setTarget(randInt(1, 255));
                    setVal(0);
                    markLab("ip-binary");
                  }}
                >
                  Siguiente número →
                </Button>
              </div>
            ) : (
              <p className="text-center text-xs text-muted">Pista: empieza por la casilla más grande que cabe en {target} ({PLACES.find((p) => p <= target)}) y sigue con lo que sobra.</p>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ModeTabs mode={mode} setMode={setMode} />
      <input
        value={text}
        onChange={(e) => onText(e.target.value)}
        inputMode="decimal"
        className={cn("h-12 w-full rounded-2xl border-2 bg-white px-3 text-center font-mono text-lg font-bold dark:bg-slate-900", parseIPv4(text) === null ? "border-rose-400" : "border-slate-200 dark:border-white/10")}
        aria-label="Dirección IPv4"
      />
      <div className="space-y-3">
        {oct.map((v, o) => (
          <div key={o}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="font-semibold text-muted">Octeto {o + 1}</span>
              <span className="font-mono text-base font-black">{v}</span>
            </div>
            <BitRow value={v} onToggle={(b) => toggle(o, b)} />
          </div>
        ))}
      </div>
      <p className="break-all rounded-xl bg-slate-900 p-3 text-center font-mono text-xs text-emerald-300">{oct.map(toBin8).join(".")}</p>
      <p className="text-center text-xs text-muted">Toca un bit para encenderlo o apagarlo. 32 bits = 4 octetos de 8 bits.</p>
    </div>
  );
}

function ModeTabs({ mode, setMode }: { mode: "libre" | "reto"; setMode: (m: "libre" | "reto") => void }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-sm font-semibold dark:bg-slate-800">
      {(["libre", "reto"] as const).map((m) => (
        <button key={m} type="button" onClick={() => setMode(m)} className={cn("rounded-lg py-2", mode === m ? "bg-white shadow dark:bg-slate-950" : "text-muted")}>
          {m === "libre" ? "🔧 Explorar" : "🎯 Reto"}
        </button>
      ))}
    </div>
  );
}

function BitRow({ value, onToggle }: { value: number; onToggle: (bit: number) => void }) {
  return (
    <div className="grid grid-cols-8 gap-1">
      {PLACES.map((p, b) => {
        const on = (value & p) !== 0;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onToggle(b)}
            className={cn(
              "flex h-12 flex-col items-center justify-center rounded-lg border-2 transition active:scale-95",
              on ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900",
            )}
          >
            <span className="font-mono text-base font-black">{on ? 1 : 0}</span>
            <span className="text-[9px]">{p}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// Clasificador de IPs
// ============================================================
const GAME_KINDS: IpKind[] = ["privada", "publica", "loopback", "apipa", "cgnat", "multicast"];

function randomIpOf(kind: IpKind): string {
  switch (kind) {
    case "privada": {
      const r = randInt(0, 3);
      if (r === 0) return `10.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
      if (r === 1) return `172.${randInt(16, 31)}.${randInt(0, 255)}.${randInt(1, 254)}`;
      return `192.168.${randInt(0, 255)}.${randInt(1, 254)}`;
    }
    case "loopback":
      return `127.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
    case "apipa":
      return `169.254.${randInt(1, 254)}.${randInt(1, 254)}`;
    case "cgnat":
      return `100.${randInt(64, 127)}.${randInt(0, 255)}.${randInt(1, 254)}`;
    case "multicast":
      return `${randInt(224, 239)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
    default: {
      // públicas "trampa" frecuentes primero
      const traps = [`172.${randInt(32, 63)}.${randInt(0, 255)}.${randInt(1, 254)}`, `192.169.${randInt(0, 255)}.${randInt(1, 254)}`, `11.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`, "8.8.8.8", "1.1.1.1"];
      if (Math.random() < 0.5) return traps[randInt(0, traps.length - 1)];
      for (;;) {
        const ip = `${randInt(1, 223)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
        if (classifyIPv4(parseIPv4(ip)!).kind === "publica") return ip;
      }
    }
  }
}

export function IpClassifier() {
  const ROUNDS = 10;
  const [round, setRound] = useState(-1);
  const [ip, setIp] = useState("");
  const [picked, setPicked] = useState<IpKind | null>(null);
  const [score, setScore] = useState(0);
  const [start, setStart] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const nextIp = () => setIp(randomIpOf(GAME_KINDS[randInt(0, GAME_KINDS.length - 1)]));

  const begin = () => {
    setRound(0);
    setScore(0);
    setPicked(null);
    setStart(Date.now());
    nextIp();
  };

  if (round < 0) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted">Te mostraremos {ROUNDS} direcciones IPv4. Elige su tipo lo más rápido que puedas.</p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {GAME_KINDS.map((k) => (
            <span key={k} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium dark:bg-slate-800">
              {KIND_LABEL[k]}
            </span>
          ))}
        </div>
        <Button full onClick={begin}>
          ▶ Empezar
        </Button>
      </div>
    );
  }

  if (round >= ROUNDS) {
    return (
      <div className="animate-pop space-y-3 text-center">
        <div className="text-5xl">{score >= 9 ? "🏆" : score >= 7 ? "🎉" : "📚"}</div>
        <p className="text-3xl font-black">
          {score}/{ROUNDS}
        </p>
        <p className="text-muted">Tiempo: {Math.round(elapsed / 1000)} s</p>
        <Button full onClick={begin}>
          Jugar otra vez
        </Button>
      </div>
    );
  }

  const real = classifyIPv4(parseIPv4(ip)!);
  const answered = picked !== null;
  const ok = picked === real.kind;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ProgressBar value={pct(round, ROUNDS)} color="bg-violet-600" />
        <span className="text-xs font-semibold tabular-nums text-muted">
          {round + 1}/{ROUNDS}
        </span>
        <span className="text-xs font-bold">✅ {score}</span>
      </div>
      <div key={round} className={cn("animate-pop rounded-2xl border-2 bg-white py-8 text-center dark:bg-slate-900", !answered ? "border-slate-200 dark:border-white/10" : ok ? "border-emerald-500" : "animate-shake border-rose-500")}>
        <p className="font-mono text-3xl font-black tracking-tight">{ip}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {GAME_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            disabled={answered}
            onClick={() => {
              setPicked(k);
              if (k === real.kind) setScore((s) => s + 1);
            }}
            className={cn(
              "min-h-12 rounded-2xl border-2 text-sm font-semibold transition",
              !answered && "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
              answered && k === real.kind && "border-emerald-500 bg-emerald-500 text-white",
              answered && k === picked && !ok && "border-rose-500 bg-rose-500 text-white",
              answered && k !== real.kind && k !== picked && "opacity-40",
            )}
          >
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>
      {answered && (
        <div className="animate-pop space-y-2">
          <p className={cn("rounded-xl p-3 text-sm", ok ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-rose-50 dark:bg-rose-950/40")}>
            <strong>{ok ? "¡Correcto! " : "Incorrecto. "}</strong>
            {ip} → {real.label}
          </p>
          <Button
            full
            onClick={() => {
              setPicked(null);
              if (round + 1 >= ROUNDS) {
                setElapsed(Date.now() - start);
                markLab("ip-classifier");
              } else nextIp();
              setRound((r) => r + 1);
            }}
          >
            {round + 1 >= ROUNDS ? "Ver resultado" : "Siguiente →"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Laboratorio IPv6
// ============================================================
const V6_EXAMPLES = ["2001:0db8:0000:0000:0000:0000:0000:0001", "fe80:0000:0000:0000:0204:61ff:fe9d:f156", "2001:db8:0:0:1:0:0:1", "ff02::1", "::1", "fd12:3456:789a:0001:0000:0000:0000:0010"];

export function Ipv6Lab() {
  const [text, setText] = useState(V6_EXAMPLES[0]);
  const [mode, setMode] = useState<"explorar" | "reto">("explorar");
  const groups = parseIPv6(text);

  return (
    <div className="space-y-4" onPointerDown={() => markLab("ipv6-lab")}>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-sm font-semibold dark:bg-slate-800">
        {(["explorar", "reto"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} className={cn("rounded-lg py-2", mode === m ? "bg-white shadow dark:bg-slate-950" : "text-muted")}>
            {m === "explorar" ? "🔍 Explorar" : "🎯 Reto: abrevia"}
          </button>
        ))}
      </div>
      {mode === "reto" ? (
        <Ipv6Challenge />
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {V6_EXAMPLES.map((e) => (
              <Chip key={e} onClick={() => setText(e)} className="max-w-full truncate font-mono text-[11px]">
                {compressIPv6(parseIPv6(e)!).text}
              </Chip>
            ))}
          </div>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoCapitalize="off"
            autoComplete="off"
            spellCheck={false}
            className={cn("h-12 w-full rounded-2xl border-2 bg-white px-3 font-mono text-sm dark:bg-slate-900", groups ? "border-slate-200 dark:border-white/10" : "border-rose-400")}
            aria-label="Dirección IPv6"
          />
          {!groups ? (
            <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              Dirección IPv6 inválida. Recuerda: 8 grupos hexadecimales (0-9, a-f) de hasta 4 dígitos, y <code>::</code> solo una vez.
            </p>
          ) : (
            <Ipv6Steps groups={groups} />
          )}
        </>
      )}
    </div>
  );
}

function Ipv6Steps({ groups }: { groups: number[] }) {
  const { text, run } = compressIPv6(groups);
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 text-xs font-bold text-muted">1 · Forma completa (8 grupos × 16 bits = 128 bits)</p>
        <div className="grid grid-cols-4 gap-1 sm:grid-cols-8">
          {groups.map((g, i) => {
            const inRun = run && i >= run[0] && i <= run[1];
            return (
              <div key={i} className={cn("rounded-lg border px-1 py-1.5 text-center font-mono text-[12px]", inRun ? "border-amber-400 bg-amber-100 dark:bg-amber-900/40" : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800")}>
                {g.toString(16).padStart(4, "0")}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs font-bold text-muted">2 · Quitar ceros a la izquierda de cada grupo</p>
        <p className="break-all rounded-lg bg-slate-100 p-2 font-mono text-sm dark:bg-slate-800">{groups.map((g) => g.toString(16)).join(":")}</p>
      </div>
      <div>
        <p className="mb-1 text-xs font-bold text-muted">3 · Reemplazar la racha de ceros más larga por :: (una sola vez)</p>
        <p className="break-all rounded-lg bg-violet-600 p-2 font-mono text-base font-bold text-white">{text}</p>
        <p className="mt-1 text-xs text-muted">{run ? `Se reemplazaron los grupos ${run[0] + 1} a ${run[1] + 1} (en amarillo).` : "No hay 2 o más grupos de ceros seguidos: no se usa ::."}</p>
      </div>
      <p className="break-all text-xs text-muted">
        Completa: <span className="font-mono">{expandIPv6(groups)}</span>
      </p>
      <p className="rounded-lg bg-slate-100 p-2 text-sm dark:bg-slate-800">
        Tipo: <strong>{classifyIPv6(groups)}</strong>
      </p>
    </div>
  );
}

function randomV6(): number[] {
  const g = Array.from({ length: 8 }, () => (Math.random() < 0.45 ? 0 : Math.random() < 0.3 ? randInt(1, 255) : randInt(0, 0xffff)));
  if (Math.random() < 0.6) {
    g[0] = 0x2001;
    g[1] = 0x0db8;
  } else if (Math.random() < 0.5) g[0] = 0xfe80;
  // asegura una racha de ceros
  const start = randInt(2, 5);
  const len = randInt(2, 3);
  for (let i = start; i < Math.min(8, start + len); i++) g[i] = 0;
  return g;
}

function Ipv6Challenge() {
  const [g, setG] = useState<number[] | null>(null);
  const [val, setVal] = useState("");
  const [res, setRes] = useState<boolean | null>(null);
  if (!g)
    return (
      <Button full onClick={() => setG(randomV6())}>
        ▶ Generar dirección
      </Button>
    );
  const answer = compressIPv6(g).text;
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (res !== null) {
          setG(randomV6());
          setVal("");
          setRes(null);
          return;
        }
        const parsed = parseIPv6(val);
        // Debe ser la misma dirección Y estar en forma mínima
        setRes(!!parsed && parsed.every((x, i) => x === g[i]) && val.trim().toLowerCase() === answer);
      }}
    >
      <p className="text-sm text-muted">Escribe la forma abreviada (mínima) de:</p>
      <p className="break-all rounded-xl bg-slate-100 p-3 font-mono text-sm font-bold dark:bg-slate-800">{expandIPv6(g)}</p>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        disabled={res !== null}
        autoCapitalize="off"
        autoComplete="off"
        spellCheck={false}
        placeholder="ej. 2001:db8::1"
        className={cn("h-12 w-full rounded-2xl border-2 bg-white px-3 font-mono dark:bg-slate-900", res === null ? "border-slate-200 dark:border-white/10" : res ? "border-emerald-500" : "border-rose-500")}
      />
      {res !== null && (
        <p className={cn("rounded-xl p-3 text-sm", res ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-rose-50 dark:bg-rose-950/40")}>
          {res ? "✅ ¡Perfecto!" : "❌ La forma mínima es:"} <span className="font-mono font-bold">{answer}</span>
        </p>
      )}
      <Button full type="submit" disabled={res === null && !val.trim()}>
        {res === null ? "Comprobar" : "Otra dirección →"}
      </Button>
    </form>
  );
}
