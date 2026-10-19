// Utilidades de direccionamiento IPv4 / IPv6 usadas por los laboratorios.
// Todos los enteros IPv4 se manejan como unsigned de 32 bits (>>> 0).

export function parseIPv4(s: string): number | null {
  const parts = s.trim().split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const v = Number(p);
    if (v > 255) return null;
    n = n * 256 + v;
  }
  return n >>> 0;
}

export function ipToString(n: number): string {
  return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

export function octets(n: number): number[] {
  return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
}

export function toBin8(v: number): string {
  return v.toString(2).padStart(8, "0");
}

export function ipToBinary(n: number): string {
  return octets(n).map(toBin8).join(".");
}

export function maskFromPrefix(p: number): number {
  if (p <= 0) return 0;
  if (p >= 32) return 0xffffffff >>> 0;
  return (0xffffffff << (32 - p)) >>> 0;
}

export function prefixFromMask(mask: number): number | null {
  const bin = (mask >>> 0).toString(2).padStart(32, "0");
  if (!/^1*0*$/.test(bin)) return null;
  return bin.indexOf("0") === -1 ? 32 : bin.indexOf("0");
}

export type SubnetInfo = {
  ip: number;
  prefix: number;
  mask: number;
  wildcard: number;
  network: number;
  broadcast: number;
  firstHost: number;
  lastHost: number;
  total: number;
  usable: number;
  blockSize: number;
  interestingOctet: number; // 1..4, octeto donde "salta" la subred
};

export function subnet(ip: number, prefix: number): SubnetInfo {
  const mask = maskFromPrefix(prefix);
  const wildcard = ~mask >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const total = 2 ** (32 - prefix);
  let usable: number;
  let firstHost: number;
  let lastHost: number;
  if (prefix === 32) {
    usable = 1;
    firstHost = lastHost = network;
  } else if (prefix === 31) {
    usable = 2; // enlaces punto a punto (RFC 3021)
    firstHost = network;
    lastHost = broadcast;
  } else {
    usable = total - 2;
    firstHost = network + 1;
    lastHost = broadcast - 1;
  }
  const interestingOctet = prefix === 0 ? 1 : Math.min(4, Math.ceil(prefix / 8) || 1);
  const bitsInOctet = prefix - (interestingOctet - 1) * 8;
  const blockSize = 2 ** (8 - bitsInOctet);
  return {
    ip,
    prefix,
    mask,
    wildcard,
    network,
    broadcast,
    firstHost: firstHost >>> 0,
    lastHost: lastHost >>> 0,
    total,
    usable,
    blockSize,
    interestingOctet,
  };
}

export function ipClass(n: number): { cls: string; note: string } {
  const o = n >>> 24;
  if (o <= 127) return { cls: "A", note: "0–127 · histórico: redes muy grandes" };
  if (o <= 191) return { cls: "B", note: "128–191 · histórico: redes medianas" };
  if (o <= 223) return { cls: "C", note: "192–223 · histórico: redes pequeñas" };
  if (o <= 239) return { cls: "D", note: "224–239 · multicast" };
  return { cls: "E", note: "240–255 · reservado / experimental" };
}

export type IpKind =
  | "privada"
  | "publica"
  | "loopback"
  | "apipa"
  | "cgnat"
  | "multicast"
  | "documentacion"
  | "broadcast"
  | "no-especificada"
  | "reservada";

type Range = { cidr: string; kind: IpKind; label: string; rfc?: string };

export const SPECIAL_RANGES: Range[] = [
  { cidr: "0.0.0.0/8", kind: "no-especificada", label: "Red actual / no especificada (0.0.0.0)" },
  { cidr: "10.0.0.0/8", kind: "privada", label: "Privada RFC 1918 (10.0.0.0/8)", rfc: "RFC 1918" },
  { cidr: "100.64.0.0/10", kind: "cgnat", label: "Espacio compartido CGNAT (100.64.0.0/10)", rfc: "RFC 6598" },
  { cidr: "127.0.0.0/8", kind: "loopback", label: "Loopback / localhost (127.0.0.0/8)" },
  { cidr: "169.254.0.0/16", kind: "apipa", label: "Enlace local / APIPA (169.254.0.0/16)" },
  { cidr: "172.16.0.0/12", kind: "privada", label: "Privada RFC 1918 (172.16.0.0/12)", rfc: "RFC 1918" },
  { cidr: "192.0.2.0/24", kind: "documentacion", label: "Documentación TEST-NET-1 (192.0.2.0/24)" },
  { cidr: "192.168.0.0/16", kind: "privada", label: "Privada RFC 1918 (192.168.0.0/16)", rfc: "RFC 1918" },
  { cidr: "198.18.0.0/15", kind: "reservada", label: "Pruebas de rendimiento (198.18.0.0/15)" },
  { cidr: "198.51.100.0/24", kind: "documentacion", label: "Documentación TEST-NET-2 (198.51.100.0/24)" },
  { cidr: "203.0.113.0/24", kind: "documentacion", label: "Documentación TEST-NET-3 (203.0.113.0/24)" },
  { cidr: "224.0.0.0/4", kind: "multicast", label: "Multicast (224.0.0.0/4)" },
  { cidr: "255.255.255.255/32", kind: "broadcast", label: "Broadcast limitado (255.255.255.255)" },
  { cidr: "240.0.0.0/4", kind: "reservada", label: "Reservada / clase E (240.0.0.0/4)" },
];

function inCidr(ip: number, cidr: string): boolean {
  const [base, p] = cidr.split("/");
  const b = parseIPv4(base)!;
  const m = maskFromPrefix(Number(p));
  return ((ip & m) >>> 0) === ((b & m) >>> 0);
}

export function classifyIPv4(ip: number): { kind: IpKind; label: string } {
  for (const r of SPECIAL_RANGES) {
    if (inCidr(ip, r.cidr)) return { kind: r.kind, label: r.label };
  }
  return { kind: "publica", label: "Pública (enrutable en Internet)" };
}

export const KIND_LABEL: Record<IpKind, string> = {
  privada: "Privada",
  publica: "Pública",
  loopback: "Loopback",
  apipa: "APIPA / enlace local",
  cgnat: "CGNAT",
  multicast: "Multicast",
  documentacion: "Documentación",
  broadcast: "Broadcast",
  "no-especificada": "No especificada",
  reservada: "Reservada",
};

// ---------------- IPv6 ----------------

/** Devuelve los 8 grupos (como números) o null si no es válida */
export function parseIPv6(input: string): number[] | null {
  const s = input.trim().toLowerCase();
  if (!s || /[^0-9a-f:]/.test(s)) return null;
  const dbl = s.split("::");
  if (dbl.length > 2) return null;
  const parseSide = (side: string) => (side === "" ? [] : side.split(":"));
  const left = parseSide(dbl[0]);
  const right = dbl.length === 2 ? parseSide(dbl[1]) : [];
  const all = [...left, ...right];
  if (all.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  if (dbl.length === 1) {
    if (left.length !== 8) return null;
    return left.map((g) => parseInt(g, 16));
  }
  const missing = 8 - left.length - right.length;
  if (missing < 1) return null;
  return [...left, ...Array(missing).fill("0"), ...right].map((g) => parseInt(g, 16));
}

export function expandIPv6(groups: number[]): string {
  return groups.map((g) => g.toString(16).padStart(4, "0")).join(":");
}

/** Compresión según RFC 5952: sin ceros a la izquierda y :: en la racha de ceros más larga (≥2) */
export function compressIPv6(groups: number[]): { text: string; run: [number, number] | null } {
  let bestStart = -1;
  let bestLen = 0;
  let i = 0;
  while (i < 8) {
    if (groups[i] === 0) {
      let j = i;
      while (j < 8 && groups[j] === 0) j++;
      if (j - i > bestLen) {
        bestLen = j - i;
        bestStart = i;
      }
      i = j;
    } else i++;
  }
  const hex = groups.map((g) => g.toString(16));
  if (bestLen < 2) return { text: hex.join(":"), run: null };
  const left = hex.slice(0, bestStart).join(":");
  const right = hex.slice(bestStart + bestLen).join(":");
  return { text: `${left}::${right}`, run: [bestStart, bestStart + bestLen - 1] };
}

export function classifyIPv6(groups: number[]): string {
  const g0 = groups[0];
  if (groups.every((g) => g === 0)) return "No especificada (::/128)";
  if (groups.slice(0, 7).every((g) => g === 0) && groups[7] === 1) return "Loopback (::1/128)";
  if ((g0 & 0xffc0) === 0xfe80) return "Enlace local (fe80::/10)";
  if ((g0 & 0xfe00) === 0xfc00) return "Local única – ULA (fc00::/7)";
  if ((g0 & 0xff00) === 0xff00) return "Multicast (ff00::/8)";
  if (g0 === 0x2001 && groups[1] === 0x0db8) return "Documentación (2001:db8::/32)";
  if ((g0 & 0xe000) === 0x2000) return "Unicast global (2000::/3) – pública";
  return "Otro / reservado";
}

// ---------------- utilidades varias ----------------

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Separador de miles con punto, sin depender del locale del servidor */
export function formatNumber(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
