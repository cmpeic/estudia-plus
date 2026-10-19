"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

function Loading() {
  return <div className="h-48 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />;
}


// Cada grupo se carga solo cuando se necesita (código dividido por tema).
const REGISTRY: Record<string, ComponentType> = {
  // Arquitectura
  "arch-cycle": dynamic(() => import("./arquitectura").then((m) => m.ArchCycle), { loading: Loading }),
  "seven-terms": dynamic(() => import("./arquitectura").then((m) => m.SevenTerms), { loading: Loading }),
  mvc: dynamic(() => import("./arquitectura").then((m) => m.MvcFlow), { loading: Loading }),
  // Entornos
  "env-stack": dynamic(() => import("./entornos").then((m) => m.EnvStack), { loading: Loading }),
  "env-pipeline": dynamic(() => import("./entornos").then((m) => m.EnvPipeline), { loading: Loading }),
  // Quishing
  "phishing-family": dynamic(() => import("./quishing").then((m) => m.PhishingFamily), { loading: Loading }),
  "quishing-flow": dynamic(() => import("./quishing").then((m) => m.QuishingFlow), { loading: Loading }),
  "url-anatomy": dynamic(() => import("./quishing").then((m) => m.UrlAnatomy), { loading: Loading }),
  // UML
  "uml-types": dynamic(() => import("./uml").then((m) => m.UmlTypes), { loading: Loading }),
  "sales-process": dynamic(() => import("./uml").then((m) => m.SalesProcess), { loading: Loading }),
  "uc-elements": dynamic(() => import("./uml").then((m) => m.UcElements), { loading: Loading }),
  "uc-relations": dynamic(() => import("./uml").then((m) => m.UcRelations), { loading: Loading }),
  "uc-agencia": dynamic(() => import("./uml").then((m) => m.UcAgencia), { loading: Loading }),
  "uc-ventas": dynamic(() => import("./uml").then((m) => m.UcVentas), { loading: Loading }),
  // Usabilidad
  "iso-triad": dynamic(() => import("./usabilidad").then((m) => m.IsoTriad), { loading: Loading }),
  "ux-timeline": dynamic(() => import("./usabilidad").then((m) => m.UxTimeline), { loading: Loading }),
  "sus-scale": dynamic(() => import("./usabilidad").then((m) => m.SusScale), { loading: Loading }),
  // Redes IP
  "home-lan": dynamic(() => import("./redes").then((m) => m.HomeLan), { loading: Loading }),
  "packet-journey": dynamic(() => import("./redes").then((m) => m.PacketJourney), { loading: Loading }),
  "ipv4-structure": dynamic(() => import("./redes").then((m) => m.Ipv4Structure), { loading: Loading }),
  "network-host": dynamic(() => import("./redes").then((m) => m.NetworkHost), { loading: Loading }),
  "nat-diagram": dynamic(() => import("./redes").then((m) => m.NatDiagram), { loading: Loading }),
  "cgnat-chain": dynamic(() => import("./redes").then((m) => m.CgnatChain), { loading: Loading }),
  "dhcp-dora": dynamic(() => import("./redes").then((m) => m.DhcpDora), { loading: Loading }),
  "ip-vs-mac": dynamic(() => import("./redes").then((m) => m.IpVsMac), { loading: Loading }),
};

export default function Diagram({ id }: { id: string }) {
  const C = REGISTRY[id];
  if (!C) return <div className="rounded-xl bg-slate-100 p-4 text-sm text-slate-500 dark:bg-slate-800">Diagrama no disponible ({id})</div>;
  return <C />;
}
